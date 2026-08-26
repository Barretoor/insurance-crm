import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Phone } from "lucide-react";
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
import { CallButton } from "@/components/call-button";
import { RefreshButton } from "@/components/refresh-button";

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
    },
  });

  if (!contact) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
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
          <div className="overflow-hidden rounded-md border border-gray-200">
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
              <tbody className="divide-y divide-gray-100 bg-white">
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
