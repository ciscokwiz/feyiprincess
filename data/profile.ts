import type { Profile } from "@/lib/types";

/**
 * Everything personal on the site lives here. Edit this file to update
 * education, skills, contact details or photo paths. No component changes needed.
 *
 * PHOTOS: drop files into /public/images/ using the filenames below. Until a
 * file exists, a branded placeholder is shown in exactly the same space.
 */
// WhatsApp number in international format, digits only: country code then number, no + or leading 0 (e.g. 2348012345678).
// The contact form opens WhatsApp with the visitor's message ready to send here, and it's listed under "Say hello".
const WHATSAPP_NUMBER = "2348115484067";

export const profile: Profile = {
  fullName: "Uchechukwu Precious Onuoma",
  preferredName: "Uchechukwu",
  monogram: "UO",
  role: "Data Science student · Customer Success professional · future health data researcher",

  email: "uchechukwuonuoma@gmail.com",
  emailIsPlaceholder: false,
  whatsappNumber: WHATSAPP_NUMBER,

  socials: [
    { label: "WhatsApp", href: `https://wa.me/${WHATSAPP_NUMBER}`, placeholder: false, display: "+234 811 548 4067" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/uchechukwu-csm/", placeholder: false },
    { label: "GitHub", href: "https://github.com/uchechukwu-csm", placeholder: false },
  ],

  // Used for Open Graph URLs. Set NEXT_PUBLIC_SITE_URL in Vercel, or edit here.
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://uchechukwu-onuoma.vercel.app",

  photos: {
    hero: {
      src: "/images/hero.jpg",
      alt: "Uchechukwu Onuoma in a pink blazer and glasses, smiling against a grey studio backdrop",
      label: "Hero portrait",
      width: 900,
      height: 1100,
    },
    about: {
      src: "/images/about.jpg",
      alt: "Uchechukwu smiling in a bright pink top, her long braids over one shoulder",
      label: "About-page portrait",
      width: 900,
      height: 1100,
    },
    candid: {
      src: "/images/candid.jpg",
      alt: "Uchechukwu in a red top and glasses, striking a playful pose",
      label: "Candid fun photo",
      width: 900,
      height: 1125,
    },
  },

  introVideo: {
    src: "/media/intro.webm",
    type: "video/webm",
    captions: "/media/intro-captions.vtt",
    poster: {
      src: "/media/intro-poster.png",
      alt: "Poster frame for Uchechukwu's intro video",
      label: "Intro video poster frame",
      width: 1280,
      height: 720,
    },
    note: "This is a short animated title card for now. My recorded intro video is coming soon.",
  },

  bio: [
    "Uchechukwu is a healthcare management graduate and Customer Success professional with six years of experience, currently pursuing a BSc in Data Science at Miva Open University. With a long-term goal of becoming a health data researcher, she is focused on combining her healthcare background, customer success expertise, and growing data science knowledge to contribute to evidence-based research and improved health outcomes.",
    "Her background in healthcare provides an understanding of healthcare systems and the environments in which care is delivered, while her experience in customer-facing roles has strengthened her ability to understand user needs, solve problems, communicate effectively, and build lasting relationships. She is developing her expertise in data science to explore how data analytics, pattern recognition, and research methodologies can generate meaningful insights, support healthcare research, and inform better decision-making.",
    "Beyond her professional and academic pursuits, she is an avid reader, anime enthusiast, and lover of dance and cooking. She enjoys exploring new ideas through books, learning new skills, and engaging with her interests in sports, particularly basketball.",
    "Through her journey across healthcare management, customer success, and data science, she is building a multidisciplinary foundation to bridge the gap between healthcare and data-driven research, with the broader goal of contributing to more informed decisions and better health outcomes.",
  ],

  currently: [
    { label: "Studying", value: "BSc Data Science at Miva (100 Level, 2nd Semester)" },
    { label: "Experience", value: "6 years in Customer Success" },
    { label: "Aiming for", value: "Health data research" },
  ],

  education: [
    {
      qualification: "BSc Data Science",
      institution: "Miva Open University",
      status: "In progress",
      detail: "Currently 100 Level, Second Semester",
    },
    {
      qualification: "First degree in Healthcare Management",
      institution: null,
      status: "Graduate",
    },
    {
      qualification: "Certified Nursing Assistant",
      institution: null,
      status: "Certified",
    },
  ],

  certifications: [
    {
      title: "Diploma in Product Marketing",
      issuer: "AltSchool Africa",
      school: "School of Product",
      awarded: "2026-07-10",
      reference: "REF-9TCAyfzA39VKeWFdAK",
      certificatePath: "/certificates/altschool-product-marketing.pdf",
    },
  ],

  aspirations: [
    "My long-term goal is to become a health data researcher, combining my background in healthcare management with data science to contribute to meaningful research and evidence-based healthcare decisions.",
    "I am particularly interested in using data to investigate health trends, identify patterns in health outcomes, evaluate healthcare services, and generate insights that can improve the quality of care and people's lives.",
    "As I progress through my data science degree, I aim to build a strong foundation in mathematics, statistics, programming, data analysis, and research methodologies. I also intend to develop practical projects that apply these skills to real-world healthcare challenges and strengthen my ability to translate data into actionable insights.",
    "Beyond health data research, I remain open to further education in related fields, including kinesiology and sports science, as well as postgraduate study in supply chain management, as my interests and professional goals continue to evolve.",
  ],

  skills: {
    learningNow: [
      "Foundational Mathematics and Statistics",
      "Problem-Solving and Computational Thinking",
      "Introductory Computer Science",
      "Web Technologies",
      "Data Science Fundamentals",
      "Scientific Reasoning and Research-Oriented Learning",
    ],
    upNext: [
      "Programming languages",
      "Data analysis tools",
      "Data visualisation",
      "Research methodologies",
      "Applying it all to healthcare problems",
    ],
  },

  softSkills: [
    "Communication and Interpersonal Skills",
    "Relationship Building and Stakeholder Engagement",
    "Critical Thinking and Problem-Solving",
    "Research and Information Gathering",
    "Leadership and Team Collaboration",
    "Public Speaking and Presentation",
    "Customer Service and Relationship Management",
    "Adaptability and Solution-Oriented Thinking",
  ],
  softSkillsNote:
    "My 6 years of experience in customer-facing roles have strengthened my ability to understand customer needs, manage relationships, communicate effectively, and resolve challenges. These experiences have also developed my interpersonal, analytical, and problem-solving abilities, which I aim to apply as I transition into data science and pursue a career in health data research.",

  hobbies: [
    { name: "Reading", blurb: "Always halfway through a book, and usually with the next one already lined up.", illustration: "/illustrations/reading.svg", tint: "rose" },
    { name: "Anime", blurb: "Big stories, bigger feelings. A good arc is my favourite way to unwind.", illustration: "/illustrations/anime.svg", tint: "sun" },
    { name: "Cooking", blurb: "Trying new recipes and feeding the people I love.", illustration: "/illustrations/cooking.svg", tint: "coral" },
    { name: "Dance", blurb: "If the music is on, I'm moving. Dancing is pure joy for me.", illustration: "/illustrations/dance.svg", tint: "teal" },
    { name: "Basketball", blurb: "My favourite sport to watch, talk about and play.", illustration: "/illustrations/basketball.svg", tint: "sun" },
    { name: "Continuous Learning", blurb: "New skills, new ideas and new rabbit holes. I love being a beginner.", illustration: "/illustrations/learning.svg", tint: "rose" },
  ],

  milestones: [
    { milestone: "Healthcare Management degree", area: "Healthcare", status: "Completed" },
    { milestone: "Certified Nursing Assistant", area: "Healthcare", status: "Certified" },
    { milestone: "Six years in Customer Success roles", area: "Career", status: "Ongoing" },
    { milestone: "Diploma in Product Marketing (AltSchool Africa)", area: "Product & marketing", status: "Awarded" },
    { milestone: "BSc Data Science: 100 Level, Second Semester", area: "Data science", status: "In progress" },
    { milestone: "COS 106 term project: this website", area: "Web technologies", status: "In progress" },
    { milestone: "First health data analysis project", area: "Health data research", status: "Planned" },
  ],
};
