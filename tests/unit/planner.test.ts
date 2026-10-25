import { describe, expect, it } from "vitest";
import { buildDefaultTimetable, DAYS } from "@/data/timetable";
import { DEFAULT_COURSES } from "@/data/courses";
import { assignmentProgress, completionHistory, courseProgress, dailyCompletion, todaysTasks, weeklyStudy } from "@/lib/dashboard";
import { addDays, monthGrid, startOfWeek, toISODate } from "@/lib/date";
import { plannerReducer } from "@/lib/plannerReducer";
import { createDefaultPlannerData } from "@/lib/plannerStorage";
import { dueReminders } from "@/lib/reminders";
import { dayTotals, effectiveWeek, targetStatus } from "@/lib/timetable";
import type { PlannerData, PlannerTask } from "@/lib/types";

const today = "2026-10-21"; // a Wednesday
const week = startOfWeek(today);

const makeTask = (over: Partial<PlannerTask> = {}): PlannerTask => ({
  id: `task_${Math.random().toString(36).slice(2)}`,
  title: "Task",
  categoryId: "daily-study",
  courseId: null,
  dueDate: today,
  dueTime: null,
  completed: false,
  completedAt: null,
  createdAt: `${today}T07:00:00.000Z`,
  ...over,
});

describe("dates", () => {
  it("finds Monday as the start of the week", () => {
    expect(week).toBe("2026-10-19");
    expect(startOfWeek("2026-10-25")).toBe("2026-10-19"); // Sunday
  });
  it("builds a 42-day month grid starting on Monday", () => {
    const grid = monthGrid(2026, 9);
    expect(grid).toHaveLength(42);
    expect(grid[0]).toBe("2026-09-28");
    expect(grid).toContain("2026-10-31");
  });
});

describe("default timetable rules", () => {
  const blocks = buildDefaultTimetable(DEFAULT_COURSES.map((c) => c.id));
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));

  it("locks weekday work 9 AM–5 PM and schedules no study inside it", () => {
    for (const day of ["mon", "tue", "wed", "thu", "fri"]) {
      const inside = blocks.filter((b) => b.day === day && toMin(b.start) >= 540 && toMin(b.end) <= 1020);
      const work = inside.filter((b) => b.kind === "work");
      expect(work.length).toBeGreaterThan(0);
      expect(work.every((b) => b.locked)).toBe(true);
      // The only non-work block allowed inside 9–5 is the lunch break.
      expect(inside.filter((b) => b.kind === "study").every((b) => b.start === "13:00")).toBe(true);
    }
  });

  it("plans 3–4 h of study on weekdays and more at weekends", () => {
    const data = createDefaultPlannerData();
    const totals = dayTotals(effectiveWeek(data, week));
    for (const t of totals.slice(0, 5)) expect(targetStatus(t.plannedHours, 3, 4)).toBe("on-target");
    const weekday = totals[0]!.plannedHours;
    expect(totals[5]!.plannedHours).toBeGreaterThan(weekday);
    expect(totals[6]!.plannedHours).toBeGreaterThan(weekday);
  });

  it("keeps evenings free of regular study", () => {
    expect(blocks.filter((b) => toMin(b.start) >= 17 * 60 && b.kind === "study")).toHaveLength(0);
  });

  it("gives every course at least one study block a week", () => {
    for (const c of DEFAULT_COURSES) expect(blocks.some((b) => b.courseId === c.id && b.kind === "study")).toBe(true);
  });

  it("covers all seven days", () => {
    expect(new Set(blocks.map((b) => b.day)).size).toBe(DAYS.length);
  });
});

