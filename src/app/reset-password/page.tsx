import Link from "next/link";
import { ResetPasswordForm } from "@/components/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
            Restablecer contraseña
          </h1>
        </div>

        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="space-y-4 text-center">
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              Este enlace no es válido.
            </p>
            <Link
              href="/forgot-password"
              className="inline-block text-sm font-medium text-gray-900 underline"
            >
              Solicitar un nuevo enlace
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
