Does this already exist?
No: this is a site-specific layout fix; no vendor will ship it.

# Hero-one and plus-mark test map

Base 423f0c8 → code 00e158a (on 15e4986). Line numbers refer to the new files unless noted.

The double intro was still present at 423f0c8: the hero footer said "PATTERN 01 · CITEBOT · EXPLODED VIEW" and section 1 opened with "01 · CITEBOT" plus the old title. Before shots: before-390-join.png, before-1440-hero.png.

## New: one test per H row — test/hero-one-project.spec.ts

| Row | What it checks | Mutation that makes it fail |
|---|---|---|
| H1 | the hero shows numeral 01 and label CITEBOT with the same kicker font-family and size as the section header (390, 1440) | drop the kicker class from PlateKicker |
| H2 | CiteBot as a project label appears once in hero + section 1 headings; section 1 does not repeat the old title or "01 · CITEBOT" (390, 1440) | restore the old section 1 kicker and headline |
| H3 | a visible hero link with a hairline points at #citebot; the text is “See the parts”, not the section label (390, 1440) | restore the repeated “The parts in detail” link |
| H4 | no sideways overflow at 390×844 | drop overflow-x clip and force a 520px sticky frame |

## New: one test per P row — test/plus-marks.spec.ts

| Row | What it checks | Mutation that makes it fail |
|---|---|---|
| P1 | at 1440 every + is a register mark and no layer note is shown twice; at 390 every visible + is a button with aria-expanded, or a register mark (aria-hidden, not focusable) | keep the plus as a button when the note is already visible |
| P2 | click opens the callout and sets aria-expanded true; a second click or Escape closes it (390) | remove the click handler |
| P3 | Tab reaches each plus button and Enter toggles it (390) | tabindex="-1" on the buttons |
| P4 | each plus button is at least 44×44 CSS px at 390×844 | set the phone hit area to 24px |
| P5 | an open callout stays in the viewport and does not intersect the card heading text (390) | absolutely position the callout over the card heading |

## Removed or changed assertions

| Base file:line | Was | Now |
|---|---|---|
| test/schnitt-page.spec.ts:9 | served HTML must contain CITEBOT_PLATE.headline | the headline is no longer an intro; assert "The parts in detail" instead |
| test/schnitt-page.spec.ts:64 | heading CITEBOT_PLATE.headline is visible with JS off | heading "The parts in detail" is visible |
| test/plates.test.tsx:16 | Plates HTML includes CITEBOT_PLATE.headline | includes "The parts in detail" and does not include the old headline |

C1–C10 in test/citebot-read.spec.ts are unchanged. The figcaption still carries CITEBOT_PLATE.body, which C6 requires.

## Plus marks

- Buttons (4, phone / narrow only, where the layer note is hidden): A Handbook (“Source document”), B Passages (“Retrieved for this question”), C Sentences (“Recorded claims”), D Verdict (“A result per sentence”).
- Register marks: the same four layer marks become register marks at 1440, where the note is already visible; plus 4 crop marks on the hero stage; plus 4 sheet-rule marks each on About, Contact, and Footer.
