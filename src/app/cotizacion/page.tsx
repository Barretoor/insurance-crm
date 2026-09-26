import type { Metadata } from "next";
import { QuoteForm } from "@/components/quote-form";

export const metadata: Metadata = {
  title: "Solicita tu cotización | Andrea Insurance",
  description:
    "Solicita una cotización gratis de seguro de vida con Andrea Insurance.",
};

export default function CotizacionPage() {
  return (
    <div className="flex flex-1 justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div>
          <p className="text-sm font-medium text-accent-600">Andrea Insurance</p>
          <h1 className="mt-1 text-2xl font-medium text-gray-900 tracking-tight">
            Solicita tu cotización de seguro de vida
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Cuéntanos un poco sobre ti y un agente se pondrá en contacto contigo.
          </p>
        </div>

        <QuoteForm />
      </div>
    </div>
  );
}
