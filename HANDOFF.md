# Handoff

The lookbook checks that used to live in `test/noir.spec.ts` now live on the Schnitt page.

| What it locked | Where it lives now |
| --- | --- |
| Opening line, contact, one email | `test/schnitt.spec.ts` and `test/schnitt-page.spec.ts` |
| Tap targets, contrast, sideways scroll, the main link on the first screen, no iframes | `test/schnitt-page.spec.ts` "the limits kept from the old page hold" |
| No video | `test/looks.test.ts` and the page spec |
| Copy scan | `scripts/scan-copy.ts`, including `content/fixtures` and `.json` |

The hero is specified in `docs/specs/schnitt-hero.md`. Below it: 01 Selected work (Persona, CiteBot, Retrieval Autopsy, Style Distance), 02 Skills, 03 About, 04 Contact. The application-ready checks are in `test/application-ready.spec.ts`.
