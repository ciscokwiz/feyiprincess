"use client";

import type { ReactNode } from "react";
import { usePlanner } from "@/components/planner/PlannerContext";

/** Coloured dot + course code. Shows "Removed course" if the course no longer exists. */
export function CourseTag({ courseId, full = false }: { courseId: string | null; full?: boolean }) {
  const { courseById } = usePlanner();
  if (!courseId) return null;
  const course = courseById.get(courseId);
  if (!course) return <span className="course-tag course-tag--missing">Removed course</span>;
  return (
    <span className="course-tag" title={`${course.code}: ${course.title}`}>
      <span className="course-tag__dot" style={{ background: course.color }} aria-hidden="true" />
      {full ? `${course.code}: ${course.title}` : course.code}
    </span>
  );
}

/** Friendly empty state that says exactly what to do to fill it. */
export function EmptyState({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">
        {icon}
      </span>
      <p className="empty-state__title">{title}</p>
      <div className="empty-state__body">{children}</div>
    </div>
  );
}

/** <option>s for every course. */
export function CourseOptions() {
  const { data } = usePlanner();
  return (
    <>
      {data.courses.map((c) => (
        <option key={c.id} value={c.id}>
          {c.code}: {c.title}
        </option>
      ))}
    </>
  );
}

/** <option>s for every category (preset + custom). */
export function CategoryOptions() {
  const { categories } = usePlanner();
  return (
    <>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </>
  );
}

/** Panel heading used at the top of each planner tab. */
export function PanelHead({ title, id, children }: { title: string; id: string; children?: ReactNode }) {
  return (
    <div className="panel-head">
      <h2 id={id} className="panel-head__title">
        {title}
      </h2>
      {children ? <div className="panel-head__extra">{children}</div> : null}
    </div>
  );
}
