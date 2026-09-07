"use client";

import { useActionState, useState } from "react";
import {
  createAutomation,
  type AutomationActionState,
} from "@/app/(app)/automatizaciones/actions";
import {
  AUTOMATION_TRIGGER_LABELS,
  AUTOMATION_TRIGGER_VARIABLES,
  AUTOMATION_TEMPLATE_EXAMPLES,
} from "@/lib/automation-labels";
import type { AutomationTrigger } from "@/generated/prisma/enums";

const TRIGGERS: AutomationTrigger[] = [
  "STAGE_ENTERED",
  "POLICY_RENEWAL_UPCOMING",
  "MISSED_CALL",
];

export function AutomationForm({
  stages,
}: {
  stages: { id: string; name: string }[];
}) {
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState<AutomationTrigger>("STAGE_ENTERED");
  const [stageId, setStageId] = useState("");
  const [daysBeforeRenewal, setDaysBeforeRenewal] = useState("15");
  const [messageTemplate, setMessageTemplate] = useState("");

  const [state, formAction, pending] = useActionState<
    AutomationActionState,
    FormData
  >(async (prevState, formData) => {
    const result = await createAutomation(prevState, formData);
    if (!result.error) {
      setName("");
      setTrigger("STAGE_ENTERED");
      setStageId("");
      setDaysBeforeRenewal("15");
      setMessageTemplate("");
    }
    return result;
  }, {});

  function applyExample(key: string) {
    const example = AUTOMATION_TEMPLATE_EXAMPLES.find((e) => e.key === key);
    if (!example) return;

    setName(example.name);
    setTrigger(example.trigger);
    setMessageTemplate(example.messageTemplate);
    if (example.daysBeforeRenewal) {
      setDaysBeforeRenewal(String(example.daysBeforeRenewal));
    }
    if (example.stageNameHint) {
      const match = stages.find(
        (s) => s.name.toLowerCase() === example.stageNameHint
      );
      setStageId(match?.id ?? "");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-700">Plantillas de ejemplo</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {AUTOMATION_TEMPLATE_EXAMPLES.map((example) => (
            <button
              key={example.key}
              type="button"
              onClick={() => applyExample(example.key)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Usar &quot;{example.label}&quot;
            </button>
          ))}
        </div>
      </div>

      <form action={formAction} className="max-w-xl space-y-4">
        {state.error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
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
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
          />
        </div>

        <div>
          <label htmlFor="trigger" className="block text-sm font-medium text-gray-700">
            Cuando...
          </label>
          <select
            id="trigger"
            name="trigger"
            value={trigger}
            onChange={(e) => setTrigger(e.target.value as AutomationTrigger)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
          >
            {TRIGGERS.map((t) => (
              <option key={t} value={t}>
                {AUTOMATION_TRIGGER_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        {trigger === "STAGE_ENTERED" && (
          <div>
            <label htmlFor="stageId" className="block text-sm font-medium text-gray-700">
              Etapa del pipeline
            </label>
            <select
              id="stageId"
              name="stageId"
              required
              value={stageId}
              onChange={(e) => setStageId(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            >
              <option value="">Selecciona...</option>
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {trigger === "POLICY_RENEWAL_UPCOMING" && (
          <div>
            <label
              htmlFor="daysBeforeRenewal"
              className="block text-sm font-medium text-gray-700"
            >
              Días antes de la renovación
            </label>
            <input
              id="daysBeforeRenewal"
              name="daysBeforeRenewal"
              type="number"
              min={1}
              required
              value={daysBeforeRenewal}
              onChange={(e) => setDaysBeforeRenewal(e.target.value)}
              className="mt-1 block w-32 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </div>
        )}

        <div>
          <label
            htmlFor="messageTemplate"
            className="block text-sm font-medium text-gray-700"
          >
            Mensaje
          </label>
          <textarea
            id="messageTemplate"
            name="messageTemplate"
            rows={3}
            required
            value={messageTemplate}
            onChange={(e) => setMessageTemplate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Variables disponibles:{" "}
            {AUTOMATION_TRIGGER_VARIABLES[trigger].map((v) => `{${v}}`).join(", ")}
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="active"
            defaultChecked
            className="rounded border-gray-300"
          />
          Activa
        </label>

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-700 disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Crear automatización"}
        </button>
      </form>
    </div>
  );
}
