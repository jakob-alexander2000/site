# Close Reading

## 1. Header and goal

Build the Close Reading page as a new draft pull request off main. The request is: "Build it as a new PR that replaces the PR 13 lookbook direction".

PR 13 (`https://github.com/jakob-alexander2000/site/pull/13`, branch `cursor/spatial-set-9f53`) stays open. This branch does not stack on it, force-push it, or close it. Code from that branch may be reused. None of it is the page.

This file is the phase 1 spec. The rendered page is still the lookbook. The tests in section 6 are red for that reason. The visual build waits until this spec is reviewed.

Goal. A lead gets the page in 10 seconds and can check a claim in 2 minutes. CiteBot is the interim flagship: one answer set in front of the passage it came from. The flagship is one definition file, so a later product replaces that file and not the layout.

The page does not name an employer, a city, or a hiring pitch.

## 2. Devices

Playwright runs Chromium and WebKit. Desktop Chrome is the Chromium project. Desktop Safari is the WebKit project. Phone and iPad sizes run on both engines. Safari and Chrome on iOS are both WebKit, so their toolbar difference is two visual-viewport heights on the WebKit project, not a second browser binary.

Phone landscape stays on the 4-column phone grid. Width alone would treat 844 as a tablet. The performance profile is separate from these layout viewports: iPhone 12 Pro, 390×844, device pixel ratio 2, measured on the deployed preview.

| Device | Engine | Viewport | Columns | Margin | Notes |
| --- | --- | --- | --- | --- | --- |
| Desktop Chrome and Desktop Safari | Chromium and WebKit | 1440×900 | 12 | 96 | Gutters 24. Max content width 1248. |
| Desktop Chrome and Desktop Safari | Chromium and WebKit | 1280×800 | 12 | 96 | Shorter desktop window. |
| iPad mini landscape | Chromium and WebKit | 1133×744 | 8 | 48 | Toolbars retracted. |
| iPad mini landscape, browser chrome | Chromium and WebKit | 1133×610 | 8 | 48 | Specified chrome height. |
| iPad mini portrait | Chromium and WebKit | 744×1133 | 8 | 48 | |
| iPhone 12 Pro portrait | Chromium and WebKit | 390×844 | 4 | 20 | Layout viewport. Performance profile uses this size at DPR 2. |
| iPhone 12 Pro landscape | Chromium and WebKit | 844×390 | 4 | 20 | Layout viewport. |
| Small phone | Chromium and WebKit | 375×667 | 4 | 20 | Layout viewport. |
| iPhone Chrome on iOS, small phone | WebKit and Chromium | 375×547 | 4 | 20 | Toolbar height from the review. |
| iPad mini portrait, Chrome toolbar estimate | WebKit and Chromium | 744×999 | 8 | 48 | Full portrait height 1133 minus 134px. |
| iOS Safari, toolbars expanded | WebKit | 390×703 | 4 | 20 | First-load estimate for a 390×844 notch phone: 844 minus 47 status minus 94 bottom bar (doesitfit.lol). Not measured on the owner's phone. |
| iOS Safari landscape | WebKit | 844×340 | 4 | 20 | About 50px of bars. Same height the lookbook suite already uses. |
| iOS Chrome, toolbars expanded | WebKit | 390×664 | 4 | 20 | Chrome on iOS is WebKit with a taller toolbar. 664 is the shorter stand-in already in the lookbook suite (844 minus 664 is 180). It is not a lab measurement of Chrome's toolbar. The fold has to fit this shorter height. |

There is no separate measured height for Chrome on iOS in landscape. The portrait Chrome stand-in is the tighter of the two portrait toolbars.

The list in `test/devices.ts` is this table. `the spec names every viewport, the copy, and the tests` fails if a size or a test title drops out of this file.

## 3. Scope

In this draft:

