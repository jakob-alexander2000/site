async function main() {
  const url = process.argv[2];
if (!url) {
  console.error("Usage: npm run check:live -- https://citebot-chi.vercel.app");
  process.exit(1);
}

const targets = [
  "https://github.com/jakob-alexander2000/citebot-evals",
  "https://retrieval-autopsy.vercel.app/",
  "https://citebot-chi.vercel.app/",
  url.endsWith("/ask") ? url : `${url.replace(/\/$/, "")}/ask`,
];

for (const target of targets) {
  const response = await fetch(target, { redirect: "follow" });
  if (response.status !== 200) {
    console.error(`${response.status} ${target}`);
    process.exit(1);
  }
  console.log(`200 ${target}`);
}

const started = Date.now();
const response = await fetch("https://citebot-chi.vercel.app/api/chat", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ question: "How many paid vacation days do full-time employees get?" }),
});
const elapsed = Date.now() - started;
const body = (await response.json()) as { verification?: { claims?: Array<{ verdict?: string }> } };
const verdicts = (body.verification?.claims ?? []).map((claim) => claim.verdict).filter((verdict) => Boolean(verdict));
console.log(`chat ${response.status} ${elapsed}ms verdicts ${verdicts.join(",") || "none"}`);
  if (response.status !== 200 || elapsed > 10_000 || verdicts.length === 0) process.exit(1);
}

void main();
