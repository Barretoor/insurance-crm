"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function moveContactStage(contactId: string, stageId: string) {
  const session = await requireSession();

  const stage = await prisma.pipelineStage.findFirst({
    where: { id: stageId, agencyId: session.user.agencyId },
    select: { id: true },
  });
  if (!stage) {
    return { error: "Etapa no válida." };
  }

  const result = await prisma.contact.updateMany({
    where: { id: contactId, agencyId: session.user.agencyId },
    data: { stageId },
  });
  if (result.count === 0) {
    return { error: "Contacto no encontrado." };
  }

  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
  revalidatePath(`/contacts/${contactId}`);
  return { ok: true };
}
