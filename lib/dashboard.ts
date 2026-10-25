import { agendaItems } from "@/lib/agenda";
import { addDays, minutesBetween, toISODate } from "@/lib/date";
import { BASE_TIMETABLE, effectiveWeek, isStudy } from "@/lib/timetable";
import type { ISODate, PlannerData } from "@/lib/types";

/**
 * Dashboard numbers. Every figure is computed from what she has recorded:
 * tasks, calendar events and timetable blocks she ticked off. Nothing is estimated.
 */

export interface Ratio {
  done: number;
  total: number;
  /** null when there is nothing to measure yet. */
  percent: number | null;
}

const ratio = (done: number, total: number): Ratio => ({
  done,
  total,
  percent: total === 0 ? null : Math.round((done / total) * 100),
});

/**
 * Today's checklist: tasks due today, plus overdue and undated tasks that are
 * still open or were finished today.
 */
export function todaysTasks(data: PlannerData, today: ISODate) {
  const finishedToday = (completedAt: string | null) => completedAt !== null && localDay(completedAt) === today;
  return data.tasks.filter((t) => {
    if (t.dueDate === today) return true;
    if (t.dueDate !== null && t.dueDate < today) return !t.completed || finishedToday(t.completedAt);
    if (t.dueDate === null) return !t.completed || finishedToday(t.completedAt);
    return false;
  });
}

export function dailyCompletion(data: PlannerData, today: ISODate): Ratio {
  const tasks = todaysTasks(data, today);
  return ratio(tasks.filter((t) => t.completed).length, tasks.length);
}

export function weeklyStudy(data: PlannerData, weekStart: ISODate) {
  const study = effectiveWeek(data, weekStart).filter(isStudy);
  const planned = study.reduce((s, b) => s + b.hours, 0);
  const done = study.filter((b) => b.done).reduce((s, b) => s + b.hours, 0);
  return { plannedHours: planned, doneHours: done, percent: planned === 0 ? null : Math.round((done / planned) * 100) };
}

/** Calendar events of type "assignment" plus tasks in the assignment category. */
export function assignmentProgress(data: PlannerData) {
  const events = data.events.filter((e) => e.type === "assignment");
  const tasks = data.tasks.filter((t) => t.categoryId === "assignment");
  const done = events.filter((e) => e.done).length + tasks.filter((t) => t.completed).length;
  const total = events.length + tasks.length;
  return { ...ratio(done, total), outstanding: total - done, fromEvents: events.length, fromTasks: tasks.length };
}

export interface CourseProgress {
  courseId: string;
  items: Ratio;
  studyHoursDone: number;
  studyHoursPlanned: number;
}

/** Per course: tasks + calendar items done, and this week's study blocks done vs planned. */
export function courseProgress(data: PlannerData, weekStart: ISODate): CourseProgress[] {
  const week = effectiveWeek(data, weekStart).filter(isStudy);
  const agenda = agendaItems(data);
  return data.courses.map((course) => {
    const undatedTasks = data.tasks.filter((t) => t.courseId === course.id && t.dueDate === null);
    const dated = agenda.filter((i) => i.courseId === course.id);
    const done = dated.filter((i) => i.done).length + undatedTasks.filter((t) => t.completed).length;
    const total = dated.length + undatedTasks.length;
    const blocks = week.filter((b) => b.courseId === course.id);
    return {
      courseId: course.id,
      items: ratio(done, total),
      studyHoursPlanned: blocks.reduce((s, b) => s + b.hours, 0),
      studyHoursDone: blocks.filter((b) => b.done).reduce((s, b) => s + b.hours, 0),
    };
  });
}

export interface HistoryDay {
  date: ISODate;
  tasksCompleted: number;
  studyBlocksDone: number;
  studyHoursDone: number;
}

const blockHours = new Map(BASE_TIMETABLE.map((b) => [b.id, minutesBetween(b.start, b.end) / 60]));

/** Goals completed per day over the last `days` days (tasks ticked off + study blocks marked done). */
export function completionHistory(data: PlannerData, today: ISODate, days = 14): HistoryDay[] {
  const dates = Array.from({ length: days }, (_, i) => addDays(today, i - days + 1));
  return dates.map((date) => {
    const blocks = data.completedBlocks.filter((k) => k.startsWith(`${date}|`));
    return {
      date,
      tasksCompleted: data.tasks.filter((t) => t.completed && t.completedAt !== null && localDay(t.completedAt) === date).length,
      studyBlocksDone: blocks.length,
      studyHoursDone: blocks.reduce((s, k) => s + (blockHours.get(k.split("|")[1] ?? "") ?? 0), 0),
    };
  });
}

/** Local calendar day of an ISO timestamp. */
export function localDay(timestamp: string): ISODate {
  const d = new Date(timestamp);
  return Number.isNaN(d.getTime()) ? timestamp.slice(0, 10) : toISODate(d);
}