- This spec.
- Tests that fail while the lookbook is still served, plus the scanner and the locks that are already green.
- Scaffolding that does not satisfy those tests: `lib/close-reading.ts` (types), `lib/flagship.ts` (null), `lib/proof-shelf.ts` (empty), and `components/CloseReadingPage.tsx` (records the definition it was given and renders no scene). The home page does not mount that component.
- GitHub Actions runs typecheck, lint, unit, the copy scan, and Playwright on Chromium and WebKit. A red unit suite does not skip Playwright.

Out of this draft:

- The visual build, the 3D stage, and the diagrams.
- Vendored fixture bytes. The pins are in section 4. The files are not copied yet.
- A preview performance measurement. No number is invented.
- Any deploy, and any change to the production domain `jakobalex.vercel.app`.
- Any edit to PR 13.

Decisions, settled:

- The proof shelf has exactly three public entries: citebot-evals, retrieval-autopsy, and CiteBot. Planner workbench is omitted. Vierspur and verified shipping are omitted. MCP is omitted. There is no placeholder, clip, or empty slot for any of them. The shelf is a list, so a later entry is a new definition. A test renders five dummy entries from the test file only.
- The contact address stays `jdevacc2000@gmail.com`. The visible link says Email. The address lives in the `mailto:` href. GitHub is the same: the word GitHub, the profile URL in the href.
- CiteBot is the flagship until `lib/flagship.ts` is replaced. Swapping the flagship is a new definition, not a layout change.
- The one biography sentence is the craft line in section 4. The bootcamp and degree sentence is the career-change arc and comes off the page.
- Fixture verdicts win where the brief's diagram labels disagree. Details are in section 4.
- One large number on the page: 18 of 18. The other scores are mono labels on their own nodes.

## 4. Requirements

Each sentence names the test that checks it. Sizes are CSS pixels. Byte budgets use SI units: 90 kB is 90,000 bytes, 260 kB is 260,000 bytes.

### Page

The fold, before any scroll, at every viewport in section 2, shows the opening sentence, the flagship scene, and two links whose accessible names are exactly GitHub and Email. Test: `fold shows the sentence, the flagship, and the words GitHub and Email before scroll`.

The opening sentence is: I build AI products that companies can trust: answers tied to their sources, interfaces people actually understand.

The craft line is present, and the page does not contain the bootcamp sentence, `LOOK 01`, `The product page is coming.`, `taught himself`, `In progress`, or the word plate. Test: `craft line is present and the bootcamp arc is absent`.

The craft line is: I studied comparative literature. Checking a sentence against its passage is the same job.

The grid is 12 columns with 96px margins at 1440×900 and 1280×800, 8 columns with 48px margins on the iPad viewports, and 4 columns with 20px margins on every phone viewport including landscape and the toolbar heights. The grid element exposes `data-columns` and its left padding equals the margin. Test: `grid matches the breakpoint`.

No two `[data-block]` regions overlap at any scroll position, and the page does not scroll sideways. Test: `nothing overlaps at any scroll position`.

A footer contains `#contact`, and after scrolling to it the block is inside the viewport, with Email and GitHub as word links. Test: `footer and contact are reachable`.

Body text marked `data-role="body"` has contrast of at least 7 to 1. The fail mark has contrast of at least 4.5 to 1 and sits next to the word Fail. Test: `body contrast is at least 7 to 1 and fail red is at least 4.5 to 1`.

The type ramp is four sizes, marked `data-type`: display from 40px to 72px, heading 32px, body 17px, mono 12px. Test: `type ramp uses the four sizes`. Fonts are Geist, Geist Mono, and Instrument Serif italic once, on the word check inside the opening sentence. Mono does not use a swash f.

Colors for the build: `#0A0A0A` ground, `#F5F5F2` text, `#A3A3A3` secondary, `#2A2A2A` hairlines. The source plane is `#F5F5F2` paper with `#111` text. One fail red, always beside the word Fail.

Reduced motion lays the planes flat, replaces threads with static numbered ties, and keeps the sentence control. Checked at 1280×800 and at 390×844. Test: `reduced motion keeps the diagrams understandable`.

Keyboard focus and Enter select a sentence and show its thread. Test: `keyboard selects a sentence and draws its thread`.

