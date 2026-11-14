# Handoff

The lookbook checks that used to live in `test/noir.spec.ts` now live on the Schnitt page.

| What it locked | Where it lives now |
| --- | --- |
| Opening line, contact, one email | `test/schnitt.spec.ts` and `test/schnitt-page.spec.ts` |
| Tap targets, contrast, sideways scroll, the main link on the first screen, no iframes | `test/schnitt-page.spec.ts` "the limits kept from the old page hold" |
| No video | `test/looks.test.ts` and the page spec |
| Copy scan | `scripts/scan-copy.ts`, including `content/fixtures` and `.json` |

The hero is specified in `docs/specs/schnitt-hero.md`. Plates 01–03 are CiteBot, Retrieval Autopsy, and Style Distance.
