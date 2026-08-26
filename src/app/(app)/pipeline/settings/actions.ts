"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export type StageActionState = { error?: string };

async function requireAdmin() {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") {
    throw new Error("Solo un administrador puede configurar el pipeline.");
  }
  return session;
}

export async function createStage(
  _prevState: StageActionState,
  formData: FormData
): Promise<StageActionState> {
  const session = await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();

  if (!name) {
    return { error: "El nombre de la etapa es obligatorio." };
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
    return { error: "Color inválido." };
  }

  const last = await prisma.pipelineStage.findFirst({
    where: { agencyId: session.user.agencyId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  await prisma.pipelineStage.create({
    data: {
      name,
      color,
      order: (last?.order ?? -1) + 1,
      agencyId: session.user.agencyId,
    },
  });

  revalidatePath("/pipeline/settings");
  revalidatePath("/pipeline");
  return {};
}

export async function updateStage(
  stageId: string,
  _prevState: StageActionState,
  formData: FormData
): Promise<StageActionState> {
  const session = await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();

  if (!name) {
    return { error: "El nombre de la etapa es obligatorio." };
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
    return { error: "Color inválido." };
  }

  const result = await prisma.pipelineStage.updateMany({
    where: { id: stageId, agencyId: session.user.agencyId },
    data: { name, color },
  });
  if (result.count === 0) {
    return { error: "Etapa no encontrada." };
  }

  revalidatePath("/pipeline/settings");
  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
  return {};
}

export async function moveStage(stageId: string, direction: "up" | "down") {
  const session = await requireAdmin();

  const stages = await prisma.pipelineStage.findMany({
    where: { agencyId: session.user.agencyId },
    orderBy: { order: "asc" },
  });

  const index = stages.findIndex((s) => s.id === stageId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= stages.length) return;

  const a = stages[index];
  const b = stages[swapWith];

  await prisma.$transaction([
    prisma.pipelineStage.update({
      where: { id: a.id },
      data: { order: b.order },
    }),
    prisma.pipelineStage.update({
      where: { id: b.id },
      data: { order: a.order },
    }),
  ]);

  revalidatePath("/pipeline/settings");
  revalidatePath("/pipeline");
}

export async function deleteStage(formData: FormData) {
  const session = await requireAdmin();

  const stageId = String(formData.get("stageId") ?? "");
  const reassignToStageId = String(formData.get("reassignToStageId") ?? "");

  const stage = await prisma.pipelineStage.findFirst({
    where: { id: stageId, agencyId: session.user.agencyId },
    include: { _count: { select: { contacts: true } } },
  });
  if (!stage) return;

  if (stage._count.contacts > 0) {
    if (!reassignToStageId || reassignToStageId === stageId) return;

    const target = await prisma.pipelineStage.findFirst({
      where: { id: reassignToStageId, agencyId: session.user.agencyId },
    });
    if (!target) return;

    await prisma.$transaction([
      prisma.contact.updateMany({
        where: { stageId: stage.id, agencyId: session.user.agencyId },
        data: { stageId: target.id },
      }),
      prisma.pipelineStage.delete({ where: { id: stage.id } }),
    ]);
  } else {
    await prisma.pipelineStage.delete({ where: { id: stage.id } });
  }

  revalidatePath("/pipeline/settings");
  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
}
