<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Jakob Alex site

Spatial set. Read DESIGN.md before changing type, color, or motion.

The home page is one volume: an opening plane and the looks in `lib/looks.ts`. Scroll moves through the planes when motion is allowed. Reduced motion and no JavaScript keep a vertical stack. Each look has a diagram of that product's real path, a still, and a proof whose excerpt is on the page. Link the product page only when it is public. Otherwise the caption block says the product page is coming. `lib/shelf.ts` lists names that are not rendered.

`lib/contact.ts` is the only contact config. `phone` stays `null`, so no phone row renders. `email` is the one allowed address (`ALLOWED_EMAIL`), a `mailto:` link next to GitHub. The copy scan and the end-to-end test "no page shows an email address other than the contact address" fail on any other address.

Write about Jakob Alex in the first person. Run `npm run build` and then `node --import tsx scripts/scan-copy.ts`.

CiteBot's diagram is the offline check. `showCiteBotLive` in `lib/looks.ts` is false until the public CiteBot deployment answers again. There is no video.

```bash
npm run build
npm run typecheck
npm run lint
npm test
```
