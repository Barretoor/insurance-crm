"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-[#dc2626] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#b91c1c] disabled:opacity-60"
    >
      {pending ? "Eliminando..." : "Sí, eliminar"}
    </button>
  );
}

export function DeleteContactButton({
  contactId,
  contactName,
  optedOut,
  action,
}: {
  contactId: string;
  contactName: string;
  optedOut: boolean;
  action: (formData: FormData) => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        Eliminar
      </button>
    );
  }

  return (
    <form
      action={action}
      className="max-w-sm space-y-3 rounded-md border border-red-200 bg-red-50 p-3"
    >
      <input type="hidden" name="contactId" value={contactId} />
      <p className="text-sm font-medium text-red-800">¿Eliminar a {contactName}?</p>
      <p className="text-sm text-red-700">
        Se borrarán también sus pólizas, tareas, citas, mensajes y llamadas. Esto no se puede
        deshacer.
        {optedOut &&
          " Este contacto pidió no recibir más mensajes (STOP): si lo vuelves a agregar, ese registro se pierde."}
      </p>
      <div className="flex gap-2">
        <ConfirmButton />
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-md border border-gray-300 bg-surface px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
