# FlyRank Capstone — Developer Portfolio

A Next.js 16 + React 19 + TypeScript developer portfolio, built for the FlyRank
AI Frontend Internship. See [CLAUDE.md](CLAUDE.md) for the full tech stack,
project structure, and conventions.

## Commands

```bash
npm install   # install dependencies
npm run dev   # start the dev server (Turbopack, HMR) on :3000
npm run build # production build, includes type-checking
npm run start # serve the production build locally
npm test        # unit & component tests (Vitest + Testing Library)
npm run test:e2e # end-to-end tests (Playwright; first run: npx playwright install chromium)
```

## Testing

- **Component tests** (`src/**/*.test.tsx`) cover the chat widget across its
  empty, pending, streaming, error and tool-call states, the composer form's
  validation, the `getProjects` tool-result component (all four lifecycle
  states), the `AsyncActionButton` state machine, and the route error boundary.
  They query by role, label and visible text, so restyling a component doesn't
  break them.
- **Playwright** (`e2e/`) walks the primary flow in a real browser: open the
  chat, ask a question, get a reply with a project card, follow it to its page —
  plus an error-then-retry path.
- **The AI route is always mocked.** Unit tests stub `fetch` (and any un-mocked
  call throws); Playwright intercepts the request with `page.route`. Nothing in
  the suite or CI needs an API key or reaches Gemini.
- **CI** (`.github/workflows/ci.yml`) runs typecheck, the unit tests, the build
  and the Playwright suite on every push and pull request. To make failures
  actually block merging, mark the `unit` and `e2e` jobs as required status
  checks in the repo's branch protection settings.

## "Ask about me" AI chat

A streaming AI chat widget (`src/components/portfolio-chat.tsx`), mounted
globally in the root layout so it's available on every page. It's backed by
Google Gemini via the Vercel AI SDK, with the model, system prompt, and tools
wired up in `src/app/api/portfolio-chat/route.ts`.

- Model + system prompt: [src/lib/ai/config.ts](src/lib/ai/config.ts) — tries
  `gemini-3.6-flash` first, falling back to `gemini-flash-lite-latest` if the
  free tier's per-model quota is hit.
- Route handler: [src/app/api/portfolio-chat/route.ts](src/app/api/portfolio-chat/route.ts)
- Chat component: [src/components/portfolio-chat.tsx](src/components/portfolio-chat.tsx)

### Tool contract: `getProjects`

Defined in [src/lib/ai/tools.ts](src/lib/ai/tools.ts). The assistant calls
this whenever asked about Minn's projects or what he's built, instead of
answering from the system prompt — it's the one source of truth for project
data, shared with the tool so the two can't drift apart.

**Input schema** (Zod):

```ts
z.object({
  name: z.string().optional(), // a specific project name, e.g. "Study Buddy"; omit to list all
})
```

**Return shape** (on success):

```ts
{
  projects: Array<{
    id: string;
    name: string;
    summary: string;
    stack: string[];
    status: "concept" | "live";
    href: string; // internal route to the project's page
  }>;
}
```

**Errors:** if `name` doesn't match a known project, the tool throws a plain
`Error` with a message listing the known project names (e.g. `No project
named "X" was found. Known projects: Study Buddy, Ask about me.`). That
message is safe by design — it never leaks internals — so the route handler
passes it straight through to the client, where it renders in a designed
error card rather than a crash.

The chat UI ([src/components/projects-tool-part.tsx](src/components/projects-tool-part.tsx))
renders all four tool lifecycle states distinctly: a "preparing" placeholder
while input streams in, a spinner while the tool executes, real project cards
(name, status badge, stack chips, link) on success, and a red error card on
failure — never a raw JSON dump.
