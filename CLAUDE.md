# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

**FlyRank Capstone**, part of the FlyRank AI Frontend Internship. The repo is a
Vite + React + TypeScript single-page app used to practice a professional
frontend workflow, from environment setup and Git hygiene to AI-assisted
development with Claude Code.

## Tech Stack

- **React 19** with function components and hooks
- **TypeScript** (strict, project references via `tsconfig.app.json` and
  `tsconfig.node.json`)
- **Vite 8** for dev server and build
- **ESLint 9** flat config (`eslint.config.js`) with `typescript-eslint` and the
  React Hooks and React Refresh plugins

## Commands

Run these from the repo root (npm):

- `npm install` — install dependencies
- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — type-check (`tsc -b`) then produce a production build
- `npm run preview` — serve the production build locally
- `npm run lint` — lint all `.ts`/`.tsx` files

There is no test runner configured on this branch. Do not assume `npm test`
works; add Vitest and Testing Library first if tests are needed.

## Structure

```
flyrank-capstone/
├── index.html            # Vite entry HTML
├── public/               # Static assets served as-is (favicon, icons)
├── src/
│   ├── main.tsx          # App bootstrap / React root
│   ├── App.tsx           # Root component
│   ├── assets/           # Imported images and SVGs
│   └── *.css             # Component and global styles
├── eslint.config.js      # Flat ESLint config
├── vite.config.ts        # Vite config
└── tsconfig*.json        # TypeScript project references
```

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

- Verify changes against `npm run lint` and `npm run build` before considering
  them done; there are no tests to rely on yet.
- Feature experiments live on separate branches (for example the settings-form
  work). Confirm the intended branch before committing.
- Leave staging and committing to the user unless explicitly asked.
