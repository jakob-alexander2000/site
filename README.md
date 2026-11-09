# Jakob Alex

Personal site. Selected work: an opening line and three looks: CiteBot, Retrieval Autopsy, and Voice check (Style Distance).

## Local

Node.js 22 or newer (`engines` in package.json; GitHub Actions uses 22).

```bash
npm install
npm run dev
```

## Check

```bash
npm run build
npm run typecheck
npm run lint
npm test
```

`npm test` runs the unit checks, the copy scan against source and the production build, then Playwright in Chromium and WebKit. Build first so the scan can read `.next`.

Run one layer on its own: `npm run test:unit`, `npm run test:scan` (copy scan, needs a build first) or `npm run test:e2e`.

## Layout

- `app/`: the page, layout and global styles.
- `components/`: the look view, product stills and contact block.
- `lib/looks.ts`: the opening line and the copy for each look.
- `scripts/scan-copy.ts`: the copy scan.
- `test/`: unit tests and Playwright specs.
- `DESIGN.md`, `AGENTS.md`: design rules and working notes.
