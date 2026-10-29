# Jakob Alex

Source for the personal site. Four instruments: **CiteBot**, **citebot-evals**, **Desk**, and **desk-index**.

- **CiteBot:** [live](https://citebot-chi.vercel.app) · [verify writeup](https://citebot-chi.vercel.app/harness) · [source](https://github.com/jakob-alexander2000/citebot)
- **citebot-evals:** [scorecard](https://github.com/jakob-alexander2000/citebot-evals#scorecard-fixture) (18/18 fixture)
- **Desk:** [60-second run](https://github.com/jakob-alexander2000/desk#60-second-run)
- **desk-index:** [demo](https://github.com/jakob-alexander2000/desk-index#demo)

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
