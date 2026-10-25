import { COURSE_COLORS } from "@/data/courses";
import { createDefaultPlannerData } from "@/lib/plannerStorage";
import { completedBlockKey, weekOverrideKey } from "@/lib/timetable";
import type {
  ActivityCategory,
  BlockAssignment,
  CalendarEvent,
  Course,
  ISODate,
  Note,
  PlannerData,
  PlannerSettings,
  PlannerTask,
} from "@/lib/types";

/**
 * Every change to the planner goes through this pure reducer. Keeping it pure
 * (no Date.now / storage inside) makes it easy to unit test.
 */
export type PlannerAction =
  | { type: "replace"; data: PlannerData }
  | { type: "clear" }
  | { type: "task/add"; task: PlannerTask }
  | { type: "task/update"; id: string; changes: Partial<Omit<PlannerTask, "id" | "createdAt">> }
  | { type: "task/toggle"; id: string; at: string }
  | { type: "task/delete"; id: string }
  | { type: "category/add"; category: ActivityCategory }
  | { type: "category/delete"; id: string }
  | { type: "course/add"; course: Course }
  | { type: "course/update"; id: string; changes: Partial<Omit<Course, "id">> }
  | { type: "course/delete"; id: string }
  | { type: "block/setTemplate"; blockId: string; assignment: BlockAssignment | null }
  | { type: "block/setWeek"; weekStart: ISODate; blockId: string; assignment: BlockAssignment | null }
  | { type: "block/toggleDone"; date: ISODate; blockId: string }
  | { type: "week/reset"; weekStart: ISODate }
  | { type: "template/reset" }
  | { type: "event/add"; event: CalendarEvent }
  | { type: "event/update"; id: string; changes: Partial<Omit<CalendarEvent, "id" | "createdAt">> }
  | { type: "event/delete"; id: string }
  | { type: "note/add"; note: Note }
  | { type: "note/update"; id: string; changes: Partial<Omit<Note, "id" | "createdAt">> }
  | { type: "note/delete"; id: string }
  | { type: "settings/update"; changes: Partial<PlannerSettings> }
  | { type: "reminders/notified"; keys: string[] };

const withoutKey = <T,>(record: Record<string, T>, key: string): Record<string, T> => {
  const next = { ...record };
  delete next[key];
  return next;
};

export function plannerReducer(state: PlannerData, action: PlannerAction): PlannerData {
  switch (action.type) {
    case "replace":
      return action.data;
    case "clear":
      return createDefaultPlannerData();

    /* Tasks */
    case "task/add":
      return { ...state, tasks: [action.task, ...state.tasks] };
    case "task/update":
      return { ...state, tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, ...action.changes } : t)) };
    case "task/toggle":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, completed: !t.completed, completedAt: t.completed ? null : action.at } : t,
        ),
      };
    case "task/delete":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };

    /* Categories */
    case "category/add":
      return { ...state, customCategories: [...state.customCategories, action.category] };
    case "category/delete":
      return {
        ...state,
        customCategories: state.customCategories.filter((c) => c.id !== action.id),
        // Tasks in a removed category fall back to the general daily to-do list.
        tasks: state.tasks.map((t) => (t.categoryId === action.id ? { ...t, categoryId: "daily-study" } : t)),
      };

    /* Courses */
    case "course/add":
      return { ...state, courses: [...state.courses, action.course] };
    case "course/update":
      return { ...state, courses: state.courses.map((c) => (c.id === action.id ? { ...c, ...action.changes } : c)) };
    case "course/delete": {
      const clear = <T extends { courseId: string | null }>(item: T): T =>
        item.courseId === action.id ? { ...item, courseId: null } : item;
      const clearRecord = (record: Record<string, BlockAssignment>) =>
        Object.fromEntries(Object.entries(record).map(([k, v]) => [k, clear(v)]));
      return {
        ...state,
        courses: state.courses.filter((c) => c.id !== action.id),
        tasks: state.tasks.map(clear),
        events: state.events.map(clear),
        notes: state.notes.map(clear),
        templateOverrides: clearRecord(state.templateOverrides),
        weekOverrides: clearRecord(state.weekOverrides),
      };
    }

    /* Timetable */
    case "block/setTemplate":
      return {
        ...state,
        templateOverrides: action.assignment
          ? { ...state.templateOverrides, [action.blockId]: action.assignment }
          : withoutKey(state.templateOverrides, action.blockId),
      };
    case "block/setWeek": {
      const key = weekOverrideKey(action.weekStart, action.blockId);
      return {
        ...state,
        weekOverrides: action.assignment
          ? { ...state.weekOverrides, [key]: action.assignment }
          : withoutKey(state.weekOverrides, key),
      };
    }
    case "block/toggleDone": {
      const key = completedBlockKey(action.date, action.blockId);
      const done = state.completedBlocks.includes(key);
      return {
        ...state,
        completedBlocks: done ? state.completedBlocks.filter((k) => k !== key) : [...state.completedBlocks, key],
      };
    }
    case "week/reset":
      return {
        ...state,
        weekOverrides: Object.fromEntries(
          Object.entries(state.weekOverrides).filter(([key]) => !key.startsWith(`${action.weekStart}|`)),
        ),
      };
    case "template/reset":
      return { ...state, templateOverrides: {} };

    /* Calendar events */
    case "event/add":
      return { ...state, events: [...state.events, action.event] };
    case "event/update":
      return { ...state, events: state.events.map((e) => (e.id === action.id ? { ...e, ...action.changes } : e)) };
    case "event/delete":
      return { ...state, events: state.events.filter((e) => e.id !== action.id) };

    /* Notes */
    case "note/add":
      return { ...state, notes: [action.note, ...state.notes] };
    case "note/update":
      return { ...state, notes: state.notes.map((n) => (n.id === action.id ? { ...n, ...action.changes } : n)) };
    case "note/delete":
      return { ...state, notes: state.notes.filter((n) => n.id !== action.id) };

    /* Settings & reminders */
    case "settings/update":
      return { ...state, settings: { ...state.settings, ...action.changes } };
    case "reminders/notified":
      return {
        ...state,
        // Keep the list bounded so storage never grows without limit.
        notifiedReminders: Array.from(new Set([...state.notifiedReminders, ...action.keys])).slice(-300),
      };
  }
}

/** Picks the first course colour not already in use (or cycles). */
export function nextCourseColor(courses: Course[]): string {
  const used = new Set(courses.map((c) => c.color.toLowerCase()));
  return (COURSE_COLORS.find((c) => !used.has(c.hex)) ?? COURSE_COLORS[courses.length % COURSE_COLORS.length]!).hex;
}
