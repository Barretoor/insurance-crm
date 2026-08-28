"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { getNextRecurrenceDate } from "@/lib/task-recurrence";
import type { TaskRecurrence } from "@/generated/prisma/enums";

export type TaskActionState = { error?: string };

const RECURRENCE_VALUES: TaskRecurrence[] = ["NONE", "DAILY", "WEEKLY", "MONTHLY"];

export async function createTask(
  _prevState: TaskActionState,
  formData: FormData
): Promise<TaskActionState> {
  const session = await requireSession();

  const title = String(formData.get("title") ?? "").trim();
  const dueDateRaw = String(formData.get("dueDate") ?? "").trim();
  const recurrence = String(formData.get("recurrence") ?? "NONE") as TaskRecurrence;
  const description = String(formData.get("description") ?? "").trim();
  const contactId = String(formData.get("contactId") ?? "").trim();

  if (!title) {
    return { error: "El título es obligatorio." };
  }
  if (!dueDateRaw || Number.isNaN(Date.parse(dueDateRaw))) {
    return { error: "La fecha de vencimiento no es válida." };
  }
  if (!RECURRENCE_VALUES.includes(recurrence)) {
    return { error: "Recurrencia inválida." };
  }

  let validContactId: string | null = null;
  if (contactId) {
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, agencyId: session.user.agencyId },
      select: { id: true },
    });
    if (!contact) {
      return { error: "Contacto no válido." };
    }
    validContactId = contact.id;
  }

  await prisma.task.create({
    data: {
      title,
      description: description || null,
      dueDate: new Date(dueDateRaw),
      recurrence,
      agencyId: session.user.agencyId,
      contactId: validContactId,
    },
  });

  revalidatePath("/tareas");
  revalidatePath("/dashboard");
  if (validContactId) revalidatePath(`/contacts/${validContactId}`);
  return {};
}

export async function toggleTask(formData: FormData) {
  const session = await requireSession();
  const taskId = String(formData.get("taskId") ?? "");

  const task = await prisma.task.findFirst({
    where: { id: taskId, agencyId: session.user.agencyId },
  });
  if (!task) return;

  const completed = !task.completed;

  await prisma.task.update({
    where: { id: task.id },
    data: { completed, completedAt: completed ? new Date() : null },
  });

  if (completed && task.recurrence !== "NONE") {
    const nextDue = getNextRecurrenceDate(task.dueDate, task.recurrence);
    if (nextDue) {
      await prisma.task.create({
        data: {
          title: task.title,
          description: task.description,
          dueDate: nextDue,
          recurrence: task.recurrence,
          agencyId: task.agencyId,
          contactId: task.contactId,
        },
      });
    }
  }

  revalidatePath("/tareas");
  revalidatePath("/dashboard");
  if (task.contactId) revalidatePath(`/contacts/${task.contactId}`);
}
