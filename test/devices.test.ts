import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { CRAFT, OPENING, SHELF_COPY } from "./copy";
import { devices } from "./devices";

const titles = [
  "fold shows the sentence, the flagship, and the words GitHub and Email before scroll",
  "grid matches the breakpoint",
  "nothing overlaps at any scroll position",
  "footer and contact are reachable",
  "visible text has no raw url, third person, location, company target, or money",
  "proof shelf has three entries and each has a claim, an artifact, and a limit",
  "labeled scores do not contradict each other",
  "the scene uses the two clean fixture sentences",
  "craft line is present and the bootcamp arc is absent",
  "reduced motion keeps the diagrams understandable",
  "keyboard selects a sentence and draws its thread",
  "touch selects a sentence and draws its thread",
  "body contrast is at least 7 to 1 and fail red is at least 4.5 to 1",
  "type ramp uses the four sizes",
  "replay restarts the thread",
  "public-face scanner flags third person, location, raw urls, company targets, and money",
  "rendered home visible text has no public-face hits",
  "a second dummy flagship renders in place of CiteBot",
  "five dummy shelf entries render from a test definition",
  "the shipped shelf is the three public entries",
  "the production flagship is the CiteBot definition",
  "committed fixtures are vendored before any verdict is rendered",
  "deployed preview meets the performance budget",
  "the phone renderer caps DPR and handles context loss",
];

test("the spec names every viewport, the copy, and the tests", () => {
  const spec = readFileSync("docs/specs/close-reading.md", "utf8");
  assert.equal(
    spec.includes("Build it as a new PR that replaces the PR 13 lookbook direction"),
    true,
  );
  assert.equal(spec.includes("[Needs clarification"), false);
  assert.equal(spec.includes("Found, not fixed"), false);
  assert.equal(spec.includes(OPENING), true);
  assert.equal(spec.includes(CRAFT), true);
  for (const device of devices) {
    assert.equal(spec.includes(`${device.width}×${device.height}`), true, device.name);
    assert.equal(device.note.length > 0, true, device.name);
  }
  for (const entry of SHELF_COPY) assert.equal(spec.includes(entry.claim), true, entry.id);
  for (const title of titles) assert.equal(spec.includes(title), true, title);
  const done = spec.split("## 10.")[1] ?? "";
  const rows = done
    .split("\n")
    .filter((row) => row.startsWith("|") && !row.includes("---") && !row.toLowerCase().includes("check |"));
  assert.ok(rows.length >= 20, `done rows ${rows.length}`);
  for (const row of rows) assert.match(row, /Not checked/, row);
});
