"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { CarBookingBlock } from "@/lib/supabase/cars";

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toDateStr(date: Date) {
  return date.toISOString().split("T")[0];
}

function isBlocked(dateStr: string, blocks: CarBookingBlock[]) {
  return blocks.some((b) => dateStr >= b.startDate && dateStr <= b.endDate);
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const days: Array<{ date: Date; current: boolean }> = [];

  for (let i = startDow; i > 0; i--) {
    days.push({ date: new Date(year, month, 1 - i), current: false });
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(year, month, d), current: true });
  }
  const tail = days.length % 7;
  if (tail > 0) {
    for (let d = 1; d <= 7 - tail; d++) {
      days.push({ date: new Date(year, month + 1, d), current: false });
    }
  }

  return days;
}

export function BookingCalendar({ blocks }: { blocks: CarBookingBlock[] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toDateStr(today);

  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  function prevMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  function nextMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days = getCalendarDays(year, month);
  const isPrevDisabled = viewDate <= new Date(today.getFullYear(), today.getMonth(), 1);

  function getDayStyle(date: Date, current: boolean) {
    const dateStr = toDateStr(date);
    const isPast = date < today;
    const isToday = dateStr === todayStr;

    if (!current) return "text-slate-200 cursor-default";
    if (isPast && !isToday) return "text-slate-300 cursor-default";
    if (isToday) return isBlocked(dateStr, blocks)
      ? "bg-red-500 text-white ring-2 ring-[#ff3600] ring-offset-1 rounded-full font-black"
      : "bg-[#ff3600] text-white rounded-full font-black";
    if (isBlocked(dateStr, blocks)) return "bg-red-100 text-red-600 rounded-full font-semibold";
    return "bg-emerald-100 text-emerald-700 rounded-full font-semibold";
  }

  const hasBlocked = blocks.length > 0;

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-[#e9e9e9] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e9e9e9] px-4 py-3">
        <button
          onClick={prevMonth}
          disabled={isPrevDisabled}
          className="flex size-7 items-center justify-center rounded-full transition hover:bg-[#fff7f4] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="size-4 text-[#0b0b0b]" />
        </button>
        <p className="text-sm font-black text-[#0b0b0b]">
          {MONTHS[month]} {year}
        </p>
        <button
          onClick={nextMonth}
          className="flex size-7 items-center justify-center rounded-full transition hover:bg-[#fff7f4]"
        >
          <ChevronRight className="size-4 text-[#0b0b0b]" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-[#e9e9e9] px-2 py-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-[#616161]">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1 px-2 py-3">
        {days.map(({ date, current }, i) => {
          const style = getDayStyle(date, current);
          return (
            <div key={i} className="flex items-center justify-center py-0.5">
              <span className={`flex size-7 items-center justify-center text-xs transition ${style}`}>
                {current ? date.getDate() : ""}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 border-t border-[#e9e9e9] px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-emerald-100 ring-1 ring-emerald-200" />
          <span className="text-[11px] font-semibold text-[#616161]">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-red-100 ring-1 ring-red-200" />
          <span className="text-[11px] font-semibold text-[#616161]">Booked</span>
        </div>
        {!hasBlocked && (
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-[#ff3600]" />
            <span className="text-[11px] font-semibold text-[#616161]">Today</span>
          </div>
        )}
      </div>
    </div>
  );
}
