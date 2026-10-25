"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState, type Dispatch, type ReactNode } from "react";
import { PRESET_CATEGORIES } from "@/data/categories";
import { toISODate } from "@/lib/date";
import { plannerReducer, type PlannerAction } from "@/lib/plannerReducer";
import { createDefaultPlannerData, loadPlannerData, savePlannerData, STORAGE_KEY, type LoadStatus } from "@/lib/plannerStorage";
import type { ActivityCategory, Course, ISODate, PlannerData } from "@/lib/types";

interface PlannerContextValue {
  data: PlannerData;
  dispatch: Dispatch<PlannerAction>;
  /** How saved data looked when the page loaded. */
  loadStatus: LoadStatus;
  dropped: number;
  /** False if the browser refused to save (private mode, storage full). */
  saveOk: boolean;
  now: Date;
  today: ISODate;
  categories: ActivityCategory[];
  courseById: Map<string, Course>;
  categoryById: Map<string, ActivityCategory>;
}

const PlannerContext = createContext<PlannerContextValue | null>(null);

type State = { data: PlannerData; hydrated: boolean };
type Action = PlannerAction | { type: "hydrate"; data: PlannerData };

function reducer(state: State, action: Action): State {
  if (action.type === "hydrate") return { data: action.data, hydrated: true };
  return { ...state, data: plannerReducer(state.data, action) };
}

const CLOCK_TICK_MS = 30_000;

/**
 * Holds planner data in a reducer and mirrors it to localStorage.
 * Hydration-safe: the server (and the first client render) shows a loading
 * state; saved data is read only after mount, so markup always matches.
 */
export function PlannerProvider({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const [state, dispatchRaw] = useReducer(reducer, undefined, () => ({ data: createDefaultPlannerData(), hydrated: false }));
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("empty");
  const [dropped, setDropped] = useState(0);
  const [saveOk, setSaveOk] = useState(true);
  const [now, setNow] = useState<Date | null>(null);
  const skipNextSave = useRef(true);

  // Load once on mount.
  useEffect(() => {
    const result = loadPlannerData();
    setLoadStatus(result.status);
    setDropped(result.dropped);
    dispatchRaw({ type: "hydrate", data: result.data });
    setNow(new Date());
  }, []);

  // Persist every change after hydration (the hydrate itself is not re-saved unless it was repaired).
  useEffect(() => {
    if (!state.hydrated) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      if (loadStatus === "ok" || loadStatus === "empty") return;
    }
    setSaveOk(savePlannerData(state.data));
  }, [state.data, state.hydrated, loadStatus]);

  // Keep "now" fresh so reminders and "today" roll over while the tab stays open.
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), CLOCK_TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  // Pick up changes made in another tab.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const result = loadPlannerData();
      skipNextSave.current = true;
      dispatchRaw({ type: "hydrate", data: result.data });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo<PlannerContextValue | null>(() => {
    if (!state.hydrated || !now) return null;
    const categories = [...PRESET_CATEGORIES, ...state.data.customCategories];
    return {
      data: state.data,
      dispatch: dispatchRaw as Dispatch<PlannerAction>,
      loadStatus,
      dropped,
      saveOk,
      now,
      today: toISODate(now),
      categories,
      courseById: new Map(state.data.courses.map((c) => [c.id, c])),
      categoryById: new Map(categories.map((c) => [c.id, c])),
    };
  }, [state, now, loadStatus, dropped, saveOk]);

  if (!value) return <>{fallback}</>;
  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner(): PlannerContextValue {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error("usePlanner must be used inside <PlannerProvider>");
  return ctx;
}
