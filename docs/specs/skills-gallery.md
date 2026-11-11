# Skills gallery

Addendum to `docs/specs/close-reading.md`. The page stays Close Reading. This file adds one section.

## 1. Header and goal

Build a small skills gallery on the Close Reading page. The request is a new draft pull request whose base is `cursor/close-reading-37ec`. Do not merge. Merging publishes, and Jakob approves publishing.

Goal. A reader can name five skills, read one first-person line for each, see a diagram of how that skill works, and open a public proof. No skill is listed without that proof.

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
| Evaluation | `https://github.com/jakob-alexander2000/citebot-evals` | A fixed set of example answers is scored, and the run does not call a model. | API `visibility=public`. curl 200. |
| Verification | `https://retrieval-autopsy.vercel.app/` | A sample answer drops a condition, and Qualifier fails. | curl 200. No login. |
| AI agents with tool use | `https://citebot-chi.vercel.app/harness` | The handbook agent plans, runs at most three tools, drafts, then checks. | curl 200. The page names `search_handbook`, `list_topics`, `get_section`, and `quote_check`. |
| TypeScript in production | `https://github.com/jakob-alexander2000/citebot/blob/main/.github/workflows/ci.yml` | CI typechecks the TypeScript app and builds it. | API `visibility=public`. curl 200 on the workflow and on `https://citebot-chi.vercel.app/`. The file has a Typecheck step and a Build step. |
| Retrieval with citations | `https://citebot-chi.vercel.app/ask` | A question is answered from one handbook, and the passage stays with the answer. | curl 200. No login. |

Observability and tracing of AI runs had no public proof. Retrieval with citations takes that place. The search was the public trees of citebot, citebot-evals, retrieval-autopsy, desk, desk-index, this site, and style-distance. The only "tracing" hit was a Next file-tracing comment. There was no OpenTelemetry, LangSmith, or trace of an AI run.

Also checked, and not a gallery row:

- `https://citebot-chi.vercel.app/evals` returned 200. It is the golden run already on the flagship. The evaluation row uses the offline question set.
- `https://github.com/jakob-alexander2000/site/blob/main/.github/workflows/test.yml` is public and curl returned 200. It typechecks and tests this site. The TypeScript row uses the shipped app's CI, which typechecks and builds the live app.

### Omitted, no public proof

- MCP. No public file and no public page.
- Observability and tracing of AI runs. Substituted above.
- Private repos. Not linked. No empty slot.

The rendered page does not name MCP or observability. Test: `skills gallery shows the five public skills`.

### The section

The gallery is one `data-block="skills"` section after the proof shelf. It has five `data-skill` rows, in this order: Evaluation, Verification, Tool use, TypeScript, Retrieval. Each row has the skill name, one first-person line, a `data-diagram` list, and one proof link. The link's visible text is a word, not a URL. Test: `skills gallery shows the five public skills`.

| Visible name | Line | Diagram steps | Proof label | Proof URL |
| --- | --- | --- | --- | --- |
| Evaluation | I score example answers against the handbook, and the run does not call a model. | Example answers, Score, No model | Question set | `https://github.com/jakob-alexander2000/citebot-evals` |
| Verification | I mark the condition a sample answer drops. | Claim, Passage, Verdict | Checks | `https://retrieval-autopsy.vercel.app/` |
| Tool use | I stop the handbook agent after three tool calls, then the draft is checked. | Plan, At most three tools, Draft, Check | Harness | `https://citebot-chi.vercel.app/harness` |
| TypeScript | I typecheck the handbook app in CI, and that same CI builds it. | Typecheck, Build | CI | `https://github.com/jakob-alexander2000/citebot/blob/main/.github/workflows/ci.yml` |
| Retrieval | I answer from one handbook and keep the passage next to the answer. | Question, Passage, Cited answer | Ask | `https://citebot-chi.vercel.app/ask` |

`lib/skills.ts` is the only copy of those rows. `app/` and `components/` do not contain the proof URLs or a branch on a skill id. A test can pass five dummy rows and the page renders those rows instead. Test: `the shipped skills are the five public proofs`. Test: `five dummy skills render from a test definition`.

The diagrams are HTML text in the existing hairline boxes. They are not a card grid, and they do not animate. On the four viewports in section 2, nothing in the gallery overflows the viewport. Test: `skill diagrams fit the phone and the iPad`.

Reduced motion keeps every diagram step visible and starts no animation. Test: `reduced motion keeps the skill diagrams`.

Initial JavaScript stays at most 145,000 bytes gzip. Total transfer stays at most 260,000 bytes gzip. The gallery adds no client component and no script. The outcome budgets in the Close Reading spec are unchanged.

Visible text follows the Close Reading public-face rules: first person, no raw URL, no place name, no money language, no hire framing, no third person.

## 5. Plan

Render the section from `lib/skills.ts` on the server, after the shelf and before the footer. Reuse the page type, the hairline, and the paper and ground colours. Do not add a route.

Rejected alternative: a second page, a carousel, or a client canvas for the diagrams. The diagrams are five short sequences. A canvas would spend JavaScript the budget does not have, and a second page hides the proofs from the reader who already opened this one.

## 6. Tests

Playwright, Chromium and WebKit, in `test/skills.spec.ts`:

- `skills gallery shows the five public skills`
- `skill diagrams fit the phone and the iPad`
- `reduced motion keeps the skill diagrams`

Unit, in `test/skills.test.tsx`:

- `the shipped skills are the five public proofs`
- `five dummy skills render from a test definition`

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
- This site's own CI is public and was still left out of the TypeScript row, so the row would not point at a branch that is not what is shipped.
- The golden eval page was left out of the evaluation row so the row would not repeat the flagship's recorded run.
- Toolbar heights and owner-device checks stay in the Close Reading spec. This addendum does not mark them done.

## 10. Done

Local evidence is from 11 Nov 2026. Playwright on Chromium and WebKit passed 154 tests, 12 skipped, with the gallery on the page. The 12 skips are the original WebKit-only toolbar viewports on Chromium. After the diagram boxes were sized to their text, the three gallery tests and the axe checks passed again on both engines. Unit tests passed, including the shipped-skill lock and the five dummy rows. The gallery is server HTML. It adds no client module and no script.

One pass on the gallery, after the diagrams were drawn content-sized instead of stretched. Self-score: central idea 4, functional fit 5, hierarchy 4, typography 4, spacing and grid 4, color restraint 5, explanatory completeness 4, clear action 4, factual rigor 5, detail and accessibility 4. Total 43. Nothing below 4.

| Check | Test | Status |
| --- | --- | --- |
| Five public skills, lines, diagrams, and proof links | skills gallery shows the five public skills | Pass |
| Phone and iPad fit | skill diagrams fit the phone and the iPad | Pass |
| Reduced motion | reduced motion keeps the skill diagrams | Pass |
| Definition module | the shipped skills are the five public proofs | Pass |
| Dummy rows | five dummy skills render from a test definition | Pass |
| Rubric, one pass | review: rubric | Pass |
