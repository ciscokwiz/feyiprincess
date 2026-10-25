import { readFile } from "node:fs/promises";
import { expect, test } from "./fixtures";
import type { Page } from "@playwright/test";

const openTab = (page: Page, name: RegExp) => page.getByRole("tab", { name }).click();

test.beforeEach(async ({ page }) => {
  await page.goto("/planner/");
  await expect(page.getByRole("tab", { name: /Today/ })).toBeVisible();
});

test("checklist: validate, add, complete, edit, delete, undo and persist", async ({ page }) => {
  await expect(page.getByText("Nothing on today's list yet")).toBeVisible();

  // Blank titles are rejected.
  await page.getByRole("button", { name: /Add task/ }).click();
  await expect(page.getByRole("alert").filter({ hasText: "can't be blank" })).toBeVisible();
  await expect(page.getByLabel("New task")).toBeFocused();

  // Add two tasks; focus returns to the title input each time.
  await page.getByLabel("New task").fill("Read COS 106 week 6");
  await page.locator("#task-course").selectOption({ label: "COS 106: Introduction to Web Technologies" });
  await page.getByRole("button", { name: /Add task/ }).click();
  await expect(page.getByLabel("New task")).toBeFocused();
  await expect(page.getByLabel("New task")).toHaveValue("");
  await page.getByLabel("New task").fill("Practice quiz questions");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("remaining-count")).toHaveText("2");
  await expect(page).toHaveTitle(/^\(2\) Planner/);

  // Complete one, then uncomplete it.
  await page.getByRole("checkbox", { name: "Read COS 106 week 6" }).check();
  await expect(page.getByTestId("done-count")).toHaveText("1");
  await page.getByRole("checkbox", { name: "Read COS 106 week 6" }).uncheck();
  await expect(page.getByTestId("done-count")).toHaveText("0");

  // Edit.
  await page.getByRole("button", { name: "Edit Practice quiz questions" }).click();
  await page.getByLabel("Task title").fill("Practice quiz questions (set B)");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.locator(".task-item__title", { hasText: "Practice quiz questions (set B)" })).toBeVisible();

  // Delete and undo.
  await page.getByRole("button", { name: "Delete Practice quiz questions (set B)" }).click();
  await expect(page.getByTestId("remaining-count")).toHaveText("1");
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByTestId("remaining-count")).toHaveText("2");

  // Finishing everything celebrates.
  await page.getByRole("checkbox", { name: "Read COS 106 week 6" }).check();
  await page.getByRole("checkbox", { name: "Practice quiz questions (set B)" }).check();
  await expect(page.getByText("All done for today!")).toBeVisible();
  await expect(page).toHaveTitle(/^Planner/);

  // Survives a reload.
  await page.reload();
  await expect(page.getByTestId("done-count")).toHaveText("2");
  await expect(page.getByRole("checkbox", { name: "Read COS 106 week 6" })).toBeChecked();
});

test("custom category can be created from the task form", async ({ page }) => {
  await page.getByLabel("Category").selectOption("__new");
  await page.getByLabel("New category name").fill("Hackathon");
  await page.getByLabel("New task").fill("Sketch idea");
  await page.getByRole("button", { name: /Add task/ }).click();
  await expect(page.locator(".task-item").filter({ hasText: "Sketch idea" })).toContainText("Hackathon");
});

test("corrupt saved data shows an honest notice and keeps a backup", async ({ page }) => {
  await page.evaluate(() => localStorage.setItem("uo-planner:v1", "{definitely not json"));
  await page.reload();
  await expect(page.getByRole("alert").filter({ hasText: "couldn't be read" })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("uo-planner:backup"))).toBe("{definitely not json");
  await page.getByRole("button", { name: "Got it" }).click();
  await expect(page.getByLabel("New task")).toBeVisible();
});

