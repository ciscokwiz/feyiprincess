"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { PanelHead } from "@/components/planner/bits";
import { ConfirmDialog } from "@/components/planner/Modal";
import { usePlanner } from "@/components/planner/PlannerContext";
import { COURSE_COLORS } from "@/data/courses";
import { downloadTextFile, focusElement } from "@/lib/dom";
import { createId } from "@/lib/id";
import { nextCourseColor } from "@/lib/plannerReducer";
import { parsePlannerData } from "@/lib/plannerStorage";
import type { Course, PlannerData } from "@/lib/types";
import { NotificationSettings } from "@/components/planner/Reminders";

export function SettingsPanel() {
  return (
    <section aria-labelledby="settings-title" className="planner-panel">
      <PanelHead id="settings-title" title="Courses & settings" />
      <div className="settings-grid">
        <CoursesManager />
        <div className="settings-col">
          <CategoriesManager />
          <TargetSettings />
          <NotificationSettings />
          <DataTools />
        </div>
      </div>
    </section>
  );
}

function CoursesManager() {
  const { data, dispatch } = usePlanner();
  const [toRemove, setToRemove] = useState<Course | null>(null);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  const add = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!code.trim()) {
      setError("Add a course code, e.g. MTH 102.");
      focusElement(codeRef.current);
      return;
    }
    dispatch({
      type: "course/add",
      course: { id: createId("course"), code: code.trim(), title: title.trim() || "Untitled course", color: nextCourseColor(data.courses), placeholder: false },
    });
    setCode("");
    setTitle("");
    setError(null);
    focusElement(codeRef.current);
  };

  return (
    <article className="settings-card card" aria-labelledby="courses-title">
      <h3 id="courses-title">My courses ({data.courses.length})</h3>
      <p className="field__hint">Rename the placeholders to your real courses. Changes save as you type.</p>
      <ul className="course-list">
        {data.courses.map((course) => (
          <li key={course.id} className="course-row" style={{ borderLeftColor: course.color }}>
            <div className="course-row__fields">
              <div className="field">
                <label className="field__label" htmlFor={`code-${course.id}`}>
                  Code
                </label>
                <input
                  id={`code-${course.id}`}
                  className="input"
                  value={course.code}
                  maxLength={40}
                  onChange={(e) => dispatch({ type: "course/update", id: course.id, changes: { code: e.target.value, placeholder: false } })}
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor={`title-${course.id}`}>
                  Course name
                </label>
                <input
                  id={`title-${course.id}`}
                  className="input"
                  value={course.title}
                  maxLength={120}
                  onChange={(e) => dispatch({ type: "course/update", id: course.id, changes: { title: e.target.value, placeholder: false } })}
                />
              </div>
            </div>
            <fieldset className="swatches">
              <legend className="visually-hidden">Colour for {course.code}</legend>
              {COURSE_COLORS.map((c) => (
                <label key={c.hex} className="swatch" style={{ background: c.hex }} title={c.name}>
                  <input
                    type="radio"
                    name={`color-${course.id}`}
                    value={c.hex}
                    checked={course.color.toLowerCase() === c.hex}
                    onChange={() => dispatch({ type: "course/update", id: course.id, changes: { color: c.hex } })}
                  />
                  <span className="visually-hidden">{c.name}</span>
                </label>
              ))}
            </fieldset>
            <div className="course-row__foot">
              {course.placeholder ? <span className="chip chip--sun">Placeholder name</span> : <span />}
              <button type="button" className="btn btn--danger btn--sm" onClick={() => setToRemove(course)}>
                Remove<span className="visually-hidden"> {course.code}</span>
              </button>
            </div>
          </li>
        ))}
      </ul>

      <form className="course-add" onSubmit={add} noValidate>
        <h4>Add a course</h4>
        <div className="course-row__fields">
          <div className="field">
            <label className="field__label" htmlFor="new-course-code">
              Code
            </label>
            <input
              ref={codeRef}
              id="new-course-code"
              className="input"
              value={code}
              maxLength={40}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "new-course-error" : undefined}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="new-course-title">
              Course name
            </label>
            <input id="new-course-title" className="input" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} />
          </div>
        </div>
        {error ? (
          <span id="new-course-error" className="field__error" role="alert">
            {error}
          </span>
        ) : null}
        <button type="submit" className="btn btn--sm">
          Add course
        </button>
      </form>

      <ConfirmDialog
        open={toRemove !== null}
        title={`Remove ${toRemove?.code ?? "course"}?`}
        message="Tasks, events, notes and timetable blocks linked to it will be kept, but unlinked from the course."
        confirmLabel="Remove course"
        onCancel={() => setToRemove(null)}
        onConfirm={() => {
          if (toRemove) dispatch({ type: "course/delete", id: toRemove.id });
          setToRemove(null);
        }}
      />
    </article>
  );
}

