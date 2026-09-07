import type { AutomationTrigger } from "@/generated/prisma/enums";

export const AUTOMATION_TRIGGER_LABELS: Record<AutomationTrigger, string> = {
  STAGE_ENTERED: "Contacto entra a una etapa del pipeline",
  POLICY_RENEWAL_UPCOMING: "Póliza próxima a renovar",
  MISSED_CALL: "Nueva llamada perdida",
};

/** Variables available in the message template for each trigger type. */
export const AUTOMATION_TRIGGER_VARIABLES: Record<AutomationTrigger, string[]> = {
  STAGE_ENTERED: ["nombre"],
  POLICY_RENEWAL_UPCOMING: ["nombre", "fecha_renovacion"],
  MISSED_CALL: ["nombre"],
};

export type AutomationTemplateExample = {
  key: string;
  label: string;
  name: string;
  trigger: AutomationTrigger;
  daysBeforeRenewal?: number;
  /** Matched against PipelineStage.name (case-insensitive) to prefill the stage picker. */
  stageNameHint?: string;
  messageTemplate: string;
};

export const AUTOMATION_TEMPLATE_EXAMPLES: AutomationTemplateExample[] = [
  {
    key: "renewal-reminder",
    label: "Recordatorio de renovación",
    name: "Recordatorio de renovación",
    trigger: "POLICY_RENEWAL_UPCOMING",
    daysBeforeRenewal: 15,
    messageTemplate:
      "Hola {nombre}, tu póliza está por renovarse el {fecha_renovacion}. Contáctanos si tienes alguna pregunta.",
  },
  {
    key: "welcome-lead",
    label: "Bienvenida a nuevo lead",
    name: "Bienvenida a nuevo lead",
    trigger: "STAGE_ENTERED",
    stageNameHint: "nuevo lead",
    messageTemplate:
      "Hola {nombre}, gracias por tu interés en nuestros seguros de vida. Pronto un agente se pondrá en contacto contigo.",
  },
];

/** Replaces {variable} placeholders in a template. Unknown/missing variables become empty text. */
export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => vars[key] ?? "");
}
