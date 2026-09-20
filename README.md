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

## 3D hero (FE-AA2)

**Live:** [akkminn.github.io](https://akkminn.github.io) (redirects to the
Vercel deployment). The scene is on the home page.

### What was built

The home page hero has a live 3D scene behind the intro copy: tiles carrying the
logos of technologies I work with drift through the space, and the visitor
can push them around. Move the cursor (or touch the screen) and nearby tiles are
shoved away, then spring back and settle.

- **Scene:** React Three Fiber (`three` + `@react-three/fiber`, deliberately no
  `drei`). Each technology is one `instancedMesh` of a procedurally extruded
  rounded square, with the logo drawn onto a canvas texture from the
  [`simple-icons`](https://simpleicons.org) vector paths. 24 tiles on desktop,
  14 on phones. There are no model or image files to download.
  ([`hero-scene.tsx`](src/components/hero/hero-scene.tsx))
- **Interaction beyond orbiting:** cursor and touch push physics (radius, force,
  spring and damping), driven by window pointer listeners that write to a ref, so
  moving the pointer never triggers a React render. There is also an
  **Animation on/off** switch that is remembered in `localStorage`.
- **Static version:** a pure HTML/SVG/CSS snapshot of the same tiles
  ([`hero-fallback.tsx`](src/components/hero/hero-fallback.tsx)). It is
  server-rendered, costs no JavaScript, and is what visitors see while the scene
  loads and whenever they don't get 3D.
- **Accessibility:** the tech stack is also listed as real text under the intro,
  the canvas layer is `aria-hidden`, and the switch is a keyboard-operable
  `role="switch"`.

### Performance note

Everything below is about keeping a WebGL scene from costing the page more than it
gives back.

- **Size:** the 3D code is one lazy chunk of **226.7 KB gzipped (853 KB raw)**,
  almost all of it `three`. Total JS on the home page goes from 245 KB to 472 KB
  gzipped when the scene loads. Zero KB of models or textures, because everything is
  procedural.
- **Loaded after the page, never before:** the scene is `React.lazy`-imported and
  only mounted once the browser is idle, so it never competes with hydration or the
  first paint. The static tiles paint first and fade out when the scene is ready.
  The scene's box is the same size as the static version, so nothing shifts
  (CLS ≈ 0), and the LCP element is the tagline text, not the canvas.
- **Who gets the static version instead:** visitors with `prefers-reduced-motion`
  (followed live, no reload needed), data-saver on, `deviceMemory ≤ 2`,
  `hardwareConcurrency ≤ 2`, no WebGL, or a failed chunk download (an error boundary
  catches these). They never download the 3D chunk. Neither does anyone who has
  switched the animation off.
- **Cost while running:** `dpr` capped at 1.5, `powerPreference: "low-power"`,
  fewer tiles on phones, one draw call per technology through instancing, no
  shadows or post-processing, and the frame delta clamped so a stalled tab can't
  cause a physics jump. The render loop stops while the hero is scrolled out of
  view. Switching the animation off unmounts the canvas, which releases the WebGL
  context and GPU memory. An e2e test checks that this really happens.
- **Mobile:** the pointer listeners are on `window` and the canvas layer is
  `pointer-events: none`, so the scene never captures touches. A vertical swipe over
  the hero scrolls the page exactly as it does with the scene off.

**Through the FE-10 lens** (production build, headless Chromium with *software*
WebGL, one run each):

| Scenario | Frame rate | Long tasks | CLS |
|---|---|---|---|
| Desktop 1280×800 | ~36 fps (p95 frame 50 ms) | 5 (430 ms total) | 0 |
| Desktop, 4× CPU throttle | ~42 fps | 16 (3.1 s total) | ~0 |
| Phone 375×812, touch | 60 fps | 4 (460 ms total) | ~0 |
| Reduced motion (static) | 60 fps | 0 | ~0 |

Read this honestly: the numbers come from a CPU rasterizer on a dev machine, not
from a phone GPU, so they are pessimistic on frame rate. The differences between
the first three rows are mostly noise from a single run. What they do show is the
cost of turning 3D on. It adds about 0.4 s of long tasks around scene start-up
(shader compilation and texture creation), and that cost disappears when the static
version is used. Still to do: a real-phone check and a PageSpeed Insights run on the
live URL.

### With more time

- **Adaptive quality:** measure frame time at runtime and step down (dpr, then tile
  count, then static) instead of relying on device hints, which only Chromium
  reports.
- **One texture atlas** for all the logos instead of a texture and mesh per
  technology, to cut draw calls and start-up work further.
- **Spread the start-up cost:** build the textures across several idle frames rather
  than in one go, to trim the long tasks above.
- **A bundle-size budget in CI** so the 3D chunk can't quietly grow, plus a
  Lighthouse run against the preview deployment.
- **Tiles that do something:** click a technology to open the projects that use it.

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
