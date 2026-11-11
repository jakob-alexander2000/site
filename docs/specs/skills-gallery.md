# Skills gallery

Addendum to `docs/specs/close-reading.md`. The page stays Close Reading. This file adds one section.

## 1. Header and goal

Build a small skills gallery on the Close Reading page. The request is a new draft pull request whose base is `cursor/close-reading-37ec`. Do not merge. Merging publishes, and Jakob approves publishing.

Goal. A reader can name the skills in the gallery, read one first-person line for each, see a diagram of how that skill works, and open a public proof. No skill is listed without that proof. A skill whose only public proof is already on the shelf is not listed again.

The page does not name an employer, a city, a hiring pitch, a listing, or a count of listings.

## 2. Devices

The device table in `docs/specs/close-reading.md` still applies. This section is checked on both Chromium and WebKit at:

| Device | Viewport |
| --- | --- |
| iPhone 12 Pro portrait | 390×844 |
| Small phone | 375×667 |
| iPad mini landscape | 1133×744 |
| iPad mini portrait | 744×1133 |

Reduced motion shows the same diagrams, with no animation. The fold tests still have to pass: the gallery sits after the proof shelf, below the first screen.

## 3. Scope

In this draft:

- This spec.
- `lib/skills.ts`, the only definition of the gallery.
- The gallery section on the home page, server-rendered. No new client module and no new script.
- Tests named in section 6.

Out of this draft:

- A merge, a production deploy, or any change to `jakobalex.vercel.app`.
- A placeholder for a skill that has no public proof.
- Any private repo.

## 4. Requirements

### Proof inventory

Checked 11 Nov 2026. A live URL was accepted only when `curl -L` returned 200 with no login. A GitHub repo was accepted only when the API reported `visibility=public`.

| Skill | Proof URL | What it shows, in one line | Verified how |
| --- | --- | --- | --- |
| Evaluation | `https://citebot-chi.vercel.app/evals` | The handbook questions run through the agent loop, and a failed question stops the build. | curl 200. No login. This is not the shelf link. |
| Tool use | `https://citebot-chi.vercel.app/harness` | The handbook agent plans, runs at most three tools, drafts, then checks. | curl 200. The page names `search_handbook`, `list_topics`, `get_section`, and `quote_check`. |
| TypeScript | `https://github.com/jakob-alexander2000/citebot/actions/workflows/ci.yml` | The runs page shows a passing CI run that typechecks and builds the app. | curl 200. The GitHub API lists that workflow's runs, and the latest completed run's conclusion is success (9 Nov 2026). |
| Retrieval | `https://citebot-chi.vercel.app/ask` | A question is answered from one handbook, and the passage stays with the answer. | curl 200. No login. |

Observability and tracing of AI runs had no public proof. Retrieval takes that place. The search was the public trees of citebot, citebot-evals, retrieval-autopsy, desk, desk-index, this site, and style-distance. The only "tracing" hit was a Next file-tracing comment. There was no OpenTelemetry, LangSmith, or trace of an AI run.

Also checked, and not a gallery row:

- `https://github.com/jakob-alexander2000/citebot-evals` is public and curl returned 200. The proof shelf already links to it. The gallery evaluation row uses the golden-run page instead.
- `https://retrieval-autopsy.vercel.app/` returned 200. The proof shelf already links to it. The gallery does not list verification again.
- `https://github.com/jakob-alexander2000/site/blob/main/.github/workflows/test.yml` is public and curl returned 200. It typechecks and tests this site. The TypeScript row uses the shipped app's runs page.

### Omitted, no public proof

- MCP. No public file and no public page.
- Observability and tracing of AI runs. Substituted above.
- Private repos. Not linked. No empty slot.

The rendered page does not name MCP or observability. Test: `skills gallery shows the public skills`.

### The section

The gallery is one `data-block="skills"` section after the proof shelf. The visible heading is `Skills`, an `h2`. The skill names are `h3`. The rows, in order, are Evaluation, Tool use, TypeScript, and Retrieval. Each row has the skill name, one first-person line, a `data-diagram` sequence, and one proof link. The link's visible text is a word, not a URL, and it is the strongest element in the row. No gallery link uses a shelf href. Test: `skills gallery shows the public skills`.

The diagram is a hairline sequence in the same stroke as the pipeline drawing. Between steps, an `aria-hidden` direction mark is drawn. The steps are not 44px bordered boxes. Test: `skills gallery shows the public skills`.

| Visible name | Line | Diagram steps | Proof label | Proof URL |
| --- | --- | --- | --- | --- |
| Evaluation | I run the handbook questions through the agent loop, and a failed question stops the build. | Questions, Stand-in, Check | Evals | `https://citebot-chi.vercel.app/evals` |
| Tool use | I stop the handbook agent after three tool calls, then the draft is checked. | Plan, At most three tools, Draft, Check | Harness | `https://citebot-chi.vercel.app/harness` |
| TypeScript | I typecheck the handbook app in CI, and that same CI builds it. | Lint, Tests, Eval, Build | Runs | `https://github.com/jakob-alexander2000/citebot/actions/workflows/ci.yml` |
| Retrieval | I answer from one handbook and keep the passage next to the answer. | Question, Passage, Cited answer | Ask | `https://citebot-chi.vercel.app/ask` |

The TypeScript steps are the CI work the sentence does not name: lint, tests, and the eval, then the build. The evaluation steps name the stand-in. The gallery does not say "does not call a model".

