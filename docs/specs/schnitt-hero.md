# Schnitt hero

The homepage opens with one construction drawing. Four sheets — handbook, passages, sentences, verdict — sit in real depth. Scroll pulls them apart. The sheets below that drawing are the existing looks.

## Data

Nothing on the sheets is written by hand. `lib/schnitt-extract.ts` reads the vendored files and `lib/schnitt-run.ts` passes that result to the page. A unit test hashes the files and checks the rendered fields against a second parse.

| Source | Pin | What is used |
| --- | --- | --- |
| CiteBot `tests/fixtures/verify-cases.json` | commit `2ec2319dd9b3a75e45d5e7773b3841f4afe3fff9`, 9 Nov 2026, blob `914692a2350b8acf39a0de7a66da6eaba65b1895` | Case "all pass is grounded": "Full-time employees receive 30 days." Pass. Evidence "30 days of paid vacation". Case "all fail is ungrounded": "PTO is unlimited." Fail. Evidence "The handbook says 30 days." |
| CiteBot `examples/nordlicht-corpus/pto-and-leave.md` | same commit, blob `511f514b4742ebfc70af178224f59f1dd26543e5` | The "Paid time off" section. The full-time sentence is cut before the clause that names a place. The part-time sentence is kept whole. |
| CiteBot `evals/golden.json` | same commit, blob `9723431d89acb45874b33f369aeae85071cc4c5c` | The question on case `pto-days` only. |
| citebot-evals `reports/SAMPLE.md` | commit `b9e2c8ba3c2b8f5f61a1a6e79d6af4470d9b3a45`, blob `1db253014188239e23d1fa95a6c707359dce67bf` | The offline score, rendered as "18 of 18", and the report date 29 Oct 2026. |

The two claims are two fixture cases, not one recorded draft. The drawing says so ("Recorded claims"). The footer date is the pin date of the CiteBot commit, formatted from `manifest.json`.

The place name, the currency case, and every slash ratio stay in `content/fixtures/`. They are not passed to the page.

## Picture

Paper `#F7F7F5`. Sheets `#FBFAF7`. Verdict sheet `#111111`. Ink `#111111`. Mute `#3A3A36`. Fail red `#C6302A` on paper and `#FF8A84` on the verdict sheet. Red is the fail word and the pen loop only. The `theme-color` meta tag is paper `#F7F7F5`, and `color-scheme` is light. Body copy is 17px. Labels sit on leaders, including `D · VERDICT`, and do not meet a sheet.

Geist 200 for the sentence, Geist 300 for the support line and the sheet body, Geist Mono for labels and evidence, Instrument Serif italic on the word "check" only.

The sentence is "I build AI answers you can check, sentence by sentence." The support line is "Each answer is built in layers, from the company's own documents up to a verdict on every sentence. Scroll pulls the layers apart." The last sentence is hidden wherever the static stack is shown, because nothing moves there. Links: "See CiteBot run" (scrolls the drawing) and "How it is built" (the CiteBot repository). Mono labels: `A · HANDBOOK`, `B · PASSAGES`, `C · SENTENCES`, `D · VERDICT`, `PATTERN 01 · CITEBOT · EXPLODED VIEW`, `DATA FROM A RECORDED RUN, 9 NOV 2026`.

A cropped `18` sits behind the sheets. The readable line is `18 of 18 · offline eval · 29 OCT 2026`.

One thread runs from the passing sentence to the passage span it rests on. The failing sentence has the pen loop and the word FAIL, and no thread.

## Behaviour

| Situation | What you get |
| --- | --- |
| Desktop, motion allowed, WebGL on | Orthographic-feeling perspective camera. Four Three.js groups at different z. Scroll increases the separation. Text is HTML on `CSS3DRenderer` planes. The thread and the sheet edges are WebGL. |
| Width at most 800, including 390×844, 390×780, and 375×667 | The static tilted stack at full type size, with the label above each sheet. The tilt does not scale type below 1. The scroll scene is desktop only. No WebGL context is created and `three` is not requested. |
| `prefers-reduced-motion: reduce` | No scroll animation. On a phone the sheets stay the static tilted stack. On desktop they are the flat still: sheets separated on leaders, not tilted. The same words, the same thread, the same loop. |
| WebGL missing or blocked | Desktop shows that same flat reduced-motion still. The stage is never an empty canvas. The phone stack is unchanged. |
| JavaScript off | The sheets are still in the HTML, stacked in the stage. |

