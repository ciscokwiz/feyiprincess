import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Poppins } from "next/font/google";
import type { ReactNode } from "react";
import { RevealObserver } from "@/components/ui/RevealObserver";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { profile } from "@/data/profile";
import "./globals.css";
// Page stylesheets are loaded once here (rather than per route) so prefetching never preloads unused CSS.
import "./home.css";
import "./about/about.css";
import "./projects/projects.css";
import "./planner/planner.css";
import "./contact/contact.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  axes: ["opsz", "wdth"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-poppins",
  display: "swap",
});

const description =
  "Uchechukwu Precious Onuoma: healthcare management graduate, Customer Success professional and BSc Data Science student at Miva Open University, working towards health data research.";

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: {
    default: "Uchechukwu Onuoma | Healthcare, Data & Customer Success",
    template: "%s | Uchechukwu Onuoma",
  },
  description,
  applicationName: "Uchechukwu Onuoma",
  authors: [{ name: profile.fullName }],
  openGraph: {
    type: "website",
    siteName: "Uchechukwu Onuoma",
    title: "Uchechukwu Onuoma | Healthcare, Data & Customer Success",
    description,
    locale: "en_GB",
    url: "/",
  },
  twitter: { card: "summary_large_image", title: "Uchechukwu Onuoma", description },
};

export const viewport: Viewport = {
  themeColor: "#641F36",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: the inline script below adds data-js to <html> before React hydrates.
    <html lang="en-GB" className={`${bricolage.variable} ${poppins.variable}`} suppressHydrationWarning>
      <head>
        {/* Marks that JS is running so scroll-reveal styles only apply when they can be undone. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.dataset.js='';" }} />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
        <RevealObserver />
      </body>
    </html>
  );
}
