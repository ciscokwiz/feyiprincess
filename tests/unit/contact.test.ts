import { describe, expect, it } from "vitest";
import { buildWhatsAppLink, firstInvalidField, validateContact } from "@/lib/contactValidation";

const valid = { name: "Ada", email: "ada@example.com", phone: "08012345678", message: "Hello!" };

describe("validateContact", () => {
  it("accepts a complete, valid form", () => {
    expect(validateContact(valid)).toEqual({});
  });

  it("flags every empty field", () => {
    const errors = validateContact({ name: " ", email: "", phone: "", message: "" });
    expect(Object.keys(errors).sort()).toEqual(["email", "message", "name", "phone"]);
    expect(firstInvalidField(errors)).toBe("name");
  });

  it.each(["ada", "ada@", "ada@example", "ada @example.com", "@example.com"])("rejects bad email %s", (email) => {
    expect(validateContact({ ...valid, email }).email).toMatch(/doesn't look quite right/);
  });

  it.each(["08012345678", "+2348012345678", "+447911123456"])("accepts phone %s, with or without a country code", (phone) => {
    expect(validateContact({ ...valid, phone }).phone).toBeUndefined();
  });

  it.each(["0801 234 5678", "0801-234-5678", "abc1234567", "234+8012345678", "++2348012345678"])("rejects phone %s", (phone) => {
    expect(validateContact({ ...valid, phone }).phone).toMatch(/digits only/i);
  });

  it("enforces a sensible phone length, not counting the +", () => {
    expect(validateContact({ ...valid, phone: "+12345" }).phone).toMatch(/at least 7/);
    expect(validateContact({ ...valid, phone: "+" + "1".repeat(16) }).phone).toMatch(/at most 15/);
    expect(validateContact({ ...valid, phone: "+" + "1".repeat(15) }).phone).toBeUndefined();
  });

  it("builds a WhatsApp link with the whole message typed in", () => {
    const href = buildWhatsAppLink("+234 801 234 5678", { ...valid, phone: "+2348012345678" });
    expect(href.startsWith("https://wa.me/2348012345678?text=")).toBe(true);
    const text = decodeURIComponent(href.split("?text=")[1] ?? "");
    expect(text).toContain("Name: Ada");
    expect(text).toContain("Email: ada@example.com");
    expect(text).toContain("Phone: +2348012345678");
    expect(text.endsWith("Hello!")).toBe(true);
  });
});