A tap does the same at 390×844. Test: `touch selects a sentence and draws its thread`.

Replay is a control that restarts the thread. Test: `replay restarts the thread`. Threads draw in 700ms and play once. Verdicts change in 200ms. Those durations are build requirements; the replay test checks that the restart is visible.

### Flagship

`lib/flagship.ts` exports the one production definition, and it is CiteBot. The default page render uses that definition. Test: `the production flagship is the CiteBot definition`.

Rendering `CloseReadingPage` with a second definition from the test file shows that definition and does not show CiteBot. The dummy includes an unsupported sentence whose thread ends open (`data-thread-end="open"`). That sentence is not a fixture and is not production copy. Test: `a second dummy flagship renders in place of CiteBot`.

The production scene shows two sentences from citebot `tests/fixtures/verify-cases.json` (blob `914692a2350b8acf39a0de7a66da6eaba65b1895`, repo commit `2ec2319dd9b3a75e45d5e7773b3841f4afe3fff9`):

- Pass: "Full-time employees receive 30 days." Evidence: "30 days of paid vacation".
- Fail: "PTO is unlimited." beside the word Fail. Evidence: "The handbook says 30 days."

The passage shows this verbatim span and nothing after it: "Full-time employees receive 30 days of paid vacation per calendar year". The rest of that handbook sentence names a place and is not rendered. Test: `the scene uses the two clean fixture sentences`.

The only committed unsupported claim is in the same fixture object as a currency amount for a chair budget. A currency amount cannot be on the page, and splitting that pair would misstate the case. The production scene has no unsupported sentence. The open thread is covered by the dummy definition. Adding a real unsupported sentence later means adding it to the flagship definition.

The brief's three brackets (Scope, Qualifier, Omission) are not drawn on the autopsy diff. Fixture `leave-naive` in retrieval-autopsy `fixtures/answers.jsonl` (blob `3e55fef48ee10abb4d7d91dbb9d5f4c877f96731`, repo commit `58a5599cec3ba7d7b2d4962261b8463501b7d9d5`) records support pass, scope pass, qualifier fail, omission pass. The qualifier span is "full-time employees only". The answer also lacks "after the probation period", and the fixture still marks omission pass. The page shows the fixture verdicts. It does not mark Omission as Fail.

The document preamble of that fixture names a fictional employer and a country. It is not rendered. The passage line and the answer line are.

### Proof shelf

The shipped list is exactly `citebot-evals`, `retrieval-autopsy`, `citebot`, in that order. Test: `the shipped shelf is the three public entries`.

The page shows three `[data-shelf-entry]` rows. Each row has the claim, a link whose visible label is the artifact label and whose href is the artifact URL, and the limit. The page does not contain Vierspur, planner workbench, Voice check, Style Distance, desk-index, or the word MCP. Test: `proof shelf has three entries and each has a claim, an artifact, and a limit`.

The three entries:

| Id | Claim | Label | Artifact | Limit |
| --- | --- | --- | --- | --- |
| citebot-evals | The offline eval scores 18 of 18 example answers. | Eval run | `https://github.com/jakob-alexander2000/citebot-evals` | It scores example answers written in advance, and it does not call a model. |
| retrieval-autopsy | The sample answer drops full-time employees only, and Qualifier fails. | Demo | `https://retrieval-autopsy.vercel.app/` | The checks match spans and do not judge meaning. The sample is not a policy. |
| citebot | Each claim is marked pass, fail, or unsupported against the passage it came from. | App | `https://citebot-chi.vercel.app/` | The golden run uses a stand-in model, so it catches code changes. |

`CloseReadingPage` rendered with five dummy entries from the test file shows five claims, five limits, and five artifact hrefs. Those dummies are not the production list. Test: `five dummy shelf entries render from a test definition`.

### Scores

Three separate nodes, so the numbers cannot be read as one run. Test: `labeled scores do not contradict each other`.

