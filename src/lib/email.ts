import { Resend } from "resend";

let client: Resend | null = null;

export function resendClient() {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY no está configurada.");
    }
    client = new Resend(apiKey);
  }
  return client;
}

export const EMAIL_FROM =
  process.env.EMAIL_FROM || "CRM Seguros de Vida <onboarding@resend.dev>";

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await resendClient().emails.send({
    from: EMAIL_FROM,
    to,
    subject: "Restablece tu contraseña - CRM Seguros de Vida",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #2b2a28;">
        <h2 style="font-weight: 500;">Restablece tu contraseña</h2>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en el CRM de seguros de vida.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; background: #2f6fe0; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500;">
            Restablecer contraseña
          </a>
        </p>
        <p style="color: #7c7b77; font-size: 13px;">
          Este enlace expira en 1 hora. Si tú no pediste esto, puedes ignorar este correo.
        </p>
      </div>
    `,
  });
}
