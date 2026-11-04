import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { Highlight } from "@/components/ui/Highlight";
import { Wave } from "@/components/ui/Wave";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Uchechukwu Onuoma about health data, Customer Success or collaboration.",
  alternates: { canonical: "/contact/" },
  openGraph: { url: "/contact/", title: "Contact Uchechukwu Onuoma" },
};

export default function ContactPage() {
  return (
    <>
      <section className="contact-hero" aria-labelledby="contact-title">
        <div className="container">
          <p className="eyebrow">Contact</p>
          <h1 id="contact-title">
            Let&rsquo;s <Highlight>talk</Highlight>
            <span className="display-italic">!</span>
          </h1>
          <p className="lead">
            Questions, collaborations, book recommendations or anime debates: I&rsquo;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="section band--white" aria-labelledby="contact-form-title">
        <Wave />
        <div className="container contact-layout">
          <aside className="contact-aside" aria-labelledby="contact-direct-title">
            <h2 id="contact-direct-title" className="contact-aside__title">
              Other ways to reach me
            </h2>
            <ul className="contact-aside__list">
              <li>
                <span className="contact-aside__label">Email</span>
                <a href={`mailto:${profile.email}`}>{profile.email}</a>
                {profile.emailIsPlaceholder ? <span className="chip chip--sun">Placeholder</span> : null}
              </li>
              {profile.socials.map((s) => (
                <li key={s.label}>
                  <span className="contact-aside__label">{s.label}</span>
                  <a href={s.href} target="_blank" rel="noopener noreferrer">
                    {s.href.replace(/^https?:\/\/(www\.)?/, "")}
                    <span className="visually-hidden"> (opens in a new tab)</span>
                  </a>
                  {s.placeholder ? <span className="chip chip--sun">Placeholder</span> : null}
                </li>
              ))}
            </ul>
            <p className="contact-aside__note">I usually reply within a couple of days, often with too many exclamation marks.</p>
          </aside>
          <div className="contact-main">
            <h2 id="contact-form-title">Send a message</h2>
            <p className="field__hint">All fields are required.</p>
            <ContactForm recipient={profile.email} endpoint={profile.contactFormEndpoint} />
          </div>
        </div>
      </section>
    </>
  );
}
