# Accessibility & performance audit (FE-10)

Baseline, fixes and re-measurement for the portfolio, on branch
`feature/fe-10-a11y-perf-audit`. Everything below was measured, not estimated;
where a number is weaker than it looks, that is said next to it.

## Result

Lighthouse, **mobile preset, median of 3 runs per page**:

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Home | 73 → **94** | 100 → 100 | 96 → **100** | 100 → 100 |
| About | 85 → **92** | 100 → 100 | 96 → **100** | 100 → 100 |
| Experience | 85 → **94** | 100 → 100 | 96 → **100** | 100 → 100 |
| Projects | 90 → **92** | 100 → 100 | 96 → **100** | 100 → 100 |
| Contact | 75 → **92** | 100 → 100 | 96 → **100** | 100 → 100 |

Behind the performance scores (medians; lower is better except the score):

| Page | TBT | Speed Index | LCP | CLS | Individual Performance runs |
|---|---|---|---|---|---|
| Home | 1,142 → **162 ms** | 2.9 → 1.5 s | 2.5 → 2.7 s | 0.001 → 0 | 73/62/74 → 94/95/92 |
| About | 497 → **270 ms** | 2.8 → 1.0 s | 2.4 → 2.5 s | 0 → 0 | 85/95/83 → 92/92/93 |
| Experience | 467 → **206 ms** | 1.8 → 1.3 s | 2.5 → 2.5 s | 0.001 → 0 | 85/92/85 → 93/96/94 |
| Projects | 338 → **249 ms** | 1.9 → 1.8 s | 2.5 → 2.7 s | 0 → 0 | 84/90/92 → 91/92/92 |
| Contact | 1,012 → **282 ms** | 2.2 → 1.2 s | 2.5 → 2.5 s | 0 → 0 | 87/70/75 → 90/93/92 |

Initial JavaScript, gzipped (measured in Chromium at a 375 px-wide viewport unless noted):

| Page | Before | After |
|---|---|---|
| `/about` | 244 KB | **171 KB** (−30%) |
| `/` on a phone | 472 KB | **173 KB** (−63%) |
| `/` on desktop (still ships three.js, by design) | 472 KB | 400 KB |

The before/after Lighthouse screenshots are submitted with the assignment rather than
stored in this repo. Each row above is the median run of three.

### What these numbers do *not* say

- **"After" was measured on a local production build, not on the deployed preview.**
  The changes were not deployed yet, so I ran `next start` locally, while "before" ran
  against the live Vercel site. Lighthouse's simulated throttling models the network,
  but a CDN and a local server still differ, so small gaps (for example First
  Contentful Paint, which moved 1.0–1.3 s → 0.8–1.3 s and is flat within noise) should
  not be read as wins. **Re-run against the Vercel preview after the PR is pushed** (see
  "Reproducing") and update the "after" numbers if they move.
