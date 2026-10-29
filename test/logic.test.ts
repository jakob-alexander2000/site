import assert from "node:assert/strict";
import test from "node:test";
import { search } from "../lib/desk-index";
import { retrieve } from "../lib/desk-retrieve";
import { scoreSavedFixture } from "../lib/eval-run";
import { DESK_CHUNKS, DESK_STOPS, INDEX_DOCS, INDEX_STOPS } from "../lib/samples";

test("citebot-evals fixture scores 18 of 18", () => {
  const marks = scoreSavedFixture();
  assert.equal(marks.length, 18);
  assert.deepEqual(
    marks.map((ok, index) => (ok ? null : index)).filter((index) => index !== null),
    [],
  );
});

test("desk retrieve ranks the sample note", () => {
  assert.equal(DESK_CHUNKS.length, 1);
  for (const query of DESK_STOPS) {
    const hits = retrieve(DESK_CHUNKS, query, 3);
    assert.equal(hits[0]?.relPath, "desk-brief.md");
    assert.ok((hits[0]?.score ?? 0) > 0);
  }
  const report = retrieve(DESK_CHUNKS, "report", 3)[0];
  assert.equal(report?.score, 1);
  assert.match(report?.excerpt ?? "", /report/);
});

test("desk-index ranks the two sample notes", () => {
  const berlin = search(INDEX_DOCS, INDEX_STOPS[0], 4);
  assert.equal(berlin[0]?.path, "remote-work.md");
  assert.equal(berlin[0]?.title, "Remote work");

  const pager = search(INDEX_DOCS, "pager", 4);
  assert.equal(pager[0]?.path, "ops/oncall.md");
  assert.equal(pager[0]?.title, "On-call");

  const both = search(INDEX_DOCS, "Berlin pager", 4);
  assert.equal(both.length, 2);
  assert.equal(both[0]?.path, "ops/oncall.md");
  assert.equal(both[1]?.path, "remote-work.md");

  const hours = search(INDEX_DOCS, "core hours", 4);
  assert.equal(hours[0]?.path, "remote-work.md");
  assert.match(hours[0]?.snippet ?? "", /Berlin/);
});
