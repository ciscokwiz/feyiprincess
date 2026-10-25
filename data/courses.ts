import type { Course } from "@/lib/types";

/**
 * Eight accessible course colours (each passes WCAG AA with white text).
 * They mirror the --course-1 … --course-8 tokens in app/globals.css.
 */
export const COURSE_COLORS = [
  { name: "Burgundy", hex: "#641f36" },
  { name: "Berry", hex: "#b0285a" },
  { name: "Teal", hex: "#1f6f66" },
  { name: "Marigold", hex: "#8a5a00" },
  { name: "Coral", hex: "#b23a20" },
  { name: "Indigo", hex: "#3d4e9e" },
  { name: "Sage", hex: "#4a6b35" },
  { name: "Brown", hex: "#795548" },
] as const;

const color = (i: number): string => COURSE_COLORS[i % COURSE_COLORS.length]!.hex;

/**
 * Her eight courses this semester. Only COS 106 is confirmed; the other seven
 * are placeholders. Rename them here, or in the Planner under "Courses"
 * (changes made in the planner are saved in the browser).
 */
export const DEFAULT_COURSES: Course[] = [
  { id: "course-1", code: "COS 106", title: "Introduction to Web Technologies", color: color(0), placeholder: false },
  { id: "course-2", code: "Course 2", title: "Add course name", color: color(1), placeholder: true },
  { id: "course-3", code: "Course 3", title: "Add course name", color: color(2), placeholder: true },
  { id: "course-4", code: "Course 4", title: "Add course name", color: color(3), placeholder: true },
  { id: "course-5", code: "Course 5", title: "Add course name", color: color(4), placeholder: true },
  { id: "course-6", code: "Course 6", title: "Add course name", color: color(5), placeholder: true },
  { id: "course-7", code: "Course 7", title: "Add course name", color: color(6), placeholder: true },
  { id: "course-8", code: "Course 8", title: "Add course name", color: color(7), placeholder: true },
];
