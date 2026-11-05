# Jakob Alex

Personal site. An opening line and three looks: CiteBot, Retrieval Autopsy, and Voice check (Style Distance).

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
