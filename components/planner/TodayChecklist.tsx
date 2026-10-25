"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { CategoryOptions, CourseOptions, CourseTag, EmptyState, PanelHead } from "@/components/planner/bits";
import { usePlanner } from "@/components/planner/PlannerContext";
import { todaysTasks } from "@/lib/dashboard";
import { formatClock, formatDate } from "@/lib/date";
import { focusElement, launchConfetti } from "@/lib/dom";
import { createId } from "@/lib/id";
import type { PlannerTask } from "@/lib/types";

type Filter = "today" | "upcoming" | "all" | "done";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "all", label: "All" },
  { id: "done", label: "Done" },
];

const NEW_CATEGORY = "__new";

interface Draft {
  title: string;
  categoryId: string;
  courseId: string;
  dueDate: string;
  dueTime: string;
}

const emptyDraft = (today: string): Draft => ({ title: "", categoryId: "daily-study", courseId: "", dueDate: today, dueTime: "" });

/**
 * Daily checklist (COS 106: "interactive task management system").
 * Add, edit, complete/uncomplete and delete tasks. Arrays are filtered,
 * sorted and counted with plain functions; everything is saved automatically.
 */
export function TodayChecklist() {
  const { data, dispatch, today, categoryById } = usePlanner();
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(today));
  const [error, setError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [filter, setFilter] = useState<Filter>("today");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [lastDeleted, setLastDeleted] = useState<PlannerTask | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const todayList = useMemo(() => todaysTasks(data, today), [data, today]);
  const remaining = todayList.filter((t) => !t.completed).length;
  const done = todayList.length - remaining;

  const visible = useMemo(() => {
    const byDue = (a: PlannerTask, b: PlannerTask) =>
      Number(a.completed) - Number(b.completed) ||
      (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999") ||
      (a.dueTime ?? "99").localeCompare(b.dueTime ?? "99") ||
      b.createdAt.localeCompare(a.createdAt);
    const lists: Record<Filter, PlannerTask[]> = {
      today: todayList,
      upcoming: data.tasks.filter((t) => !t.completed && t.dueDate !== null && t.dueDate > today),
      all: data.tasks,
      done: data.tasks.filter((t) => t.completed),
    };
    return [...lists[filter]].sort(byDue);
  }, [data.tasks, filter, today, todayList]);

  // Hide the undo bar after a few seconds.
  useEffect(() => {
    if (!lastDeleted) return;
    const id = window.setTimeout(() => setLastDeleted(null), 7000);
    return () => window.clearTimeout(id);
  }, [lastDeleted]);

  const addTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = draft.title.trim();
    if (!title) {
      setError("Give your task a title first (it can't be blank).");
      focusElement(titleRef.current);
      return;
    }
    let categoryId = draft.categoryId;
    if (categoryId === NEW_CATEGORY) {
      const name = newCategory.trim();
      if (!name) {
        setError("Name your new category, or pick an existing one.");
        return;
      }
      categoryId = createId("cat");
      dispatch({ type: "category/add", category: { id: categoryId, name, preset: false } });
      setNewCategory("");
    }
    dispatch({
      type: "task/add",
      task: {
        id: createId("task"),
        title,
        categoryId,
        courseId: draft.courseId || null,
        dueDate: draft.dueDate || null,
        dueTime: draft.dueDate && draft.dueTime ? draft.dueTime : null,
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
      },
    });
    setError(null);
    setCelebrate(false);
    setDraft((d) => ({ ...emptyDraft(today), categoryId, courseId: d.courseId }));
    // DOM: put the cursor straight back in the title box for the next task.
    focusElement(titleRef.current);
  };

  const toggle = (task: PlannerTask, checkbox: HTMLInputElement) => {
    dispatch({ type: "task/toggle", id: task.id, at: new Date().toISOString() });
    const finishesToday = !task.completed && todayList.some((t) => t.id === task.id) && remaining === 1;
    if (finishesToday) {
      setCelebrate(true);
      launchConfetti(checkbox);
    } else if (task.completed) {
      setCelebrate(false);
    } else {
      launchConfetti(checkbox, 14);
    }
  };

  const remove = (task: PlannerTask) => {
    dispatch({ type: "task/delete", id: task.id });
    setLastDeleted(task);
    if (editingId === task.id) setEditingId(null);
    focusElement(listRef.current?.querySelector<HTMLElement>("input.checkbox") ?? titleRef.current);
  };

  const undo = () => {
    if (!lastDeleted) return;
    dispatch({ type: "task/add", task: lastDeleted });
    setLastDeleted(null);
  };

  const percent = todayList.length === 0 ? 0 : Math.round((done / todayList.length) * 100);

  return (
    <section aria-labelledby="checklist-title" className="planner-panel">
      <PanelHead id="checklist-title" title="Today's checklist">
        <div className="checklist-progress" aria-live="polite">
          <svg viewBox="0 0 36 36" className="checklist-progress__ring" aria-hidden="true">
            <circle cx="18" cy="18" r="15.5" className="checklist-progress__track" />
            {percent > 0 ? <circle cx="18" cy="18" r="15.5" className="checklist-progress__value" strokeDasharray={`${percent} 100`} pathLength={100} /> : null}
          </svg>
          <p className="checklist-progress__text">
            <strong data-testid="remaining-count">{remaining}</strong> left · <strong data-testid="done-count">{done}</strong> done
          </p>
        </div>
      </PanelHead>

      <form className="task-form" onSubmit={addTask} noValidate>
        <div className="field task-form__title">
          <label className="field__label" htmlFor="task-title">
            New task
          </label>
          <input
            ref={titleRef}
            id="task-title"
            className="input"
            value={draft.title}
            maxLength={200}
            placeholder="e.g. Read COS 106 week 6 notes"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "task-title-error" : undefined}
            onChange={(e) => {
              setDraft({ ...draft, title: e.target.value });
              if (error && e.target.value.trim()) setError(null);
            }}
          />
          {error ? (
            <span id="task-title-error" className="field__error" role="alert">
              {error}
            </span>
          ) : null}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="task-category">
            Category
          </label>
          <select id="task-category" className="select" value={draft.categoryId} onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}>
            <CategoryOptions />
            <option value={NEW_CATEGORY}>＋ Create a new category…</option>
          </select>
        </div>
        {draft.categoryId === NEW_CATEGORY ? (
          <div className="field">
            <label className="field__label" htmlFor="task-new-category">
              New category name
            </label>
            <input id="task-new-category" className="input" value={newCategory} maxLength={80} onChange={(e) => setNewCategory(e.target.value)} />
          </div>
        ) : null}
        <div className="field">
          <label className="field__label" htmlFor="task-course">
            Course <span className="field__hint">(optional)</span>
          </label>
          <select id="task-course" className="select" value={draft.courseId} onChange={(e) => setDraft({ ...draft, courseId: e.target.value })}>
            <option value="">No course</option>
            <CourseOptions />
          </select>
        </div>
        <div className="field field--short">
          <label className="field__label" htmlFor="task-date">
            Due date <span className="field__hint">(optional)</span>
          </label>
          <input id="task-date" type="date" className="input" value={draft.dueDate} onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} />
        </div>
        <div className="field field--short">
          <label className="field__label" htmlFor="task-time">
            Time <span className="field__hint">(optional)</span>
          </label>
          <input
            id="task-time"
            type="time"
            className="input"
            value={draft.dueTime}
            disabled={!draft.dueDate}
            onChange={(e) => setDraft({ ...draft, dueTime: e.target.value })}
          />
        </div>
        <button type="submit" className="btn task-form__submit">
          Add task <span aria-hidden="true">＋</span>
        </button>
      </form>

      <div className="filter-tabs" role="group" aria-label="Show tasks">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className="filter-tabs__btn" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {celebrate && filter === "today" && remaining === 0 && todayList.length > 0 ? (
        <div className="notice notice--success celebrate" role="status">
          <span className="celebrate__emoji" aria-hidden="true">
            🎉
          </span>
          <p>
            <strong>All done for today!</strong> You finished every task on today&rsquo;s list. Go dance a little, you earned it.
          </p>
        </div>
      ) : null}

      {visible.length === 0 ? (
        <EmptyState icon={filter === "done" ? "🌱" : "📝"} title={emptyTitle(filter)}>
          <p>{emptyBody(filter)}</p>
        </EmptyState>
      ) : (
        <ul ref={listRef} className="task-list" aria-label={`${FILTERS.find((f) => f.id === filter)?.label} tasks`}>
          {visible.map((task) =>
            editingId === task.id ? (
              <TaskEditor key={task.id} task={task} onDone={() => setEditingId(null)} />
            ) : (
              <li key={task.id} className={`task-item${task.completed ? " is-done" : ""}`}>
                <input
                  type="checkbox"
                  className="checkbox"
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onChange={(e) => toggle(task, e.currentTarget)}
                />
                <div className="task-item__main">
                  <label htmlFor={`task-${task.id}`} className="task-item__title">
                    {task.title}
                  </label>
                  <div className="task-item__meta">
                    <span className="chip">{categoryById.get(task.categoryId)?.name ?? "Uncategorised"}</span>
                    <CourseTag courseId={task.courseId} />
                    {task.dueDate ? (
                      <span className={`task-item__due${!task.completed && task.dueDate < today ? " is-overdue" : ""}`}>
                        {!task.completed && task.dueDate < today ? "Overdue · " : ""}
                        {task.dueDate === today ? "Today" : formatDate(task.dueDate)}
                        {task.dueTime ? `, ${formatClock(task.dueTime)}` : ""}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="task-item__actions">
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditingId(task.id)}>
                    Edit<span className="visually-hidden"> {task.title}</span>
                  </button>
                  <button type="button" className="btn btn--danger btn--sm" onClick={() => remove(task)}>
                    Delete<span className="visually-hidden"> {task.title}</span>
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}

      {lastDeleted ? (
        <div className="undo-bar" role="status">
          <span>
            Deleted &ldquo;{lastDeleted.title}&rdquo;.
          </span>
          <button type="button" className="btn btn--sun btn--sm" onClick={undo}>
            Undo
          </button>
        </div>
      ) : null}
    </section>
  );
}

function emptyTitle(filter: Filter): string {
  switch (filter) {
    case "today":
      return "Nothing on today's list yet";
    case "upcoming":
      return "No upcoming tasks";
    case "all":
      return "No tasks yet";
    case "done":
      return "Nothing ticked off yet";
  }
}

function emptyBody(filter: Filter): string {
  switch (filter) {
    case "today":
      return "Add your first task above. Tasks due today, overdue tasks and tasks without a date show up here.";
    case "upcoming":
      return "Give a task a future due date and it will wait for you here.";
    case "all":
      return "Every task you add, past or future, will be listed here.";
    case "done":
      return "Tick a task off and it will appear here. Small wins count!";
  }
}

function TaskEditor({ task, onDone }: { task: PlannerTask; onDone: () => void }) {
  const { dispatch } = usePlanner();
  const [title, setTitle] = useState(task.title);
  const [categoryId, setCategoryId] = useState(task.categoryId);
  const [courseId, setCourseId] = useState(task.courseId ?? "");
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [dueTime, setDueTime] = useState(task.dueTime ?? "");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => focusElement(inputRef.current, { select: true }), []);

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("The title can't be blank.");
      focusElement(inputRef.current);
      return;
    }
    dispatch({
      type: "task/update",
      id: task.id,
      changes: {
        title: title.trim(),
        categoryId,
        courseId: courseId || null,
        dueDate: dueDate || null,
        dueTime: dueDate && dueTime ? dueTime : null,
      },
    });
    onDone();
  };

  const id = `edit-${task.id}`;
  return (
    <li className="task-item task-item--editing">
      <form className="task-editor" onSubmit={save} noValidate onKeyDown={(e) => e.key === "Escape" && onDone()}>
        <div className="field task-editor__title">
          <label className="field__label" htmlFor={`${id}-title`}>
            Task title
          </label>
          <input
            ref={inputRef}
            id={`${id}-title`}
            className="input"
            value={title}
            maxLength={200}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            onChange={(e) => setTitle(e.target.value)}
          />
          {error ? (
            <span id={`${id}-error`} className="field__error" role="alert">
              {error}
            </span>
          ) : null}
        </div>
        <div className="field">
          <label className="field__label" htmlFor={`${id}-category`}>
            Category
          </label>
          <select id={`${id}-category`} className="select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <CategoryOptions />
          </select>
        </div>
        <div className="field">
          <label className="field__label" htmlFor={`${id}-course`}>
            Course
          </label>
          <select id={`${id}-course`} className="select" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            <option value="">No course</option>
            <CourseOptions />
          </select>
        </div>
        <div className="field">
          <label className="field__label" htmlFor={`${id}-date`}>
            Due date
          </label>
          <input id={`${id}-date`} type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor={`${id}-time`}>
            Time
          </label>
          <input id={`${id}-time`} type="time" className="input" value={dueTime} disabled={!dueDate} onChange={(e) => setDueTime(e.target.value)} />
        </div>
        <div className="cluster task-editor__actions">
          <button type="submit" className="btn btn--sm">
            Save changes
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onDone}>
            Cancel
          </button>
        </div>
      </form>
    </li>
  );
}
