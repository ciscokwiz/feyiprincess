import type { CSSProperties } from "react";

/** Typed way to pass CSS custom properties (e.g. --tilt) through the style prop. */
export const cssVars = (vars: Record<`--${string}`, string | number>): CSSProperties => vars as CSSProperties;
