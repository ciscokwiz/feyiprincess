import { z } from "zod";
import { CLOCK_RE, ISO_DATE_RE } from "@/lib/date";
import type {
  ActivityCategory,
  BlockAssignment,
  CalendarEvent,
  ContactFormValues,
  Course,
  Note,
  PlannerData,
  PlannerSettings,
  PlannerTask,
} from "@/lib/types";

/**
 * Zod schemas for everything saved in localStorage. Each one is typed against
 * the matching interface in lib/types.ts so the two can never drift apart.
 */

const isoDate = z.string().regex(ISO_DATE_RE);
const clock = z.string().regex(CLOCK_RE);
const id = z.string().min(1).max(120);
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const courseSchema: z.ZodType<Course> = z.object({
  id,
  code: z.string().max(40),
  title: z.string().max(120),
  color: hex,
  placeholder: z.boolean(),
});

export const categorySchema: z.ZodType<ActivityCategory> = z.object({
  id,
  name: z.string().min(1).max(80),
  preset: z.boolean(),
});

export const taskSchema: z.ZodType<PlannerTask> = z.object({
  id,
  title: z.string().min(1).max(200),
  categoryId: id,
  courseId: id.nullable(),
  dueDate: isoDate.nullable(),
  dueTime: clock.nullable(),
  completed: z.boolean(),
  completedAt: z.string().nullable(),
  createdAt: z.string(),
});

export const blockAssignmentSchema: z.ZodType<BlockAssignment> = z.object({
  kind: z.enum(["study", "work", "rest", "personal", "exercise", "light"]),
  label: z.string().max(80),
  courseId: id.nullable(),
  categoryId: id.nullable(),
  locked: z.boolean(),
});

export const eventSchema: z.ZodType<CalendarEvent> = z.object({
  id,
  title: z.string().min(1).max(200),
  type: z.enum(["assignment", "quiz", "exam", "certification", "other"]),
  date: isoDate,
  time: clock.nullable(),
  courseId: id.nullable(),
  done: z.boolean(),
  createdAt: z.string(),
});

export const noteSchema: z.ZodType<Note> = z.object({
  id,
  title: z.string().min(1).max(200),
  body: z.string().max(20000),
  type: z.enum(["lecture", "reminder", "concept", "reflection", "idea"]),
  courseId: id.nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const settingsSchema: z.ZodType<PlannerSettings> = z.object({
  dailyTargetMinHours: z.number().min(0).max(24),
  dailyTargetMaxHours: z.number().min(0).max(24),
  notifications: z.boolean(),
});

export const plannerDataSchema: z.ZodType<PlannerData> = z.object({
  version: z.literal(1),
  courses: z.array(courseSchema),
  customCategories: z.array(categorySchema),
  tasks: z.array(taskSchema),
  templateOverrides: z.record(z.string(), blockAssignmentSchema),
  weekOverrides: z.record(z.string(), blockAssignmentSchema),
  completedBlocks: z.array(z.string()),
  events: z.array(eventSchema),
  notes: z.array(noteSchema),
  settings: settingsSchema,
  notifiedReminders: z.array(z.string()),
});

/* ------------------------------------------------------------- Contact */

export const PHONE_MIN_DIGITS = 7;
export const PHONE_MAX_DIGITS = 15;

export const contactSchema: z.ZodType<ContactFormValues> = z.object({
  name: z.string().trim().min(1, "Please tell me your name.").max(100, "That name is a little long. Keep it under 100 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Please add your email address so I can reply.")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "That email doesn't look quite right. Try something like name@example.com."),
  phone: z
    .string()
    .trim()
    .min(1, "Please add a phone number.")
    .regex(/^\d+$/, "Use digits only (0–9), with no spaces, dashes or + sign.")
    .min(PHONE_MIN_DIGITS, `A phone number needs at least ${PHONE_MIN_DIGITS} digits.`)
    .max(PHONE_MAX_DIGITS, `A phone number can have at most ${PHONE_MAX_DIGITS} digits.`),
  message: z.string().trim().min(1, "Please write a message.").max(2000, "Please keep your message under 2,000 characters."),
});
