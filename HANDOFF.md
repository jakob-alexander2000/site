# Handoff

## Identity

| | |
| --- | --- |
| Head commit | `1a008e0cc11bad371b1cb552ea9ababd634f7b87` |
| Pull request | https://github.com/jakob-alexander2000/site/pull/10 |
| Vercel deployment | `dpl_77W4W4tHaVYJ595JaW4ZTwh3yNAM` |
| Preview | https://jakobalex-n1kq75wr0-jakobalexander2000s-projects.vercel.app |
| Branch alias | https://jakobalex-git-cursor-noir-l-4b949e-jakobalexander2000s-projects.vercel.app |
| Deployment state | READY. The preview and the branch alias both returned HTTP 200. The page has no video element. |
| CI | https://github.com/jakob-alexander2000/site/actions/runs/41929691100 success (pull request), and https://github.com/jakob-alexander2000/site/actions/runs/41929683870 success (push) |

This file is committed after that SHA. The preview above is the deployment of `1a008e0cc11bad371b1cb552ea9ababd634f7b87`.

On that CI, Playwright reported 45 passed and 1 skipped. Chromium passed 23. WebKit passed 22 and skipped the review-still capture.

## Acceptance

| ID | Row | Result | Proof |
| --- | --- | --- | --- |
| R1 | Opening line | pass | `npx playwright test test/noir.spec.ts -g "looks, contact"` checks `#opening`. |
| R2 | Three full-screen looks | pass | Same test. Each `section.screen` is at least the viewport tall. |
| R3 | LOOK 01 CiteBot, marked In progress | pass | Same test. |
| R4 | LOOK 02 Retrieval Autopsy, free answer checker | pass | Same test. |
| R5 | LOOK 03 Voice check is Style Distance | pass | Same test. |
| R6 | No video element remains | pass | Same test, plus `npx playwright test test/noir.spec.ts -g "reduced motion"` and `-g "settles"`. Each asserts `video` count 0. |
| R7 | No clip file remains | pass | `node --import tsx --test test/looks.test.ts` asserts `public/recordings` has no mp4 or webm. |
| R8 | CiteBot caption names the development build and the missing model | pass | Caption: `Checks each claim against the handbook passage. Development build, no AI model.` |
| R9 | CiteBot frame is a finished check, plain passage, no MOCK, no dev badge | pass | `public/recordings/citebot.jpg`. SUPPORTED, a dropped unless, `pto-and-leave.md`. |
| R10 | Autopsy still is the live product | pass | `public/recordings/autopsy.jpg`, captured from the public app on 4 Nov 2026. Qualifier FAIL. |
| R11 | Voice check still is the live product | pass | `public/recordings/style.jpg`, captured from the public app on 4 Nov 2026. Distance 1.33, off-voice. |
| R12 | Default image is monochrome | pass | `npx playwright test test/noir.spec.ts -g "settles"` expects `grayscale(1)` before the image has settled. |
| R13 | Grain is a generated SVG filter, not baked into the file | pass | `app/globals.css` `.still::after` uses `feTurbulence`. `node --import tsx --test test/looks.test.ts` matches that rule. |
| R14 | Colour settles once over 1.2 s and does not loop | pass | `SETTLE_MS` is 1200. The settles test waits 1.4 s, checks the filter is clear, waits again, and checks `data-settled` stays `1`. |
| R15 | Reduced motion shows the colour image with no transition | pass | `npx playwright test test/noir.spec.ts -g "reduced motion"` at 390×844, 744×1133, and 1280×800. Filter is none, duration is `0s`, grain opacity is 0. |
| R16 | Fine-pointer hover can restore colour and is not the only way | pass | CSS `(hover: hover) and (pointer: fine)` clears the filter. The settles test reaches colour by scrolling, with no hover. |
| R17 | One-line caption says what the product does | pass | The looks, contact test expects the three captions. |
| R18 | Public product pages are linked | pass | Autopsy and Voice check each have a Product page link and a Live link to the public app. |
| R19 | CiteBot says the product page is coming, with no dead link | pass | The text is `The product page is coming.` The looks, contact test finds no anchor to the old CiteBot preview. |
| R20 | No live iframes | pass | The looks, contact test expects iframe count 0. |
| R21 | Palette is black, white, and one grey | pass | `node --import tsx --test test/looks.test.ts` |
| R22 | No text under 16 px | pass | The looks, contact test at 390×844, 744×1133, and 1280×800, both browsers. |
| R23 | Contrast passes | pass | Same run. `#8c8c8c` on `#000000` is 6.25:1. |
| R24 | Tap targets are 44 px or more | pass | The looks, contact test, the reduced-motion test, and the main-link test measure every `a` and `button`. |
| R25 | Main link is on the first screen at every suite size | pass | `npx playwright test test/noir.spec.ts -g "main link"`. Sizes: 390×844, 744×1133, 1280×800, 390×664, 844×390, 844×340, 375×587, 1133×610. Those are the unique values among the 13 viewport entries the suite already had. |
| R26 | Each look keeps its first link on screen at the short sizes | pass | `npx playwright test test/noir.spec.ts -g "main action"` at 390×664, 844×390, 844×340, 744×1133, and 1280×800. |
| R27 | Copy scan, including self-taught and taught myself | pass | `npm run build && node --import tsx scripts/scan-copy.ts`. `node --import tsx --test test/scan.test.ts` |
| R28 | Bootcamp sentence, first person | pass | The looks, contact test expects the sentence. |
| R29 | Contact is the one address plus GitHub | pass | `node --import tsx --test test/contact.test.tsx` and the looks, contact href checks. |
| R30 | No phone row | pass | The looks, contact test expects the word Phone to be absent. |
| R31 | Tests fail on any other address | pass | `node --import tsx --test test/scan.test.ts` and `npx playwright test test/noir.spec.ts -g "email address"`. |
| R32 | CiteBot Live link hidden, flag default off | pass | `showCiteBotLive` is false. The looks, contact test finds no Live link in `#citebot`. |
| R33 | Autopsy and Voice check Live links return HTTP 200 | pass | `node --import tsx --test test/looks.test.ts` |
| R34 | Product claims have file and line proofs | pass | Same unit test fetches each proof line. |
| R35 | Name is Jakob Alex, one italic on the opening screen | pass | The looks, contact test expects the heading and exactly one `em`. |
| R36 | Shelf names are not rendered | pass | `node --import tsx --test test/looks.test.ts` and the looks, contact text check. |
| R37 | Chromium at 390×844 and 744×1133 | pass | Local Playwright, both sizes: content, type, contrast, tap targets, reduced motion, main link. |
| R38 | WebKit at 390×844 and 744×1133 | pass | Same cases on Playwright WebKit. |
| R39 | Both engines at 1280×800 | pass | Content, type, contrast, tap targets, reduced motion, settle, main link, and the short-height loops. |
| R40 | Real iOS | not checked | No physical iPhone or iPad. WebKit here is Playwright’s Linux build. |

