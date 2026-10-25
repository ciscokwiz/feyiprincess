"use client";

import { useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { CourseOptions, CourseTag, EmptyState, PanelHead } from "@/components/planner/bits";
import { usePlanner } from "@/components/planner/PlannerContext";
import { EVENT_TYPES } from "@/data/categories";
import { agendaItems, upcomingItems, type AgendaItem } from "@/lib/agenda";
import { addDays, formatClock, formatDate, fromISODate, monthGrid } from "@/lib/date";
import { focusElement } from "@/lib/dom";
import { createId } from "@/lib/id";
import type { EventType, ISODate } from "@/lib/types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarView() {
  const { data, dispatch, today, courseById } = usePlanner();
  const [selected, setSelected] = useState<ISODate>(today);
  const [cursor, setCursor] = useState(() => ({ year: fromISODate(today).getFullYear(), month: fromISODate(today).getMonth() }));
  const gridRef = useRef<HTMLTableElement>(null);

  const items = useMemo(() => agendaItems(data), [data]);
  const byDate = useMemo(() => {
    const map = new Map<ISODate, AgendaItem[]>();
    for (const item of items) map.set(item.date, [...(map.get(item.date) ?? []), item]);
    return map;
  }, [items]);
  const grid = monthGrid(cursor.year, cursor.month);
  const weeks = Array.from({ length: 6 }, (_, w) => grid.slice(w * 7, w * 7 + 7));
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const upcoming = upcomingItems(data, today, 8);
  const selectedItems = byDate.get(selected) ?? [];

  const moveMonth = (delta: number) => {
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const select = (date: ISODate) => {
    setSelected(date);
    const d = fromISODate(date);
    if (d.getMonth() !== cursor.month || d.getFullYear() !== cursor.year) setCursor({ year: d.getFullYear(), month: d.getMonth() });
  };

  // Arrow keys move between days, like a native date picker.
  const onGridKey = (event: KeyboardEvent<HTMLTableElement>) => {
    const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const delta = moves[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    const next = addDays(selected, delta);
    select(next);
    requestAnimationFrame(() => focusElement(gridRef.current?.querySelector<HTMLElement>(`[data-date="${next}"]`) ?? null));
  };

  const toggle = (item: AgendaItem) => {
    if (item.source === "task") dispatch({ type: "task/toggle", id: item.id, at: new Date().toISOString() });
    else dispatch({ type: "event/update", id: item.id, changes: { done: !item.done } });
  };

  return (
    <section aria-labelledby="calendar-title" className="planner-panel">
      <PanelHead id="calendar-title" title="Calendar">
        <div className="week-nav">
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => moveMonth(-1)}>
            <span aria-hidden="true">←</span>
            <span className="visually-hidden">Previous month</span>
          </button>
          <p className="week-nav__label" aria-live="polite">
            {monthLabel}
          </p>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => moveMonth(1)}>
            <span aria-hidden="true">→</span>
            <span className="visually-hidden">Next month</span>
          </button>
          <button type="button" className="btn btn--sm" onClick={() => select(today)}>
            Today
          </button>
        </div>
      </PanelHead>

      <ul className="cal-legend" aria-label="Event types">
        {EVENT_TYPES.map((t) => (
          <li key={t.id}>
            <span className="cal-dot" style={{ background: t.color }} aria-hidden="true" /> {t.label}
          </li>
        ))}
        <li>
          <span className="cal-dot cal-dot--task" aria-hidden="true" /> Task
        </li>
      </ul>

      <div className="cal-layout">
        <div className="cal-month">
          <table ref={gridRef} className="cal-grid" onKeyDown={onGridKey}>
            <caption className="visually-hidden">{monthLabel}. Use arrow keys to move between days.</caption>
            <thead>
              <tr>
                {WEEKDAYS.map((d) => (
                  <th key={d} scope="col">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week) => (
                <tr key={week[0]}>
                  {week.map((date) => {
                    const dayItems = byDate.get(date) ?? [];
                    const inMonth = fromISODate(date).getMonth() === cursor.month;
                    const isSelected = date === selected;
                    return (
                      <td key={date} className={`${inMonth ? "" : "is-outside"}${date === today ? " is-today" : ""}`}>
                        <button
                          type="button"
                          data-date={date}
                          className={`cal-day${isSelected ? " is-selected" : ""}`}
                          aria-pressed={isSelected}
                          tabIndex={isSelected ? 0 : -1}
                          aria-label={`${formatDate(date, { weekday: "long", day: "numeric", month: "long" })}${date === today ? ", today" : ""}${
                            dayItems.length ? `, ${dayItems.length} item${dayItems.length > 1 ? "s" : ""}` : ""
                          }`}
                          onClick={() => select(date)}
                        >
                          <span className="cal-day__num">{fromISODate(date).getDate()}</span>
                          <span className="cal-day__dots" aria-hidden="true">
                            {dayItems.slice(0, 4).map((i) => (
                              <span
                                key={i.key}
                                className={`cal-dot${i.source === "task" ? " cal-dot--task" : ""}${i.done ? " is-done" : ""}`}
                                style={i.source === "event" ? { background: i.color } : undefined}
                              />
                            ))}
                            {dayItems.length > 4 ? <span className="cal-day__more">+{dayItems.length - 4}</span> : null}
                          </span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="cal-side">
          <section className="cal-day-panel" aria-labelledby="cal-selected-title">
            <h3 id="cal-selected-title">{selected === today ? "Today" : formatDate(selected, { weekday: "long", day: "numeric", month: "long" })}</h3>
            {selectedItems.length === 0 ? (
              <p className="field__hint">Nothing on this day yet. Add an assignment, quiz, exam or deadline below.</p>
            ) : (
              <ul className="agenda-list">
                {selectedItems.map((item) => (
                  <AgendaRow key={item.key} item={item} onToggle={() => toggle(item)} onDelete={item.source === "event" ? () => dispatch({ type: "event/delete", id: item.id }) : undefined} />
                ))}
              </ul>
            )}
            <EventForm date={selected} />
          </section>

          <section className="cal-upcoming" aria-labelledby="upcoming-title">
            <h3 id="upcoming-title">Upcoming deadlines</h3>
            {upcoming.length === 0 ? (
              <EmptyState icon="📅" title="No upcoming deadlines">
                <p>Add events to the calendar or give tasks a due date, and the next ones will line up here.</p>
              </EmptyState>
            ) : (
              <ol className="agenda-list agenda-list--compact">
                {upcoming.map((item) => (
                  <li key={item.key}>
                    <button type="button" className="agenda-link" onClick={() => select(item.date)}>
                      <span className="cal-dot" style={{ background: item.source === "event" ? item.color : undefined }} aria-hidden="true" />
                      <span className="agenda-link__title">{item.title}</span>
                      <span className="agenda-link__meta">
                        {item.typeLabel} · {item.date === today ? "Today" : formatDate(item.date)}
                        {item.time ? `, ${formatClock(item.time)}` : ""}
                        {item.courseId && courseById.get(item.courseId) ? ` · ${courseById.get(item.courseId)!.code}` : ""}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}

function AgendaRow({ item, onToggle, onDelete }: { item: AgendaItem; onToggle: () => void; onDelete?: () => void }) {
  const id = `agenda-${item.key.replace(/[^a-z0-9_-]/gi, "")}`;
  return (
    <li className={`agenda-row${item.done ? " is-done" : ""}`} style={{ borderLeftColor: item.color }}>
      <input id={id} type="checkbox" className="checkbox checkbox--sm" checked={item.done} onChange={onToggle} />
      <div className="agenda-row__main">
        <label htmlFor={id} className="agenda-row__title">
          {item.title}
        </label>
        <span className="agenda-row__meta">
          <span className="chip">{item.typeLabel}</span>
          {item.time ? <span>{formatClock(item.time)}</span> : null}
          <CourseTag courseId={item.courseId} />
        </span>
      </div>
      {onDelete ? (
        <button type="button" className="btn btn--danger btn--sm" onClick={onDelete}>
          Delete<span className="visually-hidden"> {item.title}</span>
        </button>
      ) : null}
    </li>
  );
}

function EventForm({ date }: { date: ISODate }) {
  const { dispatch } = usePlanner();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EventType>("assignment");
  const [time, setTime] = useState("");
  const [courseId, setCourseId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const add = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Give the event a title.");
      focusElement(titleRef.current);
      return;
    }
    dispatch({
      type: "event/add",
      event: {
        id: createId("evt"),
        title: title.trim(),
        type,
        date,
        time: time || null,
        courseId: courseId || null,
        done: false,
        createdAt: new Date().toISOString(),
      },
    });
    setTitle("");
    setTime("");
    setError(null);
    focusElement(titleRef.current);
  };

  return (
    <form className="event-form" onSubmit={add} noValidate>
      <p className="event-form__title">Add to {formatDate(date, { day: "numeric", month: "short" })}</p>
      <div className="field event-form__wide">
        <label className="field__label" htmlFor="event-title">
          Title
        </label>
        <input
          ref={titleRef}
          id="event-title"
          className="input"
          value={title}
          maxLength={200}
          placeholder="e.g. COS 106 term project due"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "event-title-error" : undefined}
          onChange={(e) => setTitle(e.target.value)}
        />
        {error ? (
          <span id="event-title-error" className="field__error" role="alert">
            {error}
          </span>
        ) : null}
      </div>
      <div className="field">
        <label className="field__label" htmlFor="event-type">
          Type
        </label>
        <select id="event-type" className="select" value={type} onChange={(e) => setType(e.target.value as EventType)}>
          {EVENT_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label className="field__label" htmlFor="event-time">
          Time <span className="field__hint">(optional)</span>
        </label>
        <input id="event-time" type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>
      <div className="field event-form__wide">
        <label className="field__label" htmlFor="event-course">
          Course <span className="field__hint">(optional)</span>
        </label>
        <select id="event-course" className="select" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          <option value="">No course</option>
          <CourseOptions />
        </select>
      </div>
      <button type="submit" className="btn btn--sm event-form__wide">
        Add event
      </button>
    </form>
  );
}
