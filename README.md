# Jakob Alex

Source for the personal site. Four instruments: **CiteBot**, **citebot-evals**, **Desk**, and **desk-index**.

- **CiteBot:** [live app](https://citebot-chi.vercel.app/ask) · [how the check works](https://citebot-chi.vercel.app/harness) · [source](https://github.com/jakob-alexander2000/citebot)
- **citebot-evals:** in-page recorded run, 18 of 18 example answers · [source](https://github.com/jakob-alexander2000/citebot-evals)
- **Desk:** [source](https://github.com/jakob-alexander2000/desk). Its own search is `src/retrieve.ts`. The page answers questions and does not write reports.
- **desk-index:** [source](https://github.com/jakob-alexander2000/desk-index). A small Go search service for Markdown notes. It searches notes without calling an AI, and it does not power Desk.

CiteBot is the only live app. The other three run on this page. Repository links are labeled Source.

## Stack

Next.js (App Router) · TypeScript · Vercel

## Local

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

`npm test` scores the saved eval fixture, checks the in-browser note rankers, then serves the production build and reads the pages.
