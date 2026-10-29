import assert from "node:assert/strict";
import test from "node:test";
import {
  DECISIONS,
  missSentence,
  queryPhase,
  visibleDecision,
} from "../lib/copy";
import { search } from "../lib/desk-index";
import { retrieve } from "../lib/desk-retrieve";
import { scoreSavedFixture } from "../lib/eval-run";
import { PROJECTS, type ProjectLink } from "../lib/projects";
import { DESK_CHUNKS, INDEX_DOCS, SAMPLE_NOTES } from "../lib/samples";

test("citebot-evals fixture scores 18 of 18", () => {
  const marks = scoreSavedFixture();
  assert.equal(marks.length, 18);
  assert.deepEqual(
    marks.map((ok, index) => (ok ? null : index)).filter((index) => index !== null),
    [],
  );
});

test("sample folder has three notes and can miss", () => {
  assert.ok(SAMPLE_NOTES.length >= 3);
  const visible = SAMPLE_NOTES.map((note) => `${note.path}\n${note.content}`).join("\n");
  assert.equal(visible.includes("sev-1"), false);
  assert.equal(/\bCLI\b/.test(visible), false);
  assert.equal(/\bAPI\b/.test(visible), false);
  assert.equal(/\bPTO\b/.test(visible), false);

  assert.equal(retrieve(DESK_CHUNKS, "invoice", 3).length, 0);
  assert.equal(search(INDEX_DOCS, "invoice", 4).length, 0);
  assert.equal(missSentence("invoice"), "No note mentions invoice.");
  assert.equal(missSentence("  invoice. "), "No note mentions invoice.");
});

test("desk scores are not all 1.00", () => {
  const work = retrieve(DESK_CHUNKS, "work", 3);
  assert.ok(work.length >= 2);
  assert.equal(work[0]?.relPath, "remote-work.md");
  assert.equal(work[0]?.score, 1.5);
  assert.notEqual(work[1]?.score, 1.5);
  assert.ok(work.some((hit) => hit.score !== 1));

  const berlin = retrieve(DESK_CHUNKS, "berlin", 3);
  assert.equal(berlin.length, 1);
  assert.equal(berlin[0]?.relPath, "remote-work.md");
  assert.equal(berlin[0]?.score, 1);
});

test("desk-index ranks with unequal scores", () => {
  const folder = search(INDEX_DOCS, "folder", 4);
  assert.equal(folder.length, 2);
  assert.notEqual(folder[0]?.score, folder[1]?.score);
  assert.ok(folder.every((hit) => hit.score !== 1));
  assert.equal(folder[0]?.path, "desk-brief.md");
  assert.equal(folder[1]?.path, "remote-work.md");

  const berlin = search(INDEX_DOCS, "berlin", 4);
  assert.equal(berlin[0]?.path, "remote-work.md");
  assert.equal(berlin[0]?.title, "Remote work");
  assert.match(berlin[0]?.snippet ?? "", /Berlin/);
});

test("decision lines stay hidden until filled, and only CiteBot is Live", () => {
  for (const line of Object.values(DECISIONS)) {
    assert.equal(line, "");
    assert.equal(visibleDecision(line), null);
  }
  assert.equal(visibleDecision("   "), null);
  assert.equal(visibleDecision("  I chose the scope. "), "I chose the scope.");

  assert.equal(queryPhase(null, 0, 0), "idle");
  assert.equal(queryPhase("", 0, 0), "empty");
  assert.equal(queryPhase("a", 0, 0), "short");
  assert.equal(queryPhase("invoice", 1, 0), "miss");
  assert.equal(queryPhase("work", 1, 2), "hit");

  const live: ProjectLink[] = [];
  for (const project of PROJECTS) {
    assert.equal(project.made.includes("TODO"), false);
    assert.equal(project.made.includes("Jakob:"), false);
    assert.match(project.problem, /cost/i);
    for (const link of project.links) {
      if (link.label === "Live") live.push(link);
      if (link.href.includes("github.com")) assert.equal(link.label, "Source");
    }
  }
  assert.deepEqual(
    live.map((link) => link.href),
    ["https://citebot-chi.vercel.app/ask"],
  );
});
