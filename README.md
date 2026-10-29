# Jakob Alex

Source for the personal site. Four instruments: **CiteBot**, **citebot-evals**, **Desk**, and **desk-index**.

- **CiteBot:** [live app](https://citebot-chi.vercel.app/ask) · [how the check works](https://citebot-chi.vercel.app/harness) · [source](https://github.com/jakob-alexander2000/citebot)
- **citebot-evals:** in-page recorded run of the saved 18/18 scorecard · [source](https://github.com/jakob-alexander2000/citebot-evals)
- **Desk:** in-page search of a sample folder · [source](https://github.com/jakob-alexander2000/desk)
- **desk-index:** in-page ranking of the same folder · [source](https://github.com/jakob-alexander2000/desk-index)

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
