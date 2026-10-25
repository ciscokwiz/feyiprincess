"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePlanner } from "@/components/planner/PlannerContext";
import { describeDue, dueReminders, notificationSupport, REMINDER_WINDOW_HOURS, type NotificationSupport, type Reminder } from "@/lib/reminders";

/**
 * In-app reminders: a banner listing overdue items and items due in the next
 * 24 hours. Re-checked on load and every 30 seconds while the tab is open
 * (the planner clock ticks in PlannerProvider). Items that become due as time
 * passes also pop a toast, and, if she opted in, a browser notification.
 */
export function RemindersBanner({ onOpen }: { onOpen: (tab: "today" | "calendar") => void }) {
  const { data, dispatch, now } = usePlanner();
  const reminders = useMemo(() => dueReminders(data, now), [data, now]);
  const [collapsed, setCollapsed] = useState(false);
  const [toasts, setToasts] = useState<Reminder[]>([]);
  const prevNow = useRef<Date | null>(null);

  // Toast for reminders that appear because time moved on (not for items she just added or edited).
  useEffect(() => {
    const before = prevNow.current;
    prevNow.current = now;
    if (!before || before.getTime() === now.getTime()) return;
    const earlier = new Set(dueReminders(data, before).map((r) => r.key));
    const fresh = reminders.filter((r) => !earlier.has(r.key));
    if (fresh.length > 0) setToasts((t) => [...t, ...fresh].slice(-3));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the clock ticks
  }, [now]);

  // Optional browser notification, once per reminder.
  useEffect(() => {
    if (!data.settings.notifications || notificationSupport() !== "granted") return;
    const unsent = reminders.filter((r) => !data.notifiedReminders.includes(r.key));
    if (unsent.length === 0) return;
    for (const r of unsent.slice(0, 3)) {
      try {
        new Notification(`${r.item.typeLabel}: ${r.item.title}`, { body: `Planner reminder: ${describeDue(r, now)}`, tag: r.key, icon: "/icon.svg" });
      } catch {
        /* Some browsers (e.g. Android Chrome) only allow notifications from a service worker. */
      }
    }
    dispatch({ type: "reminders/notified", keys: unsent.map((r) => r.key) });
  }, [reminders, data.settings.notifications, data.notifiedReminders, dispatch, now]);

  useEffect(() => {
    if (toasts.length === 0) return;
    const id = window.setTimeout(() => setToasts((t) => t.slice(1)), 8000);
    return () => window.clearTimeout(id);
  }, [toasts]);

  const overdue = reminders.filter((r) => r.status === "overdue").length;

  return (
    <>
      {reminders.length > 0 ? (
        <section className={`reminders${overdue ? " reminders--overdue" : ""}`} aria-labelledby="reminders-title">
          <div className="reminders__head">
            <h2 id="reminders-title" className="reminders__title">
              <span aria-hidden="true">⏰</span> {reminders.length} {reminders.length === 1 ? "reminder" : "reminders"}
              {overdue ? <span className="chip chip--coral">{overdue} overdue</span> : null}
            </h2>
            <button type="button" className="btn btn--ghost btn--sm" aria-expanded={!collapsed} aria-controls="reminders-list" onClick={() => setCollapsed((c) => !c)}>
              {collapsed ? "Show" : "Hide"}
            </button>
          </div>
          <ul id="reminders-list" className="reminders__list" hidden={collapsed}>
            {reminders.map((r) => (
              <li key={r.key} className={`reminders__item reminders__item--${r.status}`}>
                <span className="reminders__what">
                  <strong>{r.item.title}</strong> <span className="chip">{r.item.typeLabel}</span>
                </span>
                <span className="reminders__when">{describeDue(r, now)}</span>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => onOpen(r.item.source === "task" ? "today" : "calendar")}>
                  Open
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="toasts" aria-live="polite" role="status">
        {toasts.map((t) => (
          <p key={t.key} className="toast">
            <span aria-hidden="true">🔔</span> <strong>{t.item.title}</strong> is {describeDue(t, now)}.
          </p>
        ))}
      </div>
    </>
  );
}

/** Opt-in browser notifications. Permission is only requested when she clicks the button. */
export function NotificationSettings() {
  const { data, dispatch } = usePlanner();
  const [support, setSupport] = useState<NotificationSupport>("unsupported");

  useEffect(() => setSupport(notificationSupport()), []);

  const enable = async () => {
    if (support === "unsupported") return;
    const result = await Notification.requestPermission();
    setSupport(result);
    dispatch({ type: "settings/update", changes: { notifications: result === "granted" } });
  };

  const on = data.settings.notifications && support === "granted";

  return (
    <article className="settings-card card" aria-labelledby="notify-title">
      <h3 id="notify-title">Reminders & notifications</h3>
      <p className="field__hint">
        The planner always shows in-app reminders for anything overdue or due within {REMINDER_WINDOW_HOURS} hours. Browser
        notifications are optional. <strong>They only work while this site is open in a browser tab</strong>, because there is
        no server or push service behind it.
      </p>
      {support === "unsupported" ? (
        <p className="notice">This browser doesn&rsquo;t support notifications, so you&rsquo;ll see in-app reminders only.</p>
      ) : support === "denied" ? (
        <p className="notice">
          Notifications are blocked for this site. To turn them on, allow notifications in your browser&rsquo;s site settings, then
          reload this page.
        </p>
      ) : on ? (
        <div className="cluster">
          <span className="chip chip--teal">Browser notifications are on</span>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => dispatch({ type: "settings/update", changes: { notifications: false } })}>
            Turn off
          </button>
        </div>
      ) : (
        <button type="button" className="btn btn--sm" onClick={enable}>
          {support === "granted" ? "Turn on browser notifications" : "Enable browser notifications"}
        </button>
      )}
    </article>
  );
}
