"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { dateRangeOverlapsBlocks, formatLocalDate } from "@/lib/booking";
import type { CarBookingBlock } from "@/lib/supabase/cars";

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

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

interface BookingDatePickerProps {
  blocks: CarBookingBlock[];
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export function BookingDatePicker({ blocks, startDate, endDate, onStartDateChange, onEndDateChange }: BookingDatePickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatLocalDate(today);

  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days = getCalendarDays(year, month);
  const isPrevDisabled = viewDate <= new Date(today.getFullYear(), today.getMonth(), 1);

  function handleDayClick(dateStr: string) {
    if (!startDate || (startDate && endDate)) {
      onStartDateChange(dateStr);
      onEndDateChange("");
    } else {
      if (dateStr >= startDate) {
        if (dateRangeOverlapsBlocks(startDate, dateStr, blocks)) return;
        onEndDateChange(dateStr);
      } else {
        onStartDateChange(dateStr);
        onEndDateChange("");
      }
    }
  }

  function isInvalidRangeEnd(dateStr: string) {
    return Boolean(startDate && !endDate && dateStr >= startDate && dateRangeOverlapsBlocks(startDate, dateStr, blocks));
  }

  function getDayClasses(date: Date, current: boolean) {
    const dateStr = formatLocalDate(date);
    const isPast = date < today;
    const isToday = dateStr === todayStr;
    const blocked = isBlocked(dateStr, blocks);
    const isStart = dateStr === startDate;
    const isEnd = dateStr === endDate;

    const effectiveEnd = endDate || hoverDate || null;
    const inRange = startDate && effectiveEnd && !endDate
      ? dateStr > startDate && dateStr <= (hoverDate ?? "")
      : startDate && endDate
        ? dateStr > startDate && dateStr < endDate
        : false;

    const invalidRangeEnd = isInvalidRangeEnd(dateStr);

    if (!current) return { cell: "opacity-0 cursor-default pointer-events-none", inner: "" };

    if (isPast && !isToday) {
      return { cell: "cursor-default", inner: "text-white/20 text-xs" };
    }

    if (isStart || isEnd) {
      return {
        cell: "cursor-pointer",
        inner: "bg-[#ff3600] text-white rounded-full font-black text-xs shadow-lg shadow-[#ff3600]/30",
      };
    }

    if (inRange) {
      return {
        cell: "cursor-pointer",
        inner: "bg-[#ff3600]/20 text-[#ff3600] rounded-full text-xs font-semibold",
      };
    }

    if (blocked || invalidRangeEnd) {
      return {
        cell: "cursor-not-allowed",
        inner: "bg-red-500/20 text-red-400 rounded-full text-xs font-semibold",
      };
    }

    if (isToday) {
      return {
        cell: "cursor-pointer",
        inner: "ring-2 ring-[#ff3600] text-white rounded-full font-black text-xs",
      };
    }

    return {
      cell: "cursor-pointer hover:bg-white/5 rounded-full",
      inner: "text-emerald-400 text-xs font-semibold",
    };
  }

  const selectionLabel = startDate && endDate
    ? `${startDate} → ${endDate}`
    : startDate
      ? `${startDate} → pick end date`
      : "Click a date to start";

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      {/* Selection display */}
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Rental period</p>
        <p className="mt-1 text-sm font-black text-white">{selectionLabel}</p>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          disabled={isPrevDisabled}
          className="flex size-10 items-center justify-center rounded-full transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-20 touch-manipulation"
        >
          <ChevronLeft className="size-4 text-white" />
        </button>
        <p className="px-2 text-sm font-black text-white sm:px-0">{MONTHS[month]} {year}</p>
        <button
          type="button"
          onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          className="flex size-10 items-center justify-center rounded-full transition hover:bg-white/10 touch-manipulation"
        >
          <ChevronRight className="size-4 text-white" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-white/8 px-2 pb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-white/30">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1 px-2 py-3">
        {days.map(({ date, current }, i) => {
          const dateStr = formatLocalDate(date);
          const isPast = date < today;
          const blocked = isBlocked(dateStr, blocks);
          const invalidRangeEnd = isInvalidRangeEnd(dateStr);
          const clickable = current && !isPast && !blocked && !invalidRangeEnd;
          const { cell, inner } = getDayClasses(date, current);

          return (
            <button
              key={i}
              type="button"
              className={`flex items-center justify-center py-0.5 ${cell}`}
              onClick={() => clickable && handleDayClick(dateStr)}
              onMouseEnter={() => startDate && !endDate && current && !isPast && !blocked && !invalidRangeEnd ? setHoverDate(dateStr) : undefined}
              onMouseLeave={() => setHoverDate(null)}
              disabled={!clickable}
              aria-label={current ? formatLocalDate(date) : "Unavailable day"}
            >
              <span className={`flex size-9 items-center justify-center transition sm:size-7 ${inner}`}>
                {current ? date.getDate() : ""}
              </span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-white/8 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-emerald-500/30 ring-1 ring-emerald-500/50" />
          <span className="text-[11px] font-semibold text-white/40">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-red-500/30 ring-1 ring-red-500/50" />
          <span className="text-[11px] font-semibold text-white/40">Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-[#ff3600]" />
          <span className="text-[11px] font-semibold text-white/40">Selected</span>
        </div>
      </div>
    </div>
  );
}
