import { contactSchema } from "@/lib/schemas";
import type { ContactErrors, ContactField, ContactFormValues } from "@/lib/types";

/** Field order on screen, used to pick the first invalid field. */
export const CONTACT_FIELDS: ContactField[] = ["name", "email", "phone", "message"];

/** Validates the contact form. Returns one friendly message per invalid field (empty object = valid). */
export function validateContact(values: ContactFormValues): ContactErrors {
  const result = contactSchema.safeParse(values);
  if (result.success) return {};
  const errors: ContactErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as ContactField | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

export function firstInvalidField(errors: ContactErrors): ContactField | null {
  return CONTACT_FIELDS.find((f) => errors[f]) ?? null;
}

/** Builds a mailto: link with the message pre-filled, as an honest way to actually send it. */
export function buildMailto(to: string, values: ContactFormValues): string {
  const subject = `Hello from ${values.name.trim() || "your website"}`;
  const body = `${values.message.trim()}\n\n${values.name.trim()}\n${values.email.trim()}\n${values.phone.trim()}`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
