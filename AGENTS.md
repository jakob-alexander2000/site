<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Jakob Alex site

Noir lookbook. Read DESIGN.md before changing type, color, or motion.

The home page is the opening line plus the looks in `lib/looks.ts`. Each look needs a recording, a poster, a live URL, and a proof whose excerpt is on the page. `lib/shelf.ts` lists names that are not rendered. Move one into `lib/looks.ts` only after the recording and the proof exist.

`lib/contact.ts` is the only contact config. `phone` stays `null`, so no phone row renders. `email` is the one allowed address (`ALLOWED_EMAIL`), a `mailto:` link next to GitHub. The copy scan and the end-to-end test "no page shows an email address other than the contact address" fail on any other address.

Write about Jakob Alex in the first person. Run `npm run build` and then `node --import tsx scripts/scan-copy.ts`.

The still is dithered. Play shows the clip in greyscale, once. `REVEAL_MS` in `lib/reveal.ts` is the length. Reduced motion keeps the still. If the clip or the canvas fails, the still stays. `showCiteBotLive` in `lib/looks.ts` is false until the public CiteBot deployment answers again.

```bash
npm run build
npm run typecheck
npm run lint
npm test
```
