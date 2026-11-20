# Schnitt

Paper, ink, and one red pen. The page is a set of construction drawings.

| Token | Value | Role |
| --- | --- | --- |
| `--paper` | `#F7F7F5` | Page |
| `--sheet` | `#FBFAF7` | Sheets |
| `--ink` | `#111111` | Type and rules |
| `--fail` | `#C6302A` | Fail and the pen |

## Type

Five steps, defined in `app/globals.css`. Every text size on the page is one of them; `test/application-ready.spec.ts` fails on any other computed size outside the hero drawing.

| Token | Size | Use |
| --- | --- | --- |
| `--t-label` | 12px | Geist Mono labels, captions, kickers |
| `--t-body` | 17px | Geist 300 body, links |
| `--t-lead` | 22px | Project names, the name in the header, the address |
| `--t-title` | clamp(2rem, 3.4vw, 3rem) | Section titles, the flagship name |
| `--t-display` | clamp(2.5rem, 4.4vw, 4.25rem) | The who-I-am line |

- Geist 200 for display and titles.
- Instrument Serif italic, once, on the word check.

Labels sit on leaders. Links and buttons are at least 44px. The theme color is paper.

## Motion

Desktop scroll moves one camera through the hero. Phones, reduced motion, and a missing WebGL context stay on the flat drawing. There is no video.