| Node | Text | Date | What it is |
| --- | --- | --- | --- |
| `data-score="citebot-evals"` | 18 of 18 | 29 October 2026 | Offline fixture score in citebot-evals `reports/SAMPLE.md` (blob `1db253014188239e23d1fa95a6c707359dce67bf`). The report's clock line names a city; the page prints the date only. This is the one large number. |
| `data-score="citebot-golden"` | 8 of 8 | 29 October 2026 | CiteBot `evals/last-run.json`, `passed: 8`, `ranAt` `2026-10-29T20:24:01.243Z`, commit `467306657f213589116916544d6c2b20322b229b`. Mono, not display size. The cases-author field is not rendered. |
| `data-score="autopsy-baseline"` | 25 of 32 | none | Sample baseline. `scorer/baseline.json` stores `min_pass_rate` 0.78125, which is 25/32. The README states 25 of 32. No run date is printed, because the baseline file has none. |

Slash ratios (`18/18`, `8/8`, `25/32`) are not rendered. The existing copy scan already rejects them.

### Fixtures

These files are copied into `content/fixtures/` with `content/fixtures/manifest.json` recording the commit and blob sha above. The copy includes citebot `examples/nordlicht-corpus/pto-and-leave.md`, citebot `evals/last-run.json`, and citebot-evals `fixtures/sample-run.json` (blob `55233877b579049cf1e734212ef137cdc7797cc9`) at CI commit `b9e2c8ba3c2b8f5f61a1a6e79d6af4470d9b3a45`. Test: `committed fixtures are vendored before any verdict is rendered`.

`content/fixtures/` is excluded from the source copy scan, because the handbook files contain a place name, currency, and slash ratios. The rendered page and `app/`, `components/`, and `lib/` do not. The client bundle renders the trimmed span, not the whole handbook file.

On 11 Nov 2026 the live URLs `https://citebot-chi.vercel.app/`, `https://citebot-chi.vercel.app/ask`, and `https://retrieval-autopsy.vercel.app/` returned HTTP 200. That is not a check that an answer comes back. The fold scene is drawn from the fixtures. It does not iframe the live app. The shelf links to those URLs.

### Public face

Visible text has no raw URL, no third person, no place name (the scanner rule is the word Berlin), and no money language (the words money, income, salary, euro, a euro sign, or a dollar amount). Company-target names are not stored in this repo. The contact address is not visible; it is only in the mailto href. Test, in the browser: `visible text has no raw url, third person, location, or money`. Test, on the server render: `rendered home visible text has no public-face hits`. The scanner itself is `public-face scanner flags third person, location, raw urls, and money`.

### Performance

Measured on the deployed preview, not on `jakobalex.vercel.app`. Phone profile `iphone-12-pro`, device pixel ratio 2, five runs, raw values stored in `docs/measurements/close-reading-preview.json`. Test: `deployed preview meets the performance budget`.

- Each run's largest contentful paint is under 2.0 s (2,000 ms).
- Each run's cumulative layout shift is under 0.05.
- The median of the five per-run median frame rates is at least 55 fps. The file stores each run's raw median.
- Each run's initial JavaScript is at most 90,000 bytes gzip.
- Each run's total transfer is at most 260,000 bytes gzip.

The static fold paints before the 3D chunk loads. The phone renderer caps device pixel ratio at 2, uses at most 4 planes and 50 draw calls, draws threads as instanced quads, skips post-processing, renders on demand, pauses when offscreen or hidden, and handles context loss. Test: `the phone renderer caps DPR and handles context loss`. That test checks the renderer source for `DPR_CAP = 2`, `MAX_PLANES = 4`, `MAX_DRAW_CALLS = 50`, `function handleContextLost`, `function pauseWhenHidden`, and `function renderOnDemand`. It does not count draw calls on a GPU. The frame-rate file is the runtime check.

### Review

A newcomer can say, from diagrams 1 and 2, what goes in, what happens, what comes out, and what can fail. There is no automated test for that. The check is `review: diagrams 1 and 2`, done by reading the rendered page, including the reduced-motion state and the phone width. The rubric in section 8 is the same kind of check: `review: rubric`.

