import { writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { chromium } from "@playwright/test";

const require = createRequire(import.meta.url);
const lighthouse = require("lighthouse") as (url: string, flags: object, config?: object) => Promise<{ lhr: Record<string, unknown> }>;
const chromeLauncher = require("chrome-launcher") as { launch: (opts: object) => Promise<{ port: number; kill: () => Promise<void> }> };

async function main() {
  const url = process.argv[2];
const runsWanted = Number(process.env.RUNS ?? 5);
if (!url || !url.startsWith("http") || url.includes("jakobalex.vercel.app/")) {
  console.error("Pass a preview http(s) URL. Do not pass the production domain.");
  process.exit(1);
}

type Run = {
  lcpMs: number;
  cls: number;
  fpsMedian: number;
  initialJsGzip: number;
  totalGzip: number;
  performance: number;
  accessibility: number;
  bestPractices: number;
  tbtMs: number;
  inpMs: number | null;
};

async function sample(urlToSample: string): Promise<Pick<Run, "fpsMedian" | "initialJsGzip" | "totalGzip" | "inpMs">> {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await page.goto(urlToSample, { waitUntil: "networkidle" });
  const js = await page.evaluate(() =>
    performance.getEntriesByType("resource").reduce((sum, entry) => {
      const item = entry as PerformanceResourceTiming;
      if (!item.name.includes(".js")) return sum;
      return sum + (item.encodedBodySize || item.transferSize || 0);
    }, 0),
  );
  const fpsMedian = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        const samples: number[] = [];
        let last = performance.now();
        let frames = 0;
        const start = performance.now();
        const tick = (now: number) => {
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
  await page.locator("[data-sentence]").first().evaluate((el) => el.getAttribute("aria-pressed"));
  const inpMs = Date.now() - started;
  await browser.close();
  return { fpsMedian, initialJsGzip: js, totalGzip: js, inpMs };
}

mkdirSync("docs/measurements", { recursive: true });
const runs: Run[] = [];
for (let index = 0; index < runsWanted; index += 1) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new", "--no-sandbox"] });
  try {
    const result = await lighthouse(
      url,
      { port: chrome.port, output: "json", formFactor: "mobile" },
      {
        extends: "lighthouse:default",
        settings: {
          onlyCategories: ["performance", "accessibility", "best-practices"],
          formFactor: "mobile",
          screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2, disabled: false },
        },
      },
    );
    const lhr = result.lhr as {
      categories: Record<string, { score: number | null }>;
      audits: Record<string, { numericValue?: number }>;
    };
    writeFileSync(`docs/measurements/lighthouse-run-${index + 1}.json`, JSON.stringify(result.lhr));
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
  } finally {
    await chrome.kill();
  }
}

const report = { url, profile: "iphone-12-pro", dpr: 2, runs };
  writeFileSync("docs/measurements/close-reading-preview.json", JSON.stringify(report, null, 2));
  console.log("wrote docs/measurements/close-reading-preview.json");
}

void main();