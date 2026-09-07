import { redirect } from "next/navigation";
import { Zap } from "lucide-react";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AutomationForm } from "@/components/automation-form";
import { EmptyState } from "@/components/empty-state";
import { AUTOMATION_TRIGGER_LABELS } from "@/lib/automation-labels";
import { toggleAutomationActive, deleteAutomation } from "./actions";

export default async function AutomatizacionesPage() {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [automations, stages] = await Promise.all([
    prisma.automation.findMany({
      where: { agencyId: session.user.agencyId },
      orderBy: { createdAt: "desc" },
      include: { stage: { select: { name: true } } },
    }),
    prisma.pipelineStage.findMany({
      where: { agencyId: session.user.agencyId },
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
          Automatizaciones
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Reglas simples: cuando pasa algo, se manda un SMS automáticamente.
          Se revisan una vez al día.
        </p>
      </div>

      <section className="rounded-md border border-gray-200 p-4">
        <AutomationForm stages={stages} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-gray-900">Tus automatizaciones</h2>

        {automations.length === 0 ? (
          <EmptyState
            icon={Zap}
            title="Sin automatizaciones todavía"
            description="Crea una arriba para empezar a enviar mensajes automáticos."
          />
        ) : (
          <div className="divide-y divide-gray-100 rounded-md border border-gray-200">
            {automations.map((automation) => (
              <div
                key={automation.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">
                      {automation.name}
                    </p>
                    <span
                      className={`inline-flex flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        automation.active
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {automation.active ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {AUTOMATION_TRIGGER_LABELS[automation.trigger]}
                    {automation.trigger === "STAGE_ENTERED" &&
                      automation.stage &&
                      ` · ${automation.stage.name}`}
                    {automation.trigger === "POLICY_RENEWAL_UPCOMING" &&
                      ` · ${automation.daysBeforeRenewal} días antes`}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                    {automation.messageTemplate}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  <form action={toggleAutomationActive}>
                    <input type="hidden" name="id" value={automation.id} />
                    <button
                      type="submit"
                      className="text-sm font-medium text-gray-500 hover:text-gray-900 hover:underline"
                    >
                      {automation.active ? "Desactivar" : "Activar"}
                    </button>
                  </form>
                  <form action={deleteAutomation}>
                    <input type="hidden" name="id" value={automation.id} />
                    <button
                      type="submit"
                      className="text-sm font-medium text-red-600 hover:text-red-800 hover:underline"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
