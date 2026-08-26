"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CallButton({ contactId }: { contactId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<
    { type: "error" | "success"; text: string } | null
  >(null);

  async function handleClick() {
    setPending(true);
    setMessage(null);

    try {
      const response = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage({
          type: "error",
          text: data?.error ?? "No se pudo iniciar la llamada.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: "Llamando a tu teléfono para conectarte con el contacto...",
      });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "No se pudo iniciar la llamada." });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
      >
        {pending ? "Llamando..." : "Llamar"}
      </button>
      {message && (
        <p
          className={`text-sm ${
            message.type === "error" ? "text-red-700" : "text-green-700"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
