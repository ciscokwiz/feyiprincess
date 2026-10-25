import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./fixtures";

const PAGES = [
  { path: "/", title: /Uchechukwu Onuoma/, h1: /Uchechukwu/ },
  { path: "/about/", title: /About/, h1: /scenic/ },
  { path: "/projects/", title: /Projects/, h1: /case by case/ },
  { path: "/planner/", title: /Planner/, h1: /Study smart/ },
  { path: "/contact/", title: /Contact/, h1: /talk/ },
];

for (const p of PAGES) {
  test(`${p.path} renders with one h1, metadata, no overflow and no a11y violations`, async ({ page }) => {
    await page.goto(p.path);
    await expect(page).toHaveTitle(p.title);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText(p.h1);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator("main#main-content")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    // Let reveal animations settle so axe sees final colours.
    await page.evaluate(() => document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible")));
    await page.waitForTimeout(800);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}

test("navigation marks the active page", async ({ page, isMobile }) => {
  await page.goto("/about/");
  if (isMobile) await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "page");
});

test("skip link jumps to main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await skip.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
});

test("mobile menu opens, traps focus, closes on Escape and navigates", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Menu" });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await expect(page.getByRole("button", { name: "Close" })).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("body")).toHaveClass(/is-scroll-locked/);
  await expect(page.getByRole("link", { name: "Home", exact: true }).first()).toBeFocused();
  // Tab through every link and make sure focus never leaves the header.
  for (let i = 0; i < 8; i += 1) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest(".site-header")))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Menu" })).toBeFocused();
  await expect(page.locator("body")).not.toHaveClass(/is-scroll-locked/);
  await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Projects" }).click();
  await expect(page).toHaveURL(/\/projects\/$/);
  await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false");
});

test("home shows hero, currently strip, bio and a working intro video", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /See my projects/ })).toHaveAttribute("href", "/projects/");
  await expect(page.getByRole("main").getByRole("link", { name: "Say hello" })).toHaveAttribute("href", "/contact/");
  await expect(page.getByText("BSc Data Science at Miva (100 Level, 2nd Semester)")).toBeVisible();
  await expect(page.getByText(/healthcare management graduate and Customer Success professional with six years/)).toBeVisible();
  const video = page.locator("video");
  await expect(video).toHaveAttribute("controls", "");
  await expect(video.locator("track[kind=captions]")).toHaveCount(1);
  const ok = await page.request.get("/media/intro.webm");
  expect(ok.status()).toBe(200);
});

test("about page lists education, certificate, skills, hobbies and a semantic table", async ({ page }) => {
  await page.goto("/about/");
  for (const text of ["BSc Data Science", "First degree in Healthcare Management", "Certified Nursing Assistant"]) {
    await expect(page.getByRole("heading", { name: text })).toBeVisible();
  }
  await expect(page.getByText("REF-9TCAyfzA39VKeWFdAK")).toBeVisible();
  await expect(page.getByRole("link", { name: /View certificate/ })).toHaveCount(0); // no PDF yet → no broken link
  await expect(page.getByRole("heading", { name: /Learning now/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Basketball" })).toBeVisible();
  const table = page.locator("table.data-table");
  await expect(table.locator("caption")).toHaveCount(1);
  await expect(table.locator('thead th[scope="col"]')).toHaveCount(3);
  await expect(table.locator('tbody th[scope="row"]').first()).toBeVisible();
});

test("projects page lists all five case studies with safe external links", async ({ page }) => {
  await page.goto("/projects/");
  const links = page.getByRole("link", { name: /Read case study/ });
  await expect(links).toHaveCount(5);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await expect(link).toHaveAttribute("href", /^https:\/\/orange-fuchsia-9db\.notion\.site\//);
  }
  await expect(page.locator(".project-card--featured")).toContainText("Nova Health Clinics");
  await expect(page.getByText("Data & health research projects")).toBeVisible();
  await expect(page.locator(".photo-slot")).toHaveCount(5);
});
