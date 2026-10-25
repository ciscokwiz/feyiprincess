import { agendaItems, type AgendaItem } from "@/lib/agenda";
import { dueDateTime } from "@/lib/date";
import type { PlannerData } from "@/lib/types";

export const REMINDER_WINDOW_HOURS = 24;
export const REMINDER_CHECK_INTERVAL_MS = 60_000;

export interface Reminder {
  item: AgendaItem;
  status: "overdue" | "soon";
  due: Date;
  /** Changes if the due date/time changes, so a rescheduled item can remind again. */
  key: string;
}

/** Items not done that are overdue or due within the next 24 hours. */
export function dueReminders(data: PlannerData, now: Date): Reminder[] {
  const horizon = now.getTime() + REMINDER_WINDOW_HOURS * 3_600_000;
  return agendaItems(data)
    .filter((item) => !item.done)
    .map((item) => {
      const due = dueDateTime(item.date, item.time);
      return {
        item,
        due,
        status: due.getTime() < now.getTime() ? ("overdue" as const) : ("soon" as const),
        key: `${item.key}@${item.date}T${item.time ?? "eod"}`,
      };
    })
    .filter((r) => r.due.getTime() <= horizon);
}

export function describeDue(reminder: Reminder, now: Date): string {
  const diffMin = Math.round((reminder.due.getTime() - now.getTime()) / 60_000);
  if (diffMin < 0) {
    const ago = Math.abs(diffMin);
    if (ago < 60) return `overdue by ${ago} min`;
    if (ago < 60 * 48) return `overdue by ${Math.round(ago / 60)} h`;
    return `overdue by ${Math.round(ago / 1440)} days`;
  }
  if (!reminder.item.time) return "due today";
  if (diffMin < 60) return `due in ${diffMin} min`;
  return `due in ${Math.round(diffMin / 60)} h`;
}

export type NotificationSupport = "unsupported" | "default" | "granted" | "denied";

export function notificationSupport(): NotificationSupport {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}
