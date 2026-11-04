# Handoff

## Identity

| | |
| --- | --- |
| Head commit | `599fc68183a650275e54df02f1bb690c4eb8a253` |
| Pull request | https://github.com/jakob-alexander2000/site/pull/10 |
| Vercel deployment | `dpl_BrPe3g3mFpzoC2f4BMVhK7atZPph` |
| Preview | https://jakobalex-2d0yy94d5-jakobalexander2000s-projects.vercel.app |
| Branch alias | https://jakobalex-git-cursor-noir-l-4b949e-jakobalexander2000s-projects.vercel.app |
| Deployment state | READY. The preview returned HTTP 200 and the bootcamp sentence. |
| CI | https://github.com/jakob-alexander2000/site/actions/runs/41911291062 success (Chromium and WebKit) |

This file is committed after that SHA. The preview above is the deployment of `599fc68183a650275e54df02f1bb690c4eb8a253`.

## Acceptance

| ID | Row | Result | Proof |
| --- | --- | --- | --- |
| R1 | Opening line plus three full-screen looks | pass | `npx playwright test test/noir.spec.ts -g "looks, contact"` |
| R2 | LOOK 01 CiteBot, marked In progress | pass | Same test. |
| R3 | LOOK 02 Retrieval Autopsy, free answer checker | pass | Same test. Live link kept. `node --import tsx --test test/looks.test.ts` requires HTTP 200. |
| R4 | LOOK 03 Voice check (Style Distance) | pass | Same test. Live link kept. |
| R5 | CiteBot recording shows a finished answer and a claim check | pass | Local development build, branch `cursor/answer-core-56ce`, mock provider. The still shows SUPPORTED, a dropped unless, and `pto-and-leave.md`. Label: `Recording · development build · 4 Nov 2026`. |
| R6 | Dithered stills, readable at 390 | pass | `test-results/noir-review-stills-at-390-chromium/*-390.png` from `npx playwright test test/noir.spec.ts -g "review stills"`. Play shows the clip in greyscale. |
| R7 | Recording label with date | pass | CiteBot uses the development-build label. The other two use `Recording · 4 Nov 2026`. |
| R8 | No live iframes | pass | Playwright iframe count is 0. |
| R9 | Palette #000 / #FFF plus one grey | pass | `node --import tsx --test test/looks.test.ts` |
| R10 | No text under 16 px | pass | Playwright at 390×844, 744×1133, and 1280×800, both browsers. |
| R11 | Contrast passes | pass | Same run. `#8c8c8c` on `#000000` is 6.25:1. |
| R12 | Hover, tap, and keyboard play | pass | `npx playwright test test/noir.spec.ts -g "hover\|tap\|keyboard"` |
| R13 | Reduced motion shows stills | pass | `npx playwright test test/noir.spec.ts -g "reduced motion"` |
| R14 | Reveal 600–900 ms, once | pass | `REVEAL_MS` is 750. Playwright checks `data-elapsed`. |
| R15 | Fallback when the clip or canvas fails | pass | `npx playwright test test/noir.spec.ts -g "missing"` |
| R16 | Product claims have proofs | pass | `node --import tsx --test test/looks.test.ts` |
| R17 | Copy scan, including self-taught and taught myself | pass | `npm run build && node --import tsx scripts/scan-copy.ts`. `node --import tsx --test test/scan.test.ts` |
| R18 | Opening line | pass | Playwright `toHaveText` on `#opening`. |
| R19 | Bootcamp sentence, first person | pass | Playwright expects the sentence. It does not use the banned phrases. |
| R20 | Contact from `lib/contact.ts`. No phone row | pass | `node --import tsx --test test/contact.test.tsx` |
| R21 | Email mailto, GitHub profile | pass | Playwright href checks. |
| R22 | CiteBot Live link hidden behind one flag, default off | pass | `showCiteBotLive` is false in `lib/looks.ts`. Playwright finds no Live link in `#citebot`. |
| R23 | Autopsy and Voice check Live links, HTTP 200 | pass | `node --import tsx --test test/looks.test.ts` |
| R24 | Lighthouse on the preview | pass | `npx lighthouse https://jakobalex-2d0yy94d5-jakobalexander2000s-projects.vercel.app --only-categories=performance --form-factor=mobile --screenEmulation.mobile=true --chrome-flags="--headless=new --no-sandbox"`. Performance 99. The preview responded without a login wall. |

## Playwright

`npx playwright test` after `npm run build`: 31 passed, 1 skipped (the WebKit copy of the review-still capture). Chromium and WebKit both ran the three sizes.

| Browser | 390×844 | 744×1133 | 1280×800 |
| --- | --- | --- | --- |
| Chromium | pass: content, type, contrast, keyboard, reduced motion, tap. Review stills for all three looks. | pass: content, type, contrast, keyboard, reduced motion, tap | pass: content, type, contrast, keyboard, reduced motion, hover, both fallbacks |
| WebKit | pass: content, type, contrast, keyboard, reduced motion, tap | pass: content, type, contrast, keyboard, reduced motion, tap | pass: content, type, contrast, keyboard, reduced motion, hover, both fallbacks |

## Found, not fixed

- The CiteBot clip is the local development build with the mock provider, not the public deployment. The label says so. `showCiteBotLive` stays false.
- The mock answer prints the passage with markdown marks still visible (`##`, `**`). That is what the development screen shows.
- No physical iPhone or iPad. WebKit is Playwright’s Linux build.
- Installer phone agent, voice test bench, and agent cockpit stay in `lib/shelf.ts` and are not on the page.
- `/about` redirects home.
