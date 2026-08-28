"use client";

import { useActionState } from "react";
import {
  createAppointment,
  type AppointmentActionState,
} from "@/app/(app)/calendario/actions";

export function AppointmentForm({
  contacts,
  fixedContactId,
  defaultDate,
  submitLabel = "Agendar cita",
}: {
  contacts?: { id: string; name: string }[];
  fixedContactId?: string;
  defaultDate?: string;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState<
    AppointmentActionState,
    FormData
  >(createAppointment, {});

  return (
    <form action={formAction} className="max-w-md space-y-3">
      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      {fixedContactId ? (
        <input type="hidden" name="contactId" value={fixedContactId} />
      ) : (
        <div>
          <label htmlFor="contactId" className="block text-sm font-medium text-gray-700">
            Contacto
          </label>
          <select
            id="contactId"
            name="contactId"
            required
            defaultValue=""
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
          >
            <option value="" disabled>
              Selecciona un contacto…
            </option>
            {contacts?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Título
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="Llamada de seguimiento"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Fecha
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={defaultDate}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
          />
        </div>
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700">
            Hora
          </label>
          <input
            id="time"
            name="time"
            type="time"
            required
            defaultValue="09:00"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="durationMin" className="block text-sm font-medium text-gray-700">
          Duración (minutos)
        </label>
        <input
          id="durationMin"
          name="durationMin"
          type="number"
          min={5}
          step={5}
          defaultValue={30}
          className="mt-1 block w-32 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notas
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-700 disabled:opacity-60"
      >
        {pending ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}
