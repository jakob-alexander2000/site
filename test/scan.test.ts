import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { contact } from "../lib/contact";
import { allowedEmailFromSource, findHits } from "../scripts/scan-copy";

test("the scanner allows only the configured email", () => {
  const source = readFileSync("lib/contact.ts", "utf8");
  assert.equal(allowedEmailFromSource(source), contact.email);
  assert.equal(findHits(contact.email ?? "", { allowedEmail: contact.email }).length, 0);
  const fake = readFileSync("test/fixtures/bad-copy.txt", "utf8");
  const hits = findHits(fake, { allowedEmail: contact.email });
  const rules = new Set(hits.map((hit) => hit.rule));
  for (const rule of [
    "made-in-berlin",
    "guitar",
    "cost",
    "commit-count",
    "self-taught",
    "taught-himself",
    "taught-myself",
    "third-person",
    "ledger",
    "grounded-docs",
    "mittelstand",
    "white-label",
    "vierspur",
    "open-to-work",
    "email",
  ]) {
    assert.equal(rules.has(rule), true, rule);
  }
});

test("a null email allows no address", () => {
  const fake = readFileSync("test/fixtures/bad-copy.txt", "utf8");
  const hits = findHits(fake, { allowedEmail: null });
  assert.equal(hits.some((hit) => hit.rule === "email"), true);
});