function CategoriesManager() {
  const { data, dispatch } = usePlanner();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const add = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Name the category first.");
      return;
    }
    dispatch({ type: "category/add", category: { id: createId("cat"), name: name.trim(), preset: false } });
    setName("");
    setError(null);
  };

  return (
    <article className="settings-card card" aria-labelledby="categories-title">
      <h3 id="categories-title">Custom categories</h3>
      <p className="field__hint">The ten preset activity categories are always available. Add your own here.</p>
      {data.customCategories.length > 0 ? (
        <ul className="cat-list">
          {data.customCategories.map((c) => (
            <li key={c.id} className="chip chip--rose">
              {c.name}
              <button type="button" className="cat-list__remove" onClick={() => dispatch({ type: "category/delete", id: c.id })}>
                <span aria-hidden="true">×</span>
                <span className="visually-hidden">Remove {c.name}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <form className="inline-form" onSubmit={add} noValidate>
        <div className="field">
          <label className="field__label" htmlFor="new-category">
            New category
          </label>
          <input
            id="new-category"
            className="input"
            value={name}
            maxLength={80}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "new-category-error" : undefined}
            onChange={(e) => setName(e.target.value)}
          />
          {error ? (
            <span id="new-category-error" className="field__error" role="alert">
              {error}
            </span>
          ) : null}
        </div>
        <button type="submit" className="btn btn--sm">
          Add
        </button>
      </form>
    </article>
  );
}

function TargetSettings() {
  const { data, dispatch } = usePlanner();
  const { dailyTargetMinHours: min, dailyTargetMaxHours: max } = data.settings;
  const update = (key: "dailyTargetMinHours" | "dailyTargetMaxHours") => (e: ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Math.min(24, Number(e.target.value) || 0));
    dispatch({ type: "settings/update", changes: { [key]: value } });
  };
  return (
    <article className="settings-card card" aria-labelledby="target-title">
      <h3 id="target-title">Daily reading target</h3>
      <div className="inline-form">
        <div className="field">
          <label className="field__label" htmlFor="target-min">
            From (hours)
          </label>
          <input id="target-min" type="number" min={0} max={24} step={0.5} className="input" value={min} onChange={update("dailyTargetMinHours")} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="target-max">
            To (hours)
          </label>
          <input id="target-max" type="number" min={0} max={24} step={0.5} className="input" value={max} onChange={update("dailyTargetMaxHours")} />
        </div>
      </div>
      {min > max ? (
        <p className="field__error" role="alert">
          The &ldquo;from&rdquo; value is higher than &ldquo;to&rdquo;.
        </p>
      ) : null}
    </article>
  );
}

function DataTools() {
  const { data, dispatch } = usePlanner();
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [pendingImport, setPendingImport] = useState<PlannerData | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadTextFile(`uchechukwu-planner-${stamp}.json`, JSON.stringify(data, null, 2));
    setMessage({ tone: "success", text: "Backup downloaded. Keep it somewhere safe, and import it in any browser." });
  };

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const result = parsePlannerData(await file.text());
    if (result.status === "reset" || result.status === "empty") {
      setMessage({ tone: "danger", text: "That file isn't a planner backup this site can read. Nothing was changed." });
      return;
    }
    setPendingImport(result.data);
    if (result.status === "recovered") {
      setMessage({ tone: "danger", text: `Heads up: ${result.dropped} invalid record(s) in that file will be skipped.` });
    } else {
      setMessage(null);
    }
  };

  return (
    <article className="settings-card card" aria-labelledby="data-title">
      <h3 id="data-title">Your data</h3>
      <p className="field__hint">
        Everything is saved in this browser only. Export a backup before switching browsers or devices, then import it there.
      </p>
      <div className="cluster">
        <button type="button" className="btn btn--sm" onClick={exportData}>
          Export backup (JSON)
        </button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => fileRef.current?.click()}>
          Import backup
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="visually-hidden" tabIndex={-1} aria-label="Choose a planner backup file" onChange={onFile} />
        <button type="button" className="btn btn--danger btn--sm" onClick={() => setConfirmClear(true)}>
          Clear all data
        </button>
      </div>
      {message ? (
        <p className={`notice notice--${message.tone} settings-message`} role="status">
          {message.text}
        </p>
      ) : null}

      <ConfirmDialog
        open={pendingImport !== null}
        title="Replace your planner with this backup?"
        message={
          pendingImport
            ? `The backup has ${pendingImport.tasks.length} tasks, ${pendingImport.events.length} events and ${pendingImport.notes.length} notes. Your current planner data will be replaced.`
            : ""
        }
        confirmLabel="Import and replace"
        onCancel={() => setPendingImport(null)}
        onConfirm={() => {
          if (pendingImport) dispatch({ type: "replace", data: pendingImport });
          setPendingImport(null);
          setMessage({ tone: "success", text: "Backup imported." });
        }}
      />
      <ConfirmDialog
        open={confirmClear}
        title="Clear all planner data?"
        message="This deletes every task, note, event, timetable change and course edit saved in this browser. It can't be undone unless you exported a backup."
        confirmLabel="Yes, clear everything"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          dispatch({ type: "clear" });
          setConfirmClear(false);
          setMessage({ tone: "success", text: "All planner data cleared. Fresh start!" });
        }}
      />
    </article>
  );
}
