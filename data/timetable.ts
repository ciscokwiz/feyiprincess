import type { BlockAssignment, DayKey, TimetableBlock, TimetableSlot } from "@/lib/types";

/**
 * Default weekly timetable.
 *
 * Rules it follows:
 *  - Work is 9 AM–5 PM on weekdays. Those blocks are locked and hold no study.
 *  - Study is prioritised early morning (5:30–8:30) and in the weekday lunch break.
 *  - Weekdays plan 3.5 h of study (target is 3–4 h a day).
 *  - Evenings default to rest, personal time or optional light tasks.
 *  - Weekends carry more of the load, mostly in the afternoon.
 *
 * Edit the slots or the WEEK plan below to change the default for every week.
 * One-off changes (for a single week) are made in the Planner.
 */

export const DAYS: { key: DayKey; short: string; long: string }[] = [
  { key: "mon", short: "Mon", long: "Monday" },
  { key: "tue", short: "Tue", long: "Tuesday" },
  { key: "wed", short: "Wed", long: "Wednesday" },
  { key: "thu", short: "Thu", long: "Thursday" },
  { key: "fri", short: "Fri", long: "Friday" },
  { key: "sat", short: "Sat", long: "Saturday" },
  { key: "sun", short: "Sun", long: "Sunday" },
];

export const SLOTS: TimetableSlot[] = [
  { id: "s01", start: "05:30", end: "06:30" },
  { id: "s02", start: "06:30", end: "07:30" },
  { id: "s03", start: "07:30", end: "08:30" },
  { id: "s04", start: "08:30", end: "09:00" },
  { id: "s05", start: "09:00", end: "12:30" },
  { id: "s06", start: "12:30", end: "13:00" },
  { id: "s07", start: "13:00", end: "13:30" },
  { id: "s08", start: "13:30", end: "15:00" },
  { id: "s09", start: "15:00", end: "17:00" },
  { id: "s10", start: "17:00", end: "18:30" },
  { id: "s11", start: "18:30", end: "20:00" },
  { id: "s12", start: "20:00", end: "21:30" },
  { id: "s13", start: "21:30", end: "22:00" },
];

export const DEFAULT_DAILY_TARGET = { min: 3, max: 4 } as const;

/** "course" means: rotate through the eight courses in order. */
type PlanCell = BlockAssignment | "course";

const a = (kind: BlockAssignment["kind"], label: string, extra: Partial<BlockAssignment> = {}): BlockAssignment => ({
  kind,
  label,
  courseId: null,
  categoryId: null,
  locked: false,
  ...extra,
});

const work = a("work", "Work", { locked: true });
const commute = a("personal", "Get ready & commute");
const lunch = a("rest", "Lunch break");
const lunchReview = a("study", "Lunch-break quick review", { categoryId: "revision" });
const dinner = a("rest", "Unwind & dinner");
const exercise = a("exercise", "Rest & exercise", { categoryId: "rest-exercise" });
const personal = a("personal", "Personal time");
const light = a("light", "Optional light task (tidy notes)", { categoryId: "notes-reflection" });
const windDown = a("rest", "Wind down & reflect");

const weekday = (evening: BlockAssignment): PlanCell[] => [
  "course",
  "course",
  "course",
  commute,
  work,
  lunch,
  lunchReview,
  work,
  work,
  dinner,
  evening,
  light,
  windDown,
];

const WEEK: Record<DayKey, PlanCell[]> = {
  mon: weekday(exercise),
  tue: weekday(personal),
  wed: weekday(exercise),
  thu: weekday(personal),
  fri: weekday(a("rest", "Friday fun & rest")),
  sat: [
    a("rest", "Sleep in"),
    "course",
    "course",
    a("rest", "Breakfast"),
    a("personal", "Chores, errands & brunch"),
    a("rest", "Lunch"),
    a("rest", "Break"),
    a("study", "Assignment deep work", { categoryId: "assignment" }),
    a("study", "Portfolio & project work", { categoryId: "portfolio", courseId: "course-1" }),
    a("exercise", "Basketball / dance / walk", { categoryId: "rest-exercise" }),
    a("personal", "Personal & social time"),
    a("rest", "Anime & chill"),
    windDown,
  ],
  sun: [
    a("rest", "Sleep in"),
    a("rest", "Slow morning"),
    "course",
    a("rest", "Breakfast"),
    a("personal", "Personal & family time"),
    a("rest", "Lunch"),
    a("rest", "Break"),
    a("study", "Weekly review & revision", { categoryId: "revision" }),
    a("study", "Quiz & exam preparation", { categoryId: "quiz-prep" }),
    a("personal", "Cook & prep for the week"),
    a("rest", "Rest & reading for fun"),
    a("light", "Plan next week (optional)", { categoryId: "notes-reflection" }),
    windDown,
  ],
};

/** Builds the default 7-day template, rotating course study blocks through the given course ids. */
export function buildDefaultTimetable(courseIds: readonly string[]): TimetableBlock[] {
  let rotation = 0;
  const blocks: TimetableBlock[] = [];
  for (const day of DAYS) {
    WEEK[day.key].forEach((cell, index) => {
      const slot = SLOTS[index]!;
      let assignment: BlockAssignment;
      if (cell === "course") {
        const courseId = courseIds.length > 0 ? courseIds[rotation % courseIds.length]! : null;
        rotation += 1;
        assignment = a("study", "Course study", { courseId, categoryId: "study-session" });
      } else {
        assignment = cell;
      }
      blocks.push({ ...assignment, id: `${day.key}-${slot.id}`, day: day.key, slotId: slot.id, start: slot.start, end: slot.end });
    });
  }
  return blocks;
}
