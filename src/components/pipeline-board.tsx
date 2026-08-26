"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { moveContactStage } from "@/app/(app)/pipeline/actions";

export type PipelineCardData = {
  id: string;
  name: string;
  phone: string | null;
  lastActivity: string | null;
  estimatedValue: string | null;
};

export type PipelineStageData = {
  id: string;
  name: string;
  color: string;
  contacts: PipelineCardData[];
};

export function PipelineBoard({
  stages: initialStages,
}: {
  stages: PipelineStageData[];
}) {
  const [stages, setStages] = useState(initialStages);
  const [, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const contactId = String(active.id);
    const targetStageId = String(over.id);
    const sourceStage = stages.find((s) =>
      s.contacts.some((c) => c.id === contactId)
    );
    if (!sourceStage || sourceStage.id === targetStageId) return;

    const contact = sourceStage.contacts.find((c) => c.id === contactId);
    if (!contact) return;

    const previousStages = stages;
    setStages((prev) =>
      prev.map((s) => {
        if (s.id === sourceStage.id) {
          return { ...s, contacts: s.contacts.filter((c) => c.id !== contactId) };
        }
        if (s.id === targetStageId) {
          return { ...s, contacts: [contact, ...s.contacts] };
        }
        return s;
      })
    );

    startTransition(async () => {
      const result = await moveContactStage(contactId, targetStageId);
      if (result?.error) {
        setStages(previousStages);
      }
    });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <Column key={stage.id} stage={stage} />
        ))}
      </div>
    </DndContext>
  );
}

function Column({ stage }: { stage: PipelineStageData }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 flex-shrink-0 flex-col rounded-md border transition-colors ${
        isOver ? "border-gray-400 bg-gray-50" : "border-gray-200 bg-gray-50/50"
      }`}
    >
      <div className="flex items-center gap-2 border-b border-gray-200 px-3.5 py-3">
        <span
          className="h-2 w-2 flex-shrink-0 rounded-full"
          style={{ backgroundColor: stage.color }}
        />
        <h3 className="text-sm font-medium text-gray-900">{stage.name}</h3>
        <span className="ml-auto text-xs text-gray-400">
          {stage.contacts.length}
        </span>
      </div>
      <div className="min-h-[100px] flex-1 space-y-2 p-2">
        {stage.contacts.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-gray-400">
            Sin contactos
          </p>
        ) : (
          stage.contacts.map((contact) => (
            <Card key={contact.id} contact={contact} />
          ))
        )}
      </div>
    </div>
  );
}

function Card({ contact }: { contact: PipelineCardData }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: contact.id });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 10,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab rounded-md border border-gray-200 bg-white p-3.5 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <Link
        href={`/contacts/${contact.id}`}
        onPointerDown={(e) => e.stopPropagation()}
        className="text-sm font-medium text-gray-900 hover:underline"
      >
        {contact.name}
      </Link>
      <p className="mt-1 text-xs text-gray-500">
        {contact.phone ?? "Sin teléfono"}
      </p>
      <p className="mt-1 text-xs text-gray-400">
        {contact.lastActivity ?? "Sin actividad"}
      </p>
      {contact.estimatedValue && (
        <p className="mt-1 text-xs font-medium text-gray-700">
          {contact.estimatedValue}/mes
        </p>
      )}
    </div>
  );
}
