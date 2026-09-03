"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/forgot-password/actions";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, {});

  if (state.submitted) {
    return (
      <div className="space-y-4 text-center">
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Si ese correo tiene una cuenta, te enviamos un enlace para
          restablecer tu contraseña. Revisa tu bandeja de entrada.
        </p>
        <Link
          href="/login"
          className="inline-block text-sm font-medium text-gray-900 underline"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-accent-600 transition-colors px-3 py-2 text-sm font-medium text-white hover:bg-accent-700 disabled:opacity-60"
      >
        {pending ? "Enviando..." : "Enviar enlace de restablecimiento"}
      </button>

      <p className="text-center text-sm text-gray-500">
        <Link href="/login" className="font-medium text-gray-900 underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}
