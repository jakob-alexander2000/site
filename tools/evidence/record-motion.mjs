import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const outDir = "docs/evidence/stop3";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader"] });
const page = await browser.newPage();
await page.addInitScript(() => {
  window.__long = [];
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const scripts = entry.scripts?.map((script) => ({
        invoker: script.invoker,
        source: script.sourceFunctionName,
        duration: Math.round(script.duration),
      })) ?? [];
      window.__long.push({ name: entry.name, start: Math.round(entry.startTime), duration: Math.round(entry.duration), scripts });
    }
  }).observe({ type: "long-animation-frame", buffered: true });
});

async function sample(label, width, height, scrollMs) {
  await page.setViewportSize({ width, height });
  await page.goto("http://127.0.0.1:3456/", { waitUntil: "load" });
  const client = await page.context().newCDPSession(page);
  await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const result = await page.evaluate(async (ms) => {
    const root = document.querySelector(".schnitt");
    const range = root ? root.scrollHeight - window.innerHeight : document.body.scrollHeight - window.innerHeight;
    const start = performance.now();
    const gaps = [];
    let previous = start;
    await new Promise((resolve) => {
      const step = (now) => {
        const gap = now - previous;
        gaps.push(gap);
        if (gap > 20) {
          const plate = [...document.querySelectorAll("section.plate, .schnitt")].find((node) => {
            const rect = node.getBoundingClientRect();
            return rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.5;
          });
          window.__spikes = [...(window.__spikes ?? []), { gap: Math.round(gap), plate: plate?.id || "" }];
        }
        previous = now;
        const t = now - start;
        window.scrollTo(0, Math.min(range, (t / ms) * range));
        if (t < ms) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
    const sorted = [...gaps].sort((a, b) => a - b);
    const mid = sorted.length % 2 === 1 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
    const max = sorted[sorted.length - 1] ?? 0;
    const maxAt = gaps.indexOf(max);
    return {
      frames: gaps.length,
      medianMs: Number(mid.toFixed(2)),
      p95Ms: Number((sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)] ?? 0).toFixed(2)),
      maxMs: Number(max.toFixed(2)),
      maxAt,
      shareOver20ms: Number((gaps.filter((gap) => gap > 20).length / Math.max(gaps.length, 1)).toFixed(4)),
      first: Number((gaps[0] ?? 0).toFixed(2)),
      long: window.__long ?? [],
      spikes: window.__spikes ?? [],
      gaps,
    };
  }, scrollMs);
  await client.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  console.log(label, JSON.stringify({ ...result, gaps: undefined }));
  return { label, ...result };
}

const server = process.argv.includes("--serve");
if (server) {
  const { spawn } = await import("node:child_process");
  const child = spawn("npx", ["next", "start", "-H", "127.0.0.1", "-p", "3456"], { stdio: "inherit" });
  await new Promise((resolve) => setTimeout(resolve, 1500));
  child.unref();
}

const phone = await sample("phone-390", 390, 844, 1200);
const desktop = await sample("desktop-1440", 1440, 900, 6000);
const plates = {};
for (const id of ["citebot", "autopsy", "style", "skills"]) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:3456/", { waitUntil: "load" });
  const client = await page.context().newCDPSession(page);
  await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  plates[id] = await page.evaluate(async (plateId) => {
    const plate = document.getElementById(plateId);
    const top = plate ? plate.offsetTop : 0;
    const height = plate ? plate.offsetHeight : window.innerHeight;
    const start = performance.now();
    const gaps = [];
    let previous = start;
    await new Promise((resolve) => {
      const step = (now) => {
        gaps.push(now - previous);
        previous = now;
        const t = now - start;
        const span = Math.max(height - window.innerHeight, 1);
        window.scrollTo(0, top + Math.min(span, (t / 1500) * span));
        if (t < 1500) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
    const sorted = [...gaps].sort((a, b) => a - b);
    const max = sorted[sorted.length - 1] ?? 0;
    return {
      frames: gaps.length,
      medianMs: Number((sorted[Math.floor(sorted.length / 2)] ?? 0).toFixed(2)),
      maxMs: Number(max.toFixed(2)),
      maxAt: gaps.indexOf(max),
      shareOver20ms: Number((gaps.filter((gap) => gap > 20).length / Math.max(gaps.length, 1)).toFixed(4)),
      first: Number((gaps[0] ?? 0).toFixed(2)),
    };
  }, id);
  await client.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  console.log(id, JSON.stringify(plates[id]));
}

const counters = await page.evaluate(() => {
  const stage = document.querySelector(".schnitt-stage");
  return {
    draws: stage?.getAttribute("data-draws") ?? "",
    triangles: stage?.getAttribute("data-triangles") ?? "",
    ratio: stage?.getAttribute("data-ratio") ?? "",
  };
});

writeFileSync(
  `${outDir}/frames.json`,
  JSON.stringify({ phone, desktop: { ...desktop, gaps: desktop.gaps }, plates, counters }, null, 2),
);
await browser.close();
