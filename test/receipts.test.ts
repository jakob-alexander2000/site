import assert from "node:assert/strict";
import { test } from "node:test";
import { parseReceipts, shortDate, stampFor } from "../lib/receipts";

const good = {
  date: "2026-11-22",
  receipts: [
    { project: "citebot", eval: "handbook-golden", passed: 8, total: 8, commit: "2ec2319", file: "2026-11-22-citebot-handbook-golden.json" },
    { project: "style-distance", eval: "unit-and-parity", passed: 8, total: 9, commit: "37dbefa", file: "2026-11-22-style-distance-unit-and-parity.json", worse_than: { date: "2026-11-15", passed: 9, total: 9 } },
  ],
};

test("a good index becomes a stamp per tool, linked to its receipt", () => {
  const receipts = parseReceipts(good);
  const stamp = stampFor(receipts, "citebot");
  assert.equal(stamp?.label, "checked 22 Nov · 8 of 8");
  assert.equal(stamp?.fault, false);
  assert.match(stamp?.href ?? "", /checks\/receipts\/2026-11-22-citebot-handbook-golden\.json$/);
});

test("a slipped tool is a fault", () => {
  const stamp = stampFor(parseReceipts(good), "style-distance");
  assert.equal(stamp?.label, "checked 22 Nov · 8 of 9 pass");
  assert.equal(stamp?.fault, true);
});

test("anything malformed means no receipt, never a guessed number", () => {
  assert.equal(parseReceipts(null), null);
  assert.equal(parseReceipts({ date: "22 Nov", receipts: [] }), null);
  assert.equal(parseReceipts({ ...good, receipts: [{ ...good.receipts[0], passed: 9 }] }), null);
  assert.equal(parseReceipts({ ...good, receipts: [{ ...good.receipts[0], file: "../x.json" }] }), null);
  assert.equal(stampFor(null, "citebot"), null);
  assert.equal(stampFor(parseReceipts(good), "persona"), null);
});

test("dates read as day and month", () => {
  assert.equal(shortDate("2026-01-05"), "5 Jan");
});
