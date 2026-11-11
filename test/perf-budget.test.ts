import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

type PerfRun = {
  lcpMs: number;
  cls: number;
  fpsMedian: number;
  initialJsGzip: number;
  totalGzip: number;
};

type PerfReport = {
  url: string;
  profile: string;
  dpr: number;
  runs: PerfRun[];
};

const path = "docs/measurements/close-reading-preview.json";

test("deployed preview meets the performance budget", () => {
  assert.equal(existsSync(path), true, "preview measurement is not recorded");
  const report = JSON.parse(readFileSync(path, "utf8")) as PerfReport;
  assert.equal(report.profile, "iphone-12-pro");
  assert.equal(report.dpr, 2);
  assert.equal(Array.isArray(report.runs), true);
  assert.equal(report.runs.length, 5, "expected 5 raw runs");
  assert.equal(report.url.startsWith("https://"), true);
  assert.equal(report.url.includes("jakobalex.vercel.app"), false, "do not measure the production domain");
  const fps = report.runs.map((run) => run.fpsMedian).sort((a, b) => a - b);
  const median = fps[2];
  assert.equal(typeof median, "number");
  assert.ok(median >= 55, `median fps ${median}`);
  for (const run of report.runs) {
    assert.ok(Number.isFinite(run.lcpMs), "raw lcp");
    assert.ok(Number.isFinite(run.cls), "raw cls");
    assert.ok(Number.isFinite(run.fpsMedian), "raw fps");
    assert.ok(Number.isFinite(run.initialJsGzip), "raw initial js");
    assert.ok(Number.isFinite(run.totalGzip), "raw total");
    assert.ok(run.lcpMs < 2000, `lcp ${run.lcpMs}`);
    assert.ok(run.cls < 0.05, `cls ${run.cls}`);
    assert.ok(run.initialJsGzip <= 90_000, `initial js ${run.initialJsGzip}`);
    assert.ok(run.totalGzip <= 260_000, `total ${run.totalGzip}`);
  }
});
