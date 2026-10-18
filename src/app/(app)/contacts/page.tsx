import Link from "next/link";
import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { US_STATES } from "@/lib/us-states";
import { EmptyState } from "@/components/empty-state";
import { ContactRow } from "@/components/contact-row";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; state?: string }>;
}) {
  const session = await requireSession();
  const agencyId = session.user.agencyId;
  const { q, state } = await searchParams;

  const contacts = await prisma.contact.findMany({
    where: {
      agencyId,
      ...(state ? { state } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      city: true,
      state: true,
      stage: { select: { name: true, color: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
      calls: { orderBy: { startedAt: "desc" }, take: 1, select: { startedAt: true } },
      _count: { select: { policies: true } },
    },
  });
  const now = new Date();

  const usedStates = await prisma.contact.findMany({
    where: { agencyId, state: { not: null } },
    distinct: ["state"],
    select: { state: true },
    orderBy: { state: "asc" },
  });
  const stateOptions = usedStates
    .map((c) => c.state)
    .filter((s): s is string => Boolean(s));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Contactos</h1>
          <p className="mt-1 text-sm text-gray-500">
            {contacts.length} {contacts.length === 1 ? "contacto" : "contactos"}
          </p>
        </div>
        <Link
          href="/contacts/new"
          className="rounded-md bg-accent-600 transition-colors px-4 py-2 text-sm font-medium text-white hover:bg-accent-700"
        >
          Nuevo contacto
        </Link>
      </div>

      <form className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="q" className="block text-sm font-medium text-gray-700">
            Buscar
          </label>
          <input
            id="q"
            name="q"
            type="text"
            defaultValue={q ?? ""}
            placeholder="Nombre, teléfono o correo"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
          />
        </div>

        <div>
          <label
            htmlFor="state"
            className="block text-sm font-medium text-gray-700"
          >
            Estado
          </label>
          <select
            id="state"
            name="state"
            defaultValue={state ?? ""}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
          >
            <option value="">Todos</option>
            {stateOptions.map((code) => (
              <option key={code} value={code}>
                {US_STATES.find((s) => s.code === code)?.label ?? code}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Filtrar
        </button>
        {(q || state) && (
          <Link
            href="/contacts"
            className="text-sm font-medium text-gray-500 underline"
          >
            Limpiar
          </Link>
        )}
      </form>

      {contacts.length === 0 ? (
        q || state ? (
          <EmptyState
            icon={Users}
            title="Ningún contacto coincide con tu búsqueda"
            description="Prueba con otro nombre, teléfono o correo, o quita el filtro de estado."
          />
        ) : (
          <EmptyState
            icon={Users}
            title="Aún no tienes contactos"
            description="Agrega tu primer contacto para empezar a darle seguimiento en el pipeline."
            action={{ label: "Nuevo contacto", href: "/contacts/new" }}
          />
        )
      ) : (
        <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-surface">
          {contacts.map((contact) => (
            <ContactRow
              key={contact.id}
              now={now}
              contact={{
                id: contact.id,
                name: contact.name,
                phone: contact.phone,
                email: contact.email,
                city: contact.city,
                state: contact.state,
                stage: contact.stage,
                policyCount: contact._count.policies,
                lastActivity:
                  [contact.messages[0]?.createdAt, contact.calls[0]?.startedAt]
                    .filter((d): d is Date => Boolean(d))
                    .sort((a, b) => b.getTime() - a.getTime())[0] ?? null,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
