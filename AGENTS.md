<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Jakob Alex site

Close Reading. Read `docs/specs/close-reading.md` and `DESIGN.md` before changing type, color, or motion.

The home page reads `lib/flagship.ts` and `lib/proof-shelf.ts`. Swapping the flagship replaces that definition. Adding a shelf entry appends a definition. Do not branch on an entry id in `app/` or `components/`.

`lib/contact.ts` is the only contact config. `phone` stays `null`. `email` is the one allowed address (`ALLOWED_EMAIL`). The visible links say GitHub and Email.

Write about Jakob Alex in the first person.

```bash
npm run build
npm run typecheck
npm run lint
npm test
```
