/**
 * Direct DOM manipulation helpers (COS 106: "DOM manipulation").
 * React renders most of the UI from state. These functions cover the places
 * where talking to the DOM directly is the right tool. Each is used by a named
 * component (see README → "Where the rubric requirements live").
 */

const reducedMotion = (): boolean =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Moves keyboard focus to an element, e.g. back to the task input after adding a task. */
export function focusElement(el: HTMLElement | null, options: { select?: boolean } = {}): void {
  if (!el) return;
  el.focus({ preventScroll: false });
  if (options.select && el instanceof HTMLInputElement) el.select();
}

/** Scrolls the first invalid field into view and focuses it (contact form). */
export function scrollToFirstInvalid(fields: (HTMLElement | null)[]): void {
  const first = fields.find((f) => f?.getAttribute("aria-invalid") === "true") ?? null;
  if (!first) return;
  first.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "center" });
  first.focus({ preventScroll: true });
}

/** Locks page scrolling behind the open mobile menu and makes the page behind it inert. */
export function setPageLocked(locked: boolean): void {
  document.body.classList.toggle("is-scroll-locked", locked);
  for (const id of ["main-content", "site-footer"]) {
    const region = document.getElementById(id);
    if (!region) continue;
    if (locked) region.setAttribute("inert", "");
    else region.removeAttribute("inert");
  }
}

/** Updates the browser tab title, e.g. "(3) Planner · Uchechukwu Onuoma". */
export function setDocumentTitle(base: string, outstanding: number): void {
  document.title = outstanding > 0 ? `(${outstanding}) ${base}` : base;
}

/** Returns focusable elements inside a container, for focus trapping. */
export function focusableWithin(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => el.offsetParent !== null || el === document.activeElement);
}

const CONFETTI_COLORS = ["#641f36", "#d6336c", "#f7a93b", "#f27059", "#2a9d8f", "#ffe6b8"];

/**
 * Celebration burst: creates confetti pieces as DOM nodes, animates them with
 * CSS (see .confetti-piece in globals.css) and removes them afterwards.
 * Skipped entirely when the visitor prefers reduced motion.
 */
export function launchConfetti(origin?: HTMLElement | null, pieces = 46): void {
  if (typeof document === "undefined" || reducedMotion()) return;
  const rect = origin?.getBoundingClientRect();
  const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 3;

  const layer = document.createElement("div");
  layer.className = "confetti-layer";
  layer.setAttribute("aria-hidden", "true");

  for (let i = 0; i < pieces; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    const angle = (Math.PI * 2 * i) / pieces + Math.random() * 0.4;
    const distance = 120 + Math.random() * 220;
    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length]!;
    piece.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    piece.style.setProperty("--dy", `${Math.sin(angle) * distance + 160}px`);
    piece.style.setProperty("--rot", `${Math.round(Math.random() * 720 - 360)}deg`);
    piece.style.animationDelay = `${Math.random() * 120}ms`;
    layer.appendChild(piece);
  }

  document.body.appendChild(layer);
  window.setTimeout(() => layer.remove(), 1800);
}

/** Saves text as a file download by creating a temporary link and clicking it. */
export function downloadTextFile(filename: string, text: string, type = "application/json"): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
