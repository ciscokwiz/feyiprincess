/**
 * Shared, explicit types for site content and the planner.
 * Content types describe the editable files in /data.
 * Planner types describe what is saved in the browser (see lib/schemas.ts for
 * the matching Zod schemas used to validate stored data on read).
 */

/** Calendar date in local time, formatted `YYYY-MM-DD`. */
export type ISODate = string;
/** 24-hour clock time, formatted `HH:mm`. */
export type ClockTime = string;

/* ---------------------------------------------------------------- Content */

export interface PhotoAsset {
  /** Path under /public, e.g. `/images/hero.jpg`. */
  src: string;
  alt: string;
  /** Short name shown on the placeholder, e.g. "Hero portrait". */
  label: string;
  width: number;
  height: number;
}

export interface SocialLink {
  label: string;
  href: string;
  /** True while the link still points at a placeholder value. */
  placeholder: boolean;
}

export interface Education {
  qualification: string;
  institution: string | null;
  status: string;
  detail?: string;
}

export interface Certification {
  title: string;
  issuer: string;
  school?: string;
  /** Date awarded (YYYY-MM-DD). */
  awarded: ISODate;
  reference: string;
  /** Path under /public. The "View certificate" link only renders if this file exists at build time. */
  certificatePath: string;
}

export type Tint = "rose" | "sun" | "teal" | "coral";

export interface Hobby {
  name: string;
  blurb: string;
  /** Illustration under /public/illustrations. */
  illustration: string;
  tint: Tint;
}

export type MilestoneStatus = "Completed" | "Certified" | "Awarded" | "Ongoing" | "In progress" | "Planned";

export interface Milestone {
  milestone: string;
  area: string;
  status: MilestoneStatus;
}

export interface IntroVideo {
  /** Video file under /public. The <video> renders only if this file exists at build time. */
  src: string;
  type: "video/mp4" | "video/webm";
  captions: string;
  poster: PhotoAsset;
  /** Shown next to the player so visitors know what they are watching. */
  note: string;
}

export interface Profile {
  fullName: string;
  preferredName: string;
  monogram: string;
  role: string;
  email: string;
  emailIsPlaceholder: boolean;
  /** WhatsApp number in international format, digits only (e.g. 2348012345678). The contact form sends messages here. */
  whatsappNumber: string;
  socials: SocialLink[];
  siteUrl: string;
  photos: {
    hero: PhotoAsset;
    about: PhotoAsset;
    candid: PhotoAsset;
  };
  introVideo: IntroVideo;
  bio: string[];
  currently: { label: string; value: string }[];
  education: Education[];
  certifications: Certification[];
  aspirations: string[];
  skills: { learningNow: string[]; upNext: string[] };
  softSkills: string[];
  softSkillsNote: string;
  hobbies: Hobby[];
  milestones: Milestone[];
}

export interface Project {
  slug: string;
  title: string;
  client: string;
  summary: string;
  tags: string[];
  url: string;
  cover: PhotoAsset;
  /** Highlighted card (e.g. the healthcare-focused case study). */
  featured: boolean;
  featureNote?: string;
  /**
   * Where the summary came from. "title" means the Notion page could not be read
   * when the site was built, so the summary only restates the title. Review it.
   */
  summarySource: "page" | "title";
}

/* ---------------------------------------------------------------- Planner */

export interface Course {
  id: string;
  code: string;
  title: string;
  /** Hex colour from COURSE_COLORS. */
  color: string;
  /** True until she replaces the placeholder name. */
  placeholder: boolean;
}

export interface ActivityCategory {
  id: string;
  name: string;
  preset: boolean;
}

export interface PlannerTask {
  id: string;
  title: string;
  categoryId: string;
  courseId: string | null;
  dueDate: ISODate | null;
  dueTime: ClockTime | null;
  completed: boolean;
  /** ISO timestamp of completion. */
  completedAt: string | null;
  createdAt: string;
}

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type BlockKind = "study" | "work" | "rest" | "personal" | "exercise" | "light";

export interface TimetableSlot {
  id: string;
  start: ClockTime;
  end: ClockTime;
}

/** The editable part of a timetable block. */
export interface BlockAssignment {
  kind: BlockKind;
  label: string;
  courseId: string | null;
  categoryId: string | null;
  locked: boolean;
}

export interface TimetableBlock extends BlockAssignment {
  /** `${day}-${slotId}`, e.g. `mon-s01`. */
  id: string;
  day: DayKey;
  slotId: string;
  start: ClockTime;
  end: ClockTime;
}

export type EventType = "assignment" | "quiz" | "exam" | "certification" | "other";

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  date: ISODate;
  time: ClockTime | null;
  courseId: string | null;
  done: boolean;
  createdAt: string;
}

export type NoteType = "lecture" | "reminder" | "concept" | "reflection" | "idea";

export interface Note {
  id: string;
  title: string;
  body: string;
  type: NoteType;
  courseId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlannerSettings {
  dailyTargetMinHours: number;
  dailyTargetMaxHours: number;
  /** She opted in to browser notifications (permission is still checked separately). */
  notifications: boolean;
}

export interface PlannerData {
  version: 1;
  courses: Course[];
  customCategories: ActivityCategory[];
  tasks: PlannerTask[];
  /** Changes to the default weekly template, keyed by block id. */
  templateOverrides: Record<string, BlockAssignment>;
  /** One-week changes, keyed by `${weekStart}|${blockId}`. */
  weekOverrides: Record<string, BlockAssignment>;
  /** Study blocks she marked done, as `${date}|${blockId}` keys. */
  completedBlocks: string[];
  events: CalendarEvent[];
  notes: Note[];
  settings: PlannerSettings;
  /** Reminder keys already sent as browser notifications (prevents repeats). */
  notifiedReminders: string[];
}

/* ---------------------------------------------------------------- Contact */

export interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export type ContactField = keyof ContactFormValues;
export type ContactErrors = Partial<Record<ContactField, string>>;
