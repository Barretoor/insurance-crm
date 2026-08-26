"use client";

import { useActionState } from "react";
import { US_STATES } from "@/lib/us-states";
import { createPhoneNumber } from "@/app/(app)/numbers/actions";

export function PhoneNumberForm() {
  const [state, formAction, pending] = useActionState(createPhoneNumber, {});

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      {state.error && (
        <p className="w-full rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.warning && (
        <p className="w-full rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {state.warning}
        </p>
      )}

      <div>
        <label htmlFor="number" className="block text-sm font-medium text-gray-700">
          Número (E.164)
        </label>
        <input
          id="number"
          name="number"
          type="text"
          required
          placeholder="+12145551234"
          className="mt-1 block w-48 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
        />
      </div>

      <div>
        <label htmlFor="state" className="block text-sm font-medium text-gray-700">
          Estado
        </label>
        <select
          id="state"
          name="state"
          className="mt-1 block w-40 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
        >
          <option value="">Sin especificar</option>
          {US_STATES.map((s) => (
            <option key={s.code} value={s.code}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent-600 transition-colors px-4 py-2 text-sm font-medium text-white hover:bg-accent-700 disabled:opacity-60"
      >
        {pending ? "Agregando..." : "Agregar número"}
      </button>
    </form>
  );
}