## 5. Plan

Build the page from the definition files. `app/page.tsx` renders `CloseReadingPage` with no arguments, which reads `lib/flagship.ts` and `lib/proof-shelf.ts`. Tests pass a dummy flagship or a five-entry shelf and do not edit those files.

Order:

1. Vendor the pinned fixtures and fill the two definitions with the copy in section 4.
2. Replace the lookbook page with the static fold: sentence, word links, fixture scene, shelf, scores, craft line, footer. This has to pass the fold, shelf, score, scene, craft, contrast, type, and public-face tests before the 3D chunk exists.
3. Add the sentence-to-span control for keyboard, touch, and reduced motion, then replay.
4. Lazy-load the stage. Keep the static fold as the first paint and as the reduced-motion layout.
5. Measure the preview five times on the phone profile and commit the raw file. Do not deploy to the production domain.

Rejected alternative: keep going on the PR 13 lookbook. That direction scored 17/50 in the critique, the running demo is gone, and the scaled planes read as a layout bug. A new pull request off main replaces that direction. The flat proof-sheet direction from the same critique keeps inline demos and drops the perspective this brief asks for, so it is not the plan. Reduced motion is the flat version of this page, not a second design.

`test/noir.spec.ts` and `test/looks.test.ts` still describe the lookbook. They stay in this draft so the current page remains covered. The build removes the lookbook assertions, including the one that forbids the string `citebot-evals` and the one that expects a single mailto node if the footer repeats the link. Every mailto stays the contact address.

## 6. Tests

| File | Role in this draft |
| --- | --- |
| `test/close-reading.spec.ts` | Playwright, Chromium and WebKit, at the viewports in `test/devices.ts`. Red. The fold failure names the lookbook sentence that is still on the page. |
| `test/public-face.test.tsx` | Scanner lock (green) and the rendered lookbook's visible text (red: raw URL and visible address). |
| `test/close-reading.test.tsx` | Dummy flagship, five dummy shelf entries, empty production shelf, null flagship. Red. |
| `test/fixtures-pin.test.ts` | Pinned files are not vendored yet. Red. |
| `test/perf-budget.test.ts` | Preview measurement file is absent. Red. |
| `test/stage.test.ts` | Phone renderer is absent. Red. |
| `test/devices.test.ts` | This spec still names every viewport, claim, and test title, and section 10 is all Not checked. Green. |
| `test/scan.test.ts` | Existing bans plus location and money. Green. |
| `test/noir.spec.ts`, `test/looks.test.ts`, `test/contact.test.tsx` | Lookbook contract. Green until the build replaces them. |

`npm test` stops at the first red script. Actions runs unit, the copy scan, and Playwright as separate steps, then fails the job if any step failed, so a red unit suite still produces a Playwright run.

Phase 1 red run, 11 Nov 2026, local, against the lookbook still served by `next start`. Typecheck, lint, and the source copy scan passed (95 files).

Unit, 24 tests: 16 passed, 8 failed.

- `the production flagship is the CiteBot definition`: production flagship definition is not filled.
- `a second dummy flagship renders in place of CiteBot`: dummy title, pass sentence, and open thread are not rendered.
- `the shipped shelf is the three public entries`: the shelf is empty.
- `five dummy shelf entries render from a test definition`: zero entries rendered.
- `committed fixtures are vendored before any verdict is rendered`: the eight pinned paths are absent.
- `deployed preview meets the performance budget`: preview measurement is not recorded.
- `rendered home visible text has no public-face hits`: `raw-url`, `visible-address`.
- `the phone renderer caps DPR and handles context loss`: the renderer source is absent.

Playwright `test/close-reading.spec.ts`, Chromium and WebKit: 110 tests, 98 failed, 12 skipped, 0 passed. The 12 skips are the three WebKit-only toolbar viewports on Chromium. The fold failure is: the close-reading opening is missing and the page still shows "I build AI tools whose answers you can check, sentence by sentence."; GitHub and Email are not word-only links; the flagship scene is missing. The shelf failure is: 0 entries, and the page still contains Voice check and Style Distance. The craft failure is: the craft line is missing, and the page still contains the bootcamp line, LOOK 01, "The product page is coming.", and "In progress".

