import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import {
  dateKey,
  getMonthGrid,
  monthLabel,
  monthParam,
  parseMonthParam,
} from "@/lib/calendar";
import { CalendarGrid, type CalendarAppointment } from "@/components/calendar-grid";
import { AppointmentForm } from "@/components/appointment-form";

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await requireSession();
  const { month: monthParamValue } = await searchParams;
  const { year, month } = parseMonthParam(monthParamValue);

  const grid = getMonthGrid(year, month);
  const gridStart = grid[0][0];
  const gridEnd = new Date(grid[grid.length - 1][6]);
  gridEnd.setDate(gridEnd.getDate() + 1);

  const [appointments, contacts] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        agencyId: session.user.agencyId,
        startsAt: { gte: gridStart, lt: gridEnd },
      },
      orderBy: { startsAt: "asc" },
      include: { contact: { select: { id: true, name: true } } },
    }),
    prisma.contact.findMany({
      where: { agencyId: session.user.agencyId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const appointmentsByDay: Record<string, CalendarAppointment[]> = {};
  for (const appt of appointments) {
    const key = dateKey(appt.startsAt);
    if (!appointmentsByDay[key]) appointmentsByDay[key] = [];
    appointmentsByDay[key].push({
      id: appt.id,
      title: appt.title,
      startsAt: appt.startsAt.toISOString(),
      durationMin: appt.durationMin,
      status: appt.status,
      contact: appt.contact,
    });
  }

  const weeks = grid.map((week) => week.map((d) => dateKey(d)));

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 tracking-tight capitalize">
            {monthLabel(year, month)}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Calendario de citas con tus contactos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/calendario?month=${monthParam(prevYear, prevMonth)}`}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            ← Anterior
          </Link>
          <Link
            href={`/calendario?month=${monthParam(nextYear, nextMonth)}`}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Siguiente →
          </Link>
        </div>
      </div>

      <details className="rounded-md border border-gray-200 p-4">
        <summary className="cursor-pointer text-sm font-medium text-gray-900">
          + Agendar cita
        </summary>
        <div className="mt-4">
          <AppointmentForm contacts={contacts} />
        </div>
      </details>

      <CalendarGrid
        weeks={weeks}
        appointmentsByDay={appointmentsByDay}
        currentMonth={month}
        todayKey={dateKey(new Date())}
      />
    </div>
  );
}
