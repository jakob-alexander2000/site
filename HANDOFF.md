# Handoff

## Studio rebuild (branch `claude/studio-site`)

Replaces the Noir lookbook with the Studio design: hero with Fig. 1, work index, Persona, Answer checks, the German document QA benchmark, the Studio section (Fig. 1 pulled apart, one layer per row), Log, About, Contact, and a separate `/playground` page for Vierspur.

| Check | Result |
| --- | --- |
| `npm run build` | pass |
| `npm run typecheck` | pass |
| `npm run lint` | pass |
| Unit tests | 8 of 8 pass |
| Copy scan | pass |
| Playwright, Chromium | 10 of 10 pass at 390, 744 and 1280 px |
| Playwright, WebKit | not run locally, CI runs it |

## Decisions to review

- The `vierspur` copy-scan rule is removed, because Vierspur now has its own playground page.
- Persona numbers are left out until they are measured. The receipt shows the published example only.
- The benchmark is marked "Next", not "In progress".
- Lighthouse has not been run.
