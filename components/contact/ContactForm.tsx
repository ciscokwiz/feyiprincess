"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { buildMailto, buildWhatsAppLink, CONTACT_FIELDS, validateContact } from "@/lib/contactValidation";
import { scrollToFirstInvalid } from "@/lib/dom";
import type { ContactErrors, ContactField, ContactFormValues } from "@/lib/types";

const EMPTY: ContactFormValues = { name: "", email: "", phone: "", message: "" };

const FIELD_META: Record<ContactField, { label: string; hint?: string; autoComplete: string; type?: string; inputMode?: "tel" | "email" }> = {
  name: { label: "Name", autoComplete: "name" },
  email: { label: "Email", autoComplete: "email", type: "email", inputMode: "email", hint: "So I can reply to you." },
  phone: { label: "Phone", autoComplete: "tel", type: "tel", inputMode: "tel", hint: "Include your country code, e.g. +2348012345678." },
  message: { label: "Message", autoComplete: "off" },
};

/**
 * Contact form (COS 106: forms + JavaScript form validation).
 * Validation runs in TypeScript on submit and then live per field. Errors are
 * announced via aria-describedby / aria-invalid, focus jumps to the first
 * invalid field, and submission is blocked until everything is valid.
 * A valid message opens WhatsApp with the text ready to send to her number.
 * The site can't see whether it was sent, so it never claims it was.
 */
export function ContactForm({ recipient, whatsappNumber }: { recipient: string; whatsappNumber: string }) {
  const [values, setValues] = useState<ContactFormValues>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [handedOff, setHandedOff] = useState<{ values: ContactFormValues; link: string; opened: boolean } | null>(null);
  const fieldRefs = useRef<Partial<Record<ContactField, HTMLInputElement | HTMLTextAreaElement | null>>>({});
  const resultRef = useRef<HTMLDivElement>(null);

  const onChange = (field: ContactField) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...values, [field]: event.target.value };
    setValues(next);
    setHandedOff(null);
    // After the first submit, keep each field's message in sync as she types.
    if (attempted) {
      const nextErrors = validateContact(next);
      setErrors((prev) => ({ ...prev, [field]: nextErrors[field] }));
    }
  };

  const onBlur = (field: ContactField) => () => {
    if (!attempted && values[field] === "") return;
    const nextErrors = validateContact(values);
    setErrors((prev) => ({ ...prev, [field]: nextErrors[field] }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempted(true);
    const nextErrors = validateContact(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setHandedOff(null);
      // Wait one frame so aria-invalid is in the DOM before we look for it.
      requestAnimationFrame(() => scrollToFirstInvalid(CONTACT_FIELDS.map((f) => fieldRefs.current[f] ?? null)));
      return;
    }

    const link = buildWhatsAppLink(whatsappNumber, values);
    // Opened straight from the submit click, so browsers allow it. If a popup blocker still says no, the button below works.
    // ("noopener" would make window.open always return null, so the opener link is cut by hand instead.)
    const tab = window.open(link, "_blank");
    if (tab) tab.opener = null;
    const opened = tab !== null;
    setHandedOff({ values, link, opened });
    requestAnimationFrame(() => resultRef.current?.focus());
  };

  const reset = () => {
    setValues(EMPTY);
    setErrors({});
    setAttempted(false);
    setHandedOff(null);
    fieldRefs.current.name?.focus();
  };

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <form className="contact-form" noValidate onSubmit={onSubmit} aria-describedby="contact-whatsapp-note">
      <p id="contact-whatsapp-note" className="notice notice--info contact-form__demo">
        <span aria-hidden="true">💬</span>
        <span>
          Your message is sent to me on <strong>WhatsApp</strong>. When you press the button, WhatsApp opens with your message
          ready. Just tap <strong>Send</strong> there.
        </span>
      </p>

      <div role="alert" aria-live="assertive" className={attempted && errorCount > 0 ? "notice notice--danger" : "visually-hidden"}>
        {attempted && errorCount > 0 ? (
          <p>
            Please fix {errorCount} {errorCount === 1 ? "field" : "fields"} below before submitting.
          </p>
        ) : null}
      </div>

      <div className="contact-form__grid">
        {CONTACT_FIELDS.map((field) => {
          const meta = FIELD_META[field];
          const error = errors[field];
          const id = `contact-${field}`;
          const describedBy = [meta.hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
          const common = {
            id,
            name: field,
            value: values[field],
            onChange: onChange(field),
            onBlur: onBlur(field),
            required: true,
            "aria-required": true,
            "aria-invalid": error ? true : undefined,
            "aria-describedby": describedBy,
            autoComplete: meta.autoComplete,
          } as const;
          return (
            <div key={field} className={`field contact-form__field contact-form__field--${field}`}>
              <label className="field__label" htmlFor={id}>
                {meta.label} <span aria-hidden="true">*</span>
              </label>
              {field === "message" ? (
                <textarea
                  {...common}
                  ref={(el) => {
                    fieldRefs.current[field] = el;
                  }}
                  className="textarea"
                  rows={6}
                />
              ) : (
                <input
                  {...common}
                  ref={(el) => {
                    fieldRefs.current[field] = el;
                  }}
                  className="input"
                  type={meta.type ?? "text"}
                  inputMode={meta.inputMode}
                />
              )}
              {meta.hint ? (
                <span id={`${id}-hint`} className="field__hint">
                  {meta.hint}
                </span>
              ) : null}
              {error ? (
                <span id={`${id}-error`} className="field__error">
                  {error}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="cluster contact-form__actions">
        <button type="submit" className="btn">
          Send on WhatsApp <span aria-hidden="true">→</span>
        </button>
        <button type="button" className="btn btn--ghost" onClick={reset}>
          Clear form
        </button>
      </div>

      {handedOff ? (
        <div ref={resultRef} tabIndex={-1} className="notice notice--success contact-form__success" role="status">
          <span aria-hidden="true">💬</span>
          <div>
            <p>
              <strong>Almost there, {handedOff.values.name.trim().split(" ")[0]}!</strong>{" "}
              {handedOff.opened
                ? "WhatsApp opened in a new tab with your message ready. Tap Send in WhatsApp to deliver it."
                : "Tap the button below to open WhatsApp with your message ready, then tap Send there."}
            </p>
            <p className="cluster">
              <a className="btn btn--sm" href={handedOff.link} target="_blank" rel="noopener noreferrer">
                {handedOff.opened ? "Open WhatsApp again" : "Open WhatsApp"}
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
              <a className="btn btn--ghost btn--sm" href={buildMailto(recipient, handedOff.values)}>
                Email me instead
              </a>
            </p>
          </div>
        </div>
      ) : null}
    </form>
  );
}
