"use server";

import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { appUrl } from "@/lib/twilio";
import { sendTeamInviteEmail } from "@/lib/email";
import type { Role } from "@/generated/prisma/enums";

export type CreateTeamMemberState = {
  error?: string;
  inviteUrl?: string;
  emailSent?: boolean;
};

const INVITE_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function createTeamMember(
  _prevState: CreateTeamMemberState,
  formData: FormData
): Promise<CreateTeamMemberState> {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") {
    return { error: "Solo un administrador puede agregar agentes." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "AGENT") as Role;

  if (!name) {
    return { error: "El nombre es obligatorio." };
  }
  if (!email) {
    return { error: "El correo es obligatorio." };
  }
  if (role !== "ADMIN" && role !== "AGENT") {
    return { error: "Rol inválido." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe una cuenta con ese correo." };
  }

  // Random password the new agent will never see or use - they set their own
  // via the invite link below (same mechanism as "olvidé mi contraseña").
  const placeholderPassword = randomBytes(32).toString("hex");
  const passwordHash = await bcrypt.hash(placeholderPassword, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      agencyId: session.user.agencyId,
    },
  });

  const token = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + INVITE_TOKEN_TTL_MS),
    },
  });

  const inviteUrl = appUrl(`/reset-password?token=${token}`);

  let emailSent = true;
  try {
    await sendTeamInviteEmail(email, name, inviteUrl);
  } catch (error) {
    emailSent = false;
    console.error("Error al enviar el correo de invitación:", error);
  }

  revalidatePath("/equipo");
  return { inviteUrl, emailSent };
}
