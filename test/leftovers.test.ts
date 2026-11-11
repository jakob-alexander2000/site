import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const BANNED = [
  "vierspur",
  "planner",
  "workbench",
  "mcp",
  "voice check",
  "style distance",
  "style-distance",
  "desk-index",
  "look 01",
  "installer phone agent",
  "voice test bench",
  "agent cockpit",
  "in progress",
  "coming",
  "plate",
  "i came into software through a coding bootcamp",
  "agents with checks",
];

function filesUnder(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === "cache" || name === "node_modules") continue;
    const path = join(dir, name);
    const info = statSync(path);
    if (info.isDirectory()) filesUnder(path, out);
    else if (/\.(html|js|css|json|txt|rsc|map|xml|svg|md)$/.test(name)) out.push(path);
  }
  return out;
}

function siteFile(path: string, text: string): boolean {
  if (path.startsWith("public")) return true;
  return (
    text.includes("Jakob Alex") ||
    text.includes("close-reading") ||
    path.endsWith(".html") ||
    path.endsWith(".rsc")
  );
}

test("production source maps stay off", () => {
  const source = readFileSync("next.config.ts", "utf8");
  assert.match(source, /productionBrowserSourceMaps:\s*false/);
});

test("app and components do not hard-code shelf or flagship ids", () => {
  const blob = [...filesUnder("app"), ...filesUnder("components")].map((path) => readFileSync(path, "utf8")).join("\n");
  assert.equal(/citebot/i.test(blob), false);
  assert.equal(/retrieval-autopsy/i.test(blob), false);
  assert.equal(/if\s*\(\s*\w+\s*===\s*["']/.test(blob), false);
});

test("built output and public files omit lookbook leftovers and rasters", () => {
  assert.equal(existsSync(".next"), true, "run npm run build before this test");
  const paths = [...filesUnder(".next"), ...filesUnder("public")];
  const hits: string[] = [];
  for (const path of paths) {
    if (/\.(jpg|jpeg|webp)$/i.test(path)) hits.push(`raster ${path}`);
    let text = "";
    try {
      text = readFileSync(path, "utf8");
    } catch {
      continue;
    }
    if (!siteFile(path, text)) continue;
    const folded = text.toLowerCase();
    for (const term of BANNED) {
      const pattern = term.includes(" ") ? term : `\\b${term}\\b`;
      if (new RegExp(pattern, "i").test(folded)) hits.push(`${path}: ${term}`);
    }
  }
  assert.deepEqual(hits, []);
});
