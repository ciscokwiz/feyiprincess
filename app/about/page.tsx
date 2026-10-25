import Image from "next/image";
import type { Metadata } from "next";
import { Highlight } from "@/components/ui/Highlight";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Wave } from "@/components/ui/Wave";
import { profile } from "@/data/profile";
import { formatDate } from "@/lib/date";
import { publicFileExists } from "@/lib/publicAssets";
import { cssVars } from "@/lib/style";
import type { MilestoneStatus, Tint } from "@/lib/types";

export const metadata: Metadata = {
  title: "About",
  description:
    "Education, certifications, career aspirations, skills and hobbies of Uchechukwu Onuoma: healthcare management graduate, Certified Nursing Assistant and BSc Data Science student.",
  alternates: { canonical: "/about/" },
  openGraph: { url: "/about/", title: "About Uchechukwu Onuoma" },
};

const tintVar: Record<Tint, string> = {
  rose: "var(--c-rose-tint)",
  sun: "var(--c-marigold-tint)",
  teal: "var(--c-teal-tint)",
  coral: "var(--c-coral-tint)",
};

const statusClass: Record<MilestoneStatus, string> = {
  Completed: "chip--teal",
  Certified: "chip--teal",
  Awarded: "chip--teal",
  Ongoing: "chip--sun",
  "In progress": "chip--rose",
  Planned: "",
};

const softSkillIcons = ["💬", "🤝", "🧠", "🔎", "🌱", "🎤", "💛", "🧭"];

