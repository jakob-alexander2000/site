import assert from "node:assert/strict";
import test from "node:test";
import { DESK_NOTES } from "../lib/desk-notes.ts";
import { retrieve } from "../lib/desk-retrieve.ts";
import { searchNotes } from "../lib/desk-index.ts";
import { INDEX_NOTES } from "../lib/index-notes.ts";
import { scoreSavedCases } from "../lib/eval-cases.ts";

test("desk retrieve ranks the sample notes with the real score", () => {
  const report = retrieve(DESK_NOTES, "write a report", 4);
  assert.equal(report[0]?.relPath, "desk-brief.md");
  assert.equal(report[0]?.score, 1.41);
  assert.equal(report.length, 1);

  const both = retrieve(DESK_NOTES, "folder agent", 4);
  assert.deepEqual(
    both.map((hit) => [hit.relPath, hit.score]),
    [
      ["desk-brief.md", 1.41],
      ["meeting-2026-10-20.md", 1.41],
    ],
  );

  const citebot = retrieve(DESK_NOTES, "CiteBot", 4);
  assert.equal(citebot[0]?.relPath, "meeting-2026-10-20.md");
  assert.equal(citebot[0]?.score, 1);

  const blank = retrieve(DESK_NOTES, "to", 4);
  assert.equal(blank.length, 2);
  assert.ok(blank.every((hit) => hit.score === 0));
});

test("desk-index ranks with term count times notes over document frequency", () => {
  const berlin = searchNotes(INDEX_NOTES, "Berlin", 5);
  assert.equal(berlin.length, 1);
  assert.equal(berlin[0]?.path, "remote-work.md");
  assert.equal(berlin[0]?.title, "Remote work");
  assert.equal(berlin[0]?.score, 2);

  const hours = searchNotes(INDEX_NOTES, "core hours", 5);
  assert.equal(hours[0]?.path, "remote-work.md");
  assert.equal(hours[0]?.score, 4);
  assert.match(hours[0]?.snippet ?? "", /Core hours/);

  const oncall = searchNotes(INDEX_NOTES, "on-call", 5);
  assert.equal(oncall[0]?.path, "ops/oncall.md");
  assert.equal(oncall[0]?.title, "On-call");
  assert.equal(oncall[0]?.score, 8);

  assert.deepEqual(searchNotes(INDEX_NOTES, "a", 5), []);
});

test("the saved eval cases clear under the real checker", () => {
  const scored = scoreSavedCases();
  assert.equal(scored.length, 6);
  assert.ok(scored.every((item) => item.passed));
  const days = scored.find((item) => item.id === "pto-days-ft");
  assert.equal(days?.checks.length, 4);
  assert.ok(days?.checks.every((check) => check.ok));
});
