"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { buildMailto, CONTACT_FIELDS, validateContact } from "@/lib/contactValidation";
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
 * There is no backend, so nothing is transmitted.
 */
export function ContactForm({ recipient }: { recipient: string }) {
  const [values, setValues] = useState<ContactFormValues>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [validated, setValidated] = useState<ContactFormValues | null>(null);
  const fieldRefs = useRef<Partial<Record<ContactField, HTMLInputElement | HTMLTextAreaElement | null>>>({});
  const successRef = useRef<HTMLDivElement>(null);

  const onChange = (field: ContactField) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...values, [field]: event.target.value };
    setValues(next);
    setValidated(null);
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
      setValidated(null);
      // Wait one frame so aria-invalid is in the DOM before we look for it.
      requestAnimationFrame(() => scrollToFirstInvalid(CONTACT_FIELDS.map((f) => fieldRefs.current[f] ?? null)));
      return;
    }

    setValidated(values);
    requestAnimationFrame(() => successRef.current?.focus());
  };

  const reset = () => {
    setValues(EMPTY);
    setErrors({});
    setAttempted(false);
    setValidated(null);
    fieldRefs.current.name?.focus();
  };

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <form className="contact-form" noValidate onSubmit={onSubmit} aria-describedby="contact-demo-note">
      <p id="contact-demo-note" className="notice notice--info contact-form__demo">
        <span aria-hidden="true">ℹ️</span>
        <span>
          <strong>Demo form.</strong> It checks your details in the browser but does not send anything yet. To actually
          reach me, use the email link after you submit.
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
        <button type="submit" className="btn">
          Check & submit <span aria-hidden="true">→</span>
        </button>
        <button type="button" className="btn btn--ghost" onClick={reset}>
          Clear form
        </button>
      </div>

      {validated ? (
        <div ref={successRef} tabIndex={-1} className="notice notice--success contact-form__success" role="status">
          <span aria-hidden="true">✅</span>
          <div>
            <p>
              <strong>Thanks, {validated.name.trim().split(" ")[0]}! Everything looks good.</strong> Your message passed
              validation, but it has <strong>not been sent</strong>, because this demo form has no backend yet.
            </p>
            <p>
              <a className="btn btn--sm" href={buildMailto(recipient, validated)}>
                Open it in your email app instead
              </a>
            </p>
          </div>
        </div>
      ) : null}
    </form>
  );
}
