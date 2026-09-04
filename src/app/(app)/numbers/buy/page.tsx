import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { BuyNumberSearch } from "@/components/buy-number-search";

export default async function BuyNumberPage() {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/numbers"
          className="text-sm font-medium text-gray-500 hover:text-gray-900 hover:underline"
        >
          ← Administrar números
        </Link>
        <h1 className="mt-2 text-2xl font-medium text-gray-900 tracking-tight">
          Comprar número
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Busca números de Twilio disponibles por código de área o ciudad. Al
          comprar uno, queda registrado en tu pool y configurado
          automáticamente para recibir llamadas y mensajes de texto.
        </p>
      </div>

      <BuyNumberSearch />
    </div>
  );
}
