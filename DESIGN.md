# Design tokens

The site is built only from the tokens below. Do not introduce a color, type size, space, or radius that is not listed here.

## Color

| Token | Value | Use |
| --- | --- | --- |
| `ink` | `#111111` | All body text and headings |
| `paper` | `#F7F7F5` | Background |
| `gray-1` | `#6B6B6B` | Labels, secondary text, 12-pixel meta |
| `gray-2` | `#A3A3A3` | Link underlines only |
| `gray-3` | `#E5E5E3` | Hairlines |
| `accent` | `#E63312` | The 4-pixel bar on a failed claim |
| `accent-text` | `#C42B0F` | Reserved. Use only if a red word is ever required |

Contrast rules:

- `gray-1` (`#6B6B6B`) is allowed on `paper` only. Never place it on `#E5E5E3`.
- `gray-2` (`#A3A3A3`) draws link underlines only. Never use it as text.
- `gray-3` (`#E5E5E3`) is a hairline. Never use it as a text background.
- `accent` (`#E63312`) is a mark only: the single red line on the planted wrong answer. Never use it as text or as a button fill.
- If a red word is ever needed, use `accent-text` (`#C42B0F`). It is unused today.

## Type

Family: Inter, weights 400 and 500 only. Numbers use tabular figures.

| Size | Line height | Weight | Use |
| --- | --- | --- | --- |
| 96 | 1.0 | 500 | Name on desktop, tracking −3 percent |
| 48 | 1.0 | 500 | Name on mobile, same tracking |
| 24 | 1.33 | 500 for names, 400 for sentences | Hero sentence, project names, About sentence |
| 16 | 1.5 | 400, 500 for the current nav item and for Pass or Fail | Body, links, labels |
| 12 | 1.5 | 400 | Stack line, colophon, copyright, in `gray-1`, tracking +2 percent |

Tracking is opt-in. `letter-spacing` is inherited, and Chromium adds it after the hyphen character, which opens a gap in `citebot-evals`, `desk-index`, `Full-time`, and `pto-and-leave.md`. The −3 percent tracking sits only on the name. The +2 percent tracking sits only on the stack line, the colophon, and the copyright, none of which contain a hyphen. Every string that contains a hyphen renders the hyphen in its own span with tracking set back to zero.

## Space

8, 16, 24, 32, 48, 64, 96, 128.

In CSS these are `--s1` through `--s4`, then `--s6`, `--s8`, `--s12`, and `--s16`.

## Grid

12 columns, 24-pixel gutter, 1200 maximum. Labels sit in columns 1 to 3. Content sits in columns 4 to 10. Page margin is 48 on desktop and 24 below 720 pixels wide.

## Radius

0 by default. 2 on inputs. 4 at most. The current pages have no inputs, so every corner is 0.

## Motion

150 milliseconds, ease-out, and only the underline color. No other property animates. When the visitor asks for reduced motion, the underline does not animate.
