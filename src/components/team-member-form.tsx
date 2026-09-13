"use client";

import { useActionState, useState } from "react";
import { createTeamMember, type CreateTeamMemberState } from "@/app/(app)/equipo/actions";

export function TeamMemberForm() {
  const [copied, setCopied] = useState(false);
  const [state, formAction, pending] = useActionState<CreateTeamMemberState, FormData>(
    async (prevState, formData) => {
      setCopied(false);
      return createTeamMember(prevState, formData);
    },
    {}
  );

  if (state.inviteUrl) {
    return (
      <div className="space-y-3">
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          {state.emailSent
            ? "Cuenta creada. Le enviamos un correo para que cree su contraseña."
            : "Cuenta creada, pero no se pudo enviar el correo automáticamente. Comparte este enlace tú mismo:"}
        </p>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={state.inviteUrl}
            onFocus={(e) => e.target.select()}
            className="block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600"
          />
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(state.inviteUrl!);
              setCopied(true);
            }}
            className="flex-shrink-0 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
        <p className="text-xs text-gray-500">El enlace expira en 7 días.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="max-w-md space-y-4">
      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
        />
      </div>

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

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Rol
        </label>
        <select
          id="role"
          name="role"
          defaultValue="AGENT"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
        >
          <option value="AGENT">Agente</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-700 disabled:opacity-60"
      >
        {pending ? "Agregando..." : "Agregar agente"}
      </button>
    </form>
  );
}
