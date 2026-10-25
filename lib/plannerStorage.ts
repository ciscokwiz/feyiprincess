import { z } from "zod";
import { DEFAULT_COURSES } from "@/data/courses";
import { DEFAULT_DAILY_TARGET } from "@/data/timetable";
import {
  blockAssignmentSchema,
  categorySchema,
  courseSchema,
  eventSchema,
  noteSchema,
  plannerDataSchema,
  settingsSchema,
  taskSchema,
} from "@/lib/schemas";
import type { PlannerData } from "@/lib/types";

/** Versioned key: bump the suffix (and add a migration) if the data shape changes. */
export const STORAGE_KEY = "uo-planner:v1";
/** Where unreadable data is copied before starting fresh, so nothing is silently lost. */
export const BACKUP_KEY = "uo-planner:backup";

export type LoadStatus =
  /** Nothing saved yet. */
  | "empty"
  /** Saved data was valid. */
  | "ok"
  /** Some records were invalid and were dropped; the rest was kept. */
  | "recovered"
  /** Saved data could not be read at all; started fresh (a backup was kept). */
  | "reset";

export interface LoadResult {
  data: PlannerData;
  status: LoadStatus;
  /** Number of records dropped during recovery. */
  dropped: number;
}

export function createDefaultPlannerData(): PlannerData {
  return {
    version: 1,
    courses: DEFAULT_COURSES.map((c) => ({ ...c })),
    customCategories: [],
    tasks: [],
    templateOverrides: {},
    weekOverrides: {},
    completedBlocks: [],
    events: [],
    notes: [],
    settings: {
      dailyTargetMinHours: DEFAULT_DAILY_TARGET.min,
      dailyTargetMaxHours: DEFAULT_DAILY_TARGET.max,
      notifications: false,
    },
    notifiedReminders: [],
  };
}

function salvageArray<T>(value: unknown, schema: z.ZodType<T>): { items: T[]; dropped: number } {
  if (!Array.isArray(value)) return { items: [], dropped: value === undefined ? 0 : 1 };
  const items: T[] = [];
  for (const entry of value) {
    const parsed = schema.safeParse(entry);
    if (parsed.success) items.push(parsed.data);
  }
  return { items, dropped: value.length - items.length };
}

function salvageRecord<T>(value: unknown, schema: z.ZodType<T>): { items: Record<string, T>; dropped: number } {
  const items: Record<string, T> = {};
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { items, dropped: value === undefined ? 0 : 1 };
  }
  let dropped = 0;
  for (const [key, entry] of Object.entries(value)) {
    const parsed = schema.safeParse(entry);
    if (parsed.success) items[key] = parsed.data;
    else dropped += 1;
  }
  return { items, dropped };
}

/**
 * Parses raw stored text into planner data. Never throws.
 * Valid data passes through; partly-invalid data is salvaged record by record;
 * unreadable data falls back to defaults.
 */
export function parsePlannerData(raw: string | null): LoadResult {
  if (raw === null || raw.trim() === "") {
    return { data: createDefaultPlannerData(), status: "empty", dropped: 0 };
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { data: createDefaultPlannerData(), status: "reset", dropped: 0 };
  }

  const full = plannerDataSchema.safeParse(json);
  if (full.success) return { data: full.data, status: "ok", dropped: 0 };

  if (typeof json !== "object" || json === null || Array.isArray(json) || (json as { version?: unknown }).version !== 1) {
    return { data: createDefaultPlannerData(), status: "reset", dropped: 0 };
  }

  const source = json as Record<string, unknown>;
  const defaults = createDefaultPlannerData();
  const courses = salvageArray(source.courses, courseSchema);
  const customCategories = salvageArray(source.customCategories, categorySchema);
  const tasks = salvageArray(source.tasks, taskSchema);
  const events = salvageArray(source.events, eventSchema);
  const notes = salvageArray(source.notes, noteSchema);
  const completedBlocks = salvageArray(source.completedBlocks, z.string());
  const notifiedReminders = salvageArray(source.notifiedReminders, z.string());
  const templateOverrides = salvageRecord(source.templateOverrides, blockAssignmentSchema);
  const weekOverrides = salvageRecord(source.weekOverrides, blockAssignmentSchema);
  const settings = settingsSchema.safeParse(source.settings);

  const dropped =
    courses.dropped +
    customCategories.dropped +
    tasks.dropped +
    events.dropped +
    notes.dropped +
    completedBlocks.dropped +
    notifiedReminders.dropped +
    templateOverrides.dropped +
    weekOverrides.dropped +
    (settings.success || source.settings === undefined ? 0 : 1);

  return {
    status: "recovered",
    dropped,
    data: {
      version: 1,
      // Keep the planner usable: if every course was invalid, restore the defaults.
      courses: courses.items.length > 0 ? courses.items : defaults.courses,
      customCategories: customCategories.items,
      tasks: tasks.items,
      events: events.items,
      notes: notes.items,
      completedBlocks: completedBlocks.items,
      notifiedReminders: notifiedReminders.items,
      templateOverrides: templateOverrides.items,
      weekOverrides: weekOverrides.items,
      settings: settings.success ? settings.data : defaults.settings,
    },
  };
}

/** Reads planner data from localStorage. Client-only; safe if storage is blocked. */
export function loadPlannerData(storage: Storage | undefined = safeLocalStorage()): LoadResult {
  if (!storage) return { data: createDefaultPlannerData(), status: "empty", dropped: 0 };
  let raw: string | null = null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { data: createDefaultPlannerData(), status: "empty", dropped: 0 };
  }
  const result = parsePlannerData(raw);
  if ((result.status === "reset" || result.status === "recovered") && raw !== null) {
    try {
      storage.setItem(BACKUP_KEY, raw);
    } catch {
      /* storage full or blocked: nothing more we can do */
    }
  }
  return result;
}

/** Writes planner data. Returns false if the browser refused (private mode, quota). */
export function savePlannerData(data: PlannerData, storage: Storage | undefined = safeLocalStorage()): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function clearPlannerData(storage: Storage | undefined = safeLocalStorage()): void {
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function safeLocalStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}
