import { ListChecks } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { TaskForm } from "@/components/task-form";
import { TaskItem, type TaskItemData } from "@/components/task-item";
import { EmptyState } from "@/components/empty-state";
import { dateKey } from "@/lib/calendar";

function formatDayHeading(date: Date): string {
  return new Intl.DateTimeFormat("es-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

export default async function TareasPage() {
  const session = await requireSession();
  const agencyId = session.user.agencyId;

  const now = new Date();
  const startOfToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const endOfToday = new Date(startOfToday);
  endOfToday.setUTCDate(endOfToday.getUTCDate() + 1);
  endOfToday.setUTCMilliseconds(-1);

  const startOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  );
  const startOfNextMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
  );

  const [todayTasks, monthTasks] = await Promise.all([
    prisma.task.findMany({
      where: {
        agencyId,
        OR: [
          { completed: false, dueDate: { lte: endOfToday } },
          {
            completed: true,
            completedAt: { gte: startOfToday, lte: endOfToday },
          },
        ],
      },
      orderBy: [{ completed: "asc" }, { dueDate: "asc" }],
      include: { contact: { select: { id: true, name: true } } },
    }),
    prisma.task.findMany({
      where: { agencyId, dueDate: { gte: startOfMonth, lt: startOfNextMonth } },
      orderBy: { dueDate: "asc" },
      include: { contact: { select: { id: true, name: true } } },
    }),
  ]);

  const monthByDay = new Map<string, TaskItemData[]>();
  for (const task of monthTasks) {
    const key = dateKey(task.dueDate);
    if (!monthByDay.has(key)) monthByDay.set(key, []);
    monthByDay.get(key)!.push(task);
  }
  const monthDays = [...monthByDay.entries()].sort(([a], [b]) => a.localeCompare(b));

  const monthLabel = new Intl.DateTimeFormat("es-US", {
    month: "long",
    year: "numeric",
  }).format(now);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
          Tareas
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Tu checklist diario y las tareas del mes.
        </p>
      </div>

      <section className="rounded-md border border-gray-200 p-4">
        <TaskForm />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-gray-900">Hoy</h2>
        {todayTasks.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="Sin tareas para hoy"
            description="Agrega una arriba para empezar tu checklist."
          />
        ) : (
          <div className="divide-y divide-gray-100 rounded-md border border-gray-200 px-4">
            {todayTasks.map((task) => (
              <TaskItem key={task.id} task={task} showContact />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-gray-900 capitalize">
          Este mes · {monthLabel}
        </h2>
        {monthDays.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="Sin tareas este mes"
            description="Las tareas que agregues con fecha en este mes van a aparecer aquí, agrupadas por día."
          />
        ) : (
          <div className="space-y-4">
            {monthDays.map(([key, tasks]) => (
              <div key={key}>
                <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                  {formatDayHeading(tasks[0] ? new Date(key) : new Date())}
                </h3>
                <div className="divide-y divide-gray-100 rounded-md border border-gray-200 px-4">
                  {tasks.map((task) => (
                    <TaskItem key={task.id} task={task} showContact />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
