dc752f5b11eff38f0888ada03b9f5eeeb9b55471

# CiteBot test map

Base f29264c → code dc752f5. Line numbers refer to the base file, then the new file.

## New: one test per C row — test/citebot-read.spec.ts

| Row | What it checks | Mutation that makes it fail |
|---|---|---|
| C1 | question → source → answer order in the drawing columns, the phone stack and the accessibility tree (390, 1440) | swap Source and Answer |
| C2 | exactly the labels Question, Source, Answer; no all-caps step words (390, 1440) | add a fourth label |
| C3 | S2 is strictly the largest type; exactly one red element, under 5% of the figure (375–1920) | question 32px / 44 units; FAIL label red |
| C4 | the citation line ends on the span (≤4px), starts at [1] (≤8px), keeps >24px off S2, crosses no label (390–1920) | end moved 30px / 20 units |
| C5 | phone type sizes; no clipping or sideways scroll on 375/390/430 both orientations and iPad mini; drawn type ≥11px at 1100–1920 | sentences 20px; refusal 12 units; fixed 460px stack |
| C6 | every visible string comes from the run or the plate copy; spans and caption equal the source strings | one word changed in drawn S1 |
| C7 | reduced motion: no animation over 600ms, frames identical with and without reduce | 900ms ring draw-in |
| C8 | no cut runway; figure ≤1.2 screens at 390×844, ≤800px at 1280×800 | runway restored |
| C9 | each bake matches band width × scale and the viewBox aspect within 0.01 | old bakes restored |
| C10 | full npm run verify green with --retries=0, frame-budget test unchanged (verify.log) | — |

## Removed or changed assertions

| Base file:line | Was | Now |
|---|---|---|
| test/plates-draw.spec.ts:4 | title "a six-step rail with source and harness only" | re-pointed → C1/C2 (new :4, "reads question, source, answer…") |
| test/plates-draw.spec.ts:17-20 | six .rail-sheet and step kickers | re-pointed → C2 (stack labels = Question, Source, Answer) |
| test/plates-draw.spec.ts:22-24 | two dashed .rail-fail paths | deleted: ladder-only |
| test/plates-draw.spec.ts:25-26 | .rail-steps column | deleted: ladder-only (replaced by stack visible → C1) |
| test/plate-leaders.spec.ts:3-51 | step leaders meet their sheets (1024/1280/1440) | re-pointed → C4 (citation line meets [1] and the span) |
| test/plate-leaders.spec.ts:53-103 | dashed failure paths stay out of the step labels (1280/1440) | deleted: ladder-only (general no-label-crossing → C4) |
| test/plate-grammar.spec.ts:46-85 | failure sheets hang from their step | deleted: ladder-only |
| test/plate-grammar.spec.ts:87-94 | the verdict FAIL sentence is the split sentence that failed | re-pointed → C6 (new :46, drawing S2 = phone S2) |
| test/plate-grammar.spec.ts:96-122 | a dashed hang does not cross a leader | deleted: ladder-only |
| test/plate-fit.spec.ts:7,13,17-18,23-24,27,56-57,62-63 | sheet groups by step, refusal in step 5, verdict in step 6 | re-pointed → C6 (groups are g[data-col]; source holds the refusal, answer holds "S2 FAIL evidence") |

## Counts

- Deleted, ladder-only: 3 tests (plate-leaders test 2, plate-grammar hang ×2) + 2 assertion groups (plates-draw L22-26).
- Re-pointed: 4 tests (plates-draw test 1, plate-leaders test 1, plate-grammar FAIL-sentence test, plate-fit test 1).
- New: 9 row tests (C1–C9) in test/citebot-read.spec.ts; C10 is the verify log.

## Byte-identical check outside #citebot

Every top-level test block in test/ compared between f29264c and dc752f5 (script splits on top-level test( / for ( blocks):

```
files byte-identical: 19
CHANGED test/plate-fit.spec.ts for (const width of [1280, 1366, 1440]) {
CHANGED test/plate-leaders.spec.ts for (const width of [1024, 1280, 1440]) {
REMOVED/RETITLED test/plate-grammar.spec.ts test("failure sheets hang from their step", async ({ page }) => {
REMOVED/RETITLED test/plate-grammar.spec.ts test("the verdict FAIL sentence is the split sentence that failed", async ({ page }) => {
REMOVED/RETITLED test/plate-grammar.spec.ts test("a dashed hang does not cross a leader", async ({ page }) => {
REMOVED/RETITLED test/plate-leaders.spec.ts for (const width of [1280, 1440]) {
REMOVED/RETITLED test/plates-draw.spec.ts test("the citebot plate is a six-step rail with source and harness only", async ({ page }) => {
```

All other blocks in those four files, and all other test files, are byte-identical.
