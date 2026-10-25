import type { ClockTime, DayKey, ISODate } from "@/lib/types";

const pad = (n: number): string => String(n).padStart(2, "0");

/** Local calendar date as YYYY-MM-DD (never UTC, so "today" matches her clock). */
export function toISODate(d: Date): ISODate {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Parses YYYY-MM-DD as a local date at midnight. */
export function fromISODate(iso: ISODate): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function addDays(iso: ISODate, days: number): ISODate {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

const DAY_KEYS: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function dayKeyOf(iso: ISODate): DayKey {
  return DAY_KEYS[fromISODate(iso).getDay()]!;
}

/** Monday of the week containing `iso`. */
export function startOfWeek(iso: ISODate): ISODate {
  const day = fromISODate(iso).getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(iso, diff);
}

/** The 7 ISO dates (Mon–Sun) of the week starting `weekStart`. */
export function weekDates(weekStart: ISODate): ISODate[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function minutesBetween(start: ClockTime, end: ClockTime): number {
  const toMin = (t: ClockTime) => {
    const [h, m] = t.split(":").map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
  };
  return toMin(end) - toMin(start);
}

/** "05:30" → "5:30 AM". */
export function formatClock(t: ClockTime): string {
  const [h = 0, m = 0] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${pad(m)} ${suffix}`;
}

export function formatDate(iso: ISODate, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }): string {
  return fromISODate(iso).toLocaleDateString("en-GB", opts);
}

export function formatHours(hours: number): string {
  return `${Math.round(hours * 10) / 10} h`;
}

/** Due moment for an item: the given time, or end of day when no time is set. */
export function dueDateTime(date: ISODate, time: ClockTime | null): Date {
  const d = fromISODate(date);
  if (time) {
    const [h = 0, m = 0] = time.split(":").map(Number);
    d.setHours(h, m, 0, 0);
  } else {
    d.setHours(23, 59, 0, 0);
  }
  return d;
}

/** 6×7 grid of dates for a month view, starting on Monday. */
export function monthGrid(year: number, month: number): ISODate[] {
  const first = toISODate(new Date(year, month, 1));
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const CLOCK_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
