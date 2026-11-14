import { chromium } from "@playwright/test";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";

const root = "docs/evidence/stop3";
const plates = ["top", "citebot", "autopsy", "style"];
const viewports = [
  { width: 1280, height: 800 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
];

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader"] });
const page = await browser.newPage();
const hashes = {};

for (const viewport of viewports) {
  const folder = `${root}/${viewport.width}x${viewport.height}`;
  mkdirSync(folder, { recursive: true });
  await page.setViewportSize(viewport);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("http://127.0.0.1:3456/", { waitUntil: "networkidle" });
  for (const id of plates) {
    hashes[`${viewport.width}x${viewport.height}`] ??= {};
    for (const position of ["scroll-0", "mid-scroll", "end-scroll"]) {
      await page.evaluate(
        ({ plateId, position: place }) => {
          const plate = document.getElementById(plateId);
          if (!plate) return;
          const height = plate.offsetHeight;
          const start = plate.offsetTop;
          const end = Math.max(0, plate.offsetTop + height - window.innerHeight);
          const mid = start + (end - start) / 2;
          const lower = Math.max(0, start - Math.max(0, window.innerHeight - height) / 2);
          const y = place === "scroll-0" ? start : place === "mid-scroll" ? (end === start ? lower : mid) : end === start ? Math.max(0, start - (window.innerHeight - height)) : end;
          window.scrollTo(0, y);
        },
        { plateId: id, position },
      );
      await page.waitForTimeout(150);
      const file = `${folder}/${id}-${position}.png`;
      const buffer = await page.screenshot({ path: file });
      hashes[`${viewport.width}x${viewport.height}`][`${id}-${position}`] = createHash("md5").update(buffer).digest("hex");
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://127.0.0.1:3456/", { waitUntil: "networkidle" });
  for (const id of plates) {
    await page.evaluate((plateId) => {
      const plate = document.getElementById(plateId);
      if (plate) window.scrollTo(0, plate.offsetTop);
    }, id);
    await page.waitForTimeout(150);
    const file = `${folder}/${id}-reduced-motion.png`;
    const buffer = await page.screenshot({ path: file });
    hashes[`${viewport.width}x${viewport.height}`][`${id}-reduced-motion`] = createHash("md5").update(buffer).digest("hex");
  }
}

writeFileSync(`${root}/still-hashes.json`, JSON.stringify(hashes, null, 2));
await browser.close();
console.log("stills written");
