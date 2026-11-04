import { describe, expect, it } from "vitest";
import { sendContactMessage } from "@/lib/contactSend";

const values = { name: " Ada Lovelace ", email: "ada@example.com", phone: "08012345678", message: "Hello!" };
const endpoint = "https://formsubmit.co/ajax/owner@example.com";

const fakeFetch = (status: number, body: unknown, capture?: (init: RequestInit) => void): typeof fetch =>
  (async (_url: RequestInfo | URL, init?: RequestInit) => {
    capture?.(init ?? {});
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;

describe("sendContactMessage", () => {
  it("posts trimmed JSON fields and reports sent only when the service confirms", async () => {
    let sent: Record<string, string> = {};
    const result = await sendContactMessage(endpoint, values, fakeFetch(200, { success: "true" }, (init) => (sent = JSON.parse(String(init.body)))));
    expect(result).toEqual({ status: "sent" });
    expect(sent).toMatchObject({ name: "Ada Lovelace", email: "ada@example.com", phone: "08012345678", message: "Hello!" });
    expect(sent._subject).toContain("Ada Lovelace");
  });

  it("recognises the one-time activation step", async () => {
    const result = await sendContactMessage(endpoint, values, fakeFetch(200, { success: "false", message: "This form needs Activation." }));
    expect(result).toEqual({ status: "needs-activation" });
  });

  it("reports a failure when the service rejects the message", async () => {
    const result = await sendContactMessage(endpoint, values, fakeFetch(500, { success: "false", message: "Server error" }));
    expect(result).toEqual({ status: "failed", reason: "Server error" });
  });

  it("never claims success on a network error", async () => {
    const offline = (async () => {
      throw new TypeError("Failed to fetch");
    }) as typeof fetch;
    const result = await sendContactMessage(endpoint, values, offline);
    expect(result.status).toBe("failed");
  });
});
