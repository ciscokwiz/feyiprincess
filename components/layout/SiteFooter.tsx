import Link from "next/link";
import { profile } from "@/data/profile";
import { NAV_LINKS } from "@/lib/nav";
import { Wave } from "@/components/ui/Wave";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer id="site-footer" className="site-footer">
      <Wave />
      <div className="container">
        <div className="site-footer__grid">
          <div>
            <h2>Thanks for stopping by!</h2>
            <p className="site-footer__signoff">
              &ldquo;Now go drink some water, read something fun, and dance a little. I&rsquo;ll be here, probably laughing at
              something.&rdquo; <br />
              <span aria-hidden="true">~</span> Uche
            </p>
          </div>
          <div>
            <h3>Explore</h3>
            <ul>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Say hello</h3>
            <ul>
              <li>
                <a href={`mailto:${profile.email}`}>Email me</a>
                {profile.emailIsPlaceholder ? <span className="placeholder-note"> (placeholder address)</span> : null}
              </li>
              {profile.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer">
                    {s.label}
                    <span className="visually-hidden"> (opens in a new tab)</span>
                  </a>
                  {s.placeholder ? <span className="placeholder-note"> (placeholder link)</span> : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="site-footer__base">
          <p>
            © {year} {profile.fullName}
          </p>
          <p>COS 106 term project · Miva Open University</p>
        </div>
      </div>
    </footer>
  );
}
