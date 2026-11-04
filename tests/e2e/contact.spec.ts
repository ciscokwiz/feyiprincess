import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

const FORM_ENDPOINT = "https://formsubmit.co/ajax/**";

/** Intercepts the mail service so tests never send real email. Returns the captured request bodies. */
async function mockMailService(page: Page, reply: { status: number; body: unknown } | "offline") {
  const requests: Record<string, string>[] = [];
  await page.route(FORM_ENDPOINT, async (route) => {
    requests.push(JSON.parse(route.request().postData() ?? "{}"));
    if (reply === "offline") return route.abort("internetdisconnected");
    await route.fulfill({ status: reply.status, contentType: "application/json", body: JSON.stringify(reply.body) });
  });
  return requests;
}

async function fillValid(page: Page) {
  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel(/^Email/).fill("ada@example.com");
  await page.getByLabel(/^Phone/).fill("08012345678");
  await page.getByLabel(/^Message/).fill("Loved your portfolio!");
}

test.beforeEach(async ({ page }) => {
  await page.goto("/contact/");
});

test("blank submit shows accessible errors, focuses the first invalid field and sends nothing", async ({ page }) => {
  const requests = await mockMailService(page, { status: 200, body: { success: "true" } });
  await page.getByRole("button", { name: /Send message/ }).click();
  await expect(page.getByLabel("Name")).toBeFocused();
  for (const name of ["name", "email", "phone", "message"]) {
    const field = page.locator(`#contact-${name}`);
    await expect(field).toHaveAttribute("aria-invalid", "true");
    expect((await field.getAttribute("aria-describedby")) ?? "").toMatch(/-error/);
  }
  await expect(page.getByRole("alert").filter({ hasText: "Please fix 4 fields" })).toBeVisible();
  expect(requests).toHaveLength(0);
});

test("rejects a bad email and a phone with non-digits, focusing the first bad one", async ({ page }) => {
  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel(/^Email/).fill("ada@nowhere");
  await page.getByLabel(/^Phone/).fill("0801 234 5678");
  await page.getByLabel(/^Message/).fill("Hi there");
  await page.getByRole("button", { name: /Send message/ }).click();
  await expect(page.getByLabel(/^Email/)).toBeFocused();
  await expect(page.getByText(/doesn't look quite right/)).toBeVisible();
  await expect(page.getByText(/Use digits only/)).toBeVisible();
  await expect(page.getByLabel("Name")).not.toHaveAttribute("aria-invalid", "true");
});

test("a valid message is sent to the mail service and the form clears", async ({ page }) => {
  const requests = await mockMailService(page, { status: 200, body: { success: "true", message: "The form was submitted successfully." } });
  await fillValid(page);
  await page.getByRole("button", { name: /Send message/ }).click();
  await expect(page.getByRole("status").filter({ hasText: "Your message has been sent" })).toBeVisible();
  expect(requests).toHaveLength(1);
  expect(requests[0]).toMatchObject({ name: "Ada Lovelace", email: "ada@example.com", phone: "08012345678", message: "Loved your portfolio!" });
  await expect(page.getByLabel("Name")).toHaveValue("");
});

test("a failed send says so, keeps the message and offers email instead", async ({ page }) => {
  await mockMailService(page, "offline");
  await fillValid(page);
  await page.getByRole("button", { name: /Send message/ }).click();
  const alert = page.getByRole("alert").filter({ hasText: "wasn’t sent" });
  await expect(alert).toBeVisible();
  await expect(alert.getByRole("link", { name: /Email me directly/ })).toHaveAttribute("href", /^mailto:uchechukwuonuoma@gmail\.com/);
  await expect(page.getByLabel(/^Message/)).toHaveValue("Loved your portfolio!");
  await expect(page.getByText(/has been sent/)).toHaveCount(0);
});

test("before the inbox is activated, the form says the message wasn't sent", async ({ page }) => {
  await mockMailService(page, { status: 200, body: { success: "false", message: "This form needs Activation. We've sent you an email." } });
  await fillValid(page);
  await page.getByRole("button", { name: /Send message/ }).click();
  await expect(page.getByRole("alert").filter({ hasText: "still being set up" })).toBeVisible();
});

test("errors clear live once fixed", async ({ page }) => {
  await page.getByRole("button", { name: /Send message/ }).click();
  await page.getByLabel("Name").fill("Ada");
  await expect(page.getByLabel("Name")).not.toHaveAttribute("aria-invalid", "true");
});
