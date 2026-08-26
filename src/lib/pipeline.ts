import { prisma } from "@/lib/prisma";

export const DEFAULT_PIPELINE_STAGES = [
  { name: "Nuevo lead", order: 0, color: "#3B82F6" },
  { name: "Contactado", order: 1, color: "#6366F1" },
  { name: "Cotización enviada", order: 2, color: "#F59E0B" },
  { name: "En negociación", order: 3, color: "#8B5CF6" },
  { name: "Póliza emitida", order: 4, color: "#10B981" },
  { name: "Perdido", order: 5, color: "#6B7280" },
] as const;

/** The agency's first pipeline stage by column order - the default for new contacts. */
export async function getDefaultStageId(agencyId: string): Promise<string | null> {
  const stage = await prisma.pipelineStage.findFirst({
    where: { agencyId },
    orderBy: { order: "asc" },
    select: { id: true },
  });
  return stage?.id ?? null;
}
