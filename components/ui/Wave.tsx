/** Decorative wavy edge that sits on top of a coloured band. Inherits the band colour via currentColor. */
export function Wave({ className = "" }: { className?: string }) {
  return (
    <svg className={`wave-top ${className}`} viewBox="0 0 1440 28" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M0 28V14C120 2 240 2 360 12s240 18 360 6 240-20 360-10 240 18 360 8v18H0Z"
      />
    </svg>
  );
}
