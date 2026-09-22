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

`e2e/accessibility.spec.ts` runs axe-core over every route and completes the
primary flow by keyboard, so add any new route to its `ROUTES` list. The
chat conversation is a lazy chunk: tests must wait for it (`findBy…`), and
`portfolio-chat.test.tsx` pre-imports it in `beforeAll` so cold-import time
doesn't flake the suite. The chat's polite status region repeats the reply
text (visually hidden), so assert on reply bubbles with `{ exact: true }`.

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
│   │   ├── fonts/              # Figtree, Syne, JetBrains Mono via next/font/local
│   │   └── globals.css         # Tailwind import + design tokens
│   ├── components/
│   │   ├── navigation.tsx      # Sticky header, responsive mobile menu
│   │   ├── portfolio-chat.tsx  # Eager launcher + dialog shell (tiny)
│   │   ├── portfolio-chat-conversation.tsx  # Lazy chunk: useChat + AI SDK
│   │   ├── portfolio-terminal.tsx  # Eager launcher + modal dialog shell (tiny)
│   │   ├── terminal-session.tsx    # Lazy chunk: prompt, history, Tab completion
│   │   ├── open-terminal-button.tsx # Hero button; opens the terminal via an event
│   │   ├── page-container.tsx  # Shared max-width/padding wrapper for pages
│   │   └── ui/                 # shadcn-style primitives (e.g. button.tsx)
│   ├── lib/utils.ts            # `cn()` class-merge helper
│   ├── lib/terminal-commands.ts # Pure command table + Tab completion (tested)
│   └── assets/                 # Imported images
├── components.json             # shadcn config
├── postcss.config.mjs          # Tailwind v4 PostCSS plugin
└── tsconfig.json               # TypeScript config, `@/*` → `src/*`
```

Every route should render through `<PageContainer>` (consistent responsive
padding/max-width) and rely on the root layout for the header — don't
re-declare page background/text theming per-page. `PageContainer`'s
horizontal padding (`px-4`) has two independent copies that must be changed
together: `Navigation`'s header row and `HeroBackdrop`'s control row (the
Animation switch on the home page). All three share `mx-auto max-w-4xl`, so
their left/right edges line up only if the `px-*` value matches everywhere.

`.next/` is build output and is gitignored; never hand-edit or commit it.

## Conventions

- **Language:** TypeScript only in `src`. Type props and state; avoid `any`.
- **Components:** function components with hooks. Keep them focused and small;
  extract subcomponents rather than growing one large function.
- **Accessibility:** use semantic HTML, associate `<label>` with inputs, give
  images meaningful `alt` (or `alt=""` plus `aria-hidden` for decorative ones),
  and keep interactions keyboard accessible. Focus rings come from the global
  `:focus-visible` rule and `--ring` (an opaque, high-contrast colour: don't
  restyle them with low-alpha rings). Text over the hero's moving tiles must
  keep 4.5:1 against the *brightest* tile pixel, which is why the hero copy
  is `slate-300` over a scrim (see AUDIT.md); re-measure if you change either.
- **Typography:** `h1` is Syne (`font-display`, set in the base layer); body
  is Figtree; labels, the hero tech list and the terminal use JetBrains Mono
  (`font-mono`). All three are self-hosted through `next/font/local`, never a
  Google Fonts `<link>` (that is what made LCP slow before). Keep the name
  in the hero on one line at `lg`: Syne extrabold is very wide.
- **Terminal:** commands live in `src/lib/terminal-commands.ts` as a table,
  so adding one means adding an entry there plus a test; the component only
  renders. Anything it prints must already be true on the site (it reuses
  `PROJECTS` and `TECH`); don't invent facts. It is a modal dialog with its own
  Tab trap, so new controls inside it must stay inside `dialogRef`. The prompt
  input is the one place with no focus ring (the blinking caret is the
  indicator); every other control in it keeps the global ring.
- **Honest actions:** don't build UI that claims an outcome the site can't
  actually deliver — e.g. the Contact page's message field builds a real
  `mailto:` link (`src/lib/build-mailto-href.ts`) instead of a fake "Message
  sent!" success state, since there's no backend to send it. If a future
  change adds real delivery (an API route + email provider), the button
  copy ("Opens in your email app") and the honest-vs-simulated distinction
  documented on `AsyncActionButton` should be revisited together.
- **AsyncActionButton variants:** `variant="solid"` (default) is the original
  full-width pill for a page's one primary action (`/lab/buttons`).
  `variant="subtle"` is a smaller bordered pill for use inside a card next to
  other content (the Contact page's Copy button) — same state machine, just
  quieter chrome; `idleIcon` adds an icon before the idle label only. Adding
  a third variant should keep the default's exact classes untouched, since
  `/lab/buttons` and its tests assume them.
- **Floating launchers:** the terminal and chat launcher buttons don't
  position themselves — `RootLayout` wraps both in one `fixed right-5
  bottom-5 flex items-center gap-3` dock, so they stay flush against each
  other as the chat button's own width changes ("Ask about me" vs. the
  narrower "Close"). A third floating launcher joins the same dock rather
  than getting its own `fixed right-<n>`. Each launcher's dialog keeps its
  own independent `fixed` positioning — nesting it under the dock is safe
  because `position: fixed` descendants ignore a `fixed` (untransformed)
  ancestor's layout.
- **Performance:** keep heavy client code out of the root layout. The AI SDK
  is lazy-loaded by the chat launcher and the 3D scene starts static on
  small screens (under 768 px wide; keyed on width because DevTools'
  Lighthouse doesn't emulate touch). Re-run Lighthouse (mobile) before and after
  changes that touch the layout or add dependencies (see AUDIT.md).
- **Commits:** Conventional Commits (`feat:`, `docs:`, `chore:`). Keep history
  clean and messages scoped.
- **License:** MIT (© 2026 Aung Ko Ko Minn) — preserve the header in `LICENSE`.

## Notes for Claude

- Verify changes with `npm test` and `npm run build` before considering them
  done (add `npm run test:e2e` when touching the chat flow or routing). If a
  test fails, read why before touching it — a failing test has already caught
  real bugs here (see the raw-network-error message and the "Go home" link's
  role).
- For UI changes, start the dev server (`npm run dev`, port 3000) and check
  the page in a browser rather than relying on the build alone.
- Feature experiments live on separate branches (for example the settings-form
  work). Confirm the intended branch before committing.
- Leave staging and committing to the user unless explicitly asked.
