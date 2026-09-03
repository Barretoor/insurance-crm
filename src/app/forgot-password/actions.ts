"use server";

import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { appUrl } from "@/lib/twilio";
import { sendPasswordResetEmail } from "@/lib/email";

export type ForgotPasswordState = { submitted?: boolean; error?: string };

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const RESEND_THROTTLE_MS = 2 * 60 * 1000; // don't re-send within 2 minutes

export async function requestPasswordReset(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "Ingresa tu correo electrónico." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always report success whether or not the email exists - never reveal
  // which addresses have an account.
  if (!user) {
    return { submitted: true };
  }

  const recentToken = await prisma.passwordResetToken.findFirst({
    where: {
      userId: user.id,
      usedAt: null,
      expiresAt: { gt: new Date() },
      createdAt: { gt: new Date(Date.now() - RESEND_THROTTLE_MS) },
    },
  });
  if (recentToken) {
    return { submitted: true };
  }

  const token = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  try {
    await sendPasswordResetEmail(user.email, appUrl(`/reset-password?token=${token}`));
  } catch (error) {
    // Still report success to the user - don't leak delivery details, and
    // don't break the UX just because the email provider had a hiccup.
    console.error("Error al enviar el correo de restablecimiento:", error);
  }

  return { submitted: true };
}
