import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { TeamMemberForm } from "@/components/team-member-form";
import { EmptyState } from "@/components/empty-state";
import type { Role } from "@/generated/prisma/enums";

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  AGENT: "Agente",
};

export default async function EquipoPage() {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const members = await prisma.user.findMany({
    where: { agencyId: session.user.agencyId },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Equipo</h1>
        <p className="mt-1 text-sm text-gray-500">
          Agrega agentes a tu agencia. Cada uno crea su propia contraseña con
          un enlace que le mandamos por correo.
        </p>
      </div>

      <section className="rounded-md border border-gray-200 p-4">
        <TeamMemberForm />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-gray-900">Miembros de tu agencia</h2>

        {members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Solo estás tú por ahora"
            description="Agrega un agente arriba para que empiece a usar el CRM."
          />
        ) : (
          <div className="divide-y divide-gray-100 rounded-md border border-gray-200">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {member.name ?? member.email}
                  </p>
                  <p className="truncate text-xs text-gray-500">{member.email}</p>
                </div>
                <span className="inline-flex flex-shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {ROLE_LABELS[member.role]}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
