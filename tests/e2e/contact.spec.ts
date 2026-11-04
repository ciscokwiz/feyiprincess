import type { Page } from "@playwright/test";
import { profile } from "../../data/profile";
import { expect, test } from "./fixtures";

const waNumber = profile.whatsappNumber.replace(/\D/g, "");

/** Answers WhatsApp links locally so tests never leave the machine. */
async function stubWhatsApp(page: Page) {
  await page.context().route("https://wa.me/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<title>WhatsApp stub</title>" }));
}

async function fillValid(page: Page) {
  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel(/^Email/).fill("ada@example.com");
  await page.getByLabel(/^Phone/).fill("+2348012345678");
  await page.getByLabel(/^Message/).fill("Loved your portfolio!");
}

test.beforeEach(async ({ page }) => {
  await stubWhatsApp(page);
  await page.goto("/contact/");
});

test("blank submit shows accessible errors, focuses the first invalid field and opens nothing", async ({ page }) => {
  let popups = 0;
  page.on("popup", () => (popups += 1));
  await page.getByRole("button", { name: /Send on WhatsApp/ }).click();
  await expect(page.getByLabel("Name")).toBeFocused();
  for (const name of ["name", "email", "phone", "message"]) {
    const field = page.locator(`#contact-${name}`);
    await expect(field).toHaveAttribute("aria-invalid", "true");
    expect((await field.getAttribute("aria-describedby")) ?? "").toMatch(/-error/);
  }
  await expect(page.getByRole("alert").filter({ hasText: "Please fix 4 fields" })).toBeVisible();
  expect(popups).toBe(0);
});

test("rejects a bad email and a phone with spaces, focusing the first bad one", async ({ page }) => {
  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel(/^Email/).fill("ada@nowhere");
  await page.getByLabel(/^Phone/).fill("0801 234 5678");
  await page.getByLabel(/^Message/).fill("Hi there");
  await page.getByRole("button", { name: /Send on WhatsApp/ }).click();
  await expect(page.getByLabel(/^Email/)).toBeFocused();
  await expect(page.getByText(/doesn't look quite right/)).toBeVisible();
  await expect(page.getByText(/Use digits only/)).toBeVisible();
  await expect(page.getByLabel("Name")).not.toHaveAttribute("aria-invalid", "true");
});

test("accepts a phone number with a + country code", async ({ page }) => {
  await page.getByLabel(/^Phone/).fill("+447911123456");
  await page.getByRole("button", { name: /Send on WhatsApp/ }).click();
  await expect(page.locator("#contact-phone")).not.toHaveAttribute("aria-invalid", "true");
});

test("a valid message opens WhatsApp with the message ready to send", async ({ page }) => {
  await fillValid(page);
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: /Send on WhatsApp/ }).click();
  const popup = await popupPromise;
  const url = new URL(popup.url());
  expect(`${url.origin}${url.pathname}`).toBe(`https://wa.me/${waNumber}`);
  const text = url.searchParams.get("text") ?? "";
  expect(text).toContain("Name: Ada Lovelace");
  expect(text).toContain("Email: ada@example.com");
  expect(text).toContain("Phone: +2348012345678");
  expect(text).toContain("Loved your portfolio!");

  const status = page.getByRole("status").filter({ hasText: "Almost there, Ada" });
  await expect(status).toContainText("Tap Send in WhatsApp");
  // Compare decoded text: the browser may re-encode characters like ' in the popup's URL.
  const again = new URL((await status.getByRole("link", { name: /Open WhatsApp again/ }).getAttribute("href")) ?? "");
  expect(again.searchParams.get("text")).toBe(text);
  await expect(status.getByRole("link", { name: /Email me instead/ })).toHaveCount(0);
  await expect(page.getByText(/has been sent/)).toHaveCount(0);
});

test("if a popup blocker stops WhatsApp opening, a button opens it instead", async ({ page }) => {
  await page.evaluate(() => {
    window.open = () => null;
  });
  await fillValid(page);
  await page.getByRole("button", { name: /Send on WhatsApp/ }).click();
  const status = page.getByRole("status").filter({ hasText: "Almost there" });
  await expect(status).toContainText("Tap the button below");
  await expect(status.getByRole("link", { name: /^Open WhatsApp/ })).toHaveAttribute("href", new RegExp(`^https://wa\\.me/${waNumber}\\?text=`));
});

test("errors clear live once fixed", async ({ page }) => {
  await page.getByRole("button", { name: /Send on WhatsApp/ }).click();
  await page.getByLabel("Name").fill("Ada");
  await expect(page.getByLabel("Name")).not.toHaveAttribute("aria-invalid", "true");
});
