"use client";

import { useEffect, useOptimistic, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
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
import { ContactAvatar } from "@/components/contact-avatar";
import { formatCurrency } from "@/lib/policy-labels";
import {
  moveInStages,
  type PipelineCardData,
  type PipelineStageData,
} from "@/lib/pipeline-move";

export type { PipelineCardData, PipelineStageData };

const DESKTOP_QUERY = "(min-width: 768px)";

// Drag and drop only exists on wide screens, so phones never mount the drag
// handlers (touch dragging fights page scrolling anyway; they get "Mover").
function useIsDesktop(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(DESKTOP_QUERY);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false
  );
}

export function PipelineBoard({ stages: serverStages }: { stages: PipelineStageData[] }) {
  // Shows the move instantly, then falls back to the server's data when the
  // action finishes - which also reverts the card if the move failed.
  const [stages, applyMove] = useOptimistic(
    serverStages,
    (current, move: { contactId: string; stageId: string }) =>
      moveInStages(current, move.contactId, move.stageId)
  );
  const [, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(null);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  function move(contactId: string, stageId: string) {
    const target = stages.find((s) => s.id === stageId);
    if (!target || target.contacts.some((c) => c.id === contactId)) return;

    startTransition(async () => {
      applyMove({ contactId, stageId });
      const result = await moveContactStage(contactId, stageId);
      setNotice(
        result?.error
          ? { text: result.error, error: true }
          : { text: `Movido a ${target.name}`, error: false }
      );
    });
  }

  return (
    <>
      <p
        role="status"
        className={`min-h-5 text-sm ${notice?.error ? "text-red-700" : "text-gray-500"}`}
      >
        {notice?.text}
      </p>

      <div className="md:hidden">
        <MobileBoard stages={stages} onMove={move} />
      </div>
      <div className="hidden md:block">
        <DesktopBoard stages={stages} onMove={move} draggable={isDesktop} />
      </div>
    </>
  );
}

function stageSummary(stage: PipelineStageData): string {
  const people = `${stage.count} ${stage.count === 1 ? "contacto" : "contactos"}`;
  return stage.totalMonthly > 0
    ? `${people} · ${formatCurrency(stage.totalMonthly)}/mes`
    : people;
}

function MobileBoard({
  stages,
  onMove,
}: {
  stages: PipelineStageData[];
  onMove: (contactId: string, stageId: string) => void;
}) {
  const [selectedId, setSelectedId] = useState(
    () => (stages.find((s) => s.count > 0) ?? stages[0]).id
  );
  const selected = stages.find((s) => s.id === selectedId) ?? stages[0];

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Etapas del pipeline"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {stages.map((stage) => {
          const active = stage.id === selected.id;
          return (
            <button
              key={stage.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedId(stage.id)}
              className={`flex flex-shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors ${
                active
                  ? "border-accent-600 bg-accent-50 font-medium text-accent-700"
                  : "border-gray-200 bg-surface text-gray-600 active:bg-gray-100"
              }`}
            >
              <span
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: stage.color }}
              />
              {stage.name}
              <span className={active ? "text-accent-700" : "text-gray-400"}>{stage.count}</span>
            </button>
          );
        })}
      </div>

      <p className="text-sm text-gray-500">{stageSummary(selected)}</p>

      {selected.contacts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-400">
          Sin contactos en esta etapa
        </p>
      ) : (
        <div className="space-y-2">
          {selected.contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-surface p-3"
            >
              <Link
                href={`/contacts/${contact.id}`}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <ContactAvatar name={contact.name} />
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-medium text-gray-900">
                    {contact.name}
                  </span>
                  <span className="block truncate text-sm text-gray-500">
                    {contact.phone ?? "Sin teléfono"}
                  </span>
                  <span className="block truncate text-xs text-gray-400">
                    {contact.lastActivity ?? "Sin actividad"}
                    {contact.monthlyValue > 0 &&
                      ` · ${formatCurrency(contact.monthlyValue)}/mes`}
                  </span>
                </span>
              </Link>

              <label className="relative flex-shrink-0">
                <span className="flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700">
                  Mover
                  <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
                <select
                  aria-label={`Mover a ${contact.name} a otra etapa`}
                  value={selected.id}
                  onChange={(e) => onMove(contact.id, e.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                >
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}
        </div>
      )}

      <MoreLink stage={selected} />
    </div>
  );
}

