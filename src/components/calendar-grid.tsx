"use client";

import { useState } from "react";
import Link from "next/link";
import {
  cancelAppointment,
  completeAppointment,
} from "@/app/(app)/calendario/actions";
import {
  APPOINTMENT_STATUS_BADGE_CLASSES,
  APPOINTMENT_STATUS_LABELS,
  formatDurationMin,
  formatTime,
} from "@/lib/appointment-labels";
import { WEEKDAY_LABELS } from "@/lib/calendar";

export type CalendarAppointment = {
  id: string;
  title: string;
  startsAt: string;
  durationMin: number;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  contact: { id: string; name: string };
};

export function CalendarGrid({
  weeks,
  appointmentsByDay,
  currentMonth,
  todayKey,
}: {
  weeks: string[][];
  appointmentsByDay: Record<string, CalendarAppointment[]>;
  currentMonth: number;
  todayKey: string;
}) {
  const [selectedKey, setSelectedKey] = useState<string>(
    appointmentsByDay[todayKey] ? todayKey : weeks[0][0]
  );

  const selectedAppointments = [...(appointmentsByDay[selectedKey] ?? [])].sort(
    (a, b) => a.startsAt.localeCompare(b.startsAt)
  );

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border border-gray-200">
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-500">
          {WEEKDAY_LABELS.map((d) => (
            <div key={d} className="px-2 py-2 text-center">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {weeks.flat().map((key) => {
            const [, m, d] = key.split("-").map(Number);
            const inMonth = m - 1 === currentMonth;
            const dayAppointments = appointmentsByDay[key] ?? [];
            const isSelected = key === selectedKey;
            const isToday = key === todayKey;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedKey(key)}
                className={`min-h-[84px] border-b border-r border-gray-100 p-1.5 text-left align-top transition-colors last:border-r-0 ${
                  inMonth ? "bg-surface" : "bg-gray-50/60"
                } ${isSelected ? "ring-2 ring-inset ring-accent-500" : "hover:bg-gray-50"}`}
              >
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                    isToday
                      ? "bg-accent-600 font-medium text-white"
                      : inMonth
                        ? "text-gray-700"
                        : "text-gray-300"
                  }`}
                >
                  {d}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayAppointments.slice(0, 2).map((appt) => (
                    <div
                      key={appt.id}
                      className={`truncate rounded px-1 py-0.5 text-[11px] ${
                        appt.status === "CANCELLED"
                          ? "bg-gray-100 text-gray-400 line-through"
                          : "bg-accent-50 text-accent-700"
                      }`}
                    >
                      {formatTime(appt.startsAt)} {appt.title}
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="px-1 text-[11px] text-gray-400">
                      +{dayAppointments.length - 2} más
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-md border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900">
          {formatSelectedDate(selectedKey)}
        </h3>
        {selectedAppointments.length === 0 ? (
          <p className="mt-2 text-sm text-gray-400">
            Sin citas agendadas este día.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {selectedAppointments.map((appt) => (
              <div
                key={appt.id}
                className="flex items-start justify-between gap-3 rounded-md border border-gray-100 p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {formatTime(appt.startsAt)} · {appt.title}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {formatDurationMin(appt.durationMin)} ·{" "}
                    <Link
                      href={`/contacts/${appt.contact.id}`}
                      className="hover:underline"
                    >
                      {appt.contact.name}
                    </Link>
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${APPOINTMENT_STATUS_BADGE_CLASSES[appt.status]}`}
                  >
                    {APPOINTMENT_STATUS_LABELS[appt.status]}
                  </span>
                  {appt.status === "SCHEDULED" && (
                    <>
                      <form action={completeAppointment}>
                        <input type="hidden" name="appointmentId" value={appt.id} />
                        <button
                          type="submit"
                          className="text-xs font-medium text-gray-500 hover:text-gray-900 hover:underline"
                        >
                          Completar
                        </button>
                      </form>
                      <form action={cancelAppointment}>
                        <input type="hidden" name="appointmentId" value={appt.id} />
                        <button
                          type="submit"
                          className="text-xs font-medium text-red-600 hover:text-red-800 hover:underline"
                        >
                          Cancelar
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatSelectedDate(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("es-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}
