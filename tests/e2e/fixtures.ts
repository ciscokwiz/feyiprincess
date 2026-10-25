import { test as base, expect } from "@playwright/test";

/** Fails any test that logs a console error, page error or hydration warning. */
export const test = base.extend<{ consoleGuard: void }>({
  consoleGuard: [
    async ({ page }, use) => {
      const problems: string[] = [];
      page.on("console", (msg) => {
        const text = msg.text();
        if (msg.type() === "error" || /hydrat/i.test(text)) problems.push(`[${msg.type()}] ${text}`);
      });
      page.on("pageerror", (err) => problems.push(`[pageerror] ${err.message}`));
      await use();
      expect(problems, "console errors").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
