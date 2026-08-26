"use client";

import { useActionState } from "react";
import type { StageActionState } from "@/app/(app)/pipeline/settings/actions";

export function StageForm({
  action,
  defaultValues,
  submitLabel,
  compact,
}: {
  action: (
    prevState: StageActionState,
    formData: FormData
  ) => Promise<StageActionState>;
  defaultValues?: { name: string; color: string };
  submitLabel: string;
  compact?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form
      action={formAction}
      className={compact ? "flex items-center gap-2" : "flex flex-wrap items-end gap-3"}
    >
      <input
        type="color"
        name="color"
        defaultValue={defaultValues?.color ?? "#3B82F6"}
        className="h-9 w-9 cursor-pointer rounded border border-gray-300"
        aria-label="Color de la etapa"
      />
      <input
        type="text"
        name="name"
        required
        defaultValue={defaultValues?.name ?? ""}
        placeholder="Nombre de la etapa"
        className={`rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 ${
          compact ? "w-40" : "w-56"
        }`}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent-600 transition-colors px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-700 disabled:opacity-60"
      >
        {pending ? "Guardando..." : submitLabel}
      </button>
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
    </form>
  );
}
