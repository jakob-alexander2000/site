# Set

Black ground, a near-black sheet, white type, one grey. Scroll moves through four sheets. The sheet you are reading is frontal and as tall as its content, so the limits, the replay control, and the evidence plate are reached by ordinary scrolling. The next sheet sits farther back and smaller. It overlaps the trailing space of the sheet in front, not the words or the controls.

Reduced motion and no JavaScript leave the sheets in a vertical stack. The diagrams stay readable either way. A viewport shorter than 520px also uses that stack, so type is not clipped.

## Type

- Geist 100 for the name. Geist 200 for titles and sentences.
- Geist Mono 400 for labels, contact, captions, and diagram kickers.
- Instrument Serif italic, once, on the opening word.

Nothing is set below 16px. Links and buttons are at least 44px.

## Diagrams

Each look draws the path of that product: input, mechanism, output, and the limits of that path. CiteBot’s sheet is the offline check. It does not call a model. The still is the evidence plate.

## Adding a look

Put the screenshot in `public/recordings`. Add the look to `lib/looks.ts` with a proof (`repo`, `file`, `line`, `excerpt`). The sentence on the page has to contain that excerpt. If the product page is public, link it. If it is not, say that the product page is coming. Names that are not ready stay in `lib/shelf.ts` and are not rendered. A new look also needs a sourced diagram.