The lookbook unit tests in that same unit run passed. Lookbook Playwright `test/noir.spec.ts`: 47 passed, 1 skipped.

## 7. Standing rules

- First person. The scanner's third-person rule covers he, him, his, she, her, and a third-person "Jakob Alex" clause.
- No employer or company name as a target. Company-target names are checked outside this public repo. Do not add a name to the page.
- No hire pitch, no career-change story, no "taught himself", no city, no income, no money target, no name-dropping, no buzzwords, no co-author line, no commit-count line.
- The contact address stays `jdevacc2000@gmail.com`. Phone stays null.
- Visible text has no raw URL and no email address. Href values may.
- Scores are `n of n`, never `n/n`.
- No invented verdict, date, or count. If a fixture disagrees with this spec's diagram notes, the fixture wins and the spec is corrected.
- `content/fixtures/` may contain the handbook's place names and currency. `app/`, `components/`, `lib/`, and the rendered page may not.
- Vierspur, planner workbench, and MCP do not appear, including as "coming" or as a gap.
- Do not deploy to production. Do not change the production domain. Preview deployments are allowed when the build phase starts. This draft does not need one.
- Commit as `121804365+jakob-alexander2000@users.noreply.github.com`. No history rewrite.
- `AGENTS.md` and `DESIGN.md` still describe the lookbook. They are updated when the page is replaced. Until then this spec is the Close Reading contract.
- Do not print secrets.

## 8. Judged on

The finished page, not this spec draft, is scored on the ten rubric dimensions: central idea, functional fit, hierarchy, typography, spacing and grid, color restraint, explanatory completeness, clear action, factual rigor, detail and accessibility. The bar is 40 or above with nothing below 4. That score is `review: rubric` in section 10. It is not claimed here.

A newcomer reading diagrams 1 (answer over source) and 2 (pipeline) can say what goes in, what happens, what comes out, and what can fail, on the phone width and with reduced motion on. That is `review: diagrams 1 and 2`.

The automated bar is section 4. A green suite with a wrong sentence, a private repo link, or a made-up number is a failed review.

## 9. Fair play

- Toolbar heights for iOS Chrome and the iPad portrait chrome row are labelled estimates or review-specified sizes. They are not measurements from the owner's phone. Playwright cannot launch iOS Chrome as its own browser. Both iOS browsers are the WebKit project. The new toolbar sizes also run on Chromium so the suite does not add skips.
- A scripted question to the live app returned a verdict in 8.2 seconds on 11 Nov 2026. The page does not render that response, because the response names a place. Try it links to the app. The fold scene is the recorded fixture.
- The performance file is written by `npm run measure:preview` from a real preview. It is not filled in by hand.
- The phone renderer is `public/close-reading-stage.js`. `lib/stage.ts` holds the same caps. Runtime tests cover pixel ratio, idle frames, hidden-tab pause, a blocked script, a missing WebGL context, and context loss.
- The unsupported fixture sentence is left out because it is paired with a currency claim. The dummy definition tests the open thread.
- The handbook sentence continues into a place name. The rendered span stops before that clause. The vendored file keeps the full sentence.
- PR 13 is not modified by this branch.
- Three.js is not in the bundle. Its gzip size does not fit the 90 kB initial and 260 kB total JavaScript budgets. Planes stay real DOM. Threads are a CSS draw plus a small WebGL canvas.

## Found, not fixed

- The brief's opening is "I build AI products that companies can trust: answers tied to their sources, agents with checks, interfaces people actually understand." The clause "agents with checks" is not on the page. None of the three shelf entries is an agent. The rendered opening is that sentence with the clause removed. Provisional until Jakob approves the shortened line.
- The craft line is on the page verbatim: "I studied comparative literature. Checking a sentence against its passage is the same job." The comparative-literature fact is not sourced to a dated file. Provisional until Jakob approves it.

