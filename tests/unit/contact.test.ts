import { describe, expect, it } from "vitest";
import { buildMailto, firstInvalidField, validateContact } from "@/lib/contactValidation";

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

  it.each(["0801 234 5678", "+2348012345678", "0801-234-5678", "abc1234567"])("rejects non-digit phone %s", (phone) => {
    expect(validateContact({ ...valid, phone }).phone).toMatch(/digits only/i);
  });

  it("enforces a sensible phone length", () => {
    expect(validateContact({ ...valid, phone: "12345" }).phone).toMatch(/at least 7/);
    expect(validateContact({ ...valid, phone: "1".repeat(16) }).phone).toMatch(/at most 15/);
  });

  it("builds an encoded mailto link", () => {
    const href = buildMailto("me@example.com", valid);
    expect(href.startsWith("mailto:me@example.com?subject=Hello%20from%20Ada")).toBe(true);
    expect(href).toContain(encodeURIComponent("Hello!"));
  });
});
