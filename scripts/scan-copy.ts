import { createHash } from "node:crypto";
import { ALLOWED_EMAIL } from "../lib/contact";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

export type Hit = { rule: string; file: string; email?: string };

const TEXT = new Set([".ts", ".tsx", ".js", ".mjs", ".css", ".md", ".svg", ".txt", ".html", ".rsc"]);

const RULES: ReadonlyArray<readonly [string, RegExp]> = [
  ["made-in-berlin", /made in berlin/i],
  ["location", /\bberlin\b/i],
  ["money", /\bmoney\b/i],
  ["guitar", /guitar/i],
  ["cost", /the cost is/i],
  ["commit-count", /\bcommit counts?\b|\b\d+\s+commits?\b/i],
  ["self-taught", /self[- ]?taught|autodidakt|selbst beigebracht/i],
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
  ["hiring", /\b(hire|hires|hired|hiring|recruit\w*)\b/i],
  ["income", /\bincome\b|\beinkommen\b/i],
  ["salary", /salary|salaries|\bgehalt\b/i],
  ["euro", /€|\beur\b|\beuro\b/i],
  ["tape-brand", /tascam|portastudio/i],
  ["slash-count", /\b\d+\/\d+\b(?! ?(?:px|s|ms|%))/],
];

const LOOKALIKE: Record<string, string> = {
  "а": "a", "е": "e", "о": "o", "р": "p", "с": "c", "у": "y", "х": "x", "і": "i", "ј": "j", "ѕ": "s",
  "А": "A", "Е": "E", "О": "O", "Р": "P", "С": "C", "Т": "T", "Н": "H", "К": "K", "М": "M", "В": "B", "Х": "X", "І": "I",
  "α": "a", "ο": "o", "ρ": "p", "ε": "e", "ι": "i", "Ι": "I", "Ο": "O", "Α": "A", "Ε": "E",
};

/** Fold case tricks, lookalike letters, invisible characters and odd spaces before any rule runs. */
export function normalise(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\u2060\uFEFF\u00AD]/g, "")
    .replace(/[\u0391-\u03C9\u0400-\u04FF]/g, (ch) => LOOKALIKE[ch] ?? ch)
    .replace(/[\s\u00A0\u202F]+/g, " ");
}

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

/** Company-target names, stored as SHA-256 hex of the lowercased word. */
export const COMPANY_TARGET_DIGESTS: ReadonlySet<string> = new Set([
  "080f487fb62a439e14d014a808414249797d8a262e28301f2608fa178b610b93",
]);

export function wordDigest(word: string): string {
  return createHash("sha256").update(word.toLowerCase()).digest("hex");
}

/** Tokenise normalised text and flag a word whose digest is in the set. */
export function companyTargetHit(text: string, digests: ReadonlySet<string> = COMPANY_TARGET_DIGESTS): boolean {
  const words = normalise(text).toLowerCase().match(/[a-z0-9]+/g) ?? [];
  return words.some((word) => digests.has(wordDigest(word)));
}

/** Only the contact address in lib/contact.ts is allowed; any other address is a hit. */
export function findHits(
  raw: string,
  options: { file?: string; companyTargets?: ReadonlySet<string> } = {},
): Hit[] {
  const file = options.file ?? "text";
  const text = normalise(raw);
  const hits: Hit[] = [];
  for (const [rule, pattern] of RULES) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) hits.push({ rule, file });
  }
  if (companyTargetHit(text, options.companyTargets ?? COMPANY_TARGET_DIGESTS)) {
    hits.push({ rule: "company-target", file });
  }
  EMAIL.lastIndex = 0;
  for (const email of text.match(EMAIL) ?? []) if (email !== ALLOWED_EMAIL) hits.push({ rule: "email", file, email });
  return hits;
}

const RAW_URL = /\bhttps?:\/\/\S+|\bwww\.\S+|\b[a-z0-9.-]+\.[a-z]{2,}\/\S+/i;

/**
 * Rules for text a visitor can read. Source files may store a mailto address and
 * an href; visible text may not show either. Dollar amounts are caught here so
 * a replacement pattern in source is not treated as a price.
 */
export function findPublicFaceHits(
  raw: string,
  options: { file?: string; companyTargets?: ReadonlySet<string> } = {},
): Hit[] {
  const file = options.file ?? "text";
  const hits = findHits(raw, { file, companyTargets: options.companyTargets });
  const text = normalise(raw);
  RAW_URL.lastIndex = 0;
  if (RAW_URL.test(text)) hits.push({ rule: "raw-url", file });
  if (/\$\s?\d/.test(text)) hits.push({ rule: "money", file });
  if (text.includes(ALLOWED_EMAIL)) hits.push({ rule: "visible-address", file });
  return hits;
}

/** Handbook fixtures keep place names and currency. They are not public copy. */
export function skipsSource(file: string): boolean {
  const parts = file.split(/[/\\]/);
  return parts.includes("content") && parts.includes("fixtures");
}

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === "test" || name === "cache") continue;
    const path = join(dir, name);
    if (skipsSource(path)) continue;
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
  const files = [
    ...walk("app"),
    ...walk("components"),
    ...walk("lib"),
    ...walk("public"),
    ...walk("scripts"),
    ...walk("content"),
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
    hits.push(...findHits(text, { file }));
  }
  if (hits.length) {
    for (const hit of hits) {
      console.error(`${hit.file}: ${hit.rule}${hit.email ? ` ${hit.email}` : ""}`);
    }
    process.exit(1);
  }
  console.log(`copy scan ok (${files.length} files, only the contact address allowed)`);
}

if (process.argv[1]?.includes("scan-copy")) main();
