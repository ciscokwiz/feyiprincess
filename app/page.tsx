import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { IntroVideo } from "@/components/home/IntroVideo";
import { Highlight } from "@/components/ui/Highlight";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Wave } from "@/components/ui/Wave";
import { profile } from "@/data/profile";
import { cssVars } from "@/lib/style";

export const metadata: Metadata = {
  title: { absolute: "Uchechukwu Onuoma | Healthcare, Data & Customer Success" },
  description:
    "Hi, I'm Uchechukwu: a healthcare management graduate and Customer Success professional studying Data Science at Miva Open University, on my way to health data research.",
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

const pillars = [
  { title: "Healthcare", body: "A Healthcare Management degree and a Certified Nursing Assistant certificate. I know how care is really delivered.", tint: "rose" },
  { title: "Customer Success", body: "Six years of listening closely, solving problems and building relationships that last.", tint: "sun" },
  { title: "Data Science", body: "Now learning maths, statistics and computing at Miva, so I can turn questions into evidence.", tint: "teal" },
] as const;

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="home-hero" aria-labelledby="home-title">
        <span className="deco deco--ring deco--float home-hero__ring" aria-hidden="true" />
        <span className="deco deco--dot deco--float home-hero__dot" aria-hidden="true" />
        <div className="container home-hero__grid">
          <div className="home-hero__copy">
            <p className="eyebrow">Hello, and welcome in!</p>
            <h1 id="home-title" className="home-hero__title">
              Hi, I&rsquo;m Uchechukwu.{" "}
              <span className="display-light">Precious by name,</span> <Highlight>curious</Highlight>{" "}
              <span className="display-italic">by nature.</span>
            </h1>
            <p className="lead">
              Healthcare management graduate, Customer Success pro and Data Science student, building my way towards health
              data research. Usually with a book nearby and a laugh never far away.
            </p>
            <div className="cluster home-hero__ctas">
              <Link href="/projects/" className="btn">
                See my projects <span aria-hidden="true">→</span>
              </Link>
              <Link href="/contact/" className="btn btn--ghost">
                Say hello
              </Link>
            </div>
          </div>

          <div className="home-hero__media">
            <PhotoSlot photo={profile.photos.hero} shape="blob" priority sizes="(max-width: 860px) 90vw, 40vw" />
            <span className="sticker sticker--sun home-hero__sticker home-hero__sticker--a" style={cssVars({ "--tilt": "-6deg" })}>
              Always laughing
            </span>
            <span className="sticker sticker--teal home-hero__sticker home-hero__sticker--b" style={cssVars({ "--tilt": "5deg" })}>
              Health × Data
            </span>
            <Image className="home-hero__wave-hand" src="/illustrations/hello-wave.svg" alt="" width={110} height={110} aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* Currently strip */}
      <section className="band--burgundy home-currently" aria-labelledby="currently-title">
        <Wave />
        <div className="container">
          <h2 id="currently-title" className="visually-hidden">
            What I&rsquo;m doing right now
          </h2>
          <ul className="home-currently__list">
            {profile.currently.map((item) => (
              <li key={item.label} className="home-currently__item">
                <span className="home-currently__label">{item.label}</span>
                <span className="home-currently__value">{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Bio */}
      <section className="section band--white" aria-labelledby="bio-title">
        <div className="container home-bio">
          <div className="home-bio__aside reveal">
            <p className="eyebrow">My story so far</p>
            <h2 id="bio-title">
              Healthcare roots, <span className="display-italic">people</span> skills, data dreams.
            </h2>
            <blockquote className="home-bio__quote">
              Bridging the gap between healthcare and data-driven research, for better health outcomes.
            </blockquote>
          </div>
          <div className="home-bio__body reveal" style={cssVars({ "--reveal-delay": "120ms" })}>
            {profile.bio.map((paragraph, i) => (
              <p key={i} className={i === 0 ? "home-bio__first" : undefined}>
                {paragraph}
              </p>
            ))}
            <Link href="/about/" className="arrow-link">
              More about my education & goals <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="section band--ivory" aria-labelledby="pillars-title">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow">The recipe</p>
            <h2 id="pillars-title">
              Three ingredients, <Highlight>one</Highlight> goal.
            </h2>
            <p className="lead">Each part of my journey adds something different to the health data researcher I&rsquo;m becoming.</p>
          </div>
          <ol className="home-pillars">
            {pillars.map((p, i) => (
              <li key={p.title} className={`card card--lift home-pillar home-pillar--${p.tint} reveal`} style={cssVars({ "--reveal-delay": `${i * 110}ms` })}>
                <span className="home-pillar__num" aria-hidden="true">
                  0{i + 1}
                </span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </li>
            ))}
          </ol>
          <p className="home-pillars__equals reveal">
            <span aria-hidden="true">=</span> Health data research, done with heart.
          </p>
        </div>
      </section>

      {/* Intro video */}
      <section className="section band--rose" aria-labelledby="video-title">
        <Wave />
        <div className="container home-video">
          <div className="home-video__copy reveal">
            <p className="eyebrow">Press play</p>
            <h2 id="video-title">A quick hello</h2>
            <p>A quick hello from me, straight from my phone. Press play and say hi back!</p>
          </div>
          <div className="reveal" style={cssVars({ "--reveal-delay": "120ms" })}>
            <IntroVideo />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section--tight band--marigold home-cta" aria-labelledby="cta-title">
        <Wave />
        <div className="container home-cta__inner reveal">
          <h2 id="cta-title">Let&rsquo;s make something useful for health.</h2>
          <div className="cluster">
            <Link href="/projects/" className="btn">
              Browse case studies
            </Link>
            <Link href="/contact/" className="btn btn--light">
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
