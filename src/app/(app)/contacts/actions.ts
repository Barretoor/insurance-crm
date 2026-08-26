"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { extractAreaCode, normalizePhoneDigits } from "@/lib/phone";
import { US_STATES } from "@/lib/us-states";
import { getDefaultStageId } from "@/lib/pipeline";

export type ContactActionState = { error?: string };

function parseContactForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name) {
    return { error: "El nombre es obligatorio." } as const;
  }

  if (state && !US_STATES.some((s) => s.code === state)) {
    return { error: "Estado inválido." } as const;
  }

  return {
    data: {
      name,
      phone: phone || null,
      email: email || null,
      address: address || null,
      city: city || null,
      state: state || null,
      notes: notes || null,
      areaCode: extractAreaCode(phone),
      phoneDigits: normalizePhoneDigits(phone),
    },
  } as const;
}

export async function createContact(
  _prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const session = await requireSession();
  const parsed = parseContactForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const stageId = await getDefaultStageId(session.user.agencyId);

  const contact = await prisma.contact.create({
    data: { ...parsed.data, agencyId: session.user.agencyId, stageId },
  });

  revalidatePath("/contacts");
  redirect(`/contacts/${contact.id}`);
}

export async function updateContact(
  contactId: string,
  _prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const session = await requireSession();
  const parsed = parseContactForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const result = await prisma.contact.updateMany({
    where: { id: contactId, agencyId: session.user.agencyId },
    data: parsed.data,
  });

  if (result.count === 0) {
    return { error: "Contacto no encontrado." };
  }

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}
