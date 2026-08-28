import Link from "next/link";
import { Check } from "lucide-react";
import { toggleTask } from "@/app/(app)/tareas/actions";
import { TASK_RECURRENCE_LABELS } from "@/lib/task-recurrence";
import type { TaskRecurrence } from "@/generated/prisma/enums";

export type TaskItemData = {
  id: string;
  title: string;
  completed: boolean;
  recurrence: TaskRecurrence;
  contact: { id: string; name: string } | null;
};

export function TaskItem({
  task,
  showContact,
}: {
  task: TaskItemData;
  showContact?: boolean;
}) {
  const meta = [
    task.recurrence !== "NONE" ? TASK_RECURRENCE_LABELS[task.recurrence] : null,
  ].filter(Boolean);

  return (
    <div className="flex items-start gap-3 py-1.5">
      <form action={toggleTask} className="mt-0.5">
        <input type="hidden" name="taskId" value={task.id} />
        <button
          type="submit"
          aria-label={
            task.completed ? "Marcar como pendiente" : "Marcar como completada"
          }
          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-colors ${
            task.completed
              ? "border-accent-600 bg-accent-600 text-white"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          {task.completed && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
        </button>
      </form>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm ${
            task.completed ? "text-gray-400 line-through" : "text-gray-900"
          }`}
        >
          {task.title}
        </p>
        {(meta.length > 0 || (showContact && task.contact)) && (
          <p className="text-xs text-gray-400">
            {meta.join(" · ")}
            {meta.length > 0 && showContact && task.contact && " · "}
            {showContact && task.contact && (
              <Link
                href={`/contacts/${task.contact.id}`}
                className="hover:underline"
              >
                {task.contact.name}
              </Link>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
