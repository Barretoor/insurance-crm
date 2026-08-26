"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export type ProfileActionState = { error?: string; success?: boolean };

const E164_REGEX = /^\+[1-9]\d{6,14}$/;

export async function updateProfile(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const session = await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (phone && !E164_REGEX.test(phone)) {
    return {
      error:
        "El teléfono debe estar en formato E.164, ej. +12145551234.",
    };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: name || null, phone: phone || null },
  });

  revalidatePath("/profile");
  return { success: true };
}
