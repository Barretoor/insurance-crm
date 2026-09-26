import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gracias | Andrea Insurance",
};

export default function GraciasPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-3 text-center">
        <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
          ¡Gracias!
        </h1>
        <p className="text-sm text-gray-500">
          Recibimos tu solicitud. Un agente de Andrea Insurance se pondrá en
          contacto contigo pronto.
        </p>
        <Link
          href="/cotizacion"
          className="inline-block text-sm font-medium text-accent-600 hover:underline"
        >
          Volver al formulario
        </Link>
      </div>
    </div>
  );
}
