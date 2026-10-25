"use client";

import { useMemo, useState, type FormEvent } from "react";
import { CategoryOptions, CourseOptions, PanelHead } from "@/components/planner/bits";
import { ConfirmDialog, Modal } from "@/components/planner/Modal";
import { usePlanner } from "@/components/planner/PlannerContext";
import { DAYS, SLOTS } from "@/data/timetable";
import { addDays, dayKeyOf, formatClock, formatDate, formatHours, startOfWeek } from "@/lib/date";
import { launchConfetti } from "@/lib/dom";
import { BASE_TIMETABLE, dayTotals, effectiveWeek, targetStatus, templateAssignment, type EffectiveBlock } from "@/lib/timetable";
import type { BlockAssignment, BlockKind, DayKey } from "@/lib/types";

const KIND_LABELS: Record<BlockKind, string> = {
  study: "Study",
  work: "Work",
  rest: "Rest",
  personal: "Personal time",
  exercise: "Exercise",
  light: "Optional light task",
};

const TARGET_TEXT = { none: "No study planned", under: "Below target", "on-target": "On target", over: "Stretch day" } as const;

export function Timetable() {
  const { data, dispatch, today, courseById } = usePlanner();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));
  const [mobileDay, setMobileDay] = useState<DayKey>(() => dayKeyOf(today));
  const [editing, setEditing] = useState<EffectiveBlock | null>(null);
  const [confirm, setConfirm] = useState<"week" | "template" | null>(null);

  const blocks = useMemo(() => effectiveWeek(data, weekStart), [data, weekStart]);
  const totals = useMemo(() => dayTotals(blocks), [blocks]);
  const byCell = useMemo(() => new Map(blocks.map((b) => [`${b.day}-${b.slotId}`, b])), [blocks]);
  const { dailyTargetMinHours: min, dailyTargetMaxHours: max } = data.settings;
  const weekHasOverrides = Object.keys(data.weekOverrides).some((k) => k.startsWith(`${weekStart}|`));
  const templateEdited = Object.keys(data.templateOverrides).length > 0;
  const thisWeek = startOfWeek(today);

  const toggleDone = (block: EffectiveBlock, el: HTMLElement) => {
    dispatch({ type: "block/toggleDone", date: block.date, blockId: block.id });
    if (!block.done) {
      const dayBlocks = blocks.filter((b) => b.day === block.day && b.kind === "study");
      const allDone = dayBlocks.every((b) => b.done || b.id === block.id);
      launchConfetti(el, allDone ? 60 : 12);
    }
  };

  const blockTitle = (b: EffectiveBlock) => {
    const course = b.courseId ? courseById.get(b.courseId) : undefined;
    if (b.kind === "study" && course && b.label === "Course study") return course.code;
    return b.label || KIND_LABELS[b.kind];
  };

  const cell = (b: EffectiveBlock) => {
    const course = b.courseId ? courseById.get(b.courseId) : undefined;
    return (
      <div
        className={`tt-block tt-block--${b.kind}${b.done ? " is-done" : ""}${b.source === "week" ? " is-week-edit" : ""}`}
        style={course && b.kind === "study" ? { borderLeftColor: course.color } : undefined}
      >
        <button type="button" className="tt-block__edit" onClick={() => setEditing(b)} aria-label={`Edit ${DAYS.find((d) => d.key === b.day)?.long} ${formatClock(b.start)}: ${blockTitle(b)}`}>
          <span className="tt-block__title">
            {b.locked ? <span aria-hidden="true">🔒 </span> : null}
            {blockTitle(b)}
          </span>
          {b.kind === "study" && course && b.label !== "Course study" ? <span className="tt-block__course">{course.code}</span> : null}
          {b.source === "week" ? <span className="tt-block__flag">This week only</span> : null}
        </button>
        {b.kind === "study" ? (
          <label className="tt-block__done">
            <input type="checkbox" className="checkbox checkbox--sm" checked={b.done} onChange={(e) => toggleDone(b, e.currentTarget)} />
            <span>{b.done ? "Done" : "Mark done"}</span>
            <span className="visually-hidden">
              {" "}
              {blockTitle(b)} on {formatDate(b.date)}
            </span>
          </label>
        ) : null}
      </div>
    );
  };

  return (
    <section aria-labelledby="timetable-title" className="planner-panel">
      <PanelHead id="timetable-title" title="Weekly timetable">
        <div className="week-nav">
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setWeekStart(addDays(weekStart, -7))}>
            <span aria-hidden="true">←</span> Previous<span className="visually-hidden"> week</span>
          </button>
          <p className="week-nav__label" aria-live="polite">
            {weekStart === thisWeek ? "This week · " : ""}
            {formatDate(weekStart, { day: "numeric", month: "short" })} – {formatDate(addDays(weekStart, 6), { day: "numeric", month: "short", year: "numeric" })}
          </p>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setWeekStart(addDays(weekStart, 7))}>
            Next<span className="visually-hidden"> week</span> <span aria-hidden="true">→</span>
          </button>
          {weekStart !== thisWeek ? (
            <button type="button" className="btn btn--sm" onClick={() => setWeekStart(thisWeek)}>
              Back to this week
            </button>
          ) : null}
        </div>
      </PanelHead>

      <p className="planner-help">
        Work (9 AM–5 PM) is locked. Mornings and the lunch break hold your reading, evenings stay light. Daily target:{" "}
        <strong>
          {min}–{max} h
        </strong>{" "}
        of study. Tap any block to change it for <em>this week only</em> or for <em>every week</em>, and tick study blocks off as you
        finish them.
      </p>

      <ul className="tt-legend" aria-label="Legend">
        {(Object.keys(KIND_LABELS) as BlockKind[]).map((k) => (
          <li key={k} className={`tt-legend__item tt-legend__item--${k}`}>
            {KIND_LABELS[k]}
          </li>
        ))}
      </ul>

      {/* Desktop: semantic table (COS 106: tables) */}
      <div className="table-wrap tt-table-wrap" role="region" aria-label="Weekly timetable table" tabIndex={0}>
        <table className="data-table tt-table">
          <caption>
            Study timetable for the week of {formatDate(weekStart, { day: "numeric", month: "long", year: "numeric" })}
          </caption>
          <thead>
            <tr>
              <th scope="col">Time</th>
              {DAYS.map((d, i) => (
                <th key={d.key} scope="col" className={addDays(weekStart, i) === today ? "is-today" : undefined}>
                  <abbr title={d.long}>{d.short}</abbr>
                  <span className="tt-table__date">{formatDate(addDays(weekStart, i), { day: "numeric", month: "short" })}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLOTS.map((slot) => (
              <tr key={slot.id}>
                <th scope="row" className="tt-table__time">
                  {formatClock(slot.start)}
                  <span>– {formatClock(slot.end)}</span>
                </th>
                {DAYS.map((d) => {
                  const b = byCell.get(`${d.key}-${slot.id}`);
                  return <td key={d.key}>{b ? cell(b) : null}</td>;
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Study planned / done</th>
              {totals.map((t) => (
                <td key={t.day}>
                  <DayTotal planned={t.plannedHours} done={t.doneHours} min={min} max={max} />
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile: stacked day view */}
      <div className="tt-mobile">
        <div className="tt-mobile__days" role="group" aria-label="Choose a day">
          {DAYS.map((d, i) => (
            <button key={d.key} type="button" className="tt-mobile__day" aria-pressed={mobileDay === d.key} onClick={() => setMobileDay(d.key)}>
              <span>{d.short}</span>
              <span className="tt-mobile__date">{formatDate(addDays(weekStart, i), { day: "numeric" })}</span>
            </button>
          ))}
        </div>
        {(() => {
          const t = totals.find((x) => x.day === mobileDay)!;
          return (
            <div className="tt-mobile__total">
              <h3>{DAYS.find((d) => d.key === mobileDay)?.long}</h3>
              <DayTotal planned={t.plannedHours} done={t.doneHours} min={min} max={max} />
            </div>
          );
        })()}
        <ol className="tt-mobile__list">
          {blocks
            .filter((b) => b.day === mobileDay)
            .map((b) => (
              <li key={b.id} className="tt-mobile__item">
                <span className="tt-mobile__time">
                  {formatClock(b.start)} – {formatClock(b.end)}
                </span>
                {cell(b)}
              </li>
            ))}
        </ol>
      </div>

      <div className="cluster tt-actions">
        <button type="button" className="btn btn--ghost btn--sm" disabled={!weekHasOverrides} onClick={() => setConfirm("week")}>
          Reset this week to default
        </button>
        <button type="button" className="btn btn--ghost btn--sm" disabled={!templateEdited} onClick={() => setConfirm("template")}>
          Restore original template
        </button>
      </div>

      <BlockEditor block={editing} weekStart={weekStart} onClose={() => setEditing(null)} />

      <ConfirmDialog
        open={confirm === "week"}
        title="Reset this week?"
        message="All one-week changes for this week will be removed and the blocks will go back to your default template. Ticked-off blocks stay ticked."
        confirmLabel="Reset week"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          dispatch({ type: "week/reset", weekStart });
          setConfirm(null);
        }}
      />
      <ConfirmDialog
        open={confirm === "template"}
        title="Restore the original template?"
        message="Your 'every week' changes will be removed and the default schedule restored. One-week changes are kept."
        confirmLabel="Restore template"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          dispatch({ type: "template/reset" });
          setConfirm(null);
        }}
      />
    </section>
  );
}

function DayTotal({ planned, done, min, max }: { planned: number; done: number; min: number; max: number }) {
  const status = targetStatus(planned, min, max);
  const pct = planned === 0 ? 0 : Math.min(100, (done / planned) * 100);
  return (
    <div className={`day-total day-total--${status}`}>
      <span className="day-total__nums">
        {formatHours(planned)} <span className="day-total__sep">/</span> {formatHours(done)} done
      </span>
      <span className="day-total__bar" aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </span>
      <span className="day-total__status">{TARGET_TEXT[status]}</span>
    </div>
  );
}

function BlockEditor({ block, weekStart, onClose }: { block: EffectiveBlock | null; weekStart: string; onClose: () => void }) {
  const open = block !== null;
  return (
    <Modal
      open={open}
      title={block ? `${DAYS.find((d) => d.key === block.day)?.long}, ${formatClock(block.start)} – ${formatClock(block.end)}` : "Edit block"}
      onClose={onClose}
    >
      {block ? <BlockEditorForm key={`${block.id}-${weekStart}`} block={block} weekStart={weekStart} onClose={onClose} /> : null}
    </Modal>
  );
}

function BlockEditorForm({ block, weekStart, onClose }: { block: EffectiveBlock; weekStart: string; onClose: () => void }) {
  const { data, dispatch } = usePlanner();
  const [kind, setKind] = useState<BlockKind>(block.kind);
  const [label, setLabel] = useState(block.label);
  const [courseId, setCourseId] = useState(block.courseId ?? "");
  const [categoryId, setCategoryId] = useState(block.categoryId ?? "");
  const [scope, setScope] = useState<"week" | "template">("week");
  const [unlocked, setUnlocked] = useState(!block.locked);

  const base = BASE_TIMETABLE.find((b) => b.id === block.id)!;
  const template = templateAssignment(data, base);

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const assignment: BlockAssignment = {
      kind,
      label: label.trim() || KIND_LABELS[kind],
      courseId: kind === "study" ? courseId || null : null,
      categoryId: categoryId || null,
      // Work stays locked unless she changed it to something else.
      locked: kind === "work",
    };
    if (scope === "week") dispatch({ type: "block/setWeek", weekStart, blockId: block.id, assignment });
    else dispatch({ type: "block/setTemplate", blockId: block.id, assignment });
    onClose();
  };

  const resetBlock = () => {
    if (block.source === "week") dispatch({ type: "block/setWeek", weekStart, blockId: block.id, assignment: null });
    else dispatch({ type: "block/setTemplate", blockId: block.id, assignment: null });
    onClose();
  };

  if (!unlocked) {
    return (
      <div className="block-editor">
        <p className="notice">
          <span aria-hidden="true">🔒</span>
          <span>
            This is a locked <strong>work</strong> block, so no study is scheduled here. If your shift changes, unlock it to edit it.
          </span>
        </p>
        <div className="dialog__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Keep it locked
          </button>
          <button type="button" className="btn" onClick={() => setUnlocked(true)}>
            Unlock to edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="block-editor" onSubmit={save}>
      <div className="field">
        <label className="field__label" htmlFor="block-kind">
          Activity type
        </label>
        <select id="block-kind" className="select" value={kind} onChange={(e) => setKind(e.target.value as BlockKind)}>
          {(Object.keys(KIND_LABELS) as BlockKind[]).map((k) => (
            <option key={k} value={k}>
              {KIND_LABELS[k]}
            </option>
          ))}
        </select>
      </div>
      {kind === "study" ? (
        <div className="field">
          <label className="field__label" htmlFor="block-course">
            Course
          </label>
          <select id="block-course" className="select" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            <option value="">Any course / general study</option>
            <CourseOptions />
          </select>
        </div>
      ) : null}
      <div className="field">
        <label className="field__label" htmlFor="block-category">
          Activity category
        </label>
        <select id="block-category" className="select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">None</option>
          <CategoryOptions />
        </select>
      </div>
      <div className="field">
        <label className="field__label" htmlFor="block-label">
          Label
        </label>
        <input id="block-label" className="input" value={label} maxLength={80} onChange={(e) => setLabel(e.target.value)} />
        <span className="field__hint">Use &ldquo;Course study&rdquo; to show just the course code.</span>
      </div>
      <fieldset className="field block-editor__scope">
        <legend className="field__label">Apply this change to</legend>
        <label>
          <input type="radio" name="scope" value="week" checked={scope === "week"} onChange={() => setScope("week")} /> This week only (
          {formatDate(block.date)})
        </label>
        <label>
          <input type="radio" name="scope" value="template" checked={scope === "template"} onChange={() => setScope("template")} /> Every week
          (default template)
        </label>
      </fieldset>
      <p className="field__hint">
        Default for this slot: <strong>{template.label}</strong>
      </p>
      <div className="dialog__actions">
        {block.source !== "default" ? (
          <button type="button" className="btn btn--ghost" onClick={resetBlock}>
            {block.source === "week" ? "Undo this week's change" : "Reset to original"}
          </button>
        ) : null}
        <button type="button" className="btn btn--ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn">
          Save block
        </button>
      </div>
    </form>
  );
}
