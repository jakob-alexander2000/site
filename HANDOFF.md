# Handoff

## Identity

| | |
| --- | --- |
| Commit verified | `310ca51994ab9fe04c82b11a9b802ff214bfdd2c` |
| Pull request | https://github.com/jakob-alexander2000/site/pull/10 |
| Vercel deployment | `dpl_DesurCqgtq6SKTt6Y9pDwjdYzNE8` |
| Preview | https://jakobalex-kdjnk99cg-jakobalexander2000s-projects.vercel.app |
| Branch alias | https://jakobalex-git-cursor-noir-l-4b949e-jakobalexander2000s-projects.vercel.app |
| Deployment state | READY (HTTP 200 on the preview) |
| CI | https://github.com/jakob-alexander2000/site/actions/runs/41908663429 success, and https://github.com/jakob-alexander2000/site/actions/runs/41908646906 success |

This file was added after that commit. The preview above is the deployment of `310ca51994ab9fe04c82b11a9b802ff214bfdd2c`.

## Acceptance

| ID | Row | Result | Proof |
| --- | --- | --- | --- |
| R1 | One PR replaces the six-project site with an opening line and three full-screen looks | pass | `npx playwright test test/noir.spec.ts -g "looks, contact"` (30 passed across both browsers). Preview HTML contains the opening line and LOOK 01–03, and does not contain desk-index or citebot-evals. |
| R2 | LOOK 01 CiteBot, marked In progress | pass | Same Playwright test. `curl -fsS https://jakobalex-kdjnk99cg-jakobalexander2000s-projects.vercel.app` contains `In progress`. |
| R3 | LOOK 02 Retrieval Autopsy, free answer checker | pass | Same Playwright test and the preview HTML. |
| R4 | LOOK 03 Voice check (Style Distance) | pass | Same Playwright test and the preview HTML. |
| R5 | Each look plays a screen recording of the real product | pass | Clips in `public/recordings/` captured 4 Nov 2026 from the live apps (`scripts/capture-recordings.mjs`). Playwright: `npx playwright test test/noir.spec.ts -g "plays"`. |
| R6 | Dithered in the browser | pass | `components/DitherStage.tsx` paints a Bayer dither on a canvas. A local check of the resting canvas found only black and white pixels. |
| R7 | Labelled Recording with its capture date | pass | Visible text `Recording · 4 Nov 2026` on each look. Playwright asserts three matches. |
| R8 | No live iframes | pass | Playwright `document.querySelectorAll("iframe").length === 0` inside the looks test. |
| R9 | Palette #000 / #FFF plus one grey | pass | `node --import tsx --test test/looks.test.ts` (css hex allow-list). Grey is `#8c8c8c`. Playwright rejects any other computed text color. |
| R10 | No text under 16 px | pass | Playwright `readPage` at 390×844, 744×1133, and 1280×800 in Chromium and WebKit. |
| R11 | Contrast passes | pass | Same Playwright pass computes contrast and requires at least 4.5. `#8c8c8c` on `#000000` is 6.25:1. |
| R12 | Hover, tap, and keyboard all play the look | pass | `npx playwright test test/noir.spec.ts -g "hover\|tap\|keyboard"` in both browsers. |
| R13 | Reduced motion shows stills | pass | `npx playwright test test/noir.spec.ts -g "reduced motion"` in both browsers. `data-state` stays `still` and the play control is not shown. |
| R14 | Reveals take 600 to 900 ms and play once | pass | `lib/reveal.ts` sets `REVEAL_MS` to 750. Playwright reads `data-duration` and `data-elapsed` and checks the state stays `played`. Unit test locks the constant. |
| R15 | Fallback when the clip or the graphics fail | pass | `npx playwright test test/noir.spec.ts -g "missing"` aborts the mp4 and forces `getContext("2d")` to return null, in both browsers. |
| R16 | Every product claim has a proof | pass | `node --import tsx --test test/looks.test.ts` fetches each README line and expects HTTP 200 from the three live apps. |
| R17 | Copy scan over source and the built output | pass | `npm run build && node --import tsx scripts/scan-copy.ts` (97 files, allowed email `jdevacc2000@gmail.com`). `node --import tsx --test test/scan.test.ts` checks the scanner rejects the other phrases: Made in Berlin, guitar, the cost is, commit counts, self-taught, taught himself, taught myself, third person, any other email, ledger, Grounded Docs, Mittelstand, white-label, Vierspur, open to work. |
| R18 | Opening line is the supplied sentence | pass | Playwright `toHaveText` on `#opening`. |
| R19 | Contact block reads `lib/contact.ts` (phone, email, github) | pass | `node --import tsx --test test/contact.test.tsx`. |
| R20 | No phone row on the rendered site | pass | Production `phone` is null. Playwright body text does not contain `Phone`. Preview HTML does not contain `Phone`. |
| R21 | Email is a mailto link | pass | Playwright expects `mailto:jdevacc2000@gmail.com`. |
| R22 | GitHub is https://github.com/jakob-alexander2000 | pass | Playwright expects that href. |
| R23 | Null contact path still tested | pass | `test/contact.test.tsx` renders a null email as `Email: to follow` with no link, and omits phone. |
| R24 | Set contact path uses tel and mailto | pass | `test/fixtures/contact.ts` only. The rendered site does not use that fixture. |
| R25 | Geist 100–200, one Instrument Serif italic, Geist Mono tags | pass | Fonts are loaded in `app/layout.tsx`. Playwright counts one `em` on the page. |
| R26 | Generated grain | pass | `app/globals.css` uses an SVG `feTurbulence` tile behind the type. |
| R27 | Rough Notation on a few proven words | pass | `components/Pen.tsx` underlines `check` and `condition`. Both words are in proved copy. |
| R28 | A clean way to add later looks | pass | `lib/shelf.ts` holds the unpublished names. Playwright checks they are not in the page text. `DESIGN.md` says how to move one into `lib/looks.ts`. |
| R29 | First person, name Jakob Alex | pass | The copy scan’s third-person rule, plus the heading text. |
| R30 | GitHub Actions, Chromium and WebKit, reduced motion, 16 px | pass | `.github/workflows/test.yml`. Run 41908663429 succeeded. |
| R31 | Lighthouse performance 90+ on mobile | pass | Local `npx lighthouse http://127.0.0.1:3456 --only-categories=performance,accessibility --form-factor=mobile --screenEmulation.mobile=true --chrome-flags="--headless=new --no-sandbox"`. Performance 100, accessibility 100. |

## Playwright

`npx playwright test` after `npm run build`: 30 passed (Chromium and WebKit).

| Browser | 390×844 iPhone | 744×1133 iPad mini | 1280×800 desktop |
| --- | --- | --- | --- |
| Chromium | pass: looks, type, contrast, contact, keyboard play once, reduced-motion still, tap play | pass: looks, type, contrast, contact, keyboard play once, reduced-motion still, tap play | pass: looks, type, contrast, contact, keyboard play once, reduced-motion still, hover play, clip fallback, canvas fallback |
| WebKit | pass: same set as Chromium | pass: same set as Chromium | pass: same set as Chromium |

## Found, not fixed

- The CiteBot clip ends on “Reading the handbook…”. A 20 second capture of the live ask page never received a finished answer, so the recording is that real screen, not a completed citation.
- No physical iPhone or iPad. WebKit here is Playwright’s Linux build.
- Lighthouse was run on the local production server, not on the Vercel preview.
- Installer phone agent, voice test bench, and agent cockpit are named in `lib/shelf.ts` and are not on the page.
- The old about page redirects home. The bootcamp sentence is not on the site.
- CiteBot’s captured screen is mostly light, so its dither is mostly white with the question bubble in black. Retrieval Autopsy’s scorecard reads more clearly.
