# Noir

Black, white, and one grey. Type does the work. Each look is one real screenshot.

| Token | Value | Role |
| --- | --- | --- |
| `--black` | `#000000` | Ground |
| `--white` | `#ffffff` | Sentences, links, focus |
| `--grey` | `#8c8c8c` | Garment tags. 6.25:1 on black |
| settle | 1.2 s | One change from grey to colour |

## Type

- Geist 100 for the name. Geist 200 for look titles and sentences.
- Geist Mono 400 for tags, the contact block, and captions.
- Instrument Serif italic, once, on the opening screen.

Nothing is set below 16px. Links and buttons are at least 44px.

## Motion

Grain behind the type is a generated turbulence tile. Each screenshot starts in greyscale, with a second generated turbulence tile over the image only. When the image enters the viewport it settles once into the true-colour file over 1.2s. `SETTLE_MS` in `lib/reveal.ts` is that duration. There is no loop and no video. `prefers-reduced-motion` shows the colour image immediately, with no transition. On a fine pointer, hover may also clear the grey. Hover is not required.

## Adding a look

Put the screenshot in `public/recordings`. Add the look to `lib/looks.ts` with a proof (`repo`, `file`, `line`, `excerpt`). The sentence on the page has to contain that excerpt. If the product page is public, link it. If it is not, say that the product page is coming. Names that are not ready stay in `lib/shelf.ts` and are not rendered.
