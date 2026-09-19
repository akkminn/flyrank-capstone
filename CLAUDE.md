# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

**FlyRank Capstone**, part of the FlyRank AI Frontend Internship. The repo is a
Next.js + React + TypeScript developer portfolio used to practice a
professional frontend workflow, from environment setup and Git hygiene to
AI-assisted development with Claude Code.

## Tech Stack

- **Next.js 16** (App Router, Turbopack) with **React 19** function components
  and hooks
- **TypeScript** (strict, single `tsconfig.json`, `@/*` path alias to `src/*`)
- **Tailwind CSS v4** (CSS-first config via `@import "tailwindcss"` in
  `src/app/globals.css`, no separate `tailwind.config.*`)
- **shadcn**-style UI primitives on top of `@base-ui/react`, styled with
  `class-variance-authority` + `tailwind-merge` (see `src/lib/utils.ts`'s `cn`
  helper and `components.json`)
- **@hugeicons/react** for icons

## Commands

Run these from the repo root (npm):

- `npm install` — install dependencies
- `npm run dev` — start the Next.js dev server (Turbopack) with HMR
- `npm run build` — production build (`next build`), includes type-checking
- `npm run start` — serve the production build locally
- `npm run lint` — **currently broken.** `eslint.config.js` still references
  the old Vite template's plugins and ESLint itself isn't a listed dependency.
  Don't report a task as lint-clean without actually confirming `npm run lint`
  runs; if it still fails for the same reason, say so rather than assuming it
  passed.

Tests:

- `npm test` — Vitest + React Testing Library (`src/**/*.test.tsx`), jsdom
- `npm run test:watch` — Vitest in watch mode
- `npm run test:e2e` — Playwright (`e2e/`); builds and serves the app itself on
  port 3100, needs a one-time `npx playwright install chromium`
- `npm run typecheck` — `tsc --noEmit`

Testing conventions: query by role/label/text (never test IDs or CSS classes),
and never hit the real AI route — `vitest.setup.ts` makes any un-mocked `fetch`
throw, and tests use `src/test/mock-chat-route.ts` / `src/test/chat-stream.ts`
to stand in for `/api/portfolio-chat`. Playwright specs mock it with
`page.route`. CI (`.github/workflows/ci.yml`) runs typecheck, Vitest, the
build, and Playwright on every push and PR, with no API key.

## Structure

```
flyrank-capstone/
├── public/                     # Static assets served as-is (favicon, icons)
├── src/
│   ├── app/                    # App Router routes
│   │   ├── layout.tsx          # Root layout: renders <Navigation /> + <main>
│   │   ├── page.tsx            # Home
│   │   ├── about/, contact/, experience/, projects/, projects/studybuddy/
│   │   ├── health/page.tsx     # Simple status/health route
│   │   └── globals.css         # Tailwind import + design tokens
│   ├── components/
│   │   ├── navigation.tsx      # Sticky header, responsive mobile menu
│   │   ├── page-container.tsx  # Shared max-width/padding wrapper for pages
│   │   └── ui/                 # shadcn-style primitives (e.g. button.tsx)
│   ├── lib/utils.ts            # `cn()` class-merge helper
│   └── assets/                 # Imported images
├── eslint.config.js            # Flat ESLint config (stale — see Commands)
├── components.json             # shadcn config
├── postcss.config.mjs          # Tailwind v4 PostCSS plugin
└── tsconfig.json               # TypeScript config, `@/*` → `src/*`
```

Every route should render through `<PageContainer>` (consistent responsive
padding/max-width) and rely on the root layout for the header — don't
re-declare page background/text theming per-page.

`.next/` is build output and is gitignored; never hand-edit or commit it.

## Conventions

- **Language:** TypeScript only in `src`. Type props and state; avoid `any`.
- **Components:** function components with hooks. Keep them focused and small;
  extract subcomponents rather than growing one large function.
- **Accessibility:** use semantic HTML, associate `<label>` with inputs, give
  images meaningful `alt` (or `alt=""` plus `aria-hidden` for decorative ones),
  and keep interactions keyboard accessible.
- **Commits:** Conventional Commits (`feat:`, `docs:`, `chore:`). Keep history
  clean and messages scoped.
- **License:** MIT (© 2026 Aung Ko Ko Minn) — preserve the header in `LICENSE`.

## Notes for Claude

- Verify changes with `npm test` and `npm run build` before considering them
  done (add `npm run test:e2e` when touching the chat flow or routing). If a
  test fails, read why before touching it — a failing test has already caught
  real bugs here (see the raw-network-error message and the "Go home" link's
  role). `npm run lint` still doesn't run (see Commands); if lint tooling gets
  fixed, add it back into the verification step.
- For UI changes, start the dev server (`npm run dev`, port 3000) and check
  the page in a browser rather than relying on the build alone.
- Feature experiments live on separate branches (for example the settings-form
  work). Confirm the intended branch before committing.
- Leave staging and committing to the user unless explicitly asked.