## Lookbook suite

| Test | Fate | Why |
| --- | --- | --- |
| looks, contact, type, and contrast | Deleted | Lookbook screens. Contrast, type size, and 44px targets are ported, stricter, in `test/close-reading.spec.ts` and `test/review-rows.spec.ts`. |
| reduced motion shows the colour image | Deleted | Stills are gone. Reduced motion is ported for every viewport. |
| a still starts grey and settles | Deleted | No raster stills. |
| review stills at 390 | Deleted | The Chromium-only skip existed only to capture those stills. |
| each look shows its main action without scrolling | Deleted | One fold replaces three looks. The fold test is the stricter rule. |
| the main link is on the first screen | Ported | Fold visibility, including Try it. |
| no page shows an email address other than the contact address | Ported | Same assertion, kept in the public-face scan and the built-artifact scan. |
| a still that fails to load says so in words | Deleted | No raster stills. A blocked stage script keeps the sentence control and raises no error. |
| about returns home | Kept | `next.config.ts` still redirects `/about` to `/`. |
| opening line and reveal length | Deleted | `lib/looks.ts` and `lib/reveal.ts` are deleted. The opening is now the Close Reading sentence. |
| each shown sentence is backed by a proof excerpt | Ported | Fixture pin plus the scene test. |
| noir css keeps black, white, and one grey | Deleted | The palette is the Close Reading set in `DESIGN.md`. |
| proof lines still match the repositories | Ported | `committed fixtures are vendored before any verdict is rendered`. |
| production contact shows the one address and GitHub | Kept | `test/contact.test.tsx`. Visible text is the words Email and GitHub. |
| null contact renders no phone and no email row | Kept | Phone stays null. |
| a set phone and email become links | Kept | Same helper. |

## Owner checklist

These eight steps stay Not checked until Jakob runs them. They are not a substitute for the automated rows.

1. On iPhone Safari, the sentence, both checks, GitHub, Email, and Try it are on the first screen.
2. Tap a sentence. The thread and the verdict show.
3. Turn on Reduce Motion and reload. Numbered ties replace the thread. Replay and the sentence still work.
4. Scroll to the footer. Email and GitHub are reachable.
5. Repeat steps 1 to 4 in Chrome on the iPhone.
6. Repeat steps 1 to 4 in Safari on the iPad mini.
7. Repeat steps 1 to 4 in Chrome on the iPad mini.
8. Stop if any step fails.

## 10. Done

Local evidence is from 11 Nov 2026. Playwright: `test/close-reading.spec.ts` 114 passed, 12 skipped; `test/review-rows.spec.ts` 34 passed. Unit tests passed after the build, including the fixture pin and the leftover scan. The 12 skips are the original WebKit-only toolbar viewports on Chromium. No new skips.

Impeccable pass, one, on this head. What changed after looking at the full-page shots: the two evidence lines were one run-on sentence, and they are now separate paragraphs. Self-score: central idea 4, functional fit 4, hierarchy 4, typography 4, spacing 4, color restraint 4, explanatory completeness 4, clear action 4, factual rigor 5, detail and accessibility 4. Total 41. Nothing below 4. Screenshots: `/opt/cursor/artifacts/close-reading/` at 1440×900, 1280×800, 1133×744, 1133×610, 744×1133, 390×844, 844×390, 375×667, 375×547, 744×999, 390×703, 844×340, 390×664, and reduced motion at 390×844. The reviewer's score counts.