export default function AboutPage() {
  const [firstAspiration, ...otherAspirations] = profile.aspirations;

  return (
    <>
      {/* Intro */}
      <section className="about-hero" aria-labelledby="about-title">
        <div className="container about-hero__grid">
          <div>
            <p className="eyebrow">About me</p>
            <h1 id="about-title">
              Taking the <Highlight>scenic</Highlight> route <span className="display-italic">to health data.</span>
            </h1>
            <p className="lead">
              From healthcare management to six years of Customer Success, and now Data Science at Miva Open University.
              Every chapter is a piece of the same puzzle: helping people get better care through better evidence.
            </p>
            <ul className="cluster about-hero__stickers" aria-label="Quick facts">
              <li className="sticker sticker--rose" style={cssVars({ "--tilt": "-3deg" })}>
                100 Level · 2nd Semester
              </li>
              <li className="sticker sticker--sun" style={cssVars({ "--tilt": "2deg" })}>
                6 years in Customer Success
              </li>
              <li className="sticker sticker--teal" style={cssVars({ "--tilt": "-1deg" })}>
                Certified Nursing Assistant
              </li>
            </ul>
          </div>
          <div className="about-hero__media">
            <PhotoSlot photo={profile.photos.about} shape="arch" tint="var(--c-marigold-tint)" priority sizes="(max-width: 860px) 80vw, 36vw" />
          </div>
        </div>
      </section>

      {/* Education */}
      <section className="section band--white" aria-labelledby="education-title">
        <Wave />
        <div className="container about-two-col">
          <div className="section-head reveal">
            <p className="eyebrow">Education</p>
            <h2 id="education-title">Where I&rsquo;ve learned</h2>
            <p className="lead">A healthcare foundation, hands-on care training, and now the numbers side of things.</p>
          </div>
          <ol className="about-timeline">
            {profile.education.map((item, i) => (
              <li key={item.qualification} className="about-timeline__item reveal" style={cssVars({ "--reveal-delay": `${i * 100}ms` })}>
                <span className="about-timeline__dot" aria-hidden="true" />
                <div className="card about-timeline__card">
                  <span className="chip chip--rose">{item.status}</span>
                  <h3>{item.qualification}</h3>
                  {item.institution ? <p className="about-timeline__meta">{item.institution}</p> : null}
                  {item.detail ? <p className="about-timeline__meta">{item.detail}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Certifications */}
      <section className="section band--ivory" aria-labelledby="cert-title">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow">Certifications</p>
            <h2 id="cert-title">Proof of the (fun) hard work</h2>
          </div>
          {profile.certifications.map((cert) => {
            const hasPdf = publicFileExists(cert.certificatePath);
            return (
              <article key={cert.reference} className="about-cert reveal" aria-labelledby={`cert-${cert.reference}`}>
                <div className="about-cert__ribbon" aria-hidden="true">
                  <span>★</span>
                </div>
                <div className="about-cert__body">
                  <p className="about-cert__issuer">
                    {cert.issuer}
                    {cert.school ? ` · ${cert.school}` : ""}
                  </p>
                  <h3 id={`cert-${cert.reference}`}>{cert.title}</h3>
                  <dl className="about-cert__meta">
                    <div>
                      <dt>Awarded</dt>
                      <dd>
                        <time dateTime={cert.awarded}>{formatDate(cert.awarded, { day: "numeric", month: "long", year: "numeric" })}</time>
                      </dd>
                    </div>
                    <div>
                      <dt>Reference</dt>
                      <dd>
                        <code>{cert.reference}</code>
                      </dd>
                    </div>
                  </dl>
                  {hasPdf ? (
                    <a className="btn btn--sm" href={cert.certificatePath} target="_blank" rel="noopener noreferrer">
                      View certificate <span aria-hidden="true">↗</span>
                      <span className="visually-hidden"> (PDF, opens in a new tab)</span>
                    </a>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Aspirations */}
      <section className="section band--burgundy" aria-labelledby="aspirations-title">
        <Wave />
        <div className="container">
          <p className="eyebrow">Career aspirations</p>
          <h2 id="aspirations-title" className="visually-hidden">
            Career aspirations
          </h2>
          <blockquote className="about-aspire__quote reveal">
            <p>{firstAspiration}</p>
          </blockquote>
          <div className="about-aspire__cols">
            {otherAspirations.map((p, i) => (
              <p key={i} className="reveal" style={cssVars({ "--reveal-delay": `${i * 100}ms` })}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Technical skills */}
      <section className="section band--white" aria-labelledby="skills-title">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow">Technical skills</p>
            <h2 id="skills-title">
              My learning <Highlight>journey</Highlight>
            </h2>
            <p className="lead">
              I&rsquo;m early in my data science degree, so these are honest learning areas, not finished expertise. No made-up
              percentage bars here.
            </p>
          </div>
          <div className="about-journey">
            <div className="about-journey__stop reveal">
              <h3>
                <span className="about-journey__badge">Now</span> Learning now
              </h3>
              <ul className="about-journey__chips">
                {profile.skills.learningNow.map((s) => (
                  <li key={s} className="chip chip--rose">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <svg className="about-journey__path" viewBox="0 0 120 60" aria-hidden="true" focusable="false">
              <path d="M4 30c20-26 40-26 56 0s36 26 56 0" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="2 10" strokeLinecap="round" />
              <path d="M104 18l12 12-14 8" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="about-journey__stop about-journey__stop--next reveal" style={cssVars({ "--reveal-delay": "150ms" })}>
              <h3>
                <span className="about-journey__badge about-journey__badge--next">Next</span> Up next
              </h3>
              <ul className="about-journey__chips">
                {profile.skills.upNext.map((s) => (
                  <li key={s} className="chip about-journey__chip--next">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Non-technical skills */}
      <section className="section band--teal" aria-labelledby="soft-title">
        <Wave />
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow">Non-technical skills</p>
            <h2 id="soft-title">The people part, which I love</h2>
          </div>
          <ul className="about-soft">
            {profile.softSkills.map((skill, i) => (
              <li key={skill} className="about-soft__item reveal" style={cssVars({ "--reveal-delay": `${(i % 4) * 80}ms` })}>
                <span className="about-soft__icon" aria-hidden="true">
                  {softSkillIcons[i % softSkillIcons.length]}
                </span>
                {skill}
              </li>
            ))}
          </ul>
          <blockquote className="about-soft__note reveal">
            <p>{profile.softSkillsNote}</p>
          </blockquote>
        </div>
      </section>

      {/* Hobbies */}
      <section className="section band--rose" aria-labelledby="hobbies-title">
        <Wave />
        <div className="container about-hobbies">
          <div className="about-hobbies__intro reveal">
            <p className="eyebrow">Hobbies & interests</p>
            <h2 id="hobbies-title">
              Off the clock, <span className="display-italic">I&rsquo;m probably&hellip;</span>
            </h2>
            <PhotoSlot photo={profile.photos.candid} tint="var(--c-white)" className="about-hobbies__photo" sizes="(max-width: 860px) 90vw, 30vw" />
          </div>
          <ul className="about-hobbies__grid">
            {profile.hobbies.map((hobby, i) => (
              <li
                key={hobby.name}
                className="card card--lift about-hobby reveal"
                style={cssVars({ "--hobby-tint": tintVar[hobby.tint], "--hover-tilt": i % 2 ? "2deg" : "-2deg", "--reveal-delay": `${(i % 3) * 90}ms` })}
              >
                <Image className="about-hobby__art" src={hobby.illustration} alt={`Illustration for ${hobby.name.toLowerCase()}`} width={96} height={96} />
                <h3>{hobby.name}</h3>
                <p>{hobby.blurb}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Milestones table */}
      <section className="section band--white" aria-labelledby="milestones-title">
        <Wave />
        <div className="container container--narrow">
          <div className="section-head reveal">
            <p className="eyebrow">Milestones</p>
            <h2 id="milestones-title">Learning milestones</h2>
          </div>
          <div className="table-wrap reveal" role="region" aria-labelledby="milestones-title" tabIndex={0}>
            <table className="data-table">
              <caption>My learning and career milestones, and where each one stands today</caption>
              <thead>
                <tr>
                  <th scope="col">Milestone</th>
                  <th scope="col">Area</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {profile.milestones.map((m) => (
                  <tr key={m.milestone}>
                    <th scope="row">{m.milestone}</th>
                    <td>{m.area}</td>
                    <td>
                      <span className={`chip ${statusClass[m.status]}`}>{m.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
