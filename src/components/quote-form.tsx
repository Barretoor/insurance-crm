"use client";

import { useActionState } from "react";
import Link from "next/link";
import { US_STATES } from "@/lib/us-states";
import { submitQuoteRequest, type QuoteFormState } from "@/app/cotizacion/actions";

export function QuoteForm() {
  const [state, formAction, pending] = useActionState<QuoteFormState, FormData>(
    submitQuoteRequest,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      {/* Honeypot - hidden from real visitors, irresistible to bots. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
      />

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nombre *
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
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Teléfono *
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="(214) 555-0100"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
        />
      </div>

      <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
        <label htmlFor="smsConsent" className="flex items-start gap-2.5 text-sm text-gray-700">
          <input
            id="smsConsent"
            name="smsConsent"
            type="checkbox"
            className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-accent-600 focus:ring-accent-500"
          />
          <span>
            Acepto recibir mensajes de texto (SMS) de Andrea Insurance sobre mi cotización,
            recordatorios de citas y actualizaciones de mi póliza. La frecuencia de mensajes
            varía y pueden aplicar tarifas de mensajes y datos. Puedo responder{" "}
            <strong>STOP</strong> para cancelar en cualquier momento. Ver{" "}
            <Link href="/privacidad" className="underline hover:text-gray-900" target="_blank">
              Política de Privacidad
            </Link>{" "}
            y{" "}
            <Link href="/terminos" className="underline hover:text-gray-900" target="_blank">
              Términos y Condiciones
            </Link>
            .
          </span>
        </label>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            Ciudad
          </label>
          <input
            id="city"
            name="city"
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
          />
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            Estado
          </label>
          <select
            id="state"
            name="state"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
          >
            <option value="">Selecciona…</option>
            {US_STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          ¿Qué tipo de cobertura buscas?
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-accent-600 transition-colors px-4 py-2 text-sm font-medium text-white hover:bg-accent-700 disabled:opacity-60"
      >
        {pending ? "Enviando..." : "Solicitar cotización"}
      </button>
    </form>
  );
}
