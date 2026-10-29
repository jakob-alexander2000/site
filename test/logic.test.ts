import assert from "node:assert/strict";
import test from "node:test";
import {
  DECISIONS,
  DEFAULT_QUESTION,
  missSentence,
  queryPhase,
  visibleDecision,
} from "../lib/copy";
import { search } from "../lib/desk-index";
import { retrieve } from "../lib/desk-retrieve";
import { scoreSavedFixture } from "../lib/eval-run";
import { plainExcerpt } from "../lib/plain-excerpt";
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
  assert.equal(/hiring|hire|recruit|roles/i.test(visible), false);
  assert.equal(DEFAULT_QUESTION, "What are core hours?");

  assert.equal(retrieve(DESK_CHUNKS, "invoice", 3).length, 0);
  assert.equal(search(INDEX_DOCS, "invoice", 4).length, 0);
  assert.equal(missSentence("invoice"), "No note mentions invoice.");
  assert.equal(missSentence("  invoice. "), "No note mentions invoice.");
});

test("desk scores are not all 1.00", () => {
  const hours = retrieve(DESK_CHUNKS, DEFAULT_QUESTION, 3);
  assert.equal(hours.length, 1);
  assert.equal(hours[0]?.relPath, "core-hours.md");
  assert.equal(hours[0]?.score, 2);

  const berlin = retrieve(DESK_CHUNKS, "Berlin time", 3);
  assert.equal(berlin.length, 3);
  assert.deepEqual(
    berlin.map((hit) => [hit.relPath, hit.score]),
    [
      ["core-hours.md", 1.41],
      ["paid-time-off.md", 1.06],
      ["offsite.md", 0.71],
    ],
  );
  assert.ok(berlin.some((hit) => hit.score !== 1));
});

test("desk-index ranks with unequal scores", () => {
  const time = search(INDEX_DOCS, "time", 4);
  assert.equal(time.length, 2);
  assert.notEqual(time[0]?.score, time[1]?.score);
  assert.ok(time.every((hit) => hit.score !== 1));
  assert.equal(time[0]?.path, "paid-time-off.md");
  assert.equal(time[0]?.score, 6);
  assert.equal(time[1]?.path, "core-hours.md");
  assert.equal(time[1]?.score, 1.5);

  const hours = search(INDEX_DOCS, DEFAULT_QUESTION, 4);
  assert.equal(hours[0]?.path, "core-hours.md");
  assert.equal(hours[0]?.title, "Core hours");
  assert.equal(hours[0]?.score, 12);
  assert.match(hours[0]?.snippet ?? "", /Berlin/);
});

test("excerpts drop leading Markdown heading marks", () => {
  assert.equal(plainExcerpt("# Remote work\n\nCore hours"), "Core hours");
  assert.equal(plainExcerpt("## Workflow\n1. Point at a folder"), "1. Point at a folder");
  assert.equal(plainExcerpt("…# Desk brief Desk is a folder agent."), "…Desk brief Desk is a folder agent.");
  assert.equal(plainExcerpt("# Desk brief Desk is"), "Desk brief Desk is");
});

test("no result excerpt starts with its own title", () => {
  const queries = [DEFAULT_QUESTION, "Berlin time", "time", "invoice"];
  for (const query of queries) {
    for (const hit of search(INDEX_DOCS, query, 4)) {
      const text = plainExcerpt(hit.snippet).trim();
      assert.equal(
        text.toLowerCase().startsWith(hit.title.toLowerCase()),
        false,
        `${hit.path} excerpt starts with ${hit.title}: ${text.slice(0, 80)}`,
      );
    }
    for (const hit of retrieve(DESK_CHUNKS, query, 3)) {
      const text = plainExcerpt(hit.excerpt).trim();
      const title = hit.excerpt.match(/^#{1,6}[ \t]+([^\n]+)/)?.[1]?.trim() ?? "";
      if (!title) continue;
      assert.equal(
        text.toLowerCase().startsWith(title.toLowerCase()),
        false,
        `${hit.relPath} excerpt starts with ${title}: ${text.slice(0, 80)}`,
      );
    }
  }
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
    if (project.id === "citebot-evals") {
      assert.match(project.problem, /fixed questions/);
      assert.equal(/live loop|grounding tools|score the loop/i.test(project.idea + project.problem), false);
    } else {
      assert.match(project.problem, /cost/i);
    }
    assert.equal(project.proof.includes("18/18"), false);
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
