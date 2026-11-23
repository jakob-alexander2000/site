import assert from "node:assert/strict";
import { test } from "node:test";
import { parseReceipts, shortDate, stampFor } from "../lib/receipts";

const good = {
  date: "2026-11-23",
  receipts: [
    { project: "answer-checker", eval: "unit", passed: 81, total: 81, commit: "89357c1", file: "2026-11-23-answer-checker-unit.json" },
    { project: "answer-checker", eval: "handbook-samples", passed: 11, total: 12, commit: "89357c1", file: "2026-11-23-answer-checker-handbook-samples.json", worse_than: { date: "2026-11-16", passed: 12, total: 12 } },
  ],
};

test("a good index becomes a stamp per test set, linked to its receipt", () => {
  const receipts = parseReceipts(good);
  const stamp = stampFor(receipts, "answer-checker", "unit");
  assert.equal(stamp?.label, "checked 23 Nov · 81 of 81 tests");
  assert.equal(stamp?.fault, false);
  assert.match(stamp?.href ?? "", /checks\/receipts\/2026-11-23-answer-checker-unit\.json$/);
});

test("a slipped test set is a fault and says what it counts", () => {
  const stamp = stampFor(parseReceipts(good), "answer-checker", "handbook-samples");
  assert.equal(stamp?.label, "checked 23 Nov · 11 of 12 sample answers pass");
  assert.equal(stamp?.fault, true);
});

test("an older index without eval names still parses", () => {
  const old = { date: "2026-11-22", receipts: [{ project: "citebot", passed: 8, total: 8, file: "2026-11-22-citebot-handbook-golden.json" }] };
  assert.equal(stampFor(parseReceipts(old), "citebot")?.label, "checked 22 Nov · 8 of 8");
});

test("anything malformed means no receipt, never a guessed number", () => {
  assert.equal(parseReceipts(null), null);
  assert.equal(parseReceipts({ date: "22 Nov", receipts: [] }), null);
  assert.equal(parseReceipts({ ...good, receipts: [{ ...good.receipts[0], passed: 90 }] }), null);
  assert.equal(parseReceipts({ ...good, receipts: [{ ...good.receipts[0], file: "../x.json" }] }), null);
  assert.equal(stampFor(null, "answer-checker", "unit"), null);
  assert.equal(stampFor(parseReceipts(good), "persona"), null);
  assert.equal(stampFor(parseReceipts(good), "answer-checker", "nope"), null);
});

test("dates read as day and month", () => {
  assert.equal(shortDate("2026-01-05"), "5 Jan");
});
