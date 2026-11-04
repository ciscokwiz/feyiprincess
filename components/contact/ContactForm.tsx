"use client";

import { useRef, useState, type ChangeEvent, type FormEvent, type Ref } from "react";
import { buildMailto, CONTACT_FIELDS, validateContact } from "@/lib/contactValidation";
import { sendContactMessage, type SendResult } from "@/lib/contactSend";
import { scrollToFirstInvalid } from "@/lib/dom";
import type { ContactErrors, ContactField, ContactFormValues } from "@/lib/types";

const EMPTY: ContactFormValues = { name: "", email: "", phone: "", message: "" };

const FIELD_META: Record<ContactField, { label: string; hint?: string; autoComplete: string; type?: string; inputMode?: "numeric" | "email" }> = {
  name: { label: "Name", autoComplete: "name" },
  email: { label: "Email", autoComplete: "email", type: "email", inputMode: "email", hint: "So I can reply to you." },
  phone: { label: "Phone", autoComplete: "tel", inputMode: "numeric", hint: "Digits only, e.g. 08012345678." },
  message: { label: "Message", autoComplete: "off" },
};

/**
 * Contact form (COS 106: forms + JavaScript form validation).
 * Validation runs in TypeScript on submit and then live per field. Errors are
 * announced via aria-describedby / aria-invalid, focus jumps to the first
 * invalid field, and submission is blocked until everything is valid.
 * Valid messages are posted to FormSubmit, which emails them to her inbox.
 * "Sent" is only shown once the service confirms delivery.
 */
export function ContactForm({ recipient, endpoint }: { recipient: string; endpoint: string }) {
  const [values, setValues] = useState<ContactFormValues>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ outcome: SendResult; values: ContactFormValues } | null>(null);
  const fieldRefs = useRef<Partial<Record<ContactField, HTMLInputElement | HTMLTextAreaElement | null>>>({});
  const honeypotRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const onChange = (field: ContactField) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...values, [field]: event.target.value };
    setValues(next);
    if (result?.outcome.status !== "failed") setResult(null);
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

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    setAttempted(true);
    const nextErrors = validateContact(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setResult(null);
      // Wait one frame so aria-invalid is in the DOM before we look for it.
      requestAnimationFrame(() => scrollToFirstInvalid(CONTACT_FIELDS.map((f) => fieldRefs.current[f] ?? null)));
      return;
    }

    const submitted = values;
    setSending(true);
    setResult(null);
    // A filled honeypot means a bot: quietly skip sending.
    const outcome: SendResult = honeypotRef.current?.value ? { status: "sent" } : await sendContactMessage(endpoint, submitted);
    setSending(false);
    setResult({ outcome, values: submitted });
    if (outcome.status === "sent") {
      setValues(EMPTY);
      setAttempted(false);
    }
    requestAnimationFrame(() => resultRef.current?.focus());
  };

  const reset = () => {
    setValues(EMPTY);
    setErrors({});
    setAttempted(false);
    setResult(null);
    fieldRefs.current.name?.focus();
  };

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <form className="contact-form" noValidate onSubmit={onSubmit} aria-describedby="contact-privacy-note" aria-busy={sending}>
      <p id="contact-privacy-note" className="notice notice--info contact-form__demo">
        <span aria-hidden="true">✉️</span>
        <span>
          Your message comes straight to my inbox. Your details are only used to reply to you.
        </span>
      </p>

      {/* Honeypot for spam bots: hidden from people and assistive tech. */}
      <div className="visually-hidden" aria-hidden="true">
        <label htmlFor="contact-website">Leave this empty</label>
        <input ref={honeypotRef} id="contact-website" name="_honey" type="text" tabIndex={-1} autoComplete="off" />
      </div>

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
                  pattern={field === "phone" ? "[0-9]*" : undefined}
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
        <button type="submit" className="btn" disabled={sending}>
          {sending ? "Sending…" : "Send message"} {sending ? null : <span aria-hidden="true">→</span>}
        </button>
        <button type="button" className="btn btn--ghost" onClick={reset} disabled={sending}>
          Clear form
        </button>
      </div>

      {result ? <SendStatus ref={resultRef} outcome={result.outcome} values={result.values} recipient={recipient} /> : null}
    </form>
  );
}

interface SendStatusProps {
  ref: Ref<HTMLDivElement>;
  outcome: SendResult;
  values: ContactFormValues;
  recipient: string;
}

function SendStatus({ ref, outcome, values, recipient }: SendStatusProps) {
  const firstName = values.name.trim().split(" ")[0];
  const mailto = (
    <a className="btn btn--sm" href={buildMailto(recipient, values)}>
      Email me directly instead
    </a>
  );

  if (outcome.status === "sent") {
    return (
      <div ref={ref} tabIndex={-1} className="notice notice--success contact-form__success" role="status">
        <span aria-hidden="true">✅</span>
        <p>
          <strong>Thanks, {firstName}! Your message has been sent.</strong> I&rsquo;ll get back to you at {values.email.trim()} soon.
        </p>
      </div>
    );
  }

  return (
    <div ref={ref} tabIndex={-1} className="notice notice--danger contact-form__success" role="alert">
      <span aria-hidden="true">⚠️</span>
      <div>
        <p>
          <strong>Your message wasn&rsquo;t sent.</strong>{" "}
          {outcome.status === "needs-activation"
            ? "The contact form is still being set up, so it can't deliver messages yet."
            : `${outcome.reason} Your message is still in the form, so you can try again.`}
        </p>
        <p>{mailto}</p>
      </div>
    </div>
  );
}
