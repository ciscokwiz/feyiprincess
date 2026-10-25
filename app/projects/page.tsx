import Link from "next/link";
import type { Metadata } from "next";
import { Highlight } from "@/components/ui/Highlight";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Wave } from "@/components/ui/Wave";
import { caseStudies } from "@/data/caseStudies";
import { cssVars } from "@/lib/style";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Five Customer Success strategy case studies by Uchechukwu Onuoma, covering onboarding, adoption, churn recovery, retention, expansion and renewal risk, with data and health research projects to come.",
  alternates: { canonical: "/projects/" },
  openGraph: { url: "/projects/", title: "Projects by Uchechukwu Onuoma" },
};

const coverTints = ["var(--c-marigold-tint)", "var(--c-rose-tint)", "var(--c-teal-tint)", "var(--c-coral-tint)", "var(--c-marigold-tint)"];
const tilts = ["-1.2deg", "0.8deg", "1.4deg", "-0.8deg", "1deg"];

export default function ProjectsPage() {
  return (
    <>
      <section className="projects-hero" aria-labelledby="projects-title">
        <span className="deco deco--dot deco--float projects-hero__dot" aria-hidden="true" />
        <div className="container">
          <p className="eyebrow">Projects</p>
          <h1 id="projects-title">
            Customer Success, <Highlight>case</Highlight> <span className="display-italic">by case.</span>
          </h1>
          <p className="lead">
            My portfolio is Customer Success-focused today: five strategy case studies I&rsquo;ve written and published on
            Notion. Data analysis and health research projects are on the way as my degree grows.
          </p>
        </div>
      </section>

      <section className="section band--white projects-list" aria-labelledby="case-studies-title">
        <Wave />
        <div className="container">
          <h2 id="case-studies-title" className="visually-hidden">
            Case studies
          </h2>
          <ul className="projects-grid">
            {caseStudies.map((study, i) => (
              <li
                key={study.slug}
                className={`project-card reveal${study.featured ? " project-card--featured" : ""}`}
                style={cssVars({ "--hover-tilt": tilts[i % tilts.length]!, "--reveal-delay": `${(i % 3) * 90}ms` })}
              >
                <article className="project-card__inner" aria-labelledby={`study-${study.slug}`}>
                  <div className="project-card__cover">
                    <PhotoSlot photo={study.cover} tint={coverTints[i % coverTints.length]} sizes="(max-width: 860px) 100vw, 50vw" />
                    <span className="project-card__num" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="project-card__body">
                    {study.featureNote ? (
                      <p className="sticker sticker--sun project-card__feature" style={cssVars({ "--tilt": "-3deg" })}>
                        <span aria-hidden="true">✚</span> {study.featureNote}
                      </p>
                    ) : null}
                    <p className="project-card__client">{study.client}</p>
                    <h3 id={`study-${study.slug}`} className="project-card__title">
                      {study.title}
                    </h3>
                    <p className="project-card__summary">{study.summary}</p>
                    <ul className="project-card__tags" aria-label="Topics">
                      {study.tags.map((tag) => (
                        <li key={tag} className={`chip ${tag === "Healthcare" ? "chip--teal" : "chip--rose"}`}>
                          {tag}
                        </li>
                      ))}
                    </ul>
                    <a className="arrow-link project-card__link" href={study.url} target="_blank" rel="noopener noreferrer">
                      Read case study <span aria-hidden="true">↗</span>
                      <span className="visually-hidden">: {study.title} (opens Notion in a new tab)</span>
                    </a>
                  </div>
                </article>
              </li>
            ))}
            <li className="project-card project-card--soon reveal">
              <div className="project-card__inner">
                <div className="project-card__body">
                  <p className="sticker sticker--teal" style={cssVars({ "--tilt": "2deg" })}>
                    Coming soon
                  </p>
                  <h3 className="project-card__title">Data & health research projects</h3>
                  <p className="project-card__summary">
                    As I work through statistics, programming and research methods at Miva, I&rsquo;ll share projects that
                    apply data to real healthcare questions. Watch this space!
                  </p>
                  <Link href="/contact/" className="arrow-link">
                    Want to collaborate? Say hello <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
