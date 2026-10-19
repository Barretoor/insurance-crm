import { describe, expect, it } from "vitest";
import { moveInStages, type PipelineStageData } from "./pipeline-move";

const card = (id: string, monthlyValue = 0) => ({
  id,
  name: id,
  phone: null,
  lastActivity: null,
  monthlyValue,
});

const stages = (): PipelineStageData[] => [
  { id: "new", name: "Nuevo", color: "#000", count: 40, totalMonthly: 150.5, contacts: [card("a", 50.25), card("b")] },
  { id: "won", name: "Póliza", color: "#000", count: 1, totalMonthly: 10, contacts: [card("c", 10)] },
];

describe("moveInStages", () => {
  it("moves the card to the top of the target and updates counts and totals", () => {
    const [from, to] = moveInStages(stages(), "a", "won");
    expect(from.contacts.map((c) => c.id)).toEqual(["b"]);
    expect(from.count).toBe(39);
    expect(from.totalMonthly).toBe(100.25);
    expect(to.contacts.map((c) => c.id)).toEqual(["a", "c"]);
    expect(to.count).toBe(2);
    expect(to.totalMonthly).toBe(60.25);
  });

  it("returns the same stages when the target is the current stage, unknown, or the card is missing", () => {
    const original = stages();
    expect(moveInStages(original, "a", "new")).toBe(original);
    expect(moveInStages(original, "a", "nope")).toBe(original);
    expect(moveInStages(original, "zzz", "won")).toBe(original);
  });

  it("never lets totals or counts go negative", () => {
    const tight = stages();
    tight[0].count = 0;
    tight[0].totalMonthly = 0;
    const [from] = moveInStages(tight, "a", "won");
    expect(from.count).toBe(0);
    expect(from.totalMonthly).toBe(0);
  });
});