`lib/skills.ts` is the only copy of those rows. `app/` and `components/` do not contain the proof URLs or a branch on a skill id. A test can pass five dummy rows and the page renders those rows instead. Test: `the shipped skills are the public proofs`. Test: `five dummy skills render from a test definition`. Walking the gallery imports finds no `use client` module. Test: `the skills gallery imports no client module`.

On the four viewports in section 2, nothing in the gallery overflows the viewport. Test: `skill diagrams fit the phone and the iPad`.

Reduced motion keeps every diagram step visible. In that section, `transitionDuration` is 0 and `getAnimations()` is empty. Test: `reduced motion keeps the skill diagrams`.

Initial JavaScript stays at most 145,000 bytes gzip. The cap is the gzip size of the module scripts in this build, not the recorded preview file. Test: `this build's initial javascript is at most 145000 bytes gzip`. The gallery adds no client component and no script. The outcome budgets in the Close Reading spec are unchanged.

Visible text follows the Close Reading public-face rules: first person, no raw URL, no place name, no money language, no hire framing, no third person.

## 5. Plan

Render the section from `lib/skills.ts` on the server, after the shelf and before the footer. Reuse the page type, the hairline, and the paper and ground colours. Do not add a route.

Rejected alternative: repeat the shelf links inside the gallery, or draw the steps as 44px boxes. The shelf already holds those two proofs. A box at tap-target height reads as a button.

## 6. Tests

Playwright, Chromium and WebKit, in `test/skills.spec.ts`:

- `skills gallery shows the public skills`
- `skill diagrams fit the phone and the iPad`
- `reduced motion keeps the skill diagrams`

Unit, in `test/skills.test.tsx` and `test/js-budget.test.ts`:

- `the shipped skills are the public proofs`
- `five dummy skills render from a test definition`
- `the skills gallery imports no client module`
- `this build's initial javascript is at most 145000 bytes gzip`

The section renders from `lib/skills.ts`. The tests above are the check.

## 7. Standing rules

- Same public-face scanner as Close Reading. Do not add a banned word to get a proof onto the page.
- Commit as `121804365+jakob-alexander2000@users.noreply.github.com`. No history rewrite.
- Do not merge. Do not deploy to the production domain.
- Do not print secrets.
- Write about Jakob Alex in the first person.

## 8. Judged on

The same ten dimensions as Close Reading section 8: central idea, functional fit, hierarchy, typography, spacing and grid, color restraint, explanatory completeness, clear action, factual rigor, detail and accessibility. The bar is 40 or above with nothing below 4. One pass. The score is recorded in section 10 after that pass, not before.

## 9. Fair play

- The inventory was checked on 11 Nov 2026 against the public URLs above. Nothing in the table was inferred from a private repo.
- Three gallery proofs are hosted outside this site: the evals page, the harness page, and the ask page. They are proof links. The proof is that live page, so the link has to leave this site. This site does not host those apps.
- This site's own CI is public and was still left out of the TypeScript row, so the row would not point at a branch that is not what is shipped. The TypeScript link is the shipped app's runs page.
- Verification stays on the proof shelf. The gallery does not list that demo again.
- Toolbar heights and owner-device checks stay in the Close Reading spec. This addendum does not mark them done.

## Found, not fixed

- The Close Reading copy scan flags `hire`, `hiring`, `recruit`, and `open to work`. A sentence can still read as a hire pitch without those words. That gap is in the parent branch's scanner. This pass does not widen the scanner.
- `docs/measurements/close-reading-preview.json` stores the browser `encodedBodySize` under `initialJsGzip`. The preview sent those scripts with brotli, so the number is not a gzip of the files. Renaming the field would change the performance test that reads it, so it is not a one-line label fix. The 145,000 byte cap for this head is the gzip test on the build.
- The retrieval demo needs three clicks before it shows a result: a question, a mode, and Run. The shelf still links to it. This pass does not change that demo.

## 10. Done

Local evidence is from 11 Nov 2026, on this head. The production build succeeded. Unit tests passed, 29 of 29, including the client-module walk and the gzip cap. That cap measured the module scripts in this build at 138,587 bytes gzip, under 145,000. The nomodule polyfill is not in that sum. Playwright on Chromium and WebKit passed 154 tests and skipped 12. The 12 skips are the original WebKit-only toolbar viewports on Chromium. The client-module test went red when `use client` was added to `lib/skills.ts`, then passed after that line was removed. The reduced-motion test went red, reporting one skill transition, while a 200ms opacity transition was left on the section and the reduced-motion transition rule was turned off. Both were restored, and the test passed.

One pass on the gallery only. The shelf links are not repeated. Verification stays on the shelf. The section heading is an h2 and the skill names are h3. The steps are a hairline sequence, and the proof link sits beside the name. Self-score: central idea 4, functional fit 5, hierarchy 4, typography 4, spacing and grid 4, color restraint 5, explanatory completeness 4, clear action 5, factual rigor 5, detail and accessibility 4. Total 44. Nothing below 4.

| Check | Test | Status |
| --- | --- | --- |
| Public skills, lines, diagrams, and proof links | skills gallery shows the public skills | Pass |
| Phone and iPad fit | skill diagrams fit the phone and the iPad | Pass |
| Reduced motion | reduced motion keeps the skill diagrams | Pass |
| Definition module | the shipped skills are the public proofs | Pass |
| Dummy rows | five dummy skills render from a test definition | Pass |
| No client module | the skills gallery imports no client module | Pass |
| Initial JavaScript of this build | this build's initial javascript is at most 145000 bytes gzip | Pass |
| Rubric, one pass | review: rubric | Pass |
