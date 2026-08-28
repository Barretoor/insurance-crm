"use client";

import { useActionState, useRef } from "react";
import { createTask, type TaskActionState } from "@/app/(app)/tareas/actions";

export function TaskForm({
  contactId,
  compact,
}: {
  contactId?: string;
  compact?: boolean;
}) {
  const [state, formAction, pending] = useActionState<TaskActionState, FormData>(
    async (prevState, formData) => {
      const result = await createTask(prevState, formData);
      if (!result.error) formRef.current?.reset();
      return result;
    },
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      ref={formRef}
      action={formAction}
      className={compact ? "flex flex-wrap items-end gap-2" : "flex flex-wrap items-end gap-3"}
    >
      {contactId && <input type="hidden" name="contactId" value={contactId} />}

      <div className="flex-1 min-w-[160px]">
        {!compact && (
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Título
          </label>
        )}
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="Nueva tarea..."
          className={`mt-1 block w-full rounded-md border border-gray-300 px-3 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 ${
            compact ? "py-1.5" : "py-2"
          }`}
        />
      </div>

      <div>
        {!compact && (
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
            Fecha
          </label>
        )}
        <input
          id="dueDate"
          name="dueDate"
          type="date"
          required
          defaultValue={today}
          className={`mt-1 block rounded-md border border-gray-300 px-3 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 ${
            compact ? "py-1.5" : "py-2"
          }`}
        />
      </div>

      <div>
        {!compact && (
          <label htmlFor="recurrence" className="block text-sm font-medium text-gray-700">
            Repetir
          </label>
        )}
        <select
          id="recurrence"
          name="recurrence"
          defaultValue="NONE"
          className={`mt-1 block rounded-md border border-gray-300 px-3 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 ${
            compact ? "py-1.5" : "py-2"
          }`}
        >
          <option value="NONE">No se repite</option>
          <option value="DAILY">Diaria</option>
          <option value="WEEKLY">Semanal</option>
          <option value="MONTHLY">Mensual</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-700 disabled:opacity-60"
      >
        {pending ? "Agregando..." : "Agregar"}
      </button>

      {state.error && (
        <p className="w-full text-sm text-red-700">{state.error}</p>
      )}
    </form>
  );
}
