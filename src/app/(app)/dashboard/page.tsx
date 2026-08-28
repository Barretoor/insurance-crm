import Link from "next/link";
import { ListChecks, CalendarClock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import {
  POLICY_TYPE_LABELS,
  formatCurrency,
  formatDate,
} from "@/lib/policy-labels";

export default async function DashboardPage() {
  const session = await requireSession();
  const agencyId = session.user.agencyId;

  const now = new Date();
  const in30Days = new Date(now);
  in30Days.setDate(in30Days.getDate() + 30);

  const startOfToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const endOfToday = new Date(startOfToday);
  endOfToday.setUTCDate(endOfToday.getUTCDate() + 1);
  endOfToday.setUTCMilliseconds(-1);

  const [tasksToday, appointmentsToday] = await Promise.all([
    prisma.task.count({
      where: { agencyId, completed: false, dueDate: { lte: endOfToday } },
    }),
    prisma.appointment.count({
      where: {
        agencyId,
        status: "SCHEDULED",
        startsAt: { gte: startOfToday, lte: endOfToday },
      },
    }),
  ]);

  const upcomingRenewals = await prisma.policy.findMany({
    where: {
      status: "ACTIVE",
      renewalDate: { gte: now, lte: in30Days },
      contact: { agencyId },
    },
    orderBy: { renewalDate: "asc" },
    include: { contact: { select: { id: true, name: true } } },
  });

  const pipelineStages = await prisma.pipelineStage.findMany({
    where: { agencyId },
    orderBy: { order: "asc" },
    include: { _count: { select: { contacts: true } } },
  });
  const totalContactsInPipeline = pipelineStages.reduce(
    (sum, s) => sum + s._count.contacts,
    0
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
          Bienvenido, {session.user.name ?? session.user.email}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Resumen de tu agencia.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/tareas"
          className="flex items-center gap-3 rounded-md border border-gray-200 p-4 transition-colors hover:bg-gray-50"
        >
          <ListChecks className="h-5 w-5 flex-shrink-0 text-gray-400" strokeWidth={1.75} />
          <div>
            <p className="text-xl font-semibold text-gray-900">{tasksToday}</p>
            <p className="text-sm text-gray-500">
              {tasksToday === 1 ? "tarea pendiente hoy" : "tareas pendientes hoy"}
            </p>
          </div>
        </Link>
        <Link
          href="/calendario"
          className="flex items-center gap-3 rounded-md border border-gray-200 p-4 transition-colors hover:bg-gray-50"
        >
          <CalendarClock className="h-5 w-5 flex-shrink-0 text-gray-400" strokeWidth={1.75} />
          <div>
            <p className="text-xl font-semibold text-gray-900">{appointmentsToday}</p>
            <p className="text-sm text-gray-500">
              {appointmentsToday === 1 ? "cita agendada hoy" : "citas agendadas hoy"}
            </p>
          </div>
        </Link>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Pipeline</h2>
          <Link
            href="/pipeline"
            className="text-sm font-medium text-gray-500 hover:text-gray-900 hover:underline"
          >
            Ver tablero →
          </Link>
        </div>

        {pipelineStages.length === 0 ? (
          <p className="rounded-md border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
            Todavía no hay etapas configuradas.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {pipelineStages.map((stage) => (
              <Link
                key={stage.id}
                href="/pipeline"
                className="rounded-md border border-gray-200 p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="truncate text-xs font-medium text-gray-700">
                    {stage.name}
                  </span>
                </div>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {stage._count.contacts}
                </p>
              </Link>
            ))}
          </div>
        )}
        {totalContactsInPipeline > 0 && (
          <p className="text-xs text-gray-400">
            {totalContactsInPipeline} contactos en el pipeline.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">
          Pólizas próximas a renovar (30 días)
        </h2>

        {upcomingRenewals.length === 0 ? (
          <p className="rounded-md border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
            No hay pólizas por renovar en los próximos 30 días.
          </p>
        ) : (
          <div className="overflow-hidden rounded-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">
                    Contacto
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">
                    Tipo
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">
                    Aseguradora
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">
                    Prima mensual
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">
                    Renueva
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-surface">
                {upcomingRenewals.map((policy) => (
                  <tr key={policy.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <Link
                        href={`/contacts/${policy.contact.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {policy.contact.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {POLICY_TYPE_LABELS[policy.type]}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {policy.insurer}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {formatCurrency(policy.monthlyPremium.toString())}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {formatDate(policy.renewalDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
