# Uchechukwu Onuoma: Portfolio & Academic Planner

Personal portfolio and working study planner for **Uchechukwu Precious Onuoma**: healthcare management graduate, Customer
Success professional and BSc Data Science student at Miva Open University.

It is also her **COS 106 – Introduction to Web Technologies term project** (Miva Open University, 20 marks). The
[rubric map](#cos-106-where-the-rubric-requirements-live) below shows a grader exactly where each requirement lives.

> **Submitting for COS 106?** You need to submit **both** the **live URL** (e.g. `https://your-site.vercel.app`) **and**
> the **GitHub repository link**. See [Deploy](#deploy-github--vercel).

---

## Pages

| Route | What's there |
|---|---|
| `/` Home | Hero with photo slot and welcome headline, "currently" strip, full bio, three-pillar story, intro **video** with captions, CTAs to Projects and Contact |
| `/about/` | Education timeline, AltSchool Africa certificate card, career aspirations, "learning journey" skills (no fake percentages), non-technical skills, hobbies with illustrations, **Learning milestones table** |
| `/projects/` | Five Customer Success case studies (Notion links open in a new tab), Nova Health Clinics highlighted, "coming soon" card |
| `/planner/` | Working academic planner: daily checklist, weekly timetable, calendar, notes, reminders, progress dashboard, courses & data tools |
| `/contact/` | Validated contact form (demo, honest that nothing is sent), mailto fallback, social placeholders |

## Tech

- **Next.js 15 (App Router) + React 19 + strict TypeScript.** No `.js` source files and no `any`.
- **Static export** (`output: "export"`): `npm run build` writes plain HTML/CSS/JS to `out/`. No server or backend.
- **Hand-written external CSS**: `app/globals.css` (design tokens, nav, buttons, animations) plus one stylesheet per page.
  No Tailwind.
- **Zod** validates the contact form and every piece of planner data read back from `localStorage`.
- Fonts: **Bricolage Grotesque** (headings) and **Poppins** (body) via `next/font/google`, so there is no layout shift.
- Tests: **Vitest** (logic) and **Playwright + axe-core** (end to end, accessibility, desktop and 360 px mobile).

## Getting started

Requires Node.js 20 or newer.

```bash
npm install        # install dependencies
npm run dev        # development server at http://localhost:3000
npm run build      # static export into out/
npm start          # preview the exported site at http://127.0.0.1:3000
```

Quality checks:

```bash
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint (next/core-web-vitals + typescript), zero warnings allowed
npm test           # Vitest unit tests
npm run test:e2e   # Playwright end-to-end tests (run `npm run build` first)
npm run check      # all of the above, in order
```

Playwright needs a Chromium. If none is installed, run `npx playwright install chromium`, or point
`CHROMIUM_PATH` at an existing browser binary.

## Updating content (no component changes needed)

All content lives in typed data files:

| File | What to edit |
|---|---|
| `data/profile.ts` | Name, bio, email, socials, photo paths and alt text, education, certificates, aspirations, skills, hobbies, milestones |
| `data/caseStudies.ts` | Case study titles, summaries, tags, Notion URLs, cover images, which one is featured |
| `data/courses.ts` | Default course list (8 courses; only COS 106 is confirmed) and the 8 course colours |
| `data/timetable.ts` | Time slots and the default weekly schedule |
| `data/categories.ts` | Preset activity categories, calendar event types, note types |

**To-dos for the owner**

- [ ] `data/caseStudies.ts`: the Notion pages could not be fetched while building (the build environment's network blocked `notion.site`). Each summary currently restates only its title, with nothing invented. Replace them with your own one or two sentences, and say so if a study is a hypothetical or practice scenario.
- [ ] Rename the seven placeholder courses, either in `data/courses.ts` or in the planner under **Courses & data**.
- [ ] Add the five case-study cover photos and the certificate PDF (see below).

## Photo slots

Drop files into `public/` using these names. Until a file exists, an on-brand placeholder with the same aspect ratio is
shown, so adding the real photo causes no layout shift. The check runs at build time, so **rebuild/redeploy after adding
files**. To use different filenames, change the paths in `data/profile.ts` or `data/caseStudies.ts`.

| Slot | File | Recommended size | Where |
|---|---|---|---|
| Hero portrait ✅ | `public/images/hero.jpg` | 900 × 1100 (portrait) | Home hero (blob mask) |
| About portrait ✅ | `public/images/about.jpg` | 900 × 1100 (portrait) | About hero (arch mask) |
| Candid fun photo ✅ | `public/images/candid.jpg` | 900 × 1125 (portrait, 4:5) | About → Hobbies ("Off the clock") |
| NorthRoute cover | `public/images/case-northroute.jpg` | 1200 × 800 | Projects |
| Nova Health cover | `public/images/case-nova-health.jpg` | 1200 × 800 | Projects |
| Hashworth cover | `public/images/case-hashworth.jpg` | 1200 × 800 | Projects |
| Savanna Agro cover | `public/images/case-savanna-agro.jpg` | 1200 × 800 | Projects |
| Bioseco cover | `public/images/case-bioseco.jpg` | 1200 × 800 | Projects |
| Intro video | `public/media/intro.webm` (or `.mp4`; update `type`) | 1280 × 720 | Home → "A quick hello" |
| Intro video poster | `public/media/intro-poster.png` | 1280 × 720 | Poster frame for the video |
| Intro captions | `public/media/intro-captions.vtt` | WebVTT | Captions track |
| Certificate PDF | `public/certificates/altschool-product-marketing.pdf` | PDF | About → "View certificate" link (hidden until the file exists) |

The intro video in the repo is a short **animated title card** (no people, no AI faces), labelled as a placeholder on
the page. Replace `intro.webm`, the poster and the captions with the real recording. If you delete the video file, the
page shows "Intro video coming soon" instead of a broken player.

## The planner

Everything is saved in the browser's `localStorage` under the versioned key `uo-planner:v1`.

- **Hydration-safe:** saved data is read only after the page mounts. The server and the first render show a loading state.
- **Validated on read:** every record is checked with Zod. If some records are damaged they are skipped and the rest is
  kept. If nothing is readable the planner starts fresh. Either way a notice explains what happened and the original
  text is copied to `uo-planner:backup`.
- **Export / import** a JSON backup (Courses & data tab) to move between browsers. **Clear all data** asks for confirmation.
- **Reminders:** a banner lists overdue items and anything due within 24 hours. It is checked on load and every 30 seconds while the tab is open. Optional
  browser notifications are requested **only when she clicks the button**, and only fire while the site is open in a tab
  (there is no server or push service).
- **Default timetable rules:** weekday work 9 AM–5 PM is locked; study sits early morning (5:30–8:30) and in the lunch
  break (3.5 h on weekdays against a 3–4 h target); evenings are rest or optional light tasks; weekends carry more (5.5 h
  Saturday, 4.5 h Sunday, shown as "Stretch day"). Any block can be changed for **this week only** or **every week**,
  with reset buttons for both.
- **Dashboard:** every number is computed from recorded data (tasks, calendar events, blocks ticked off). Each widget has
  an empty state explaining what to log.

## Contact form: going live

The form validates in the browser but **does not send anything**, and says so. After a valid submit it offers a pre-filled
`mailto:` link. To make it really send:

1. Create a free form at [Formspree](https://formspree.io) and copy its endpoint (`https://formspree.io/f/xxxxabcd`).
2. In `components/contact/ContactForm.tsx`, inside `onSubmit` after validation passes, `await fetch(endpoint, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(event.currentTarget) })`.
3. Show the success message only when the response is `ok`, show an error message otherwise, and update the demo notice text.

## Deploy (GitHub + Vercel)

1. The code lives at **https://github.com/ciscokwiz/feyiprincess** (branch `main`).
2. On [vercel.com](https://vercel.com) choose **Add New → Project**, import the repository and keep the detected
   **Next.js** settings (`vercel.json` pins `npm ci` and `npm run build`). Leave the output directory at its default.
   Click **Deploy**. If the project is already connected, every push to `main` redeploys it.
3. Optional: in Vercel **Settings → Environment Variables** set `NEXT_PUBLIC_SITE_URL` to the live URL (used for
   Open Graph links), then redeploy.
4. Submit **both links** for COS 106: the Vercel live URL and the GitHub repository URL.

Because it is a static export, the `out/` folder can also be hosted on Netlify, GitHub Pages or any static host.

---

## COS 106: where the rubric requirements live

### HTML

| Requirement | Where | Notes |
|---|---|---|
| Semantic elements | `app/layout.tsx` (`<header>`, `<nav>`, `<main>`, `<footer>`), every page uses `<section>`, `<article>`, `<aside>`, `<figure>`, `<blockquote>`, `<dl>`, `<time>` | Landmarks, one `<h1>` per page, skip link |
| Forms | `components/contact/ContactForm.tsx`; planner forms in `components/planner/TodayChecklist.tsx`, `CalendarView.tsx`, `NotesPanel.tsx`, `SettingsPanel.tsx` | Labels, `<fieldset>`/`<legend>`, `aria-describedby` errors |
| Tables | `app/about/page.tsx` (Learning milestones: `<caption>`, `<thead>`, `scope="col"`/`scope="row"`); `components/planner/Timetable.tsx` (weekly timetable with `<tfoot>` totals); `CalendarView.tsx` (month grid); `Dashboard.tsx` (chart data table) | |
| Images | `components/ui/PhotoSlot.tsx` (next/image, fixed aspect ratio); hobby illustrations `public/illustrations/*.svg` used in `app/about/page.tsx` and `app/page.tsx` | Descriptive `alt` text |
| Hyperlinks | `components/layout/SiteHeader.tsx`, `SiteFooter.tsx`, CTAs in `app/page.tsx`, external Notion links in `app/projects/page.tsx` (`target="_blank" rel="noopener noreferrer"`), `mailto:` links | |
| Lists | Nav (`<ul>`), education timeline (`<ol>`), skills chips, hobbies, task list, notes, upcoming deadlines (`<ol>`) | |
| Multimedia | `components/home/IntroVideo.tsx`: `<video controls>` with `<source>`, `<track kind="captions">`, poster and fallback text | Captions: `public/media/intro-captions.vtt` |

### CSS

| Requirement | Where |
|---|---|
| External stylesheet | `app/globals.css` + `app/home.css`, `app/about/about.css`, `app/projects/projects.css`, `app/planner/planner.css`, `app/contact/contact.css` (all linked from `app/layout.tsx`) |
| Consistent colour scheme | Design tokens in `:root` at the top of `app/globals.css` (burgundy `#641F36`, brown `#795548`, white, ivory `#F5F0EB`, plus rose, marigold, coral and teal accents; 8 course colours). All text pairs pass WCAG AA (axe: 0 violations) |
| Flexbox | `.cluster`, `.site-header__inner`, `.site-nav__list`, `.task-item`, `.home-currently__list`, `.week-nav` |
| Grid | `.home-hero__grid`, `.home-bio`, `.home-pillars`, `.projects-grid` (staggered 6-column grid), `.about-hobbies__grid`, `.dash-grid`, `.task-form`, `.cal-layout` |
| Responsive / mobile-friendly | Media queries in every stylesheet (1100, 1024, 900, 860, 760, 640, 560, 520 px). Tested at 360 px and 1440 px with no horizontal overflow. The timetable switches to a stacked day view on mobile |
| Navigation styling | Section 6 of `app/globals.css`: pill links, active-route state (`[aria-current="page"]` + marigold dot), animated hamburger, full-screen mobile menu |
| Animations / transitions | Keyframes in section 10 of `app/globals.css`: `float`, `wiggle`, `pop-in`, `draw-line` (squiggle), `blob-morph`, `confetti-fall`. Bouncy button and card hovers, scroll reveal (`.reveal`). All disabled under `prefers-reduced-motion` (section 11) |

### JavaScript (TypeScript)

| Requirement | Where |
|---|---|
| Event handling | Click, submit, change, blur, keydown (Escape, Tab trap, arrow keys) and hashchange handlers: `SiteHeader.tsx`, `ContactForm.tsx`, `PlannerApp.tsx` (arrow-key tabs), `CalendarView.tsx` (arrow-key day grid), `Timetable.tsx` |
| DOM manipulation | `lib/dom.ts` (see list below), plus native `<dialog>` `showModal()`/`close()` in `components/planner/Modal.tsx` |
| Form validation | `lib/contactValidation.ts` + `lib/schemas.ts` (`contactSchema`): required fields, email format, **digits-only phone** (7–15 digits). Per-field errors, `aria-invalid`, focus moves to the first invalid field, submit blocked. Planner forms reject blank titles |
| Dynamic content updates | The whole planner: counts, progress ring, filters, calendar dots, reminders banner and toasts, dashboard figures and SVG chart all update instantly from state |
| Arrays & functions | `lib/dashboard.ts`, `lib/agenda.ts`, `lib/reminders.ts`, `lib/timetable.ts` (pure, unit-tested functions using `map`, `filter`, `reduce`, `sort`, `some`, `every`); `lib/plannerReducer.ts` |
| Interactive task management | `components/planner/TodayChecklist.tsx`: add, edit, complete/uncomplete, delete with undo, filter (Today / Upcoming / All / Done), custom categories, celebration when the day is done |

#### Direct DOM manipulation (all in `lib/dom.ts`)

| Function | What it does | Used by |
|---|---|---|
| `focusElement()` | Puts focus back in the task title box after adding a task, and on the first field when editing | `TodayChecklist.tsx`, `CalendarView.tsx`, `NotesPanel.tsx`, `SettingsPanel.tsx` |
| `scrollToFirstInvalid()` | Scrolls to and focuses the first field with `aria-invalid="true"` | `ContactForm.tsx` |
| `setPageLocked()` | Toggles a body scroll-lock class and makes `<main>`/`<footer>` `inert` while the mobile menu is open | `SiteHeader.tsx` |
| `focusableWithin()` | Finds focusable elements to trap focus inside the open mobile menu | `SiteHeader.tsx` |
| `setDocumentTitle()` | Updates `document.title` with the number of open tasks today, e.g. "(3) Planner \| Uchechukwu Onuoma" | `PlannerApp.tsx` |
| `launchConfetti()` | Creates, animates and removes confetti `<span>` nodes when a task, a study block or a whole day is finished | `TodayChecklist.tsx`, `Timetable.tsx` |
| `downloadTextFile()` | Creates a temporary `<a download>` with a Blob URL and clicks it to export the planner backup | `SettingsPanel.tsx` |

Also: `RevealObserver.tsx` adds `.is-visible` to elements with an `IntersectionObserver`; `Modal.tsx` calls
`dialog.showModal()` / `dialog.close()` through a ref.

### Hosting

Live URL + GitHub repository link: see [Deploy](#deploy-github--vercel).

---

## Project structure

```
app/                  routes (layout, page per route) + stylesheets, favicon (icon.svg), OG image
components/
  layout/             SiteHeader (nav + mobile menu), SiteFooter
  ui/                 PhotoSlot, Highlight (squiggle), Wave, RevealObserver
  home/               IntroVideo
  contact/            ContactForm
  planner/            PlannerApp (tabs), PlannerContext (state + storage), TodayChecklist, Timetable,
                      CalendarView, NotesPanel, Dashboard, Reminders, SettingsPanel, Modal, bits
data/                 all editable content (profile, case studies, courses, timetable, categories)
lib/                  types, Zod schemas, storage, reducer, date/timetable/agenda/dashboard/reminder logic, DOM helpers
public/               illustrations, media (video, poster, captions), images/, certificates/
scripts/              serve-static.mjs (preview server for out/)
tests/unit/           Vitest
tests/e2e/            Playwright (+ axe accessibility checks)
```

## Known limitations

- No backend: the contact form doesn't send, and planner data lives in one browser until exported.
- Browser notifications only fire while the site is open in a tab. Some mobile browsers (e.g. Android Chrome) don't
  allow page notifications without a service worker; in-app reminders still work there.
- Case study summaries are title-based until the owner replaces them (see To-dos).
- Photos, the real intro video and the certificate PDF are still to be added.
