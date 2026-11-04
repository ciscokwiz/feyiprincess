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

/**
 * Builds a WhatsApp click-to-chat link (wa.me) that opens a chat with `number`
 * and the visitor's message already typed in. `number` is in international
 * format; any spaces, dashes or + are stripped.
 */
export function buildWhatsAppLink(number: string, values: ContactFormValues): string {
  const text = [
    "Hello Uchechukwu! I'm reaching out from your website.",
    "",
    `Name: ${values.name.trim()}`,
    `Email: ${values.email.trim()}`,
    `Phone: ${values.phone.trim()}`,
    "",
    values.message.trim(),
  ].join("\n");
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}
