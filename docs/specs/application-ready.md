# Application-ready page

**Does this already exist?** No. PR 31 (`cursor/schnitt-full-page`) has the Schnitt hero and three CiteBot-family plates, but no Persona, no project pictures, a skills strip that does not point at work, and ad-hoc type sizes.
**Reuse:** builds on PR 31's head (6cc2bef): the same 3D stage, fonts, motion and copy scan. The hero copy, the header nav and the links in it changed; the sections below the hero are replaced.

## Goal

A reader gets the page in thirty seconds: who I am, the work, the proof, how to reach me.

## Changes

1. Hero copy and header changed: who-I-am line "I’m Jakob Alex. I\u00a0build AI products you can check." (non-breaking space after I), a "Flagship: Persona" link under it, a Work / Skills / About / Contact nav, an Email link, and no big number, no GitHub link and no "See CiteBot run" links. The 3D stage is unchanged; phones and reduced motion stay on the flat drawing.
2. A five-step type scale (`--t-label`, `--t-body`, `--t-lead`, `--t-title`, `--t-display`) replaces every ad-hoc size.
3. Selected work: Persona (flagship, formerly Dockbot), CiteBot, Retrieval Autopsy, Style Distance. One picture each, none repeated, none the same as the hero.
4. Skills rebuilt as proof: each row links to the project on the page that shows it, or to public proof (the TypeScript and Playwright row links to this site's own test suite).
5. About with a framed slot for the line-drawing portrait. It renders only when `public/portrait.svg` or `public/portrait.png` exists (see HANDOFF.md).
6. Contact is one email link. The footer keeps "Source of this site".
7. The CiteBot plate drawings, the skills strip and their tests are removed; the hero tests stay.

## Checks

`test/application-ready.spec.ts`, written first and red on 6cc2bef:

- the who-I-am line ends above the fold at 390x844 and 1440x900
- three or four projects, Persona first
- one picture per project, no repeated source
- every skill links to an in-page project anchor
- the contact section is one `mailto:` link, one address on the page, no `tel:`
- no portrait slot while the file is missing; the slot renders when it exists
- every computed text size outside the hero drawing is one of the five steps, at 390, 768 and 1440
- iPhone portrait stays flat
- no banned framing in the page text; no sideways scroll at 390, 768 and 1440

## Round 3

- Persona picture is real HTML text; the CiteBot and Style Distance pictures are recaptured tight on 320px-wide live pages; the Autopsy crop is cut on card boundaries. A test checks effective text size at 390px.
- Hero: a watchdog shows the flat drawing if the 3D scene never becomes ready; a resize redraws the flat thread; phone cards no longer run into the footer.
- Dead plate code removed: `public/plates`, `scripts/raster-plates.mjs`, `lib/plate-bake.ts`, the plate lookups in `components/schnitt-scene.ts`.

## Open

- The Persona repository is private, so its card has no link.
- The portrait slot is hidden until the drawing exists.
