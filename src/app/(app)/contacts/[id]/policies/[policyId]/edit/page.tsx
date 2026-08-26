import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PolicyForm } from "@/components/policy-form";
import { updatePolicy } from "../../actions";

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default async function EditPolicyPage({
  params,
}: {
  params: Promise<{ id: string; policyId: string }>;
}) {
  const session = await requireSession();
  const { id, policyId } = await params;

  const policy = await prisma.policy.findFirst({
    where: { id: policyId, contactId: id, contact: { agencyId: session.user.agencyId } },
    include: { contact: { select: { id: true, name: true } } },
  });

  if (!policy) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
          Editar póliza
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Para {policy.contact.name}
        </p>
      </div>
      <PolicyForm
        action={updatePolicy.bind(null, policy.id, policy.contact.id)}
        submitLabel="Guardar cambios"
        defaultValues={{
          type: policy.type,
          insurer: policy.insurer,
          policyNumber: policy.policyNumber ?? "",
          monthlyPremium: policy.monthlyPremium.toString(),
          startDate: toDateInputValue(policy.startDate),
          renewalDate: toDateInputValue(policy.renewalDate),
          status: policy.status,
        }}
      />
    </div>
  );
}
