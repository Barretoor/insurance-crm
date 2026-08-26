import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { StageForm } from "@/components/stage-form";
import { createStage, deleteStage, moveStage, updateStage } from "./actions";

export default async function PipelineSettingsPage() {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const stages = await prisma.pipelineStage.findMany({
    where: { agencyId: session.user.agencyId },
    orderBy: { order: "asc" },
    include: { _count: { select: { contacts: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
          Configurar pipeline
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Renombra, reordena o agrega etapas. Una etapa con contactos no se
          puede eliminar sin antes reasignarlos a otra.
        </p>
      </div>

      <div className="space-y-3">
        {stages.map((stage, index) => (
          <div
            key={stage.id}
            className="flex flex-wrap items-center gap-3 rounded-md border border-gray-200 p-3"
          >
            <div className="flex flex-col gap-1">
              <form action={moveStage.bind(null, stage.id, "up")}>
                <button
                  type="submit"
                  disabled={index === 0}
                  className="rounded border border-gray-300 px-1.5 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-30"
                  aria-label="Mover arriba"
                >
                  ↑
                </button>
              </form>
              <form action={moveStage.bind(null, stage.id, "down")}>
                <button
                  type="submit"
                  disabled={index === stages.length - 1}
                  className="rounded border border-gray-300 px-1.5 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-30"
                  aria-label="Mover abajo"
                >
                  ↓
                </button>
              </form>
            </div>

            <div className="flex-1">
              <StageForm
                action={updateStage.bind(null, stage.id)}
                defaultValues={{ name: stage.name, color: stage.color }}
                submitLabel="Guardar"
                compact
              />
            </div>

            <span className="text-xs text-gray-500">
              {stage._count.contacts}{" "}
              {stage._count.contacts === 1 ? "contacto" : "contactos"}
            </span>

            <DeleteStageControl
              stageId={stage.id}
              hasContacts={stage._count.contacts > 0}
              otherStages={stages.filter((s) => s.id !== stage.id)}
            />
          </div>
        ))}
      </div>

      <div className="rounded-md border border-dashed border-gray-300 p-4">
        <h2 className="mb-3 text-sm font-medium text-gray-700">
          Nueva etapa
        </h2>
        <StageForm action={createStage} submitLabel="Agregar etapa" />
      </div>
    </div>
  );
}

function DeleteStageControl({
  stageId,
  hasContacts,
  otherStages,
}: {
  stageId: string;
  hasContacts: boolean;
  otherStages: { id: string; name: string }[];
}) {
  if (hasContacts && otherStages.length === 0) {
    return (
      <span className="text-xs text-gray-400">
        No se puede eliminar (es la única etapa)
      </span>
    );
  }

  return (
    <form action={deleteStage} className="flex items-center gap-2">
      <input type="hidden" name="stageId" value={stageId} />
      {hasContacts && (
        <select
          name="reassignToStageId"
          required
          defaultValue=""
          className="rounded-md border border-gray-300 px-2 py-1 text-xs shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
        >
          <option value="" disabled>
            Reasignar contactos a…
          </option>
          {otherStages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      )}
      <button
        type="submit"
        className="text-xs font-medium text-red-600 hover:text-red-800 hover:underline"
      >
        {hasContacts ? "Reasignar y eliminar" : "Eliminar"}
      </button>
    </form>
  );
}
