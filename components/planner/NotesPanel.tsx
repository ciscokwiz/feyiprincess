"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { CourseOptions, CourseTag, EmptyState, PanelHead } from "@/components/planner/bits";
import { ConfirmDialog } from "@/components/planner/Modal";
import { usePlanner } from "@/components/planner/PlannerContext";
import { NOTE_TYPES } from "@/data/categories";
import { focusElement } from "@/lib/dom";
import { createId } from "@/lib/id";
import type { Note, NoteType } from "@/lib/types";

const typeLabel = (t: NoteType) => NOTE_TYPES.find((n) => n.id === t)?.label ?? t;

interface Draft {
  title: string;
  body: string;
  type: NoteType;
  courseId: string;
}

const EMPTY: Draft = { title: "", body: "", type: "lecture", courseId: "" };

export function NotesPanel() {
  const { data, dispatch } = usePlanner();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<NoteType | "">("");
  const [courseFilter, setCourseFilter] = useState("");
  const [toDelete, setToDelete] = useState<Note | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.notes
      .filter((n) => (typeFilter ? n.type === typeFilter : true))
      .filter((n) => (courseFilter ? n.courseId === courseFilter : true))
      .filter((n) => (q ? `${n.title} ${n.body}`.toLowerCase().includes(q) : true))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [data.notes, query, typeFilter, courseFilter]);

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.title.trim()) {
      setError("Give your note a title.");
      focusElement(titleRef.current);
      return;
    }
    const stamp = new Date().toISOString();
    const fields = { title: draft.title.trim(), body: draft.body, type: draft.type, courseId: draft.courseId || null };
    if (editingId) {
      dispatch({ type: "note/update", id: editingId, changes: { ...fields, updatedAt: stamp } });
    } else {
      dispatch({ type: "note/add", note: { id: createId("note"), ...fields, createdAt: stamp, updatedAt: stamp } });
    }
    setDraft(EMPTY);
    setEditingId(null);
    setError(null);
    focusElement(titleRef.current);
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setDraft({ title: note.title, body: note.body, type: note.type, courseId: note.courseId ?? "" });
    setError(null);
    titleRef.current?.scrollIntoView({ block: "center" });
    focusElement(titleRef.current);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(EMPTY);
    setError(null);
  };

  const filtersActive = Boolean(query || typeFilter || courseFilter);

  return (
    <section aria-labelledby="notes-title" className="planner-panel">
      <PanelHead id="notes-title" title="Notes" />
      <div className="notes-layout">
        <form className="note-form card" onSubmit={save} noValidate aria-labelledby="note-form-title">
          <h3 id="note-form-title">{editingId ? "Edit note" : "New note"}</h3>
          <div className="field">
            <label className="field__label" htmlFor="note-title">
              Title
            </label>
            <input
              ref={titleRef}
              id="note-title"
              className="input"
              value={draft.title}
              maxLength={200}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "note-title-error" : undefined}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            {error ? (
              <span id="note-title-error" className="field__error" role="alert">
                {error}
              </span>
            ) : null}
          </div>
          <div className="note-form__row">
            <div className="field">
              <label className="field__label" htmlFor="note-type">
                Type
              </label>
              <select id="note-type" className="select" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as NoteType })}>
                {NOTE_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="note-course">
                Course <span className="field__hint">(optional)</span>
              </label>
              <select id="note-course" className="select" value={draft.courseId} onChange={(e) => setDraft({ ...draft, courseId: e.target.value })}>
                <option value="">No course</option>
                <CourseOptions />
              </select>
            </div>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="note-body">
              Note
            </label>
            <textarea id="note-body" className="textarea" rows={6} value={draft.body} maxLength={20000} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
          </div>
          <div className="cluster">
            <button type="submit" className="btn btn--sm">
              {editingId ? "Save changes" : "Save note"}
            </button>
            {editingId ? (
              <button type="button" className="btn btn--ghost btn--sm" onClick={cancelEdit}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div className="notes-list-wrap">
          <div className="notes-filters" role="search">
            <div className="field">
              <label className="field__label" htmlFor="note-search">
                Search notes
              </label>
              <input id="note-search" type="search" className="input" value={query} placeholder="Search titles and text" onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="note-filter-type">
                Type
              </label>
              <select id="note-filter-type" className="select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as NoteType | "")}>
                <option value="">All types</option>
                {NOTE_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="note-filter-course">
                Course
              </label>
              <select id="note-filter-course" className="select" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
                <option value="">All courses</option>
                <CourseOptions />
              </select>
            </div>
          </div>
          <p className="field__hint" aria-live="polite">
            Showing {filtered.length} of {data.notes.length} {data.notes.length === 1 ? "note" : "notes"}
          </p>

          {filtered.length === 0 ? (
            <EmptyState icon="🗒️" title={filtersActive && data.notes.length > 0 ? "No notes match" : "No notes yet"}>
              <p>
                {filtersActive && data.notes.length > 0
                  ? "Try a different search word or clear the filters."
                  : "Capture lecture notes, key concepts, reflections or project ideas with the form."}
              </p>
            </EmptyState>
          ) : (
            <ul className="notes-list">
              {filtered.map((note) => (
                <li key={note.id} className={`note-card note-card--${note.type}`}>
                  <article aria-labelledby={`note-${note.id}`}>
                    <div className="note-card__meta">
                      <span className="chip chip--sun">{typeLabel(note.type)}</span>
                      <CourseTag courseId={note.courseId} />
                    </div>
                    <h3 id={`note-${note.id}`} className="note-card__title">
                      {note.title}
                    </h3>
                    {note.body ? <p className="note-card__body">{note.body}</p> : null}
                    <p className="note-card__date">
                      Updated {new Date(note.updatedAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <div className="cluster">
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => startEdit(note)}>
                        Edit<span className="visually-hidden"> {note.title}</span>
                      </button>
                      <button type="button" className="btn btn--danger btn--sm" onClick={() => setToDelete(note)}>
                        Delete<span className="visually-hidden"> {note.title}</span>
                      </button>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this note?"
        message={toDelete ? `“${toDelete.title}” will be removed for good.` : ""}
        confirmLabel="Delete note"
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) dispatch({ type: "note/delete", id: toDelete.id });
          if (toDelete?.id === editingId) cancelEdit();
          setToDelete(null);
        }}
      />
    </section>
  );
}
