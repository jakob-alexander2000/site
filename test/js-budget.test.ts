import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { gzipSync } from "node:zlib";

test("this build's initial javascript is at most 145000 bytes gzip", () => {
  const html = readFileSync(".next/server/app/index.html", "utf8");
  const seen = new Set<string>();
  let total = 0;
  const rows: string[] = [];
  for (const match of html.matchAll(/<script\b([^>]*)>/g)) {
    const tag = match[1] ?? "";
    const src = /src="([^"]+\.js)"/.exec(tag)?.[1];
    if (!src || seen.has(src)) continue;
    seen.add(src);
    if (/\bnoModule\b/i.test(tag)) continue;
    const name = src.split("/").pop() ?? src;
    const size = gzipSync(readFileSync(join(".next/static/chunks", name)), { level: 9 }).length;
    total += size;
    rows.push(`${size} ${name}`);
  }
  assert.ok(rows.length > 0, "no module scripts in the built page");
  assert.ok(total <= 145_000, `${total}\n${rows.join("\n")}`);
});
