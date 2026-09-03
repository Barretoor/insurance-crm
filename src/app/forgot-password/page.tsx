import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Te enviamos un enlace para restablecerla.
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}
