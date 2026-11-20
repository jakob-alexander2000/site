# Handoff

The lookbook checks that used to live in `test/noir.spec.ts` now live on the Schnitt page.

| What it locked | Where it lives now |
| --- | --- |
| Opening line, contact, one email | `test/schnitt.spec.ts` and `test/schnitt-page.spec.ts` |
| Tap targets, contrast, sideways scroll, the main link on the first screen, no iframes | `test/schnitt-page.spec.ts` "the limits kept from the old page hold" |
| No video | `test/looks.test.ts` and the page spec |
| Copy scan | `scripts/scan-copy.ts`, including `content/fixtures` and `.json` |

The hero is specified in `docs/specs/schnitt-hero.md`. Below it: 01 Selected work (Persona, CiteBot, Retrieval Autopsy, Style Distance), 02 Skills, 03 About, 04 Contact. The application-ready checks are in `test/application-ready.spec.ts`.

## Portrait

The About section shows a line-drawing portrait only when the file exists. Put the drawing at `public/portrait.svg` (or `public/portrait.png`), rebuild, and the framed slot appears next to the About text. With no file there is no slot, so the page never shows an empty box. `lib/portrait.ts` checks the files at build time and `components/PortraitSlot.tsx` renders the frame.

## Pictures and text size

Each raster work picture carries `data-min-text-px`, the smallest text size in the image at its own pixel width. `test/round3.spec.ts` multiplies it by the rendered scale at 390px and fails below 11px. The Persona picture is real HTML text, so the five-step type scale covers it.

## Hero fallback

If the 3D scene is not ready after 10 visible seconds (for example no frames in a background tab), `components/SchnittStage.tsx` shows the flat drawing instead of a blank hero. A resize redraws the flat drawing's thread.
