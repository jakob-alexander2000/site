import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { handbookLines } from "../lib/schnitt-extract";

const CITEBOT = "2ec2319dd9b3a75e45d5e7773b3841f4afe3fff9";
const EVALS = "b9e2c8ba3c2b8f5f61a1a6e79d6af4470d9b3a45";

type Manifest = {
  pinned: string;
  citebot: { commit: string; upstream: Record<string, string>; files: Record<string, string> };
  citebotEvals: { commit: string; upstream: Record<string, string>; files: Record<string, string> };
};

async function raw(repo: string, commit: string, path: string) {
  const url = `https://raw.githubusercontent.com/jakob-alexander2000/${repo}/${commit}/${path}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

export function vendorVerify(text: string) {
  const cases = JSON.parse(text) as Array<{ name?: string }>;
  const kept = cases.filter((item) => item.name === "all pass is grounded" || item.name === "all fail is ungrounded");
  if (kept.length !== 2) throw new Error("The paid-leave verify cases are missing");
  return `${JSON.stringify(kept, null, 2)}\n`;
}

export function vendorGolden(text: string) {
  const golden = JSON.parse(text) as { cases?: Array<{ id?: string; question?: string }> };
  const found = golden.cases?.find((item) => item.id === "pto-days");
  if (!found?.question) throw new Error("The paid-leave question is missing");
  return `${JSON.stringify({ cases: [{ id: "pto-days", question: found.question }] }, null, 2)}\n`;
}

export function vendorHandbook(text: string) {
  const handbook = handbookLines(text);
  return `# Time off and leave\n\n## ${handbook.title}\n\n${handbook.lines.join("\n\n")}\n`;
}

export function vendorSample(text: string) {
  const score = /(\d+)\/(\d+) passed/.exec(text);
  const started = /Started:\*\*\s+(\d{1,2}) ([A-Za-z]+) (\d{4})/.exec(text);
  if (!score || score[1] !== score[2] || !started) throw new Error("The offline eval record is missing");
  return `# CiteBot eval report\n\n- **Started:** ${started[1]} ${started[2]} ${started[3]}\n- **Score:** ${score[1]} of ${score[2]} passed\n`;
}

function blob(text: string) {
  const bytes = Buffer.from(text);
  return createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
}

export async function vendoredRecords() {
  const [verify, golden, handbook, sample] = await Promise.all([
    raw("citebot", CITEBOT, "tests/fixtures/verify-cases.json"),
    raw("citebot", CITEBOT, "evals/golden.json"),
    raw("citebot", CITEBOT, "examples/nordlicht-corpus/pto-and-leave.md"),
    raw("citebot-evals", EVALS, "reports/SAMPLE.md"),
  ]);
  return {
    "content/fixtures/citebot/tests/fixtures/verify-cases.json": vendorVerify(verify),
    "content/fixtures/citebot/evals/golden.json": vendorGolden(golden),
    "content/fixtures/citebot/examples/nordlicht-corpus/pto-and-leave.md": vendorHandbook(handbook),
    "content/fixtures/citebot-evals/reports/SAMPLE.md": vendorSample(sample),
  };
}

async function main() {
  const records = await vendoredRecords();
  const manifest = JSON.parse(readFileSync("content/fixtures/manifest.json", "utf8")) as Manifest;
  manifest.citebot.commit = CITEBOT;
  manifest.citebotEvals.commit = EVALS;
  manifest.citebot.upstream = {
    "tests/fixtures/verify-cases.json": "914692a2350b8acf39a0de7a66da6eaba65b1895",
    "examples/nordlicht-corpus/pto-and-leave.md": "511f514b4742ebfc70af178224f59f1dd26543e5",
    "evals/golden.json": "9723431d89acb45874b33f369aeae85071cc4c5c",
  };
  manifest.citebotEvals.upstream = {
    "reports/SAMPLE.md": "1db253014188239e23d1fa95a6c707359dce67bf",
  };
  for (const [path, text] of Object.entries(records)) {
    writeFileSync(path, text);
    const sha = blob(text);
    if (path.includes("citebot-evals")) manifest.citebotEvals.files["reports/SAMPLE.md"] = sha;
    else if (path.endsWith("verify-cases.json")) manifest.citebot.files["tests/fixtures/verify-cases.json"] = sha;
    else if (path.endsWith("golden.json")) manifest.citebot.files["evals/golden.json"] = sha;
    else manifest.citebot.files["examples/nordlicht-corpus/pto-and-leave.md"] = sha;
  }
  writeFileSync("content/fixtures/manifest.json", `${JSON.stringify(manifest, null, 2)}\n`);
  console.log("vendored the records the hero reads");
}

if (process.argv[1]?.includes("vendor-fixtures")) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}
