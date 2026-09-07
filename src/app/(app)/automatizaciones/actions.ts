"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import type { AutomationTrigger } from "@/generated/prisma/enums";

export type AutomationActionState = { error?: string };

const VALID_TRIGGERS: AutomationTrigger[] = [
  "STAGE_ENTERED",
  "POLICY_RENEWAL_UPCOMING",
  "MISSED_CALL",
];

export async function createAutomation(
  _prevState: AutomationActionState,
  formData: FormData
): Promise<AutomationActionState> {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") {
    return { error: "Solo un administrador puede crear automatizaciones." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const trigger = String(formData.get("trigger") ?? "") as AutomationTrigger;
  const messageTemplate = String(formData.get("messageTemplate") ?? "").trim();
  const stageId = String(formData.get("stageId") ?? "").trim();
  const daysBeforeRenewalRaw = String(formData.get("daysBeforeRenewal") ?? "").trim();
  const active = formData.get("active") === "on";

  if (!name) {
    return { error: "El nombre es obligatorio." };
  }
  if (!VALID_TRIGGERS.includes(trigger)) {
    return { error: "Elige un disparador válido." };
  }
  if (!messageTemplate) {
    return { error: "El mensaje no puede estar vacío." };
  }

  let finalStageId: string | null = null;
  let daysBeforeRenewal: number | null = null;

  if (trigger === "STAGE_ENTERED") {
    if (!stageId) {
      return { error: "Elige la etapa del pipeline." };
    }
    const stage = await prisma.pipelineStage.findFirst({
      where: { id: stageId, agencyId: session.user.agencyId },
    });
    if (!stage) {
      return { error: "Etapa inválida." };
    }
    finalStageId = stageId;
  }

  if (trigger === "POLICY_RENEWAL_UPCOMING") {
    const days = Number(daysBeforeRenewalRaw);
    if (!Number.isInteger(days) || days < 1) {
      return { error: "Ingresa un número de días válido (mayor a 0)." };
    }
    daysBeforeRenewal = days;
  }

  await prisma.automation.create({
    data: {
      name,
      trigger,
      messageTemplate,
      active,
      agencyId: session.user.agencyId,
      stageId: finalStageId,
      daysBeforeRenewal,
    },
  });

  revalidatePath("/automatizaciones");
  return {};
}

export async function toggleAutomationActive(formData: FormData) {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") return;

  const id = String(formData.get("id") ?? "");
  const automation = await prisma.automation.findFirst({
    where: { id, agencyId: session.user.agencyId },
  });
  if (!automation) return;

  await prisma.automation.update({
    where: { id: automation.id },
    data: { active: !automation.active },
  });

  revalidatePath("/automatizaciones");
}

export async function deleteAutomation(formData: FormData) {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") return;

  const id = String(formData.get("id") ?? "");
  await prisma.automation.deleteMany({
    where: { id, agencyId: session.user.agencyId },
  });

  revalidatePath("/automatizaciones");
}
