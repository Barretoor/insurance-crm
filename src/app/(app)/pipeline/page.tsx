import Link from "next/link";
import { Kanban } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { formatListStamp } from "@/lib/chat-time";
import { PipelineBoard, type PipelineStageData } from "@/components/pipeline-board";
import { EmptyState } from "@/components/empty-state";

// Cards rendered per stage. The real count is shown in the header and links to
// the full (filterable) contact list, so a big stage never bloats this page.
const CARDS_PER_STAGE = 30;

export default async function PipelinePage() {
  const session = await requireSession();
  const agencyId = session.user.agencyId;
  const now = new Date();

  const [stages, activePolicies] = await Promise.all([
    prisma.pipelineStage.findMany({
      where: { agencyId },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        color: true,
        _count: { select: { contacts: true } },
        contacts: {
          orderBy: { updatedAt: "desc" },
          take: CARDS_PER_STAGE,
          select: {
            id: true,
            name: true,
            phone: true,
            calls: {
              orderBy: { startedAt: "desc" },
              take: 1,
              select: { startedAt: true, direction: true },
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { createdAt: true, direction: true },
            },
            policies: { where: { status: "ACTIVE" }, select: { monthlyPremium: true } },
          },
        },
      },
    }),
    // Only two columns per row - cheap even for the whole agency - so each
    // stage's monthly total covers every contact, not just the visible cards.
    prisma.policy.findMany({
      where: { status: "ACTIVE", contact: { agencyId } },
      select: { monthlyPremium: true, contact: { select: { stageId: true } } },
    }),
  ]);

  const totalByStage = new Map<string, number>();
  for (const policy of activePolicies) {
    const stageId = policy.contact.stageId;
    if (!stageId) continue;
    totalByStage.set(stageId, (totalByStage.get(stageId) ?? 0) + Number(policy.monthlyPremium));
  }

  const boardStages: PipelineStageData[] = stages.map((stage) => ({
    id: stage.id,
    name: stage.name,
    color: stage.color,
    count: stage._count.contacts,
    totalMonthly: totalByStage.get(stage.id) ?? 0,
    contacts: stage.contacts.map((contact) => {
      const call = contact.calls[0];
      const message = contact.messages[0];
      const events = [
        call && {
          at: call.startedAt,
          label: call.direction === "INBOUND" ? "Llamada recibida" : "Llamada",
        },
        message && {
          at: message.createdAt,
          label: message.direction === "INBOUND" ? "Mensaje recibido" : "Mensaje enviado",
        },
      ].filter((e): e is { at: Date; label: string } => Boolean(e));
      const last = events.sort((a, b) => b.at.getTime() - a.at.getTime())[0];

      return {
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        lastActivity: last ? `${last.label} · ${formatListStamp(last.at, now)}` : null,
        monthlyValue: contact.policies.reduce((sum, p) => sum + Number(p.monthlyPremium), 0),
      };
    }),
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Pipeline</h1>
          <p className="mt-1 hidden text-sm text-gray-500 md:block">
            Arrastra un contacto entre columnas para actualizar su etapa.
          </p>
          <p className="mt-1 text-sm text-gray-500 md:hidden">
            Toca &ldquo;Mover&rdquo; en un contacto para cambiar su etapa.
          </p>
        </div>
        {session.user.role === "ADMIN" && (
          <Link
            href="/pipeline/settings"
            className="flex-shrink-0 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100"
          >
            Configurar
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
