import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Phone, ListChecks, CalendarClock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { stateLabel } from "@/lib/us-states";
import { EmptyState } from "@/components/empty-state";
import {
  POLICY_STATUS_BADGE_CLASSES,
  POLICY_STATUS_LABELS,
  POLICY_TYPE_LABELS,
  formatCurrency,
  formatDate,
} from "@/lib/policy-labels";
import {
  CALL_DIRECTION_BADGE_CLASSES,
  CALL_DIRECTION_ICONS,
  CALL_DIRECTION_LABELS,
  CALL_STATUS_BADGE_CLASSES,
  CALL_STATUS_LABELS,
  formatDateTime,
  formatDuration,
} from "@/lib/call-labels";
import {
  APPOINTMENT_STATUS_BADGE_CLASSES,
  APPOINTMENT_STATUS_LABELS,
  formatDurationMin,
  formatTime,
} from "@/lib/appointment-labels";
import { CallButton } from "@/components/call-button";
import { RefreshButton } from "@/components/refresh-button";
import { TaskForm } from "@/components/task-form";
import { TaskItem } from "@/components/task-item";
import { AppointmentForm } from "@/components/appointment-form";
import { MessageThread } from "@/components/message-thread";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const contact = await prisma.contact.findFirst({
    where: { id, agencyId: session.user.agencyId },
    include: {
      policies: { orderBy: { renewalDate: "asc" } },
      calls: {
        orderBy: { startedAt: "desc" },
        include: { recording: true, user: { select: { name: true, email: true } } },
      },
      tasks: {
        orderBy: [{ completed: "asc" }, { dueDate: "asc" }],
      },
      appointments: {
        where: { status: "SCHEDULED", startsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!contact) {
    notFound();
  }

  // Mark any unread inbound texts as read now that the agent is viewing this
  // thread, so the sidebar's unread badge reflects it on the next request.
  await prisma.message.updateMany({
    where: { contactId: contact.id, direction: "INBOUND", read: false },
    data: { read: true },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
            {contact.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {[contact.city, stateLabel(contact.state)].filter(Boolean).join(", ") ||
              "Sin ubicación registrada"}
          </p>
        </div>
        <div className="flex items-start gap-3">
          {contact.phone && <CallButton contactId={contact.id} />}
          <Link
            href={`/contacts/${contact.id}/edit`}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Editar contacto
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoRow label="Teléfono" value={contact.phone} />
        <InfoRow label="Código de área" value={contact.areaCode} />
        <InfoRow label="Correo" value={contact.email} />
        <InfoRow label="Dirección" value={contact.address} />
        <InfoRow label="Ciudad" value={contact.city} />
        <InfoRow label="Estado" value={stateLabel(contact.state)} />
      </section>

      {contact.notes && (
        <section>
          <h2 className="text-sm font-medium text-gray-700">Notas</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
            {contact.notes}
          </p>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Pólizas</h2>
          <Link
            href={`/contacts/${contact.id}/policies/new`}
            className="rounded-md bg-accent-600 transition-colors px-4 py-2 text-sm font-medium text-white hover:bg-accent-700"
          >
            Agregar póliza
          </Link>
        </div>

        {contact.policies.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Sin pólizas todavía"
            description="Registra la primera póliza de este contacto para llevar el seguimiento de primas y renovaciones."
            action={{
              label: "Agregar póliza",
              href: `/contacts/${contact.id}/policies/new`,
            }}
          />
        ) : (
          <div className="overflow-x-auto rounded-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">
                    Tipo
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">
                    Aseguradora
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">
                    No. póliza
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">
                    Prima mensual
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">
                    Renueva
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">
                    Estado
                  </th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-surface">
                {contact.policies.map((policy) => (
                  <tr key={policy.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-900">
                      {POLICY_TYPE_LABELS[policy.type]}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {policy.insurer}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {policy.policyNumber ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {formatCurrency(policy.monthlyPremium.toString())}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {formatDate(policy.renewalDate)}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${POLICY_STATUS_BADGE_CLASSES[policy.status]}`}
                      >
                        {POLICY_STATUS_LABELS[policy.status]}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Link
                        href={`/contacts/${contact.id}/policies/${policy.id}/edit`}
                        className="text-sm font-medium text-gray-500 hover:text-gray-900 hover:underline"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            Historial de llamadas
          </h2>
          <RefreshButton />
        </div>

        {contact.calls.length === 0 ? (
          <EmptyState
            icon={Phone}
            title="Sin llamadas todavía"
            description={
              contact.phone
                ? "Usa el botón \"Llamar\" arriba para registrar la primera."
                : "Agrega un teléfono a este contacto para poder llamarlo desde el CRM."
            }
          />
        ) : (
          <div className="space-y-3">
            {contact.calls.map((call) => (
              <div
                key={call.id}
                className="rounded-md border border-gray-200 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDateTime(call.startedAt)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {call.direction === "OUTBOUND"
                        ? (call.user?.name ?? call.user?.email ?? "Agente")
                        : "Llamada del contacto"}{" "}
                      · {call.fromNumber} → {call.toNumber} · duración{" "}
                      {formatDuration(call.durationSec)}
                      {call.wentToVoicemail && " · fue a buzón de voz"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${CALL_DIRECTION_BADGE_CLASSES[call.direction]}`}
                    >
                      <span aria-hidden>
                        {CALL_DIRECTION_ICONS[call.direction]}
                      </span>
                      {CALL_DIRECTION_LABELS[call.direction]}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CALL_STATUS_BADGE_CLASSES[call.status]}`}
                    >
                      {CALL_STATUS_LABELS[call.status]}
                    </span>
                  </div>
                </div>

                {call.recording ? (
                  <audio
                    controls
                    preload="none"
                    className="mt-3 w-full"
                    src={`/api/recordings/${call.recording.id}/audio`}
                  />
                ) : (
                  <p className="mt-3 text-xs text-gray-400">
                    Sin grabación disponible todavía.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-gray-900">Mensajes</h2>

        {contact.phone ? (
          <MessageThread
            contactId={contact.id}
            initialMessages={contact.messages.map((m) => ({
              id: m.id,
              direction: m.direction,
              body: m.body,
              status: m.status,
              createdAt: m.createdAt.toISOString(),
            }))}
          />
        ) : (
          <EmptyState
            icon={Phone}
            title="Este contacto no tiene teléfono"
            description="Agrega un teléfono para poder enviarle mensajes de texto."
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-gray-900">
          Tareas relacionadas
        </h2>

        {contact.tasks.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="Sin tareas para este contacto"
            description="Agrega una abajo para darle seguimiento."
          />
        ) : (
          <div className="divide-y divide-gray-100 rounded-md border border-gray-200 px-4">
            {contact.tasks.map((task) => (
              <TaskItem key={task.id} task={{ ...task, contact: null }} />
            ))}
          </div>
        )}

        <details className="rounded-md border border-dashed border-gray-300 p-3">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            + Nueva tarea
          </summary>
          <div className="mt-3">
            <TaskForm contactId={contact.id} compact />
          </div>
        </details>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-gray-900">Próximas citas</h2>

        {contact.appointments.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Sin citas agendadas"
            description="Agenda la primera cita con este contacto."
          />
        ) : (
          <div className="space-y-2">
            {contact.appointments.map((appt) => (
              <div
                key={appt.id}
                className="flex items-center justify-between gap-3 rounded-md border border-gray-200 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(appt.startsAt)} · {formatTime(appt.startsAt)} ·{" "}
                    {appt.title}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {formatDurationMin(appt.durationMin)}
                  </p>
                </div>
                <span
                  className={`inline-flex flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${APPOINTMENT_STATUS_BADGE_CLASSES[appt.status]}`}
                >
                  {APPOINTMENT_STATUS_LABELS[appt.status]}
                </span>
              </div>
            ))}
          </div>
        )}

        <details className="rounded-md border border-dashed border-gray-300 p-3">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            + Agendar cita
          </summary>
          <div className="mt-3">
            <AppointmentForm fixedContactId={contact.id} />
          </div>
        </details>
      </section>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900">{value || "—"}</dd>
    </div>
  );
}
