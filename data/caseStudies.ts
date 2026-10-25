import type { Project } from "@/lib/types";

/**
 * Customer Success strategy case studies published on Notion.
 *
 * NOTE(owner): the Notion pages could not be read when this site was built
 * (the build environment blocked notion.site), so each summary only restates
 * what the title says. No metrics, clients or results have been invented.
 * Replace each `summary` with your own one or two sentences and set
 * `summarySource` to "page". If a study is a hypothetical or practice scenario,
 * say so in the summary.
 */
export const caseStudies: Project[] = [
  {
    slug: "northroute-logistics",
    title: "NorthRoute Logistics: 90-Day Onboarding & Adoption Strategy",
    client: "NorthRoute Logistics",
    summary:
      "A Customer Success strategy setting out a 90-day plan for onboarding NorthRoute Logistics and driving product adoption.",
    tags: ["Onboarding", "Adoption", "90-day plan", "Logistics"],
    url: "https://orange-fuchsia-9db.notion.site/NorthRoute-Logistics-90-Day-Onboarding-Adoption-Strategy-32704718198083da9fdd818d83b6e66c",
    cover: { src: "/images/case-northroute.jpg", alt: "Cover image for the NorthRoute Logistics case study", label: "NorthRoute cover", width: 1200, height: 800 },
    featured: false,
    summarySource: "title",
  },
  {
    slug: "nova-health-clinics",
    title: "Nova Health Clinics: Customer Recovery & Retention Strategy",
    client: "Nova Health Clinics",
    summary:
      "A Customer Success strategy for recovering the Nova Health Clinics relationship and retaining the account, set in a healthcare context.",
    tags: ["Healthcare", "Customer Recovery", "Retention"],
    url: "https://orange-fuchsia-9db.notion.site/Nova-Health-Clinics-Customer-Recovery-Retention-Strategy-38004718198080fea6a0eb620fc2e767",
    cover: { src: "/images/case-nova-health.jpg", alt: "Cover image for the Nova Health Clinics case study", label: "Nova Health cover", width: 1200, height: 800 },
    featured: true,
    featureNote: "Where healthcare meets Customer Success",
    summarySource: "title",
  },
  {
    slug: "hashworth-consulting",
    title: "Hashworth Consulting: Silent Churn Recovery & Expansion Strategy",
    client: "Hashworth Consulting",
    summary:
      "A Customer Success strategy for spotting and recovering silent churn at Hashworth Consulting, then turning the account towards expansion.",
    tags: ["Churn Recovery", "Silent Churn", "Expansion"],
    url: "https://orange-fuchsia-9db.notion.site/Hashworth-Consulting-Silent-Churn-Recovery-Expansion-Strategy-39f04718198080b9b5f9dc6a5bd23e9a",
    cover: { src: "/images/case-hashworth.jpg", alt: "Cover image for the Hashworth Consulting case study", label: "Hashworth cover", width: 1200, height: 800 },
    featured: false,
    summarySource: "title",
  },
  {
    slug: "savanna-agro",
    title: "Savanna Agro Ltd: Trust Recovery & Competitive Retention Strategy",
    client: "Savanna Agro Ltd",
    summary:
      "A Customer Success strategy for rebuilding trust with Savanna Agro Ltd and retaining the account against competitive pressure.",
    tags: ["Trust Recovery", "Retention", "Competitive"],
    url: "https://orange-fuchsia-9db.notion.site/Savanna-Agro-Ltd-Trust-Recovery-Competitive-Retention-Strategy-3e70471819808024acf8f03841eba71d",
    cover: { src: "/images/case-savanna-agro.jpg", alt: "Cover image for the Savanna Agro Ltd case study", label: "Savanna Agro cover", width: 1200, height: 800 },
    featured: false,
    summarySource: "title",
  },
  {
    slug: "bioseco",
    title: "Bioseco: From Renewal Risk to Portfolio-Wide Recovery Model",
    client: "Bioseco",
    summary:
      "A Customer Success strategy that starts with a renewal at risk for Bioseco and builds it into a recovery model that can be applied across a portfolio.",
    tags: ["Renewal Risk", "Recovery", "Portfolio"],
    url: "https://orange-fuchsia-9db.notion.site/Bioseco-From-Renewal-Risk-to-Portfolio-Wide-Recovery-Model-3ed047181980800899c6c274b456505c",
    cover: { src: "/images/case-bioseco.jpg", alt: "Cover image for the Bioseco case study", label: "Bioseco cover", width: 1200, height: 800 },
    featured: false,
    summarySource: "title",
  },
];
