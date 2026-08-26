"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/(app)/profile/actions";

export function ProfileForm({
  defaultValues,
}: {
  defaultValues: { name: string; phone: string };
}) {
  const [state, formAction, pending] = useActionState(updateProfile, {});

  return (
    <form action={formAction} className="max-w-sm space-y-4">
      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Perfil actualizado.
        </p>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={defaultValues.name}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Mi teléfono (para recibir las llamadas que inicies)
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+12145550100"
          defaultValue={defaultValues.phone}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Formato E.164, ej. +12145550100. Twilio te llamará aquí primero y
          luego te conectará con el contacto.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent-600 transition-colors px-4 py-2 text-sm font-medium text-white hover:bg-accent-700 disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
