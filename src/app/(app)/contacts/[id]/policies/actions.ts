"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PolicyStatus, PolicyType } from "@/generated/prisma/enums";

export type PolicyActionState = { error?: string };

function parsePolicyForm(formData: FormData) {
  const type = String(formData.get("type") ?? "");
  const insurer = String(formData.get("insurer") ?? "").trim();
  const policyNumber = String(formData.get("policyNumber") ?? "").trim();
  const monthlyPremium = String(formData.get("monthlyPremium") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "").trim();
  const renewalDate = String(formData.get("renewalDate") ?? "").trim();
  const status = String(formData.get("status") ?? "");

  if (!Object.values(PolicyType).includes(type as PolicyType)) {
    return { error: "Selecciona un tipo de póliza válido." } as const;
  }
  if (!insurer) {
    return { error: "La aseguradora es obligatoria." } as const;
  }
  const premiumValue = Number(monthlyPremium);
  if (!monthlyPremium || Number.isNaN(premiumValue) || premiumValue < 0) {
    return { error: "La prima mensual debe ser un número válido." } as const;
  }
  if (!startDate || Number.isNaN(Date.parse(startDate))) {
    return { error: "La fecha de inicio no es válida." } as const;
  }
  if (!renewalDate || Number.isNaN(Date.parse(renewalDate))) {
    return { error: "La fecha de renovación no es válida." } as const;
  }
  if (!Object.values(PolicyStatus).includes(status as PolicyStatus)) {
    return { error: "Selecciona un estado válido." } as const;
  }

  return {
    data: {
      type: type as PolicyType,
      insurer,
      policyNumber: policyNumber || null,
      monthlyPremium,
      startDate: new Date(startDate),
      renewalDate: new Date(renewalDate),
      status: status as PolicyStatus,
    },
  } as const;
}

export async function createPolicy(
  contactId: string,
  _prevState: PolicyActionState,
  formData: FormData
): Promise<PolicyActionState> {
  const session = await requireSession();

  const contact = await prisma.contact.findFirst({
    where: { id: contactId, agencyId: session.user.agencyId },
    select: { id: true },
  });
  if (!contact) {
    return { error: "Contacto no encontrado." };
  }

  const parsed = parsePolicyForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  await prisma.policy.create({
    data: { ...parsed.data, contactId: contact.id },
  });

  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}

export async function updatePolicy(
  policyId: string,
  contactId: string,
  _prevState: PolicyActionState,
  formData: FormData
): Promise<PolicyActionState> {
  const session = await requireSession();

  const policy = await prisma.policy.findFirst({
    where: { id: policyId, contact: { agencyId: session.user.agencyId } },
    select: { id: true },
  });
  if (!policy) {
    return { error: "Póliza no encontrada." };
  }

  const parsed = parsePolicyForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  await prisma.policy.update({
    where: { id: policy.id },
    data: parsed.data,
  });

  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}
