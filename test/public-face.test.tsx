import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import Home from "../app/page";
import { ALLOWED_EMAIL } from "../lib/contact";
import { findHits, findPublicFaceHits } from "../scripts/scan-copy";
import { CRAFT, OPENING } from "./copy";

function visibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

const rules = (text: string) => new Set(findPublicFaceHits(text).map((hit) => hit.rule));

test("public-face scanner flags third person, location, raw urls, company targets, and money", () => {
  const found = rules(
    "He writes software in Berl\u0456n for Lang\u200Bdock. https://example.com/plan money $90 " + ALLOWED_EMAIL,
  );
  for (const rule of ["third-person", "location", "company-target", "raw-url", "money", "visible-address"]) {
    assert.equal(found.has(rule), true, rule);
  }
  assert.equal(findHits(ALLOWED_EMAIL).some((hit) => hit.rule === "email"), false);
  assert.equal(findPublicFaceHits(ALLOWED_EMAIL).some((hit) => hit.rule === "visible-address"), true);
  assert.deepEqual(findPublicFaceHits(OPENING), []);
  assert.deepEqual(findPublicFaceHits(CRAFT), []);
});

test("rendered home visible text has no public-face hits", () => {
  const text = visibleText(renderToStaticMarkup(<Home />));
  const hits = findPublicFaceHits(text);
  assert.deepEqual(
    hits.map((hit) => hit.rule),
    [],
    hits.map((hit) => hit.rule).join(", "),
  );
});

function readTree(dir: string, out: string[] = []): string[] {
  let names: string[] = [];
  try {
    names = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of names) {
    const path = join(dir, name);
    const info = statSync(path);
    if (info.isDirectory()) readTree(path, out);
    else if (/\.(tsx?|css|md)$/.test(name)) out.push(readFileSync(path, "utf8"));
  }
  return out;
}

test("app, components, and lib do not name a place", () => {
  const blob = ["app", "components", "lib"].flatMap((dir) => readTree(dir)).join("\n");
  assert.equal(/\bberlin\b/i.test(blob), false);
  assert.equal(/\blangdock\b/i.test(blob), false);
});
