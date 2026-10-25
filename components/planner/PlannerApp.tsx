"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { CalendarView } from "@/components/planner/CalendarView";
import { Dashboard } from "@/components/planner/Dashboard";
import { NotesPanel } from "@/components/planner/NotesPanel";
import { PlannerProvider, usePlanner } from "@/components/planner/PlannerContext";
import { RemindersBanner } from "@/components/planner/Reminders";
import { SettingsPanel } from "@/components/planner/SettingsPanel";
import { Timetable } from "@/components/planner/Timetable";
import { TodayChecklist } from "@/components/planner/TodayChecklist";
import { todaysTasks } from "@/lib/dashboard";
import { setDocumentTitle } from "@/lib/dom";

const TABS = [
  { id: "today", label: "Today", icon: "✅" },
  { id: "timetable", label: "Timetable", icon: "🗓️" },
  { id: "calendar", label: "Calendar", icon: "📅" },
  { id: "notes", label: "Notes", icon: "🗒️" },
  { id: "progress", label: "Progress", icon: "📈" },
  { id: "settings", label: "Courses & data", icon: "⚙️" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const isTab = (value: string): value is TabId => TABS.some((t) => t.id === value);

const PAGE_TITLE = "Planner | Uchechukwu Onuoma";

export function PlannerApp() {
  return (
    <PlannerProvider
      fallback={
        <div className="planner-loading" role="status">
          <span className="planner-loading__dot" aria-hidden="true" />
          Loading your planner…
        </div>
      }
    >
      <PlannerShell />
    </PlannerProvider>
  );
}

function PlannerShell() {
  const { data, today, loadStatus, dropped, saveOk } = usePlanner();
  const [tab, setTab] = useState<TabId>("today");
  const [dismissed, setDismissed] = useState(false);
  const tabRefs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({});

  // Deep links like /planner/#calendar open that tab.
  useEffect(() => {
    const fromHash = () => {
      const hash = window.location.hash.slice(1);
      if (isTab(hash)) setTab(hash);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const select = useCallback((id: TabId, focus = false) => {
    setTab(id);
    window.history.replaceState(null, "", `#${id}`);
    if (focus) tabRefs.current[id]?.focus();
  }, []);

  // DOM: show the number of open tasks for today in the browser tab title.
  const outstanding = todaysTasks(data, today).filter((t) => !t.completed).length;
  useEffect(() => {
    setDocumentTitle(PAGE_TITLE, outstanding);
    return () => setDocumentTitle(PAGE_TITLE, 0);
  }, [outstanding]);

  // Arrow-key navigation between tabs (WAI-ARIA tabs pattern).
  const onTabKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = TABS.findIndex((t) => t.id === tab);
    const map: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: TABS.length - 1 };
    const next = map[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(TABS[(next + TABS.length) % TABS.length]!.id, true);
  };

  return (
    <div className="planner">
      {!dismissed && (loadStatus === "reset" || loadStatus === "recovered") ? (
        <div className="notice notice--danger planner-notice" role="alert">
          <span aria-hidden="true">⚠️</span>
          <div>
            <p>
              {loadStatus === "reset"
                ? "Your saved planner data couldn't be read, so the planner started fresh."
                : `Some saved planner records were damaged and were skipped (${dropped}). Everything else was kept.`}{" "}
              A copy of the original data was kept in this browser under the key <code>uo-planner:backup</code>.
            </p>
            <button type="button" className="btn btn--sm btn--light" onClick={() => setDismissed(true)}>
              Got it
            </button>
          </div>
        </div>
      ) : null}
      {!saveOk ? (
        <p className="notice notice--danger planner-notice" role="alert">
          This browser is blocking storage (private mode or full), so changes won&rsquo;t be saved after you close the tab. Use
          &ldquo;Export backup&rdquo; to keep a copy.
        </p>
      ) : null}

      <RemindersBanner onOpen={(t) => select(t)} />

      <div className="planner-tabs" role="tablist" aria-label="Planner sections" onKeyDown={onTabKey}>
        {TABS.map((t) => (
          <button
            key={t.id}
            ref={(el) => {
              tabRefs.current[t.id] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            className="planner-tabs__tab"
            onClick={() => select(t.id)}
          >
            <span aria-hidden="true">{t.icon}</span> {t.label}
            {t.id === "today" && outstanding > 0 ? <span className="planner-tabs__badge">{outstanding}</span> : null}
          </button>
        ))}
      </div>

      {TABS.map((t) => (
        <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={tab !== t.id} tabIndex={0} className="planner-tabpanel">
          {tab === t.id ? <Panel id={t.id} /> : null}
        </div>
      ))}
    </div>
  );
}

function Panel({ id }: { id: TabId }) {
  switch (id) {
    case "today":
      return <TodayChecklist />;
    case "timetable":
      return <Timetable />;
    case "calendar":
      return <CalendarView />;
    case "notes":
      return <NotesPanel />;
    case "progress":
      return <Dashboard />;
    case "settings":
      return <SettingsPanel />;
  }
}
