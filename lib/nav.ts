export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about/", label: "About" },
  { href: "/projects/", label: "Projects" },
  { href: "/planner/", label: "Planner" },
  { href: "/contact/", label: "Contact" },
] as const;

/** True when `pathname` is the link's page (or a page beneath it). */
export function isActivePath(pathname: string, href: string): boolean {
  const clean = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);
  const path = clean(pathname);
  const target = clean(href);
  return target === "/" ? path === "/" : path === target || path.startsWith(`${target}/`);
}
