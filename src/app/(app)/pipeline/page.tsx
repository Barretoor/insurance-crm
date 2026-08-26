import Link from "next/link";
import { Kanban } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { formatCurrency } from "@/lib/policy-labels";
import { CALL_DIRECTION_LABELS, formatDateTime } from "@/lib/call-labels";
import { PipelineBoard, type PipelineStageData } from "@/components/pipeline-board";
import { EmptyState } from "@/components/empty-state";

export default async function PipelinePage() {
  const session = await requireSession();

  const stages = await prisma.pipelineStage.findMany({
    where: { agencyId: session.user.agencyId },
    orderBy: { order: "asc" },
    include: {
      contacts: {
        orderBy: { updatedAt: "desc" },
        include: {
          calls: { orderBy: { startedAt: "desc" }, take: 1 },
          policies: {
            where: { status: "ACTIVE" },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  const boardStages: PipelineStageData[] = stages.map((stage) => ({
    id: stage.id,
    name: stage.name,
    color: stage.color,
    contacts: stage.contacts.map((contact) => {
      const lastCall = contact.calls[0];
      const activePolicy = contact.policies[0];

      return {
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        lastActivity: lastCall
          ? `${CALL_DIRECTION_LABELS[lastCall.direction]}: ${formatDateTime(lastCall.startedAt)}`
          : null,
        estimatedValue: activePolicy
          ? formatCurrency(activePolicy.monthlyPremium.toString())
          : null,
      };
    }),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Pipeline</h1>
          <p className="mt-1 text-sm text-gray-500">
            Arrastra un contacto entre columnas para actualizar su etapa.
          </p>
        </div>
        {session.user.role === "ADMIN" && (
          <Link
            href="/pipeline/settings"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Configurar pipeline
          </Link>
        )}
      </div>

      {boardStages.length === 0 ? (
        <EmptyState
          icon={Kanban}
          title="Todavía no hay etapas configuradas"
          description={
            session.user.role === "ADMIN"
              ? "Crea las etapas de tu proceso de venta para empezar a dar seguimiento a tus contactos."
              : "Pídele a un administrador que configure las etapas del pipeline."
          }
          action={
            session.user.role === "ADMIN"
              ? { label: "Configurar pipeline", href: "/pipeline/settings" }
              : undefined
          }
        />
      ) : (
        <PipelineBoard stages={boardStages} />
      )}
    </div>
  );
}
