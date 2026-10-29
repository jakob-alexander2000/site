import assert from "node:assert/strict";
import { readdirSync, statSync } from "node:fs";
import test from "node:test";
import { DESK_NOTES } from "../lib/desk-notes.ts";
import { searchDesk } from "../lib/desk-retrieve.ts";
import { INDEX_NOTES } from "../lib/index-notes.ts";
import { searchIndex } from "../lib/index-search.ts";
import { RECORDED_CASES } from "../lib/recorded-cases.ts";
import { casePassed, scoreCase } from "../lib/score-case.ts";

test("serif fonts are latin files under 40KB", () => {
  const files = readdirSync("public/fonts").filter((name) => name.endsWith(".woff2"));
  assert.deepEqual(files.sort(), [
    "newsreader-latin-400-italic.woff2",
    "newsreader-latin-400-normal.woff2",
  ]);
  for (const name of files) {
    const size = statSync(`public/fonts/${name}`).size;
    assert.ok(size < 40 * 1024, `${name} is ${size} bytes`);
    assert.ok(size > 8 * 1024, `${name} looks empty`);
  }
});

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
  assert.ok(DESK_NOTES.length >= 3);
  assert.deepEqual(
    DESK_NOTES.map((note) => note.path),
    ["core-hours.md", "paid-time-off.md", "team-offsite.md"],
  );
  const desk = searchDesk("What are core hours?");
  assert.equal(desk[0]?.path, "core-hours.md");
  assert.ok((desk[0]?.score ?? 0) > (desk[1]?.score ?? 0));
  assert.equal(searchDesk("offsite")[0]?.path, "team-offsite.md");
  assert.equal(searchDesk("parking").length, 0);
  const empty = searchDesk("");
  assert.equal(empty.length, 3);
  assert.equal(empty[0]?.score, 0);
  for (const hit of empty) {
    assert.equal(hit.excerpt.startsWith("#"), false, hit.path);
    assert.doesNotMatch(
      hit.excerpt,
      new RegExp(`^${hit.title}\\s+${hit.title}`, "i"),
      hit.path,
    );
  }
  const hours = searchDesk("What are core hours?")[0];
  assert.ok(hours);
  assert.equal(hours.excerpt.startsWith("Core hours are"), true);
});

test("desk-index ranking uses the sample notes", () => {
  assert.ok(INDEX_NOTES.length >= 3);
  assert.deepEqual(
    INDEX_NOTES.map((note) => note.path),
    ["notes/core-hours.md", "notes/expense-policy.md", "notes/offsite.md"],
  );
  assert.equal(searchIndex("What are core hours?")[0]?.path, "notes/core-hours.md");
  assert.equal(searchIndex("expense")[0]?.path, "notes/expense-policy.md");
  assert.equal(searchIndex("core hours")[0]?.title, "Core hours");
  assert.equal(searchIndex("parking").length, 0);
  assert.equal(searchIndex("a").length, 0);
  const hours = searchIndex("What are core hours?")[0];
  assert.ok(hours);
  assert.equal(hours.snippet.startsWith("#"), false);
  assert.doesNotMatch(hours.snippet, /^Core hours\s+Core hours/i);
  assert.equal(hours.snippet.startsWith("Core hours are"), true);
});
