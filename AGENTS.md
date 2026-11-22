<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Jakob Alex site

Studio. Read DESIGN.md before changing type, color, or motion.

The home page is the hero with Fig. 1, the work index, Persona, Answer checks, the German document QA benchmark, the Studio section (`components/StudioSection.tsx`), the Log, About and Contact. Projects live in `lib/work.ts`, the four layers and Persona's brief, spec and receipt in `lib/studio.ts`, dated entries in `lib/log.ts`. Fun projects such as Vierspur live on `/playground`, never on the home page.

Only facts go on the page. A number appears only when it has been measured; until then it is left out, not shown as a placeholder. Log entries are things that happened.

The status strip shows the build commit and date from `next.config.ts` (`BUILD_COMMIT`, `BUILD_DATE`) and the `NOW` line in `lib/studio.ts`.

`lib/contact.ts` is the only contact config. `phone` stays `null`, so no phone row renders. `email` is the one allowed address (`ALLOWED_EMAIL`), a `mailto:` button next to GitHub. The copy scan and the end-to-end test fail on any other address.

Write about Jakob Alex in the first person. Run `npm run build` and then `node --import tsx scripts/scan-copy.ts`.

```bash
npm run build
npm run typecheck
npm run lint
npm test
```
