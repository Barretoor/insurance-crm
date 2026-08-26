"use client";

import { useActionState } from "react";
import { PolicyStatus, PolicyType } from "@/generated/prisma/enums";
import {
  POLICY_STATUS_LABELS,
  POLICY_TYPE_LABELS,
} from "@/lib/policy-labels";
import type { PolicyActionState } from "@/app/(app)/contacts/[id]/policies/actions";

type PolicyFormValues = {
  type: string;
  insurer: string;
  policyNumber: string;
  monthlyPremium: string;
  startDate: string;
  renewalDate: string;
  status: string;
};

const emptyValues: PolicyFormValues = {
  type: "TERM",
  insurer: "",
  policyNumber: "",
  monthlyPremium: "",
  startDate: "",
  renewalDate: "",
  status: "ACTIVE",
};

export function PolicyForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (
    prevState: PolicyActionState,
    formData: FormData
  ) => Promise<PolicyActionState>;
  defaultValues?: Partial<PolicyFormValues>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const values = { ...emptyValues, ...defaultValues };

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Tipo de póliza *
          </label>
          <select
            id="type"
            name="type"
            required
            defaultValue={values.type}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
          >
            {Object.values(PolicyType).map((type) => (
              <option key={type} value={type}>
                {POLICY_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Estado *
          </label>
          <select
            id="status"
            name="status"
            required
            defaultValue={values.status}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
          >
            {Object.values(PolicyStatus).map((status) => (
              <option key={status} value={status}>
                {POLICY_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="insurer" className="block text-sm font-medium text-gray-700">
            Aseguradora *
          </label>
          <input
            id="insurer"
            name="insurer"
            type="text"
            required
            defaultValue={values.insurer}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
          />
        </div>
        <div>
          <label
            htmlFor="policyNumber"
            className="block text-sm font-medium text-gray-700"
          >
            No. de póliza
          </label>
          <input
            id="policyNumber"
            name="policyNumber"
            type="text"
            defaultValue={values.policyNumber}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="monthlyPremium"
          className="block text-sm font-medium text-gray-700"
        >
          Prima mensual (USD) *
        </label>
        <input
          id="monthlyPremium"
          name="monthlyPremium"
          type="number"
          min="0"
          step="0.01"
          required
          defaultValue={values.monthlyPremium}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700"
          >
            Fecha de inicio *
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            required
            defaultValue={values.startDate}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
          />
        </div>
        <div>
          <label
            htmlFor="renewalDate"
            className="block text-sm font-medium text-gray-700"
          >
            Fecha de renovación *
          </label>
          <input
            id="renewalDate"
            name="renewalDate"
            type="date"
            required
            defaultValue={values.renewalDate}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent-600 transition-colors px-4 py-2 text-sm font-medium text-white hover:bg-accent-700 disabled:opacity-60"
      >
        {pending ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}
