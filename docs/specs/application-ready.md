# Application-ready page

**Does this already exist?** No. PR 31 (`cursor/schnitt-full-page`) has the Schnitt hero and three CiteBot-family plates, but no Persona, no project pictures, a skills strip that does not point at work, and ad-hoc type sizes.
**Reuse:** builds on PR 31's head (6cc2bef): same hero, 3D stage, fonts, motion and copy scan. Only the sections below the hero are replaced.

## Goal

A reader gets the page in thirty seconds: who I am, the work, the proof, how to reach me.

## Changes

1. Who-I-am line in the hero: "I’m Jakob Alex. I build AI products you can check." The 3D hero stays; phones and reduced motion stay on the flat drawing.
2. A five-step type scale (`--t-label`, `--t-body`, `--t-lead`, `--t-title`, `--t-display`) replaces every ad-hoc size.
3. Selected work: Persona (flagship, formerly Dockbot), CiteBot, Retrieval Autopsy, Style Distance. One picture each, none repeated, none the same as the hero.
4. Skills rebuilt as proof: each row names the project that shows it and links to it.
5. About with a marked slot for the line-drawing portrait.
6. Contact is one email link.
7. The CiteBot plate drawings, the skills strip and their tests are removed; the hero tests stay.

## Checks

`test/application-ready.spec.ts`, written first and red on 6cc2bef:

- the who-I-am line ends above the fold at 390x844 and 1440x900
- three or four projects, Persona first
- one picture per project, no repeated source
- every skill links to an in-page project anchor
- the contact section is one `mailto:` link, one address on the page, no `tel:`
- a portrait slot is present
- every computed text size outside the hero drawing is one of the five steps, at 390, 768 and 1440
- iPhone portrait stays flat
- no banned framing in the page text; no sideways scroll at 390, 768 and 1440

## Open

- The Persona repository is private, so its card has no link.
- The portrait is a placeholder until the drawing exists.
