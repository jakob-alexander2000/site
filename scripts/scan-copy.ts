import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

export type Hit = { rule: string; file: string; email?: string };

const TEXT = new Set([".ts", ".tsx", ".js", ".mjs", ".css", ".md", ".svg", ".txt", ".html", ".rsc"]);

const RULES: ReadonlyArray<readonly [string, RegExp]> = [
  ["made-in-berlin", /made in berlin/i],
  ["guitar", /guitar/i],
  ["cost", /the cost is/i],
  ["commit-count", /\bcommit counts?\b|\b\d+\s+commits?\b/i],
  ["self-taught", /self-taught/i],
  ["taught-himself", /taught himself/i],
  ["taught-myself", /taught myself/i],
  [
    "third-person",
    /\b(he|him|his|himself|she|her|hers)\b|\bJakob Alexander\b|\bJakob Alex (builds|is|was|has|had|does|did|lives|writes|studied|studies|comes|reads|makes|works)\b/i,
  ],
  ["ledger", /ledger/i],
  ["grounded-docs", /grounded docs/i],
  ["mittelstand", /mittelstand/i],
  ["white-label", /white-label/i],
  ["vierspur", /vierspur/i],
  ["open-to-work", /open to work/i],
];

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

export function allowedEmailFromSource(source: string): string | null {
  const match = source.match(/email:\s*(null|"([^"]*)")/);
  if (!match) throw new Error("lib/contact.ts has no email field");
  if (match[1] === "null") return null;
  return match[2] ?? null;
}

export function findHits(text: string, options: { allowedEmail: string | null; file?: string }): Hit[] {
  const file = options.file ?? "text";
  const hits: Hit[] = [];
  for (const [rule, pattern] of RULES) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) hits.push({ rule, file });
  }
  EMAIL.lastIndex = 0;
  const emails = text.match(EMAIL) ?? [];
  for (const email of emails) {
    if (email !== options.allowedEmail) hits.push({ rule: "email", file, email });
  }
  return hits;
}

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === "test" || name === "cache") continue;
    const path = join(dir, name);
    if (path.endsWith(`${join("scripts", "scan-copy.ts")}`)) continue;
    if (path.endsWith("HANDOFF.md")) continue;
    const info = statSync(path);
    if (info.isDirectory()) {
      if (name === ".next" && dir !== process.cwd()) {
        walk(path, out);
        continue;
      }
      if (name === ".next") continue;
      walk(path, out);
    } else if (TEXT.has(extname(name))) {
      out.push(path);
    }
  }
  return out;
}

function builtFiles(): string[] {
  const roots = [join(".next", "server"), join(".next", "static")];
  const out: string[] = [];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    const stack = [root];
    while (stack.length) {
      const dir = stack.pop();
      if (!dir) continue;
      for (const name of readdirSync(dir)) {
        if (name === "cache") continue;
        const path = join(dir, name);
        const info = statSync(path);
        if (info.isDirectory()) stack.push(path);
        else if (TEXT.has(extname(name)) || name.endsWith(".js")) out.push(path);
      }
    }
  }
  return out;
}

function main() {
  if (!existsSync(".next")) {
    console.error("Run npm run build before the copy scan.");
    process.exit(1);
  }
  const allowedEmail = allowedEmailFromSource(readFileSync("lib/contact.ts", "utf8"));
  const files = [
    ...walk("app"),
    ...walk("components"),
    ...walk("lib"),
    ...walk("public"),
    ...walk("scripts"),
    ...["README.md", "DESIGN.md", "AGENTS.md"].filter((path) => existsSync(path)),
    ...builtFiles(),
  ];
  const hits: Hit[] = [];
  for (const file of files) {
    let text = "";
    try {
      text = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const built = file.includes(`${join(".next")}`);
    const siteChunk =
      !built ||
      file.endsWith(".html") ||
      file.endsWith(".rsc") ||
      text.includes("Jakob Alex") ||
      text.includes("CiteBot");
    if (!siteChunk) continue;
    hits.push(...findHits(text, { allowedEmail, file }));
  }
  if (hits.length) {
    for (const hit of hits) {
      console.error(`${hit.file}: ${hit.rule}${hit.email ? ` ${hit.email}` : ""}`);
    }
    process.exit(1);
  }
  console.log(`copy scan ok (${files.length} files, allowed email ${allowedEmail ?? "none"})`);
}

if (process.argv[1]?.includes("scan-copy")) main();
