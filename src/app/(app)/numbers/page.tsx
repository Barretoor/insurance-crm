import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { stateLabel } from "@/lib/us-states";
import { appUrl } from "@/lib/twilio";
import { PhoneNumberForm } from "@/components/phone-number-form";
import { togglePhoneNumberActive, reconfigureWebhooks } from "./actions";

function inboundWebhookUrl(): string | null {
  try {
    return appUrl("/api/twilio/voice/inbound");
  } catch {
    return null;
  }
}

export default async function NumbersPage() {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const numbers = await prisma.phoneNumber.findMany({
    where: { agencyId: session.user.agencyId },
    orderBy: { areaCode: "asc" },
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const callCounts = await prisma.call.groupBy({
    by: ["phoneNumberId"],
    where: {
      phoneNumberId: { in: numbers.map((n) => n.id) },
      startedAt: { gte: startOfMonth, lt: startOfNextMonth },
    },
    _count: { _all: true },
  });
  const callCountByNumber = new Map(
    callCounts.map((c) => [c.phoneNumberId, c._count._all])
  );

  const monthLabel = new Intl.DateTimeFormat("es-US", {
    month: "long",
    year: "numeric",
  }).format(now);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
          Administrar números
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Pool de números de Twilio usados para presencia local al llamar
          contactos. Compra los números en el dashboard de Twilio y regístralos
          aquí.
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Al agregar un número, configuramos automáticamente sus webhooks de
          voz y SMS entrantes en Twilio.
          {inboundWebhookUrl() && (
            <>
              {" "}
              Si falla, configúralos tú manualmente ahí:{" "}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                {inboundWebhookUrl()}
              </code>
            </>
          )}
        </p>
      </div>

      <PhoneNumberForm />

      {numbers.length === 0 ? (
        <p className="rounded-md border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500">
          Todavía no hay números registrados.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500">
                  Número
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">
                  Código de área
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">
                  Estado
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">
                  Activo
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">
                  Llamadas ({monthLabel})
                </th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-surface">
              {numbers.map((phoneNumber) => (
                <tr key={phoneNumber.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {phoneNumber.number}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {phoneNumber.areaCode}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {stateLabel(phoneNumber.state) || "—"}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        phoneNumber.active
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {phoneNumber.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {callCountByNumber.get(phoneNumber.id) ?? 0}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <form action={reconfigureWebhooks}>
                        <input type="hidden" name="id" value={phoneNumber.id} />
                        <button
                          type="submit"
                          className="text-sm font-medium text-gray-500 hover:text-gray-900 hover:underline"
                        >
                          Reconfigurar
                        </button>
                      </form>
                      <form action={togglePhoneNumberActive}>
                        <input type="hidden" name="id" value={phoneNumber.id} />
                        <button
                          type="submit"
                          className="text-sm font-medium text-gray-500 hover:text-gray-900 hover:underline"
                        >
                          {phoneNumber.active ? "Desactivar" : "Activar"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
