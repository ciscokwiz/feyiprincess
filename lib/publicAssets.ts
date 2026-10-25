import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Server-only: checks at build time whether a file exists in /public.
 * Lets the site show a real image, video or certificate link when the owner
 * has added the file, and an honest placeholder (never a broken link) when not.
 */
export function publicFileExists(src: string): boolean {
  if (!src.startsWith("/")) return false;
  return existsSync(join(process.cwd(), "public", src));
}