describe("reducer", () => {
  it("adds, toggles, edits and deletes tasks", () => {
    let s = createDefaultPlannerData();
    const t = makeTask();
    s = plannerReducer(s, { type: "task/add", task: t });
    s = plannerReducer(s, { type: "task/toggle", id: t.id, at: "2026-10-21T09:00:00.000Z" });
    expect(s.tasks[0]).toMatchObject({ completed: true, completedAt: "2026-10-21T09:00:00.000Z" });
    s = plannerReducer(s, { type: "task/toggle", id: t.id, at: "x" });
    expect(s.tasks[0]).toMatchObject({ completed: false, completedAt: null });
    s = plannerReducer(s, { type: "task/update", id: t.id, changes: { title: "Renamed" } });
    expect(s.tasks[0]?.title).toBe("Renamed");
    s = plannerReducer(s, { type: "task/delete", id: t.id });
    expect(s.tasks).toHaveLength(0);
  });

  it("applies one-week overrides over the template and resets them", () => {
    let s = createDefaultPlannerData();
    const assignment = { kind: "rest" as const, label: "Day off", courseId: null, categoryId: null, locked: false };
    s = plannerReducer(s, { type: "block/setTemplate", blockId: "mon-s01", assignment: { ...assignment, label: "Template" } });
    s = plannerReducer(s, { type: "block/setWeek", weekStart: week, blockId: "mon-s01", assignment });
    expect(effectiveWeek(s, week).find((b) => b.id === "mon-s01")).toMatchObject({ label: "Day off", source: "week" });
    expect(effectiveWeek(s, addDays(week, 7)).find((b) => b.id === "mon-s01")).toMatchObject({ label: "Template", source: "template" });
    s = plannerReducer(s, { type: "week/reset", weekStart: week });
    expect(effectiveWeek(s, week).find((b) => b.id === "mon-s01")?.label).toBe("Template");
    s = plannerReducer(s, { type: "template/reset" });
    expect(effectiveWeek(s, week).find((b) => b.id === "mon-s01")?.source).toBe("default");
  });

  it("unlinks a removed course everywhere", () => {
    let s: PlannerData = { ...createDefaultPlannerData(), tasks: [makeTask({ courseId: "course-2" })] };
    s = plannerReducer(s, { type: "course/delete", id: "course-2" });
    expect(s.courses.find((c) => c.id === "course-2")).toBeUndefined();
    expect(s.tasks[0]?.courseId).toBeNull();
  });
});

describe("dashboard", () => {
  it("reports null (empty state) when nothing is recorded", () => {
    const s = createDefaultPlannerData();
    expect(dailyCompletion(s, today).percent).toBeNull();
    expect(assignmentProgress(s).percent).toBeNull();
    expect(completionHistory(s, today).every((d) => d.tasksCompleted === 0 && d.studyBlocksDone === 0)).toBe(true);
    expect(weeklyStudy(s, week).doneHours).toBe(0);
  });

  it("computes completion from recorded tasks only", () => {
    const s: PlannerData = {
      ...createDefaultPlannerData(),
      tasks: [
        makeTask({ completed: true, completedAt: new Date(2026, 9, 21, 9).toISOString() }),
        makeTask(),
        makeTask({ dueDate: "2026-10-30" }), // future: not today
        makeTask({ dueDate: "2026-10-10" }), // overdue, open: carried into today
        makeTask({ dueDate: "2026-10-10", completed: true, completedAt: new Date(2026, 9, 11).toISOString() }), // old & done
      ],
    };
    expect(todaysTasks(s, today)).toHaveLength(3);
    expect(dailyCompletion(s, today)).toMatchObject({ done: 1, total: 3, percent: 33 });
    expect(completionHistory(s, today).at(-1)?.tasksCompleted).toBe(1);
  });

  it("counts study hours only from blocks marked done", () => {
    let s = createDefaultPlannerData();
    s = plannerReducer(s, { type: "block/toggleDone", date: week, blockId: "mon-s01" });
    const study = weeklyStudy(s, week);
    expect(study.doneHours).toBe(1);
    expect(study.plannedHours).toBeGreaterThan(20);
    expect(courseProgress(s, week).find((c) => c.courseId === "course-1")?.studyHoursDone).toBe(1);
  });
});

describe("reminders", () => {
  it("lists overdue and due-within-24h items, not later ones or done ones", () => {
    const now = new Date(2026, 9, 21, 10, 0);
    const s: PlannerData = {
      ...createDefaultPlannerData(),
      tasks: [
        makeTask({ title: "today", dueDate: toISODate(now) }),
        makeTask({ title: "late", dueDate: "2026-10-20" }),
        makeTask({ title: "next week", dueDate: "2026-10-28" }),
        makeTask({ title: "done", dueDate: "2026-10-20", completed: true }),
      ],
      events: [{ id: "e1", title: "Quiz", type: "quiz", date: "2026-10-22", time: "09:00", courseId: null, done: false, createdAt: "" }],
    };
    const r = dueReminders(s, now);
    expect(r.map((x) => x.item.title).sort()).toEqual(["Quiz", "late", "today"]);
    expect(r.find((x) => x.item.title === "late")?.status).toBe("overdue");
  });
});
