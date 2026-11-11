import { mkdirSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("@playwright/test");

const url = process.argv[2];
const runsWanted = Number(process.env.RUNS ?? 5);
if (!url || !url.startsWith("http") || url.includes("jakobalex.vercel.app/")) {
  console.error("Pass a preview http(s) URL. Do not pass the production domain.");
  process.exit(1);
}

function lighthouse(outputPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "npx",
      [
        "lighthouse",
        url,
        "--quiet",
        "--chrome-flags=--headless=new --no-sandbox",
        "--only-categories=performance,accessibility,best-practices",
        "--form-factor=mobile",
        "--screenEmulation.mobile",
        "--screenEmulation.width=390",
        "--screenEmulation.height=844",
        "--screenEmulation.deviceScaleFactor=2",
        "--output=json",
        `--output-path=${outputPath}`,
      ],
      { stdio: "inherit" },
    );
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`lighthouse exit ${code}`))));
  });
}

async function sample(urlToSample) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await page.goto(urlToSample, { waitUntil: "networkidle" });
  const js = await page.evaluate(() =>
    performance.getEntriesByType("resource").reduce((sum, entry) => {
      if (!entry.name.includes(".js")) return sum;
      return sum + (entry.encodedBodySize || entry.transferSize || 0);
    }, 0),
  );
  const fpsMedian = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const samples = [];
        let last = performance.now();
        let frames = 0;
        const start = performance.now();
        const tick = (now) => {
          frames += 1;
          if (now - last >= 200) {
            samples.push((frames * 1000) / (now - last));
            frames = 0;
            last = now;
          }
          if (now - start < 1500) requestAnimationFrame(tick);
          else {
            samples.sort((a, b) => a - b);
            resolve(samples[Math.floor(samples.length / 2)] ?? 0);
          }
        };
        requestAnimationFrame(tick);
      }),
  );
  const started = Date.now();
  await page.locator("[data-sentence]").first().click();
  await page.locator("[data-sentence]").first().getAttribute("aria-pressed");
  const inpMs = Date.now() - started;
  await browser.close();
  return { fpsMedian, initialJsGzip: js, totalGzip: js, inpMs };
}

mkdirSync("docs/measurements", { recursive: true });
const runs = [];
for (let index = 0; index < runsWanted; index += 1) {
  const outputPath = `docs/measurements/lighthouse-run-${index + 1}.json`;
  await lighthouse(outputPath);
  const lhr = JSON.parse(await import("node:fs").then((fs) => fs.readFileSync(outputPath, "utf8")));
  const sampled = await sample(url);
  const audits = lhr.audits;
  runs.push({
    lcpMs: audits["largest-contentful-paint"]?.numericValue ?? -1,
    cls: audits["cumulative-layout-shift"]?.numericValue ?? -1,
    fpsMedian: sampled.fpsMedian,
    initialJsGzip: sampled.initialJsGzip,
    totalGzip: sampled.totalGzip,
    performance: Math.round((lhr.categories.performance?.score ?? 0) * 100),
    accessibility: Math.round((lhr.categories.accessibility?.score ?? 0) * 100),
    bestPractices: Math.round((lhr.categories["best-practices"]?.score ?? 0) * 100),
    tbtMs: audits["total-blocking-time"]?.numericValue ?? -1,
    inpMs: sampled.inpMs,
  });
  console.log(`run ${index + 1}`, JSON.stringify(runs.at(-1)));
}

writeFileSync(
  "docs/measurements/close-reading-preview.json",
  JSON.stringify({ url, profile: "iphone-12-pro", dpr: 2, runs }, null, 2),
);
console.log("wrote docs/measurements/close-reading-preview.json");
