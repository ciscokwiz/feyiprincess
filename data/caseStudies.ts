import type { Project } from "@/lib/types";

/**
 * Customer Success strategy case studies published on Notion.
 * Summaries are the subtitles from each Notion page. Covers live in
 * /public/images (framed screenshots of each page's header).
 */
export const caseStudies: Project[] = [
  {
    slug: "northroute-logistics",
    title: "NorthRoute Logistics: 90-Day Onboarding & Adoption Strategy",
    client: "NorthRoute Logistics",
    summary:
      "A 90-day plan to roll out new software at 14 sites across Nigeria and Cameroon for a customer still cautious after a previous software project failed, with an ₦85 million yearly contract up for renewal.",
    tags: ["Onboarding", "Adoption", "Multi-site rollout", "Logistics"],
    url: "https://orange-fuchsia-9db.notion.site/NorthRoute-Logistics-90-Day-Onboarding-Adoption-Strategy-32704718198083da9fdd818d83b6e66c",
    cover: { src: "/images/case-northroute.jpg", alt: "Header of the NorthRoute Logistics case study on Notion: title, summary and key account facts", label: "NorthRoute cover", width: 1200, height: 800 },
    featured: false,
    summarySource: "page",
  },
  {
    slug: "nova-health-clinics",
    title: "Nova Health Clinics: Customer Recovery & Retention Strategy",
    client: "Nova Health Clinics",
    summary:
      "Diagnosing adoption failure, rebuilding executive confidence, and creating a 90-day recovery strategy for a healthcare SaaS account 6 months from renewal. An anonymized case study.",
    tags: ["Healthcare", "Customer Recovery", "Retention", "Adoption"],
    url: "https://orange-fuchsia-9db.notion.site/Nova-Health-Clinics-Customer-Recovery-Retention-Strategy-38004718198080fea6a0eb620fc2e767",
    cover: { src: "/images/case-nova-health.jpg", alt: "Header of the Nova Health Clinics case study on Notion: title, summary and key account facts", label: "Nova Health cover", width: 1200, height: 800 },
    featured: true,
    featureNote: "Where healthcare meets Customer Success",
    summarySource: "page",
  },
  {
    slug: "hashworth-consulting",
    title: "Hashworth Consulting: Silent Churn Recovery & Expansion Strategy",
    client: "Hashworth Consulting",
    summary:
      "Diagnosing 18 months of account neglect, fixing it under a live competitive threat, and turning a forgotten Starter-plan account into a self-qualified upgrade, six weeks before renewal.",
    tags: ["Silent Churn", "Expansion", "Competitive Threat"],
    url: "https://orange-fuchsia-9db.notion.site/Hashworth-Consulting-Silent-Churn-Recovery-Expansion-Strategy-39f04718198080b9b5f9dc6a5bd23e9a",
    cover: { src: "/images/case-hashworth.jpg", alt: "Header of the Hashworth Consulting case study on Notion: title, summary and key account facts", label: "Hashworth cover", width: 1200, height: 800 },
    featured: false,
    summarySource: "page",
  },
  {
    slug: "savanna-agro",
    title: "Savanna Agro Ltd: Trust Recovery & Competitive Retention Strategy",
    client: "Savanna Agro Ltd",
    summary:
      "Diagnosing four recurring payroll failures, defending a ₦180M relationship the week a competitor’s opening got wider, and proving that a prioritization score is only as good as the judgment willing to override it.",
    tags: ["Trust Recovery", "Retention", "Prioritization"],
    url: "https://orange-fuchsia-9db.notion.site/Savanna-Agro-Ltd-Trust-Recovery-Competitive-Retention-Strategy-3e70471819808024acf8f03841eba71d",
    cover: { src: "/images/case-savanna-agro.jpg", alt: "Header of the Savanna Agro Ltd case study on Notion: title, summary and key account facts", label: "Savanna Agro cover", width: 1200, height: 800 },
    featured: false,
    summarySource: "page",
  },
  {
    slug: "bioseco",
    title: "Bioseco: From Renewal Risk to Portfolio-Wide Recovery Model",
    client: "Bioseco",
    summary:
      "Diagnosing why a technically flawless airport safety system still read as a renewal risk, rebuilding trust with an executive who’d gone quiet for four months, and correcting a measurement model that was making healthy accounts look sick across an entire portfolio.",
    tags: ["Renewal Risk", "Executive Engagement", "Health Scoring"],
    url: "https://orange-fuchsia-9db.notion.site/Bioseco-From-Renewal-Risk-to-Portfolio-Wide-Recovery-Model-3ed047181980800899c6c274b456505c",
    cover: { src: "/images/case-bioseco.jpg", alt: "Header of the Bioseco case study on Notion: title, summary and key account facts", label: "Bioseco cover", width: 1200, height: 800 },
    featured: false,
    summarySource: "page",
  },
];
