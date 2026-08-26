import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import {
  CALL_DIRECTION_LABELS,
  CALL_STATUS_BADGE_CLASSES,
  CALL_STATUS_LABELS,
  formatDateTime,
  formatDuration,
} from "@/lib/call-labels";

export default async function UnmatchedCallsPage() {
  const session = await requireSession();

  const calls = await prisma.call.findMany({
    where: {
      contactId: null,
      phoneNumber: { agencyId: session.user.agencyId },
    },
    orderBy: { startedAt: "desc" },
    include: { recording: true, phoneNumber: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
          Llamadas sin contacto asociado
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Llamadas (casi siempre entrantes) de números que no coinciden con
          ningún contacto registrado. Crea el contacto para vincularlas.
        </p>
      </div>

      {calls.length === 0 ? (
        <p className="rounded-md border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500">
          No hay llamadas sin asociar.
        </p>
      ) : (
        <div className="space-y-3">
          {calls.map((call) => (
            <div key={call.id} className="rounded-md border border-gray-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {call.fromNumber}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(call.startedAt)} ·{" "}
                    {CALL_DIRECTION_LABELS[call.direction]} · a{" "}
                    {call.phoneNumber?.number ?? call.toNumber} · duración{" "}
                    {formatDuration(call.durationSec)}
                    {call.wentToVoicemail && " · fue a buzón de voz"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CALL_STATUS_BADGE_CLASSES[call.status]}`}
                  >
                    {CALL_STATUS_LABELS[call.status]}
                  </span>
                  <Link
                    href={`/contacts/new?phone=${encodeURIComponent(call.fromNumber)}`}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Crear contacto
                  </Link>
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
    </div>
  );
}
