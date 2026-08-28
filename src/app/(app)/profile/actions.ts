"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import type { Theme } from "@/generated/prisma/enums";

export type ProfileActionState = { error?: string; success?: boolean };

const E164_REGEX = /^\+[1-9]\d{6,14}$/;
const THEME_VALUES: Theme[] = ["LIGHT", "DARK", "SYSTEM"];

export async function updateProfile(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const session = await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const theme = String(formData.get("theme") ?? "LIGHT") as Theme;

  if (phone && !E164_REGEX.test(phone)) {
    return {
      error: "El teléfono debe estar en formato E.164, ej. +12145551234.",
    };
  }
  if (!THEME_VALUES.includes(theme)) {
    return { error: "Tema inválido." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: name || null, phone: phone || null, theme },
  });

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return { success: true };
}

export type AvatarActionState = { error?: string };

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export async function updateAvatar(
  _prevState: AvatarActionState,
  formData: FormData
): Promise<AvatarActionState> {
  const session = await requireSession();

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona una imagen." };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Formato no soportado. Usa PNG, JPG, WEBP o GIF." };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { error: "La imagen debe pesar menos de 2 MB." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarUrl: dataUri },
  });

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return {};
}

export async function removeAvatar() {
  const session = await requireSession();

  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarUrl: null },
  });

  revalidatePath("/profile");
  revalidatePath("/", "layout");
}
