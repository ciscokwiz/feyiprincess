import type { ActivityCategory, EventType, NoteType } from "@/lib/types";

/** Preset activity categories. She can add her own in the planner. */
export const PRESET_CATEGORIES: ActivityCategory[] = [
  { id: "daily-study", name: "Daily study to-do", preset: true },
  { id: "study-session", name: "Personal study session", preset: true },
  { id: "revision", name: "Course review & revision", preset: true },
  { id: "assignment", name: "Assignment completion & submission", preset: true },
  { id: "quiz-prep", name: "Quiz preparation & practice", preset: true },
  { id: "exam-prep", name: "Examination preparation", preset: true },
  { id: "career", name: "Career development", preset: true },
  { id: "portfolio", name: "Portfolio & project work", preset: true },
  { id: "rest-exercise", name: "Rest & exercise", preset: true },
  { id: "notes-reflection", name: "Personal notes & reflections", preset: true },
];

export const EVENT_TYPES: { id: EventType; label: string; color: string }[] = [
  { id: "assignment", label: "Assignment", color: "#b0285a" },
  { id: "quiz", label: "Quiz", color: "#8a5a00" },
  { id: "exam", label: "Exam", color: "#641f36" },
  { id: "certification", label: "Certification deadline", color: "#1f6f66" },
  { id: "other", label: "Other", color: "#3d4e9e" },
];

export const NOTE_TYPES: { id: NoteType; label: string }[] = [
  { id: "lecture", label: "Lecture note" },
  { id: "reminder", label: "Study reminder" },
  { id: "concept", label: "Key concept" },
  { id: "reflection", label: "Reflection" },
  { id: "idea", label: "Project idea" },
];
