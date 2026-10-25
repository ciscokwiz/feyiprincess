import type { ReactNode } from "react";

/** A highlighted word with a hand-drawn squiggle underneath. */
export function Highlight({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span className="highlight">
      {children}
      <svg className="squiggle" viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true" focusable="false" style={color ? { color } : undefined}>
        <path
          d="M3 14c18-9 34-9 50-1s32 8 48 0 32-9 48-1 30 8 48 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
