import { DEFAULT_COURSES } from "@/data/courses";
import { buildDefaultTimetable, DAYS } from "@/data/timetable";
import { minutesBetween, weekDates } from "@/lib/date";
import type { BlockAssignment, DayKey, ISODate, PlannerData, TimetableBlock } from "@/lib/types";

/** The original template (before any of her edits). Built once from the default course ids. */
export const BASE_TIMETABLE: TimetableBlock[] = buildDefaultTimetable(DEFAULT_COURSES.map((c) => c.id));

export const weekOverrideKey = (weekStart: ISODate, blockId: string): string => `${weekStart}|${blockId}`;
export const completedBlockKey = (date: ISODate, blockId: string): string => `${date}|${blockId}`;

export interface EffectiveBlock extends TimetableBlock {
  date: ISODate;
  /** Where this block's assignment comes from. */
  source: "default" | "template" | "week";
  done: boolean;
  hours: number;
}

const assignmentOf = (b: BlockAssignment): BlockAssignment => ({
  kind: b.kind,
  label: b.label,
  courseId: b.courseId,
  categoryId: b.categoryId,
  locked: b.locked,
});

/** Default for a block once her "every week" template edits are applied. */
export function templateAssignment(data: PlannerData, block: TimetableBlock): BlockAssignment {
  return data.templateOverrides[block.id] ?? assignmentOf(block);
}

/** All blocks for the week starting `weekStart`, with template and one-week overrides applied. */
export function effectiveWeek(data: PlannerData, weekStart: ISODate): EffectiveBlock[] {
  const dates = weekDates(weekStart);
  const done = new Set(data.completedBlocks);
  return BASE_TIMETABLE.map((block) => {
    const date = dates[DAYS.findIndex((d) => d.key === block.day)]!;
    const weekOverride = data.weekOverrides[weekOverrideKey(weekStart, block.id)];
    const templateOverride = data.templateOverrides[block.id];
    const assignment = weekOverride ?? templateOverride ?? assignmentOf(block);
    return {
      ...block,
      ...assignment,
      date,
      source: weekOverride ? "week" : templateOverride ? "template" : "default",
      done: done.has(completedBlockKey(date, block.id)),
      hours: minutesBetween(block.start, block.end) / 60,
    };
  });
}

export const isStudy = (b: Pick<TimetableBlock, "kind">): boolean => b.kind === "study";

export interface DayTotals {
  day: DayKey;
  date: ISODate;
  plannedHours: number;
  doneHours: number;
}

export function dayTotals(blocks: EffectiveBlock[]): DayTotals[] {
  return DAYS.map(({ key }) => {
    const dayBlocks = blocks.filter((b) => b.day === key && isStudy(b));
    return {
      day: key,
      date: blocks.find((b) => b.day === key)?.date ?? "",
      plannedHours: dayBlocks.reduce((sum, b) => sum + b.hours, 0),
      doneHours: dayBlocks.filter((b) => b.done).reduce((sum, b) => sum + b.hours, 0),
    };
  });
}

export type TargetStatus = "none" | "under" | "on-target" | "over";

export function targetStatus(hours: number, min: number, max: number): TargetStatus {
  if (hours === 0) return "none";
  if (hours < min) return "under";
  if (hours > max) return "over";
  return "on-target";
}
