"use client";

import { useActionState } from "react";
import { resetPassword } from "@/app/reset-password/actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPassword, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Nueva contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
        />
        <p className="mt-1 text-xs text-gray-500">Mínimo 8 caracteres.</p>
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700"
        >
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-accent-600 transition-colors px-3 py-2 text-sm font-medium text-white hover:bg-accent-700 disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Restablecer contraseña"}
      </button>
    </form>
  );
}