test("partially invalid data is recovered record by record", async ({ page }) => {
  await page.evaluate(() => {
    const good = { id: "t1", title: "Kept task", categoryId: "daily-study", courseId: null, dueDate: null, dueTime: null, completed: false, completedAt: null, createdAt: new Date().toISOString() };
    localStorage.setItem("uo-planner:v1", JSON.stringify({ version: 1, tasks: [good, { id: "t2" }], courses: [] }));
  });
  await page.reload();
  await expect(page.getByRole("alert").filter({ hasText: "skipped (1)" })).toBeVisible();
  await expect(page.locator(".task-item__title", { hasText: "Kept task" })).toBeVisible();
});

test("timetable: weekly totals, mark done, one-week edit and reset", async ({ page, isMobile }) => {
  await openTab(page, /Timetable/);
  await expect(page).toHaveURL(/#timetable$/);
  // The phone view opens on today's day; pick Monday so the weekday total is checked on any day of the week.
  if (isMobile) await page.locator(".tt-mobile__day").first().click();
  await expect(page.locator(".day-total").filter({ visible: true }).first()).toContainText("3.5 h");

  // Mark the first visible study block done.
  const done = page.getByRole("checkbox", { name: /Mark done/ }).filter({ visible: true }).first();
  await done.check();
  await expect(page.locator(".day-total").filter({ visible: true }).first()).toContainText("1 h done");

  // Edit an early block for this week only.
  await page.getByRole("button", { name: /5:30 AM: COS 106/ }).filter({ visible: true }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Activity type").selectOption("rest");
  await dialog.getByLabel("Label").fill("Sleep in after a late shift");
  await dialog.getByRole("button", { name: "Save block" }).click();
  await expect(page.getByRole("button", { name: /Sleep in after a late shift/ }).filter({ visible: true })).toBeVisible();
  await expect(page.getByText("This week only").filter({ visible: true }).first()).toBeVisible();

  // Next week is unaffected.
  await page.getByRole("button", { name: /Next week/ }).click();
  await expect(page.getByRole("button", { name: /Sleep in after a late shift/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Back to this week" }).click();

  // Work blocks are locked until unlocked.
  await page.getByRole("button", { name: /9:00 AM: .*Work/ }).filter({ visible: true }).first().click();
  await expect(page.getByRole("dialog")).toContainText("locked");
  await page.getByRole("button", { name: "Keep it locked" }).click();

  // Reset the week.
  await page.getByRole("button", { name: "Reset this week to default" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Reset week" }).click();
  await expect(page.getByRole("button", { name: /Sleep in after a late shift/ })).toHaveCount(0);
});

test("calendar, upcoming deadlines and dashboard all update from recorded data", async ({ page }) => {
  await openTab(page, /Progress/);
  await expect(page.getByText("No tasks for today")).toBeVisible();
  await expect(page.getByText("No assignments logged")).toBeVisible();
  await expect(page.getByText("Your chart starts with your first tick")).toBeVisible();

  await openTab(page, /Calendar/);
  await page.getByRole("button", { name: "Add event" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Give the event a title" })).toBeVisible();
  await page.locator("#event-title").fill("COS 106 term project due");
  await page.locator("#event-type").selectOption("assignment");
  await page.locator("#event-course").selectOption({ label: "COS 106: Introduction to Web Technologies" });
  await page.getByRole("button", { name: "Add event" }).click();
  await expect(page.locator(".cal-day-panel")).toContainText("COS 106 term project due");
  await expect(page.locator(".cal-upcoming")).toContainText("COS 106 term project due");
  // The reminder banner picks it up (due today).
  await expect(page.getByRole("region", { name: /reminder/ })).toContainText("COS 106 term project due");

  // Next month and back.
  await page.getByRole("button", { name: "Next month" }).click();
  await page.getByRole("button", { name: "Today", exact: true }).click();
  await expect(page.locator(".cal-day-panel")).toContainText("COS 106 term project due");

  await openTab(page, /Progress/);
  await expect(page.locator(".dash-card").filter({ hasText: "Assignments" })).toContainText("0 done · 1 outstanding");

  await openTab(page, /Calendar/);
  await page.getByRole("checkbox", { name: "COS 106 term project due" }).check();
  await openTab(page, /Progress/);
  await expect(page.locator(".dash-card").filter({ hasText: "Assignments" })).toContainText("1 done · 0 outstanding");
});

test("dashboard chart appears after completing a task", async ({ page }) => {
  await page.getByLabel("New task").fill("Finish reading");
  await page.getByRole("button", { name: /Add task/ }).click();
  await page.getByRole("checkbox", { name: "Finish reading" }).check();
  await openTab(page, /Progress/);
  await expect(page.getByTestId("dash-daily-percent")).toHaveText("100%");
  await expect(page.getByRole("img", { name: /Stacked columns/ })).toBeVisible();
});

test("notes: create, search, filter, edit and delete", async ({ page }) => {
  await openTab(page, /Notes/);
  await expect(page.getByText("No notes yet")).toBeVisible();
  await page.locator("#note-title").fill("HTML semantics");
  await page.locator("#note-type").selectOption("concept");
  await page.locator("#note-body").fill("Use header, nav, main, footer.");
  await page.getByRole("button", { name: "Save note" }).click();
  await page.locator("#note-title").fill("Project idea: clinic wait times");
  await page.locator("#note-type").selectOption("idea");
  await page.getByRole("button", { name: "Save note" }).click();
  await expect(page.locator(".note-card")).toHaveCount(2);

  await page.getByLabel("Search notes").fill("clinic");
  await expect(page.locator(".note-card")).toHaveCount(1);
  await page.getByLabel("Search notes").fill("");
  await page.locator("#note-filter-type").selectOption("concept");
  await expect(page.locator(".note-card")).toHaveCount(1);
  await page.locator("#note-filter-type").selectOption("");

  await page.getByRole("button", { name: "Edit HTML semantics" }).click();
  await page.locator("#note-title").fill("HTML5 semantics");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("heading", { name: "HTML5 semantics" })).toBeVisible();

  await page.getByRole("button", { name: "Delete HTML5 semantics" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete note" }).click();
  await expect(page.locator(".note-card")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".note-card")).toHaveCount(1);
});

test("courses can be renamed, added and removed; export and clear work", async ({ page }) => {
  await openTab(page, /Courses & data/);
  await expect(page.locator(".course-row")).toHaveCount(8);
  await page.locator("#code-course-2").fill("MTH 102");
  await page.locator("#title-course-2").fill("Elementary Mathematics II");
  await page.locator('input[name="color-course-2"][value="#1f6f66"]').check();
  await expect(page.locator('input[name="color-course-2"][value="#1f6f66"]')).toBeChecked();
  await page.locator("#new-course-code").fill("GST 102");
  await page.getByRole("button", { name: "Add course" }).click();
  await expect(page.locator(".course-row")).toHaveCount(9);
  await page.getByRole("button", { name: "Remove GST 102" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Remove course" }).click();
  await expect(page.locator(".course-row")).toHaveCount(8);

  // The renamed course shows up in other tabs.
  await openTab(page, /Today/);
  await expect(page.locator("#task-course option", { hasText: "MTH 102: Elementary Mathematics II" })).toHaveCount(1);

  await openTab(page, /Courses & data/);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Export backup/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^uchechukwu-planner-\d{4}-\d{2}-\d{2}\.json$/);
  const json = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(json.version).toBe(1);
  expect(json.courses[1].code).toBe("MTH 102");

  await page.getByRole("button", { name: "Clear all data" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Yes, clear everything" }).click();
  await expect(page.locator("#code-course-2")).toHaveValue("Course 2");

  // Import the backup again.
  await page.locator('input[type="file"]').setInputFiles({ name: "backup.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(json)) });
  await page.getByRole("dialog").getByRole("button", { name: "Import and replace" }).click();
  await expect(page.locator("#code-course-2")).toHaveValue("MTH 102");
});

test("notifications are opt-in and explain their limits", async ({ page }) => {
  await openTab(page, /Courses & data/);
  await expect(page.getByText(/only work while this site is open in a browser tab/)).toBeVisible();
});

test("tabs support arrow-key navigation", async ({ page }) => {
  await page.getByRole("tab", { name: /Today/ }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: /Timetable/ })).toBeFocused();
  await expect(page.getByRole("tab", { name: /Timetable/ })).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: /Courses & data/ })).toBeFocused();
});
