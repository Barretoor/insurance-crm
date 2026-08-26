import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PolicyForm } from "@/components/policy-form";
import { createPolicy } from "../actions";

export default async function NewPolicyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const contact = await prisma.contact.findFirst({
    where: { id, agencyId: session.user.agencyId },
    select: { id: true, name: true },
  });

  if (!contact) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Nueva póliza</h1>
        <p className="mt-1 text-sm text-gray-500">Para {contact.name}</p>
      </div>
      <PolicyForm
        action={createPolicy.bind(null, contact.id)}
        submitLabel="Crear póliza"
      />
    </div>
  );
}
