import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { contact } from "../lib/contact";
import { findHits, normalise } from "../scripts/scan-copy";

const rules = (text: string) => new Set(findHits(text).map((hit) => hit.rule));

test("the site carries only the contact address", () => {
  assert.equal(contact.email, "jdevacc2000@gmail.com");
  assert.equal(rules("jdevacc2000@gmail.com").has("email"), false);
  assert.equal(rules("xjdevacc2000@gmail.com").has("email"), true);
  assert.equal(rules("name@example.com").has("email"), true);
});

test("every banned rule fires on the fixture", () => {
  const found = rules(readFileSync("test/fixtures/bad-copy.txt", "utf8"));
  for (const rule of [
    "made-in-berlin", "guitar", "cost", "commit-count", "self-taught", "taught-himself", "taught-myself",
    "third-person", "ledger", "grounded-docs", "mittelstand", "white-label", "vierspur", "open-to-work",
    "hiring", "income", "salary", "euro", "tape-brand", "slash-count", "email",
  ]) {
    assert.equal(found.has(rule), true, rule);
  }
});

test("case, lookalike, invisible and spacing tricks are folded", () => {
  const cases: Array<[string, string]> = [
    ["HIRING", "hiring"],
    ["We are hir\u200Bing", "hiring"],
    ["s\u0430lary", "salary"],
    ["Grounded\u00A0Docs", "grounded-docs"],
    ["Grounded\nDocs", "grounded-docs"],
    ["L\u0435dger API", "ledger"],
    ["Self taught", "self-taught"],
    ["Selbst beigebracht", "self-taught"],
    ["autodidakt", "self-taught"],
    ["Made in\u202FBerlin", "made-in-berlin"],
    ["TASC\u00ADAM", "tape-brand"],
    ["Einkommen", "income"],
    ["name\uFF20example.com", "email"],
  ];
  for (const [text, rule] of cases) assert.equal(rules(text).has(rule), true, `${JSON.stringify(text)} -> ${rule}`);
});

test("approved copy stays clean", () => {
  for (const text of [
    "I build AI tools whose answers you can check, sentence by sentence.",
    "I came into software through a coding bootcamp and am finishing a distance-learning degree in computer science.",
    "No account and no key. It shows where an answer drops a condition, sentence by sentence.",
    "Recording · development build, no AI model · 4 Nov 2026",
    "18 of 18",
  ]) {
    assert.deepEqual(findHits(text), [], text);
  }
  assert.equal(normalise("a\u00A0\u00A0b"), "a b");
});
