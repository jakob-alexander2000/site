import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { findHits } from "../scripts/scan-copy";
import { loadManifest, loadSchnittRun } from "../lib/schnitt-run";

function blob(path: string): string {
  const bytes = readFileSync(path);
  return createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
}

test("pinned fixture files match the manifest", () => {
  const manifest = loadManifest();
  assert.equal(manifest.pinned, "2026-11-09");
  assert.equal(manifest.citebot.commit, "2ec2319dd9b3a75e45d5e7773b3841f4afe3fff9");
  assert.equal(manifest.citebotEvals.commit, "b9e2c8ba3c2b8f5f61a1a6e79d6af4470d9b3a45");
  const files: Record<string, string> = {
    "content/fixtures/citebot/tests/fixtures/verify-cases.json": manifest.citebot.files["tests/fixtures/verify-cases.json"] ?? "",
    "content/fixtures/citebot/examples/nordlicht-corpus/pto-and-leave.md":
      manifest.citebot.files["examples/nordlicht-corpus/pto-and-leave.md"] ?? "",
    "content/fixtures/citebot/evals/golden.json": manifest.citebot.files["evals/golden.json"] ?? "",
    "content/fixtures/citebot-evals/reports/SAMPLE.md": manifest.citebotEvals.files["reports/SAMPLE.md"] ?? "",
  };
  for (const [path, sha] of Object.entries(files)) {
    assert.equal(sha.length, 40, path);
    assert.equal(blob(path), sha, path);
  }
});

test("the run is the paid-leave fixture", () => {
  const run = loadSchnittRun();
  const pass = run.sentences.find((sentence) => sentence.verdict === "pass");
  const fail = run.sentences.find((sentence) => sentence.verdict === "fail");
  assert.ok(pass);
  assert.ok(fail);
  assert.equal(pass.tied, true);
  assert.equal(fail.tied, false);
  assert.equal(pass.text, "Full-time employees receive 30 days.");
  assert.equal(pass.evidence, "30 days of paid vacation");
  assert.equal(pass.citationId, "pto-and-leave-1");
  assert.equal(fail.text, "PTO is unlimited.");
  assert.equal(fail.evidence, "The handbook says 30 days.");
  assert.equal(run.question, "How many paid vacation days do full-time employees get?");
  assert.deepEqual(run.handbook.lines, [
    "Full-time employees receive 30 days of paid vacation per calendar year.",
    "Part-time employees receive paid time off pro-rated by FTE.",
  ]);
  assert.equal(run.passage.text, run.handbook.lines[0]);
  assert.equal(run.passage.text.includes(run.passage.span), true);
  assert.equal(run.passage.id, "pto-and-leave-1");
  assert.equal(run.evalCount.passed, 18);
  assert.equal(run.evalCount.total, 18);
  assert.equal(run.evalCount.caption, "18 of 18");
  assert.equal(run.evalCount.dated, "29 OCT 2026");
  assert.equal(run.recordedLabel, "DATA FROM A RECORDED RUN, 9 NOV 2026");
  assert.equal(JSON.stringify(run).includes("Berlin"), false);
});

test("the run text passes the copy scan", () => {
  const run = loadSchnittRun();
  const hits = findHits(JSON.stringify(run));
  assert.deepEqual(hits, []);
  assert.equal(/\d+\/\d+/.test(JSON.stringify(run)), false);
});

test("the phone frame-time record is the static stack", () => {
  const record = JSON.parse(readFileSync("docs/evidence/schnitt-frame-timing.json", "utf8")) as {
    phone390: { viewport: string; webgl: string; method: string; frames: number; medianMs: number; p95Ms: number; maxMs: number; shareOver20ms: number };
    desktop1440: { webgl: string; method: string; frames: number };
  };
  assert.equal(record.phone390.viewport, "390x844");
  assert.equal(record.phone390.webgl, "off");
  assert.equal(record.phone390.method, "static-stack");
  assert.equal(record.desktop1440.webgl, "ready");
  assert.equal(record.desktop1440.method, "fit-loop");
  assert.notEqual(record.phone390.webgl, "ready");
  const spec = readFileSync("docs/specs/schnitt-hero.md", "utf8");
  assert.equal(spec.includes("WebGL on: 73 frames"), false);
  assert.match(spec, /static HTML stack, WebGL off/);
  assert.match(spec, new RegExp(`${record.phone390.frames} frames`));
  assert.match(spec, new RegExp(`median ${record.phone390.medianMs} ms`));
  assert.match(spec, new RegExp(`p95 ${record.phone390.p95Ms} ms`));
  assert.match(spec, new RegExp(`max ${record.phone390.maxMs} ms`));
});
