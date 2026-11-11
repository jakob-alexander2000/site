import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import Home from "../app/page";
import { ALLOWED_EMAIL } from "../lib/contact";
import { COMPANY_TARGET_DIGESTS, findHits, findPublicFaceHits, wordDigest } from "../scripts/scan-copy";
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

const EXAMPLE_CORP = "examplecorp";
const EXAMPLE_CORP_DIGEST = "53410ed29282959d64b9cc36e0b47a955e01132d1c52e7c53bae381877453cc2";

const rules = (text: string, companyTargets?: ReadonlySet<string>) =>
  new Set(findPublicFaceHits(text, { companyTargets }).map((hit) => hit.rule));

test("public-face scanner flags third person, location, raw urls, company targets, and money", () => {
  assert.equal(wordDigest(EXAMPLE_CORP), EXAMPLE_CORP_DIGEST);
  const found = rules(
    `He writes software in Berl\u0456n for ${EXAMPLE_CORP}. https://example.com/plan money $90 ` + ALLOWED_EMAIL,
    new Set([EXAMPLE_CORP_DIGEST]),
  );
  for (const rule of ["third-person", "location", "company-target", "raw-url", "money", "visible-address"]) {
    assert.equal(found.has(rule), true, rule);
  }
  assert.equal(findHits(ALLOWED_EMAIL).some((hit) => hit.rule === "email"), false);
  assert.equal(findPublicFaceHits(ALLOWED_EMAIL).some((hit) => hit.rule === "visible-address"), true);
  assert.deepEqual(findPublicFaceHits(OPENING), []);
  assert.deepEqual(findPublicFaceHits(CRAFT), []);
  assert.equal(findHits(`A note about ${EXAMPLE_CORP}.`).some((hit) => hit.rule === "company-target"), false);
  assert.equal(
    findHits(`A note about ${EXAMPLE_CORP}.`, { companyTargets: new Set([EXAMPLE_CORP_DIGEST]) }).some(
      (hit) => hit.rule === "company-target",
    ),
    true,
  );
  assert.equal(
    findHits(`A note about example\u200Bcorp.`, { companyTargets: new Set([EXAMPLE_CORP_DIGEST]) }).some(
      (hit) => hit.rule === "company-target",
    ),
    true,
  );
  for (const digest of COMPANY_TARGET_DIGESTS) assert.match(digest, /^[0-9a-f]{64}$/);
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
});