function MoreLink({ stage }: { stage: PipelineStageData }) {
  if (stage.count <= stage.contacts.length) return null;
  return (
    <Link
      href={`/contacts?stage=${stage.id}`}
      className="block py-2 text-center text-sm font-medium text-accent-700 hover:underline"
    >
      Ver los {stage.count} contactos →
    </Link>
  );
}

function DesktopBoard({
  stages,
  onMove,
  draggable,
}: {
  stages: PipelineStageData[];
  onMove: (contactId: string, stageId: string) => void;
  draggable: boolean;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    if (event.over) onMove(String(event.active.id), String(event.over.id));
  }

  const columns = (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => (
        <Column key={stage.id} stage={stage} draggable={draggable} />
      ))}
    </div>
  );

  return draggable ? (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {columns}
    </DndContext>
  ) : (
    columns
  );
}

function Column({ stage, draggable }: { stage: PipelineStageData; draggable: boolean }) {
  return draggable ? (
    <DroppableColumn stage={stage} />
  ) : (
    <ColumnShell stage={stage} isOver={false} setNodeRef={undefined} draggable={false} />
  );
}

function DroppableColumn({ stage }: { stage: PipelineStageData }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  return <ColumnShell stage={stage} isOver={isOver} setNodeRef={setNodeRef} draggable />;
}

function ColumnShell({
  stage,
  isOver,
  setNodeRef,
  draggable,
}: {
  stage: PipelineStageData;
  isOver: boolean;
  setNodeRef: ((node: HTMLElement | null) => void) | undefined;
  draggable: boolean;
}) {
  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 flex-shrink-0 flex-col rounded-xl border transition-colors ${
        isOver ? "border-gray-400 bg-gray-50" : "border-gray-200 bg-gray-50/50"
      }`}
    >
      <div className="border-b border-gray-200 px-3.5 py-3">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 flex-shrink-0 rounded-full"
            style={{ backgroundColor: stage.color }}
          />
          <h3 className="truncate text-sm font-medium text-gray-900">{stage.name}</h3>
          <span className="ml-auto text-xs text-gray-400">{stage.count}</span>
        </div>
        {stage.totalMonthly > 0 && (
          <p className="mt-1 pl-4 text-xs text-gray-500">
            {formatCurrency(stage.totalMonthly)}/mes
          </p>
        )}
      </div>
      <div className="min-h-[100px] flex-1 space-y-2 p-2">
        {stage.contacts.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-gray-400">Sin contactos</p>
        ) : (
          stage.contacts.map((contact) =>
            draggable ? (
              <DraggableCard key={contact.id} contact={contact} />
            ) : (
              <CardBody key={contact.id} contact={contact} />
            )
          )
        )}
        <MoreLink stage={stage} />
      </div>
    </div>
  );
}

function CardBody({ contact }: { contact: PipelineCardData }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-gray-200 bg-surface p-3 shadow-sm">
      <ContactAvatar name={contact.name} className="h-8 w-8 text-xs" />
      <div className="min-w-0">
        <Link
          href={`/contacts/${contact.id}`}
          onPointerDown={(e) => e.stopPropagation()}
          className="block truncate text-sm font-medium text-gray-900 hover:underline"
        >
          {contact.name}
        </Link>
        <p className="mt-0.5 truncate text-xs text-gray-500">{contact.phone ?? "Sin teléfono"}</p>
        <p className="mt-0.5 truncate text-xs text-gray-400">
          {contact.lastActivity ?? "Sin actividad"}
        </p>
        {contact.monthlyValue > 0 && (
          <p className="mt-1 text-xs font-medium text-gray-700">
            {formatCurrency(contact.monthlyValue)}/mes
          </p>
        )}
      </div>
    </div>
  );
}

function DraggableCard({ contact }: { contact: PipelineCardData }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: contact.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={
        transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 10 }
          : undefined
      }
      {...listeners}
      {...attributes}
      className={`cursor-grab transition-shadow active:cursor-grabbing ${
        isDragging ? "opacity-60 [&>div]:shadow-lg" : "[&>div]:hover:shadow-md"
      }`}
    >
      <CardBody contact={contact} />
    </div>
  );
}
