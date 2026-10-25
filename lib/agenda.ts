import { EVENT_TYPES } from "@/data/categories";
import { dueDateTime } from "@/lib/date";
import type { ClockTime, ISODate, PlannerData } from "@/lib/types";

/** A dated item from either the task list or the calendar, in one shape. */
export interface AgendaItem {
  key: string;
  source: "task" | "event";
  id: string;
  title: string;
  date: ISODate;
  time: ClockTime | null;
  courseId: string | null;
  done: boolean;
  /** "Task" or the event type label, e.g. "Quiz". */
  typeLabel: string;
  color: string;
}

const eventMeta = (type: string) => EVENT_TYPES.find((t) => t.id === type) ?? EVENT_TYPES[EVENT_TYPES.length - 1]!;

export function agendaItems(data: PlannerData): AgendaItem[] {
  const tasks: AgendaItem[] = data.tasks
    .filter((t): t is typeof t & { dueDate: ISODate } => t.dueDate !== null)
    .map((t) => ({
      key: `task:${t.id}`,
      source: "task",
      id: t.id,
      title: t.title,
      date: t.dueDate,
      time: t.dueTime,
      courseId: t.courseId,
      done: t.completed,
      typeLabel: "Task",
      color: "#5c4a50",
    }));
  const events: AgendaItem[] = data.events.map((e) => ({
    key: `event:${e.id}`,
    source: "event",
    id: e.id,
    title: e.title,
    date: e.date,
    time: e.time,
    courseId: e.courseId,
    done: e.done,
    typeLabel: eventMeta(e.type).label,
    color: eventMeta(e.type).color,
  }));
  return [...tasks, ...events].sort(compareAgenda);
}

export function compareAgenda(a: AgendaItem, b: AgendaItem): number {
  return dueDateTime(a.date, a.time).getTime() - dueDateTime(b.date, b.time).getTime() || a.title.localeCompare(b.title);
}

/** Not-done items due today or later, soonest first. */
export function upcomingItems(data: PlannerData, today: ISODate, limit = 6): AgendaItem[] {
  return agendaItems(data)
    .filter((i) => !i.done && i.date >= today)
    .slice(0, limit);
}

export function itemsOn(data: PlannerData, date: ISODate): AgendaItem[] {
  return agendaItems(data).filter((i) => i.date === date);
}
