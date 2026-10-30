# Jakob Alex

Source for the personal site. Six instruments: **CiteBot**, **citebot-evals**, **Retrieval Autopsy**, **Style Distance**, **Desk**, and **desk-index**.

- **CiteBot:** [live app](https://citebot-chi.vercel.app/ask) · [how the check works](https://citebot-chi.vercel.app/harness) · [source](https://github.com/jakob-alexander2000/citebot)
- **citebot-evals:** in-page recorded run, 18 of 18 example answers · [source](https://github.com/jakob-alexander2000/citebot-evals)
- **Retrieval Autopsy:** [live app](https://retrieval-autopsy.vercel.app) · [source](https://github.com/jakob-alexander2000/retrieval-autopsy). The card replays the sample annual-leave answer that drops a limit.
- **Style Distance:** [live app](https://style-distance.vercel.app) · [source](https://github.com/jakob-alexander2000/style-distance). It measures distance from a house voice with Burrows Delta. The card replays the synthetic sample.
- **Desk:** [source](https://github.com/jakob-alexander2000/desk). Its own search is `src/retrieve.ts`. The page answers questions and does not write reports.
- **desk-index:** [source](https://github.com/jakob-alexander2000/desk-index). A small Go search service for Markdown notes. It searches notes without calling an AI, and it does not power Desk.

CiteBot, Retrieval Autopsy, and Style Distance are the live apps. The other three run on this page. Repository links are labeled Source.

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
