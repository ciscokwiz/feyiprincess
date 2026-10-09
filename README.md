# Uchechukwu Precious Onuoma — portfolio & planner

An editorial portfolio built with Next.js App Router, React, strict TypeScript, and Tailwind CSS. Five routes share design tokens and accessible navigation without repeating one page composition.

## Run

Use Node.js 24 (pinned in `.nvmrc` and `package.json`) and npm.

```sh
npm ci
npm run dev
```

For a production server: `npm run build`, then `npm start`.

## Page map and architecture

- `/`: editorial introduction, configurable portrait, featured project, planner entry.
- `/about`: direction, education, skills, interests, learning table, audio introduction slot.
- `/projects`: featured sample and two supporting concepts with honest asset/link availability.
- `/planner`: local task creation, completion and reversal, filters, deletion, counts, durable browser storage.
- `/contact`: field validation with an explicit demo outcome; no backend or delivery claim.

`src/lib/content.ts` controls the profile, media paths, project entries, and learning milestones. Personal biography and project concepts are explicitly placeholders. Put real images/audio in `public/`, then set root-relative paths in configuration. Remote images require a Next.js image host configuration. The audio slot is intentionally unconfigured; replace it with your own recording. `src/lib/planner.ts` validates saved data; `src/lib/contact.ts` owns form validation. Reusable UI is in `src/components`, route compositions in `src/app`, and design tokens, type scale, responsive layout, and reduced-motion rules in `src/app/globals.css`.

The two small `.mjs` files are executable tool configuration required by the selected ESLint/PostCSS setup; application logic and UI use TypeScript.

## Validation

```sh
npm run lint
npm run typecheck
npm run build
npm test
```

The cloud environment uses Chromium at `/usr/bin/chromium`. Elsewhere, install Chromium and set `PLAYWRIGHT_CHROMIUM_PATH` to its executable path. Fonts are bundled locally via Fontsource and `next/font/local`.

Browser tests cover planner persistence/complete/uncomplete/delete, malformed storage recovery, empty and invalid contact fields, truthful demo feedback, every route at 1440/768/390px, overflow, and mobile navigation. Screenshots are written to ignored `test-results/`.

## Deploy to Vercel

The repository includes `vercel.json` with the Next.js preset, a reproducible `npm ci` install, and `npm run build`. Node.js 24 is selected through `package.json`. Fonts are bundled locally; no external font requests, environment variables, or backend are required.

1. Commit and push the application files, including `package-lock.json`, to your GitHub repository.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Set **Root Directory** to the directory containing `package.json` (the repository root for this project). Retain **Next.js** as the framework and the configured install/build commands. Leave the output directory at the Next.js default; do not set it to `out`.
4. Deploy. After Vercel reports success, visit `/`, `/about`, `/projects`, `/planner`, and `/contact`. Create a planner task and refresh to verify browser persistence; check that the contact form reports its demo status.

Vercel supplies HTTPS and a deployment URL. Subsequent pushes to the configured production branch trigger production deployments; other branches can produce previews. No deployment has been created from this workspace.

Before public release, replace personal placeholders and project concepts with verified content and media. If adding contact delivery, configure a real endpoint, protect credentials server-side, and only show a sent state after confirmed delivery. Planner lists stay in each browser and are not synced between devices or between different deployment domains.
