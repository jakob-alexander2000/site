# Noir

Black, white, and one grey. Type does the work. Recordings are dithered in the browser.

| Token | Value | Role |
| --- | --- | --- |
| `--black` | `#000000` | Ground |
| `--white` | `#ffffff` | Sentences, links, focus |
| `--grey` | `#8c8c8c` | Garment tags. 6.25:1 on black |
| clip length | at least 4 s | One play, at normal speed |

## Type

- Geist 100 for the name. Geist 200 for look titles and sentences.
- Geist Mono 400 for tags, the contact block, and `Recording`.
- Instrument Serif italic, once, on the opening screen.

Nothing is set below 16px.

## Motion

Grain is a generated turbulence tile behind the type. Each still is a close crop, dithered on a canvas at the frame's own resolution. Hover, tap, and keyboard play the clip once, in greyscale, at normal speed. `prefers-reduced-motion` keeps the dithered still. If the clip or the canvas fails, the still stays and a line says so.

## Adding a look

Put the recording and poster in `public/recordings`. Add the look to `lib/looks.ts` with the live URL and a proof (`repo`, `file`, `line`, `excerpt`). The sentence on the page has to contain that excerpt. Names that are not ready stay in `lib/shelf.ts` and are not rendered.