## Playwright

Local `npx playwright test` after `npm run build`, and the same command on CI runs 41929691100 and 41929683870: 45 passed, 1 skipped. The skip is the WebKit copy of the review-still capture. Chromium ran 23 and passed 23. WebKit ran 23, passed 22, skipped 1.

| Browser | 390×844 | 744×1133 | 1280×800 |
| --- | --- | --- | --- |
| Chromium | pass: content, type, contrast, tap targets, reduced motion, main link. Review stills for all three looks. | pass: content, type, contrast, tap targets, reduced motion, main link | pass: content, type, contrast, tap targets, reduced motion, settle, main link |
| WebKit | pass: content, type, contrast, tap targets, reduced motion, main link | pass: content, type, contrast, tap targets, reduced motion, main link | pass: content, type, contrast, tap targets, reduced motion, settle, main link |

## Screenshots

| Look | File | Taken from |
| --- | --- | --- |
| CiteBot | `public/recordings/citebot.jpg` (900×750) | Local development build of CiteBot, branch `cursor/answer-core-56ce`, route `/answer`, on 4 Nov 2026. Question about paid vacation days. Stand-in provider, no AI model. The caption says so. |
| Retrieval Autopsy | `public/recordings/autopsy.jpg` (900×1266) | Live https://retrieval-autopsy.vercel.app/ on 4 Nov 2026, after a check that drops a condition. |
| Voice check | `public/recordings/style.jpg` (900×1266) | Live https://style-distance.vercel.app/ on 4 Nov 2026, brand-voice demo. |

## Found, not fixed

- The CiteBot still is a development build with a stand-in and no AI model. The caption says so. The product page is coming. `showCiteBotLive` stays false.
- The plain-text passage was captured from a local display change. A CiteBot repository pull request was not opened.
- No physical iPhone or iPad. WebKit is Playwright’s Linux build.
- Installer phone agent, voice test bench, and agent cockpit stay in `lib/shelf.ts` and are not on the page.
- Lighthouse was not run on this preview.
- `/about` redirects home.