- **LCP did not improve, and one amber metric remains.** It stayed at about 2.5–2.7 s
  (Lighthouse's "good" line is 2.5 s). I expected the late web-font swap to be the
  cause and moved the font to `next/font` (it now loads at 30 ms instead of
  400–900 ms). The measurement showed no LCP change: the simulated LCP is set by the
  chain of render-blocking CSS and the JavaScript that loads before first paint, not by
  the font. The font change stays because it removed a layout shift (About's CLS
  0.013 → 0), but it was not the LCP fix I predicted.
- **Lighthouse is single-page and lab-based, and machine-dependent.** Run-to-run swings of
  5–15 points are normal (Contact's baseline ran 87 / 70 / 75). That is why the table uses
  medians of 3. It also varies with how busy the machine is: the same build and
  configuration scored 94 / 95 / 92 on Home early in the session and 90 / 86 / 90 later,
  with other applications open. **Treat Home's static score as "mid-80s to mid-90s", not
  as a guaranteed 94.**
- **The 94 on Home is with the phone default described below.** Lighthouse's mobile
  emulation is a phone, so it now measures the static hero. With the animation switched
  on, the same page scored **76–78** on the same build before the phone default was
  added (same scene, same code). That is the honest cost of the 3D scene on a
  mid-range phone.

## Independent runs (Chrome DevTools, on the author's machine)

Six Lighthouse runs from DevTools (mobile, Navigation mode), on the old deployment
and on this branch's production build, before the width-based default below:

| Code | Animation | 3D chunk downloaded | Performance | TBT |
|---|---|---|---|---|
| Old (live) | on | yes | 77 | 1,070 ms |
| Old (live) | on | yes | 77 | 1,100 ms |
| Old (live) | off | no | **90** | 410 ms |
| New (this branch) | on | yes | 78 | 1,020 ms |
| New (this branch) | on | yes | 77 | 830 ms |
| New (this branch) | off | no | **89** | 310 ms |

Accessibility, Best Practices and SEO were 100 in all six.

What this shows, honestly:

- **The animation decides the Home score**: about 77 with the scene, 89–90 without, on both
  old and new code. On Home, my other changes (lazy chat, font) are within noise of each
  other when the scene is off (90 vs 89). Their measurable effect is on the *other*
  pages and on JavaScript size (above).
- **My first version of the phone default did not fire in DevTools.** It keyed on a coarse
  pointer, but DevTools' Lighthouse panel emulates a phone's *width* without touch input
  (`screenEmulation.disabled: true` in the report), so the scene loaded and Home scored
  77, the same as before. I reproduced that with a DevTools-like Lighthouse configuration
  (77, 77), changed the rule to width alone (under 768 px), and re-ran the same
  configuration: the 3D chunk is no longer downloaded and Home scores **84–86** on a
  loaded machine.
- **LCP is noise here.** Identical code produced LCP 1.3 s and 2.7 s in consecutive runs, and
  the old deployment ranged 1.1–1.7 s. Don't read a trend into it.
- **Two things I tried that did not help:** moving the font to `next/font` (LCP
  unchanged, see above) and inlining the stylesheet with `experimental.inlineCss`
  (90 / 88 / 90 against 90 / 86 / 90, LCP still 2.9–3.0 s). The second was reverted.

## WAVE

WAVE is a browser extension, so I could not run it myself; the author ran it. I also used
[axe-core](https://github.com/dequelabs/axe-core) (below), the same class of automated
check, which does not replace WAVE: the two report different things in places.

| Page | Errors | Contrast errors | Alerts | Run against |
|---|---|---|---|---|
| `/` | **0** | **0** | 1 (redundant link, justified below) | live site, *before* this branch |
| `/about` | **0** | **0** | 1 (same redundant link) | live site, *before* this branch |
| `/experience` | **0** | **0** | 1 (same redundant link) | live site, *before* this branch |
| `/projects` | **0** | **0** | 1 (same redundant link) | live site, *before* this branch |
| `/contact` | **0** | **0** | 1 (same redundant link) | live site, *before* this branch |
| `/projects/studybuddy` | **0** | **0** | 1 (same redundant link) | live site, *before* this branch |

On every page WAVE also listed 1 feature (the page language) and some structural and ARIA
items, with an AIM score of **10 / 10** each time. Those are informational, not problems.

**The one alert on every page, "Redundant link", is justified, not fixed.** It is the same
alert each time because it sits in the site-wide header, on the "Home" link:
the site name beside it also links to `/`. A logo that links home next to a
"Home" item is a near-universal convention, both links have clear names, and it does not
fail any WCAG criterion. Removing either would make the header harder to use.

**To finish this section:** run WAVE on `/projects/studybuddy` (and `/projects/menuchecker`
if it is one of the audited pages). Then re-run `/` and the other pages once this branch is
deployed, or run the extension on the local production build (`npm run build && npm run
start`), once with the chat closed and once with it open. Any *Error* should be fixed;
alerts should be fixed or justified like the one above.

**A limit worth knowing:** WAVE's own notes say it cannot detect contrast errors where
gradients, filters or background transparency are present. The home hero is exactly that
(text over moving tiles), so WAVE's "0 contrast errors" says nothing about it. The measured
hero contrast in the next section is what covers it.

## Accessibility

### Automated (axe-core, WCAG 2.0/2.1/2.2 A and AA plus best practices)

Every route on desktop and a phone-sized viewport, plus the chat dialog open and the
mobile menu open.

| | Before | After |
|---|---|---|
| Violations | 1 (`color-contrast` on the 404 page: 4.42:1, needs 4.5:1) | **0** |
| "Needs review" | `color-contrast` on the home hero (27 nodes) | same node class: axe cannot compute contrast over moving tiles, so it is measured directly below |

This is now a permanent CI test: `e2e/accessibility.spec.ts` runs the same scans on
every push, so a regression fails the build.

### Hero text contrast over the moving 3D tiles

Lighthouse and axe both pass this page, and both are blind to it: text sits over an
animated background, so no static check can tell if it is readable. I measured it
directly: hide the text, photograph the background behind each line of text over 14
animation frames, and compute the worst contrast against the real text colour.

| Viewport | Text items below 4.5:1, before | After | Lowest ratio after |
|---|---|---|---|
| Desktop 1280 | **17 of 25** (down to 1.4:1) | **0 of 25** | 6.7:1 |
| Phone 375, scene on | **21 of 25** (down to 1.2:1) | **0 of 25** | 7.3:1 |
| Phone 375, default static hero | not applicable before | **0 of 25** | 9.7:1 |

The fix: brighter secondary text (`slate-400`/`slate-500` → `slate-300`), and a scrim
behind the copy. On phones the whole scene is dimmed, since the copy spans the width;
from `lg` up it is a soft-edged band that follows the text column, so tiles outside it
keep their brightness. The dim value was chosen from the arithmetic: the brightest tile
pixel behind the copy has to stay dark enough for `slate-300` to keep 4.5:1.

**Design trade-off you should look at:** the tiles are visibly more subdued behind the
text (compare the hero on the live site with this branch's build). That is the price of
readable text over a moving background; the strength of the scrim is one line in
`hero-backdrop.tsx` if you want to tune it and re-run the measurement.

### Keyboard-only pass through the primary flow

Page → skip the nav → open the chat → ask → stop → close. Scripted, so it is repeatable
(`e2e/accessibility.spec.ts`).

| Check | Before | After |
|---|---|---|
| First Tab stop | Site name link (6 stops of nav before content) | **"Skip to main content"**, which jumps to `<main>` |
| Focus indicator | Grey at **50% alpha**, about 1.7:1 on the page background (WCAG needs 3:1) | Solid, opaque 2 px outline, sky-blue on dark |
| Opening the chat with Enter | Focus stays on the launcher behind the dialog | **Focus moves into the composer** |
| Escape in the chat | Nothing | **Closes it and returns focus to the launcher** |
| Escape in the mobile menu | Nothing | Closes it and returns focus to the menu button |
| Reaching Stop | One Tab from the composer, works | Same, and it keeps working |
| After Stop / reply ends | Focus dropped to `<body>` (button unmounted) | **Focus stays in the chat** (one persistent Send/Stop button) |
| Closing and reopening | (History kept) | History kept: conversation stays mounted, hidden |

### AI-specific accessibility

- **Streamed output, announced politely.** A single `role="status"` / `aria-live="polite"`
  region says "Assistant is thinking.", "Assistant is replying.", then the finished
  reply once ("Assistant replied: …"), or "Stopped.". The message list itself is a
  `role="log"` with `aria-live="off"` on purpose: a live region wrapped around a
  streaming message reads out token after token. The announcement clears after 15 s so
  it doesn't linger as a duplicate of the reply.
- **Keyboard-reachable stop button.** It is the next Tab stop from the composer while a
  reply is pending, and pressing Enter stops the stream.
- **Thinking indicator.** It had `aria-label` on a plain `<div>`, which assistive tech
  ignores. Now decorative (`aria-hidden`); the status region carries the message.
- Errors keep `role="alert"`; decorative icons are `aria-hidden`.

## Performance

| Finding (evidence) | Change |
|---|---|
| Every page downloaded and ran the AI SDK and chat (about 300 KB raw, ~660 ms of script on a mid-range phone) even though most visitors never open the chat | The launcher is tiny and eager; the conversation is a lazy chunk, loaded when the button is hovered, focused, touched or clicked. History still survives closing the dialog. A load failure shows a message instead of crashing the page. |
| The 3D scene costs about 2 s of boot time under mobile throttling (1.6 s of it three.js), holding Home at 62–74 | On **small screens (under 768 px wide)** the hero **starts static** and the visitor can switch the animation on (the existing switch, remembered). Tablets and desktops are unchanged. The rule keys on width, not on a touch pointer: see "Independent runs" below for why. |
| Web font discovered late, through a CSS `@import` (requested at 400–900 ms) | `next/font/local`: preloaded from the document head, with a size-matched fallback. Removed the `@fontsource` dependency. |
| Console error on every load: `favicon.ico` 404 (Best Practices 96) | `icons` metadata points at the existing `favicon.svg`. Best Practices 100 everywhere. |
| Next's default 404 page inside the layout (the contrast violation above) | A designed `not-found.tsx`. |

Image sizing and alt text: the site has no raster images (icons are inline SVG,
decorative, `aria-hidden`), so there was nothing to size or describe. Layout shift was
already near zero; it is 0 on every page now.

**Not done, deliberately:** shipping three.js on desktop is unchanged (it is the point
of the hero, and it loads after the page is idle); re-implementing the scene on raw
three instead of React Three Fiber could cut its size but is a rewrite, not an audit
fix.

## Not verified

- **No screen reader was run** (NVDA, VoiceOver). The announcement behaviour is verified
  from the DOM (the right text appears in a polite live region at the right times), not
  from what a screen reader actually speaks. A 10-minute pass with NVDA or VoiceOver on
  the chat is worth doing.
- **No real phone.** All numbers are Lighthouse's emulation.
- **WAVE**: see above.

## Reproducing

```bash
npm run build && npm run start           # then, in another terminal:
npx lighthouse http://localhost:3000/ --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless=new" --output=html --output-path=./lighthouse-home
npm run test:e2e                          # includes the axe scans and the keyboard-only flow
```

Against the deployed preview, replace the URL. Lighthouse's defaults are the mobile
preset with simulated throttling (Moto G Power, 4× CPU, slow 4G); "before" and "after"
above used those defaults, three runs per page.
