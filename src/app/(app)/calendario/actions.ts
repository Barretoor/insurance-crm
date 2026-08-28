"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export type AppointmentActionState = { error?: string };

export async function createAppointment(
  _prevState: AppointmentActionState,
  formData: FormData
): Promise<AppointmentActionState> {
  const session = await requireSession();

  const contactId = String(formData.get("contactId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const durationMin = Number(formData.get("durationMin") ?? 30);
  const notes = String(formData.get("notes") ?? "").trim();

  if (!title) return { error: "El título es obligatorio." };
  if (!contactId) return { error: "Selecciona un contacto." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: "La fecha no es válida." };
  }
  if (!/^\d{2}:\d{2}$/.test(time)) {
    return { error: "La hora no es válida." };
  }
  if (!Number.isFinite(durationMin) || durationMin <= 0) {
    return { error: "La duración no es válida." };
  }

  const contact = await prisma.contact.findFirst({
    where: { id: contactId, agencyId: session.user.agencyId },
    select: { id: true },
  });
  if (!contact) return { error: "Contacto no válido." };

  const startsAt = new Date(`${date}T${time}:00.000Z`);
  if (Number.isNaN(startsAt.getTime())) {
    return { error: "Fecha u hora no válida." };
  }

  await prisma.appointment.create({
    data: {
      title,
      startsAt,
      durationMin: Math.round(durationMin),
      notes: notes || null,
      agencyId: session.user.agencyId,
      contactId: contact.id,
    },
  });

  revalidatePath("/calendario");
  revalidatePath("/dashboard");
  revalidatePath(`/contacts/${contact.id}`);
  return {};
}

export async function completeAppointment(formData: FormData) {
  await setAppointmentStatus(formData, "COMPLETED");
}

export async function cancelAppointment(formData: FormData) {
  await setAppointmentStatus(formData, "CANCELLED");
}

async function setAppointmentStatus(
  formData: FormData,
  status: "COMPLETED" | "CANCELLED"
) {
  const session = await requireSession();
  const appointmentId = String(formData.get("appointmentId") ?? "");

  const result = await prisma.appointment.updateMany({
    where: { id: appointmentId, agencyId: session.user.agencyId },
    data: { status },
  });
  if (result.count === 0) return;

  revalidatePath("/calendario");
  revalidatePath("/dashboard");
}
