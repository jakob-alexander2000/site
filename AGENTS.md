<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Jakob Alex site

Schnitt plates. Read DESIGN.md before changing type, color, or motion.

The home page is the Schnitt hero (`docs/specs/schnitt-hero.md`) and the plates in `components/Plates.tsx`. Projects on the page are CiteBot, Retrieval Autopsy, and Style Distance. `lib/shelf.ts` lists names that are not rendered. `showCiteBotLive` in `lib/looks.ts` stays false, so Ask stays hidden.

`lib/contact.ts` is the only contact config. `phone` stays `null`, so no phone row renders. `email` is the one allowed address (`ALLOWED_EMAIL`), a `mailto:` link next to GitHub. The copy scan fails on any other address, and on gear brands, a currency mark next to a digit, or a fixture place name.

Write about Jakob Alex in the first person. Run `npm run build` and then `node --import tsx scripts/scan-copy.ts`.

There is no video.

```bash
npm run build
npm run typecheck
npm run lint
npm test
```
