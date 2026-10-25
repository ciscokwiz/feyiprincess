"use client";

import { useMemo, useState } from "react";
import { CourseTag, EmptyState, PanelHead } from "@/components/planner/bits";
import { usePlanner } from "@/components/planner/PlannerContext";
import { upcomingItems } from "@/lib/agenda";
import { assignmentProgress, completionHistory, courseProgress, dailyCompletion, weeklyStudy, type HistoryDay } from "@/lib/dashboard";
import { formatClock, formatDate, formatHours, startOfWeek } from "@/lib/date";

/**
 * Progress dashboard. Every number comes from her own records (tasks, calendar
 * events, timetable blocks she ticked off). With nothing recorded, each widget
 * shows an empty state explaining what to log.
 */
export function Dashboard() {
  const { data, today, courseById } = usePlanner();
  const weekStart = startOfWeek(today);

  const daily = useMemo(() => dailyCompletion(data, today), [data, today]);
  const study = useMemo(() => weeklyStudy(data, weekStart), [data, weekStart]);
  const assignments = useMemo(() => assignmentProgress(data), [data]);
  const upcoming = useMemo(() => upcomingItems(data, today, 5), [data, today]);
  const courses = useMemo(() => courseProgress(data, weekStart), [data, weekStart]);
  const history = useMemo(() => completionHistory(data, today, 14), [data, today]);

  return (
    <section aria-labelledby="dashboard-title" className="planner-panel">
      <PanelHead id="dashboard-title" title="Progress dashboard" />
      <p className="planner-help">Everything here is calculated from what you&rsquo;ve recorded. Nothing is estimated or made up.</p>

      <div className="dash-grid">
        <article className="dash-card" aria-labelledby="dash-daily">
          <h3 id="dash-daily" className="dash-card__title">
            Today&rsquo;s completion
          </h3>
          {daily.percent === null ? (
            <EmptyState icon="☀️" title="No tasks for today">
              <p>Add tasks in the Today tab to see your daily completion.</p>
            </EmptyState>
          ) : (
            <>
              <p className="dash-stat" data-testid="dash-daily-percent">
                {daily.percent}%
              </p>
              <Meter value={daily.done} max={daily.total} label="Today's tasks done" />
              <p className="dash-card__sub">
                {daily.done} of {daily.total} tasks done
              </p>
            </>
          )}
        </article>

        <article className="dash-card" aria-labelledby="dash-study">
          <h3 id="dash-study" className="dash-card__title">
            Study hours this week
          </h3>
          {study.plannedHours === 0 ? (
            <EmptyState icon="⏰" title="No study blocks planned">
              <p>Set some timetable blocks to &ldquo;Study&rdquo; to plan your week.</p>
            </EmptyState>
          ) : (
            <>
              <p className="dash-stat">
                {formatHours(study.doneHours)} <span className="dash-stat__of">of {formatHours(study.plannedHours)}</span>
              </p>
              <Meter value={study.doneHours} max={study.plannedHours} label="Study hours completed this week" />
              <p className="dash-card__sub">
                {study.doneHours === 0 ? "Tick off study blocks in the timetable as you finish them." : `${study.percent}% of planned study done`}
              </p>
            </>
          )}
        </article>

        <article className="dash-card" aria-labelledby="dash-assign">
          <h3 id="dash-assign" className="dash-card__title">
            Assignments
          </h3>
          {assignments.total === 0 ? (
            <EmptyState icon="📚" title="No assignments logged">
              <p>Add an &ldquo;Assignment&rdquo; event to the calendar, or a task in the assignment category.</p>
            </EmptyState>
          ) : (
            <>
              <p className="dash-stat">
                {assignments.done} <span className="dash-stat__of">done · {assignments.outstanding} outstanding</span>
              </p>
              <Meter value={assignments.done} max={assignments.total} label="Assignments completed" />
              <p className="dash-card__sub">
                From {assignments.fromEvents} calendar {assignments.fromEvents === 1 ? "event" : "events"} and {assignments.fromTasks}{" "}
                {assignments.fromTasks === 1 ? "task" : "tasks"}
              </p>
            </>
          )}
        </article>

        <article className="dash-card" aria-labelledby="dash-upcoming">
          <h3 id="dash-upcoming" className="dash-card__title">
            Next deadlines
          </h3>
          {upcoming.length === 0 ? (
            <EmptyState icon="📅" title="Nothing coming up">
              <p>Dated tasks and calendar events will appear here, soonest first.</p>
            </EmptyState>
          ) : (
            <ol className="dash-upcoming">
              {upcoming.map((i) => (
                <li key={i.key}>
                  <span className="cal-dot" style={{ background: i.source === "event" ? i.color : undefined }} aria-hidden="true" />
                  <span className="dash-upcoming__title">{i.title}</span>
                  <span className="dash-upcoming__when">
                    {i.date === today ? "Today" : formatDate(i.date)}
                    {i.time ? `, ${formatClock(i.time)}` : ""}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </article>

        <article className="dash-card dash-card--wide" aria-labelledby="dash-courses">
          <h3 id="dash-courses" className="dash-card__title">
            Progress per course
          </h3>
          <ul className="dash-courses">
            {courses.map((c) => {
              const course = courseById.get(c.courseId);
              return (
                <li key={c.courseId} className="dash-course">
                  <CourseTag courseId={c.courseId} />
                  <span className="dash-course__name">{course?.title}</span>
                  {c.items.total === 0 ? (
                    <span className="dash-course__empty">No tasks or events logged yet</span>
                  ) : (
                    <span className="dash-course__bar">
                      <Meter value={c.items.done} max={c.items.total} label={`${course?.code} items done`} color={course?.color} />
                      <span>
                        {c.items.done}/{c.items.total} done
                      </span>
                    </span>
                  )}
                  <span className="dash-course__hours">
                    {c.studyHoursPlanned === 0 ? "No study blocks this week" : `${formatHours(c.studyHoursDone)} / ${formatHours(c.studyHoursPlanned)} studied this week`}
                  </span>
                </li>
              );
            })}
          </ul>
        </article>

        <article className="dash-card dash-card--wide" aria-labelledby="dash-history">
          <h3 id="dash-history" className="dash-card__title">
            Study goals completed, last 14 days
          </h3>
          {history.every((d) => d.tasksCompleted + d.studyBlocksDone === 0) ? (
            <EmptyState icon="📈" title="Your chart starts with your first tick">
              <p>Complete a task or mark a study block done, and each day&rsquo;s wins will build up here.</p>
            </EmptyState>
          ) : (
            <HistoryChart days={history} today={today} />
          )}
        </article>
      </div>
    </section>
  );
}

function Meter({ value, max, label, color }: { value: number; max: number; label: string; color?: string }) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <span className="meter" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-valuetext={`${value} of ${max}`}>
      <span className="meter__fill" style={{ width: `${pct}%`, background: color }} />
    </span>
  );
}

const SERIES = [
  { key: "tasksCompleted", label: "Tasks completed", color: "#8c3653" },
  { key: "studyBlocksDone", label: "Study blocks done", color: "#2a9d8f" },
] as const;

/** Stacked column chart drawn with SVG: tasks + study blocks completed per day. */
function HistoryChart({ days, today }: { days: HistoryDay[]; today: string }) {
  const [active, setActive] = useState<number | null>(null);
  const W = 640;
  const H = 220;
  const pad = { top: 16, right: 8, bottom: 30, left: 28 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const maxTotal = Math.max(1, ...days.map((d) => d.tasksCompleted + d.studyBlocksDone));
  const step = maxTotal <= 4 ? 1 : maxTotal <= 10 ? 2 : Math.ceil(maxTotal / 5);
  const top = Math.ceil(maxTotal / step) * step;
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  const band = innerW / days.length;
  const barW = Math.min(24, band * 0.6);
  const y = (v: number) => pad.top + innerH - (v / top) * innerH;
  const activeDay = active !== null ? days[active] : undefined;

  return (
    <div className="chart">
      <ul className="chart__legend" aria-label="Chart legend">
        {SERIES.map((s) => (
          <li key={s.key}>
            <span className="chart__swatch" style={{ background: s.color }} aria-hidden="true" />
            {s.label}
          </li>
        ))}
      </ul>
      <div className="chart__plot">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Stacked columns of tasks and study blocks completed each day for the last 14 days. A table version follows.">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} className="chart__grid" />
              <text x={pad.left - 8} y={y(t)} className="chart__tick" textAnchor="end" dominantBaseline="middle">
                {t}
              </text>
            </g>
          ))}
          {days.map((d, i) => {
            const x = pad.left + band * i + (band - barW) / 2;
            const segments = [
              { value: d.tasksCompleted, color: SERIES[0].color },
              { value: d.studyBlocksDone, color: SERIES[1].color },
            ].filter((s) => s.value > 0);
            let base = 0;
            const total = d.tasksCompleted + d.studyBlocksDone;
            return (
              <g key={d.date} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}>
                <rect x={pad.left + band * i} y={pad.top} width={band} height={innerH} fill="transparent" />
                {segments.map((s, si) => {
                  const y0 = y(base);
                  const y1 = y(base + s.value);
                  base += s.value;
                  const isTop = si === segments.length - 1;
                  // 2px surface gap between stacked segments; rounded 4px data-end on the top segment only.
                  const h = Math.max(0, y0 - y1 - (si > 0 ? 2 : 0));
                  return isTop ? (
                    <path key={si} d={roundedTop(x, y1, barW, h, Math.min(4, h))} fill={s.color} />
                  ) : (
                    <rect key={si} x={x} y={y1} width={barW} height={h} fill={s.color} />
                  );
                })}
                {total > 0 && total === maxTotal ? (
                  <text x={x + barW / 2} y={y(total) - 6} className="chart__value" textAnchor="middle">
                    {total}
                  </text>
                ) : null}
                {i % 2 === (days.length - 1) % 2 ? (
                  <text x={x + barW / 2} y={H - 10} className={`chart__tick${d.date === today ? " is-today" : ""}`} textAnchor="middle">
                    {d.date === today ? "Today" : formatDate(d.date, { day: "numeric", month: "short" })}
                  </text>
                ) : null}
              </g>
            );
          })}
          <line x1={pad.left} x2={W - pad.right} y1={y(0)} y2={y(0)} className="chart__axis" />
        </svg>
        {activeDay ? (
          <div className="chart__tooltip" style={{ left: `${((pad.left + band * (active! + 0.5)) / W) * 100}%` }} aria-hidden="true">
            <strong>{formatDate(activeDay.date)}</strong>
            <span>
              <i style={{ background: SERIES[0].color }} /> {activeDay.tasksCompleted} tasks
            </span>
            <span>
              <i style={{ background: SERIES[1].color }} /> {activeDay.studyBlocksDone} study blocks ({formatHours(activeDay.studyHoursDone)})
            </span>
          </div>
        ) : null}
      </div>
      <details className="chart__table">
        <summary>Show as a table</summary>
        <div className="table-wrap" role="region" aria-label="Goals completed per day, table" tabIndex={0}>
          <table className="data-table">
            <caption>Goals completed per day</caption>
            <thead>
              <tr>
                <th scope="col">Day</th>
                <th scope="col">Tasks completed</th>
                <th scope="col">Study blocks done</th>
                <th scope="col">Study hours</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d) => (
                <tr key={d.date}>
                  <th scope="row">{formatDate(d.date)}</th>
                  <td>{d.tasksCompleted}</td>
                  <td>{d.studyBlocksDone}</td>
                  <td>{formatHours(d.studyHoursDone)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

function roundedTop(x: number, y: number, w: number, h: number, r: number): string {
  if (h <= 0) return "";
  return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
}
