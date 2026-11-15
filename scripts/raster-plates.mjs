/**
 * Bake each plate drawing, with the page fonts, at 1x and 2x.
 * Run against a production server: node scripts/raster-plates.mjs http://127.0.0.1:3456
 */
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const base = process.argv[2] ?? "http://127.0.0.1:3456";
const out = join(dirname(fileURLToPath(import.meta.url)), "../public/plates");

mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

for (const scale of [1, 2]) {
  const page = await browser.newPage({ deviceScaleFactor: scale, viewport: { width: 1440, height: 900 } });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  for (const id of ["citebot", "style"]) {
    const frame = page.locator(`#${id} .drawing-frame`);
    await frame.scrollIntoViewIfNeeded();
    const box = await frame.boundingBox();
    if (!box || box.width < 2) throw new Error(`${id} has no drawing box`);
    const png = await page.screenshot({
      clip: { x: box.x, y: box.y, width: box.width, height: box.height },
      type: "png",
    });
    const file = join(out, `${id}@${scale}.webp`);
    await sharp(png).webp({ quality: 82, effort: 5 }).toFile(file);
    console.log(`${id}@${scale}`, box.width, box.height);
  }
  await page.close();
}

await browser.close();