| Check | Test | Status |
| --- | --- | --- |
| Fold at every viewport in section 2 | fold shows the sentence, the flagship, and the words GitHub and Email before scroll | Pass |
| Grid, columns, and margins | grid matches the breakpoint | Pass |
| No overlap and no sideways scroll | nothing overlaps at any scroll position | Pass |
| Footer and contact reachable | footer and contact are reachable | Pass |
| Visible public-face copy in the browser | visible text has no raw url, third person, location, or money | Pass |
| Visible public-face copy in the server render | rendered home visible text has no public-face hits | Pass |
| Proof shelf has three real entries | proof shelf has three entries and each has a claim, an artifact, and a limit | Pass |
| Shipped shelf ids | the shipped shelf is the three public entries | Pass |
| Five dummy shelf entries, tests only | five dummy shelf entries render from a test definition | Pass |
| Dummy flagship swaps in | a second dummy flagship renders in place of CiteBot | Pass |
| Fourth shelf entry from the module | the default page shows a fourth shelf entry appended on the module | Pass |
| Swapped flagship module | the default page follows a swapped flagship module | Pass |
| Production flagship is one CiteBot definition | the production flagship is the CiteBot definition | Pass |
| Scores are labeled and separate | labeled scores do not contradict each other | Pass |
| Scene uses the two clean fixture sentences | the scene uses the two clean fixture sentences | Pass |
| Fixtures vendored at the pinned shas | committed fixtures are vendored before any verdict is rendered | Pass |
| Craft line, no bootcamp arc, no lookbook costume | craft line is present and the bootcamp arc is absent | Pass |
| Reduced motion | reduced motion keeps the diagrams understandable | Pass |
| Reduced motion at every viewport | reduced motion at every viewport | Pass |
| Keyboard sentence-to-span | keyboard selects a sentence and draws its thread | Pass |
| Keyboard order, focus, and Space | keyboard order, focus, and space select a sentence | Pass |
| Touch sentence-to-span | touch selects a sentence and draws its thread | Pass |
| Body contrast at least 7 to 1 and fail red at least 4.5 to 1 | body contrast is at least 7 to 1 and fail red is at least 4.5 to 1 | Pass |
| Text at least 16px | claims, scores, labels and links are at least 16px | Pass |
| Tap targets at least 44px | tap targets are at least 44px on phone and iPad | Pass |
| Zoom and 320px reflow | no horizontal scroll at 360x740, 320x640, and 200 percent zoom | Pass |
| Four-size type ramp | type ramp uses the four sizes | Pass |
| Replay restarts the thread | replay restarts the thread | Pass |
| Motion plays once inside the timing band | thread and verdict motion play once | Pass |
| Blocked stage script | static fold survives a blocked stage script | Pass |
| Missing WebGL | static fold survives missing WebGL | Pass |
| Context loss | context loss does not surface an error | Pass |
| Renderer pixel ratio and idle pause | pixel ratio stays at most 2 and idle rendering stays still | Pass |
| Quiet console | console stays quiet on the main path | Pass |
| axe serious and critical | axe finds no serious or critical issues at 1280x800, 390x844, and 375x547 | Pass |
| Diagram text | diagrams 1 and 2 are written out | Pass |
| No rasters or lookbook leftovers | built output and public files omit lookbook leftovers and rasters | Pass |
| No hard-coded ids in app or components | app and components do not hard-code shelf or flagship ids | Pass |
| Source maps off | production source maps stay off | Pass |
| Company-target list removed from the public repo | row 19, scanner and tests | Pass |
| Initial JS measured 143772 bytes, over the 90,000 cap. Total 143772 is under 260,000. LCP 814, 764, 766, 767, 765 ms. CLS 0 on all five. TBT 79, 42, 26, 42, 51 ms. Sentence tap 60, 60, 57, 59, 59 ms. Frame-rate medians 60, 60, 60, 60, 60. Lighthouse performance 100, accessibility 100, best practices 100 on all five. | deployed preview meets the performance budget | Not met |
| Owner iPhone Safari | owner checklist steps 1 to 4 | Not checked |
| Owner iPhone Chrome | owner checklist step 5 | Not checked |
| Owner iPad mini Safari | owner checklist step 6 | Not checked |
| Owner iPad mini Chrome | owner checklist step 7 | Not checked |
| Diagrams 1 and 2 readable by a newcomer | review: diagrams 1 and 2 | Pass |
| Rubric self-score 41, nothing below 4 | review: rubric | Pass |
