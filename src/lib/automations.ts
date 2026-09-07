import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/send-sms";
import { renderTemplate } from "@/lib/automation-labels";
import { formatDate } from "@/lib/policy-labels";

// Missed-call automations look back further than the cron's own 24h cadence
// so a delayed/missed run doesn't silently drop a contact's follow-up text.
const MISSED_CALL_LOOKBACK_HOURS = 25;

/** Has this automation already messaged this contact (optionally only since a given time)? */
async function alreadyMessaged(
  automationId: string,
  contactId: string,
  since?: Date
): Promise<boolean> {
  const existing = await prisma.message.findFirst({
    where: {
      automationId,
      contactId,
      ...(since ? { createdAt: { gte: since } } : {}),
    },
    select: { id: true },
  });
  return existing !== null;
}

type Automation = Awaited<ReturnType<typeof prisma.automation.findMany>>[number];

async function runStageEnteredAutomation(automation: Automation): Promise<number> {
  if (!automation.stageId) return 0;

  const contacts = await prisma.contact.findMany({
    where: { agencyId: automation.agencyId, stageId: automation.stageId },
    select: { id: true, name: true, phone: true, areaCode: true, state: true, smsOptOut: true },
  });

  let sent = 0;
  for (const contact of contacts) {
    if (await alreadyMessaged(automation.id, contact.id)) continue;

    const body = renderTemplate(automation.messageTemplate, { nombre: contact.name });
    const result = await sendSms({
      agencyId: automation.agencyId,
      contact,
      body,
      automationId: automation.id,
    });
    if ("message" in result) sent++;
  }
  return sent;
}

async function runPolicyRenewalAutomation(automation: Automation): Promise<number> {
  const days = automation.daysBeforeRenewal ?? 15;
  const now = new Date();
  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() + days);

  const policies = await prisma.policy.findMany({
    where: {
      status: "ACTIVE",
      renewalDate: { gte: now, lte: windowEnd },
      contact: { agencyId: automation.agencyId },
    },
    include: {
      contact: {
        select: { id: true, name: true, phone: true, areaCode: true, state: true, smsOptOut: true },
      },
    },
  });

  let sent = 0;
  const handledContacts = new Set<string>();
  for (const policy of policies) {
    const contact = policy.contact;
    // One reminder per contact per run even if they have multiple policies
    // renewing soon - avoids spamming several texts on the same day.
    if (handledContacts.has(contact.id)) continue;
    handledContacts.add(contact.id);

    if (await alreadyMessaged(automation.id, contact.id)) continue;

    const body = renderTemplate(automation.messageTemplate, {
      nombre: contact.name,
      fecha_renovacion: formatDate(policy.renewalDate),
    });
    const result = await sendSms({
      agencyId: automation.agencyId,
      contact,
      body,
      automationId: automation.id,
    });
    if ("message" in result) sent++;
  }
  return sent;
}

async function runMissedCallAutomation(automation: Automation): Promise<number> {
  const since = new Date(Date.now() - MISSED_CALL_LOOKBACK_HOURS * 60 * 60 * 1000);

  const missedCalls = await prisma.call.findMany({
    where: {
      direction: "INBOUND",
      contactId: { not: null },
      startedAt: { gte: since },
      phoneNumber: { agencyId: automation.agencyId },
      OR: [{ status: "NO_ANSWER" }, { wentToVoicemail: true }],
    },
    include: {
      contact: {
        select: { id: true, name: true, phone: true, areaCode: true, state: true, smsOptOut: true },
      },
    },
  });

  let sent = 0;
  const handledContacts = new Set<string>();
  for (const call of missedCalls) {
    const contact = call.contact;
    if (!contact) continue;
    // One follow-up per contact per lookback window, even with several missed calls.
    if (handledContacts.has(contact.id)) continue;
    handledContacts.add(contact.id);

    if (await alreadyMessaged(automation.id, contact.id, since)) continue;

    const body = renderTemplate(automation.messageTemplate, { nombre: contact.name });
    const result = await sendSms({
      agencyId: automation.agencyId,
      contact,
      body,
      automationId: automation.id,
    });
    if ("message" in result) sent++;
  }
  return sent;
}

/**
 * Checks every active automation (across all agencies) against current data
 * and sends any SMS that newly qualify. Meant to run once a day; safe to run
 * more often since every trigger type is deduplicated against past sends.
 */
export async function runDueAutomations() {
  const automations = await prisma.automation.findMany({ where: { active: true } });

  let messagesSent = 0;
  for (const automation of automations) {
    switch (automation.trigger) {
      case "STAGE_ENTERED":
        messagesSent += await runStageEnteredAutomation(automation);
        break;
      case "POLICY_RENEWAL_UPCOMING":
        messagesSent += await runPolicyRenewalAutomation(automation);
        break;
      case "MISSED_CALL":
        messagesSent += await runMissedCallAutomation(automation);
        break;
    }
  }

  return { automationsChecked: automations.length, messagesSent };
}
