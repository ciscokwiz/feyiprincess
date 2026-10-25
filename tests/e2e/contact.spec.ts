import { expect, test } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await page.goto("/contact/");
});

test("blank submit shows accessible errors and focuses the first invalid field", async ({ page }) => {
  await page.getByRole("button", { name: /Check & submit/ }).click();
  const name = page.getByLabel("Name");
  await expect(name).toBeFocused();
  for (const name of ["name", "email", "phone", "message"]) {
    const field = page.locator(`#contact-${name}`);
    await expect(field).toHaveAttribute("aria-invalid", "true");
    const describedBy = (await field.getAttribute("aria-describedby")) ?? "";
    expect(describedBy).toMatch(/-error/);
  }
  await expect(page.getByRole("alert").filter({ hasText: "Please fix 4 fields" })).toBeVisible();
  await expect(page.getByText(/not been sent/)).toHaveCount(0);
});

test("rejects a bad email and a phone with non-digits, focusing the first bad one", async ({ page }) => {
  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel(/^Email/).fill("ada@nowhere");
  await page.getByLabel(/^Phone/).fill("0801 234 5678");
  await page.getByLabel(/^Message/).fill("Hi there");
  await page.getByRole("button", { name: /Check & submit/ }).click();
  await expect(page.getByLabel(/^Email/)).toBeFocused();
  await expect(page.getByText(/doesn't look quite right/)).toBeVisible();
  await expect(page.getByText(/Use digits only/)).toBeVisible();
  await expect(page.getByLabel("Name")).not.toHaveAttribute("aria-invalid", "true");
});

test("a valid form is honest that nothing was sent and offers mailto", async ({ page }) => {
  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel(/^Email/).fill("ada@example.com");
  await page.getByLabel(/^Phone/).fill("08012345678");
  await page.getByLabel(/^Message/).fill("Loved your portfolio!");
  await page.getByRole("button", { name: /Check & submit/ }).click();
  const status = page.getByRole("status").filter({ hasText: "Everything looks good" });
  await expect(status).toContainText("not been sent");
  await expect(status.getByRole("link", { name: /email app/ })).toHaveAttribute("href", /^mailto:/);
  await expect(page.getByText(/Demo form/)).toBeVisible();
});

test("errors clear live once fixed", async ({ page }) => {
  await page.getByRole("button", { name: /Check & submit/ }).click();
  await page.getByLabel("Name").fill("Ada");
  await expect(page.getByLabel("Name")).not.toHaveAttribute("aria-invalid", "true");
});
