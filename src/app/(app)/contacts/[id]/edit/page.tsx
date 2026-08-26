import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { ContactForm } from "@/components/contact-form";
import { updateContact } from "../../actions";

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const contact = await prisma.contact.findFirst({
    where: { id, agencyId: session.user.agencyId },
  });

  if (!contact) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
        Editar contacto
      </h1>
      <ContactForm
        action={updateContact.bind(null, contact.id)}
        submitLabel="Guardar cambios"
        defaultValues={{
          name: contact.name,
          phone: contact.phone ?? "",
          email: contact.email ?? "",
          address: contact.address ?? "",
          city: contact.city ?? "",
          state: contact.state ?? "",
          notes: contact.notes ?? "",
        }}
      />
    </div>
  );
}