Labels are at least 11px. Links and buttons are at least 44px. The hero reserves its box before paint so the first screen does not shift.

## Tests

| File | What it locks |
| --- | --- |
| `test/schnitt-run.test.ts` | Blob pins, both claims, the question, the trimmed handbook, the passage span, 18 of 18, the pin date, and a clean copy scan of the exported strings. |
| `test/schnitt.spec.ts` | The sentence and the italic word, both claims, the pass thread, the absent fail thread, the pen loop, phone type size, reduced motion, the WebGL fallback, canvas ink on Chromium, axe, console, and layout shift. |
| `test/noir.spec.ts` | The looks stay. The hero is outside the noir palette walk. The opening sentence is the new one. |

Chromium launches with `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader` so the canvas can draw without a GPU.

## Done

Measured on this machine after `npm run build`. Playwright Chromium launches with software WebGL.

| Check | Test | Status |
| --- | --- | --- |
| Spec and tests exist before the scene is trusted | this file, `test/schnitt-run.test.ts`, `test/schnitt.spec.ts` | Pass |
| Fixture pins and both claims | `pinned fixture files match the manifest` | Pass |
| Question, trimmed handbook, passage span | `the run is the paid-leave fixture` | Pass |
| Exported strings pass the copy scan | `the run text passes the copy scan` | Pass |
| Sentence, italic only on check | `the sentence and the two claims are on the page` | Pass, Chromium and WebKit |
| Pass thread, no fail thread, pen loop | `the passing sentence has a thread and the failing sentence has a loop` | Pass, Chromium and WebKit |
| Phone sheet type renders at 11px or more, the fail loop is centred on the claim, and the thread starts at the end of the passing sentence, at 390×844 and 390×780 | `phone sheets render type at 11px or more, the loop rings the claim, and the thread starts at the sentence` | Pass, Chromium and WebKit |
| Phone labels at least 11px, no sideways scroll | `phone type is at least 11px and the stage is not a shrunk desktop` | Pass, Chromium and WebKit |
| Reduced motion is a static exploded stack | `reduced motion keeps the exploded stack and skips the scroll scene` | Pass, Chromium and WebKit |
| WebGL blocked still shows the sheets | `a blocked WebGL context still shows the sheets` | Pass, Chromium and WebKit |
| Canvas pixels are not blank | `the WebGL canvas draws ink` | Pass on Chromium. Skipped on WebKit |
| axe, console, hero CLS | `axe, console, and hero layout shift` | Pass. 0 violations, 0 console errors, CLS 0. Chromium and WebKit |
| Frame time, 4× CPU, hero method | `docs/evidence/schnitt-frame-timing.json` | 390×844, static HTML stack, WebGL off: 58 frames, median 16.7 ms, p95 16.7 ms, max 266.7 ms, share above 20 ms = 0.017. 1440×900, WebGL on, with the fit loop: 62 frames, median 16.7 ms, p95 16.7 ms, max 200 ms, share above 20 ms = 0.016. Phone is not a 73-frame WebGL run. The single long phone frame is recorded and explained before M7. |
| Desktop 1440×900: every sheet title uncovered and the verdict inside the stage, above the footer, at scroll 0, mid and end | `desktop sheet titles stay uncovered and the verdict stays in frame through the scroll` | Pass, Chromium and WebKit |
| Typecheck, lint, unit, copy scan, Chromium, WebKit | `npm run verify` | Pass. 15 unit tests. Copy scan ok. Playwright 71 passed, 3 skipped. The skips are the WebKit copies of the Chromium-only still capture, the canvas-ink test, and the frame-time test |
| Screenshots at 1440×900 and 390×844, scroll 0, mid-scroll, reduced motion | `docs/evidence/` | Pass |
| Real iPhone Safari | — | Not checked |
| Real 60fps on a phone | — | Not checked |

## Not checked

- Real iPhone Safari. Playwright WebKit on Linux is the stand-in.
- A physical phone's frame rate. The number below is Chromium with software WebGL and a 4× CPU throttle.
- The live CiteBot deployment. `showCiteBotLive` stays false. "How it is built" goes to the repository.
