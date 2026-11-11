import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { PASS_SPAN } from "./copy";

const required = [
  "content/fixtures/manifest.json",
  "content/fixtures/citebot/tests/fixtures/verify-cases.json",
  "content/fixtures/citebot/examples/nordlicht-corpus/pto-and-leave.md",
  "content/fixtures/citebot/evals/last-run.json",
  "content/fixtures/retrieval-autopsy/fixtures/answers.jsonl",
  "content/fixtures/retrieval-autopsy/scorer/baseline.json",
  "content/fixtures/citebot-evals/fixtures/sample-run.json",
  "content/fixtures/citebot-evals/reports/SAMPLE.md",
];

test("committed fixtures are vendored before any verdict is rendered", () => {
  const missing = required.filter((path) => !existsSync(path));
  assert.deepEqual(missing, [], "fixtures are not vendored");

  const manifest = JSON.parse(readFileSync("content/fixtures/manifest.json", "utf8")) as {
    citebot: { commit: string; files: Record<string, string> };
    retrievalAutopsy: { commit: string; files: Record<string, string> };
    citebotEvals: { commit: string; files: Record<string, string> };
  };
  assert.equal(manifest.citebot.commit, "2ec2319dd9b3a75e45d5e7773b3841f4afe3fff9");
  assert.equal(
    manifest.citebot.files["tests/fixtures/verify-cases.json"],
    "914692a2350b8acf39a0de7a66da6eaba65b1895",
  );
  assert.equal(manifest.retrievalAutopsy.commit, "58a5599cec3ba7d7b2d4962261b8463501b7d9d5");
  assert.equal(
    manifest.retrievalAutopsy.files["fixtures/answers.jsonl"],
    "3e55fef48ee10abb4d7d91dbb9d5f4c877f96731",
  );
  assert.equal(manifest.citebotEvals.commit, "b9e2c8ba3c2b8f5f61a1a6e79d6af4470d9b3a45");
  assert.equal(
    manifest.citebotEvals.files["fixtures/sample-run.json"],
    "55233877b579049cf1e734212ef137cdc7797cc9",
  );
  assert.equal(
    manifest.citebotEvals.files["reports/SAMPLE.md"],
    "1db253014188239e23d1fa95a6c707359dce67bf",
  );

  const handbook = readFileSync("content/fixtures/citebot/examples/nordlicht-corpus/pto-and-leave.md", "utf8").replace(/\*\*/g, "");
  assert.equal(handbook.includes(PASS_SPAN), true);
  assert.equal(handbook.includes("Berlin"), true);
  const baseline = JSON.parse(readFileSync("content/fixtures/retrieval-autopsy/scorer/baseline.json", "utf8")) as {
    min_pass_rate: number;
  };
  assert.equal(baseline.min_pass_rate, 0.78125);
  const lastRun = JSON.parse(readFileSync("content/fixtures/citebot/evals/last-run.json", "utf8")) as {
    passed: number;
    commit: string;
  };
  assert.equal(lastRun.passed, 8);
  assert.equal(lastRun.commit, "467306657f213589116916544d6c2b20322b229b");
});
