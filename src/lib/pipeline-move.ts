export type PipelineCardData = {
  id: string;
  name: string;
  phone: string | null;
  lastActivity: string | null;
  monthlyValue: number;
};

export type PipelineStageData = {
  id: string;
  name: string;
  color: string;
  /** Real number of contacts in the stage (may exceed contacts.length, which is capped). */
  count: number;
  totalMonthly: number;
  contacts: PipelineCardData[];
};

const round2 = (n: number) => Math.max(0, Math.round(n * 100) / 100);

/** Moves a card to the top of another stage, keeping each stage's count and monthly total in step. */
export function moveInStages(
  stages: PipelineStageData[],
  contactId: string,
  targetStageId: string
): PipelineStageData[] {
  const source = stages.find((s) => s.contacts.some((c) => c.id === contactId));
  if (!source || source.id === targetStageId) return stages;
  if (!stages.some((s) => s.id === targetStageId)) return stages;

  const contact = source.contacts.find((c) => c.id === contactId);
  if (!contact) return stages;

  return stages.map((stage) => {
    if (stage.id === source.id) {
      return {
        ...stage,
        count: Math.max(0, stage.count - 1),
        totalMonthly: round2(stage.totalMonthly - contact.monthlyValue),
        contacts: stage.contacts.filter((c) => c.id !== contactId),
      };
    }
    if (stage.id === targetStageId) {
      return {
        ...stage,
        count: stage.count + 1,
        totalMonthly: round2(stage.totalMonthly + contact.monthlyValue),
        contacts: [contact, ...stage.contacts],
      };
    }
    return stage;
  });
}
