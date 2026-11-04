import type { ContactFormValues } from "@/lib/types";

export type SendResult =
  | { status: "sent" }
  /** FormSubmit holds messages until the inbox owner clicks the one-time activation link. */
  | { status: "needs-activation" }
  | { status: "failed"; reason: string };

const TIMEOUT_MS = 15_000;

/**
 * Sends a validated contact message to the FormSubmit AJAX endpoint, which emails it to the site owner.
 * Only reports "sent" when the service confirms it; every other outcome is a clear, non-throwing result.
 */
export async function sendContactMessage(
  endpoint: string,
  values: ContactFormValues,
  fetchImpl: typeof fetch = fetch,
): Promise<SendResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        message: values.message.trim(),
        _subject: `New message from ${values.name.trim()} (portfolio contact form)`,
        _template: "table",
        _captcha: "false",
      }),
      signal: controller.signal,
    });
    const body = (await response.json().catch(() => ({}))) as { success?: string | boolean; message?: string };
    const ok = body.success === true || body.success === "true";
    if (response.ok && ok) return { status: "sent" };
    if (/activat/i.test(body.message ?? "")) return { status: "needs-activation" };
    return { status: "failed", reason: body.message || `The mail service answered with status ${response.status}.` };
  } catch (error) {
    const aborted = error instanceof DOMException && error.name === "AbortError";
    return {
      status: "failed",
      reason: aborted ? "The mail service took too long to answer." : "Couldn't reach the mail service. Check your internet connection.",
    };
  } finally {
    clearTimeout(timer);
  }
}
