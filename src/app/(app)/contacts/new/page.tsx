import { ContactForm } from "@/components/contact-form";
import { createContact } from "../actions";

export default async function NewContactPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>;
}) {
  const { phone } = await searchParams;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Nuevo contacto</h1>
      <ContactForm
        action={createContact}
        submitLabel="Crear contacto"
        defaultValues={phone ? { phone } : undefined}
      />
    </div>
  );
}
