import assert from "node:assert/strict";
import test from "node:test";
import { DESK_NOTES } from "../lib/desk-notes.ts";
import { searchDesk } from "../lib/desk-retrieve.ts";
import { INDEX_NOTES } from "../lib/index-notes.ts";
import { searchIndex } from "../lib/index-search.ts";
import { RECORDED_CASES } from "../lib/recorded-cases.ts";
import { casePassed, scoreCase } from "../lib/score-case.ts";

test("recorded fixture cases pass the real checker", () => {
  assert.equal(RECORDED_CASES.length, 15);
  for (const item of RECORDED_CASES) {
    const checks = scoreCase(item.expect, {
      answer: item.answer,
      citations: item.sources.map((source) => ({ source })),
    });
    assert.equal(casePassed(checks), true, item.id);
  }
});

test("the planted 25-day sentence fails the vacation case", () => {
  const vacation = RECORDED_CASES.find((item) => item.id === "pto-days-ft");
  assert.ok(vacation);
  const checks = scoreCase(vacation.expect, {
    answer: "Full-time employees receive 25 days of paid vacation per calendar year.",
    citations: [{ source: "pto-and-leave.md" }],
  });
  const includes = checks.find((check) => check.name === "answer-includes");
  const excludes = checks.find((check) => check.name === "answer-excludes");
  assert.equal(includes?.ok, false);
  assert.equal(excludes?.ok, false);
  assert.equal(casePassed(checks), false);
});

test("Desk ranking uses the sample notes", () => {
  assert.deepEqual(
    DESK_NOTES.map((note) => note.path),
    ["desk-brief.md", "meeting-2026-10-20.md"],
  );
  const desk = searchDesk("What is Desk?");
  assert.equal(desk[0]?.path, "desk-brief.md");
  assert.ok((desk[0]?.score ?? 0) > (desk[1]?.score ?? 0));
  assert.equal(searchDesk("strangers")[0]?.path, "meeting-2026-10-20.md");
  assert.equal(searchDesk("localhost UI")[0]?.path, "desk-brief.md");
  const empty = searchDesk("");
  assert.equal(empty.length, 2);
  assert.equal(empty[0]?.score, 0);
});

test("desk-index ranking uses the sample notes", () => {
  assert.deepEqual(
    INDEX_NOTES.map((note) => note.path),
    ["ops/oncall.md", "remote-work.md"],
  );
  assert.equal(searchIndex("Berlin")[0]?.path, "remote-work.md");
  assert.equal(searchIndex("pager")[0]?.path, "ops/oncall.md");
  assert.equal(searchIndex("core hours")[0]?.title, "Remote work");
  assert.equal(searchIndex("applied").length, 0);
  assert.equal(searchIndex("a").length, 0);
});
