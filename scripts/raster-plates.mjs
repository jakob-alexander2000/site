/**
 * Bake each plate drawing per width band, at 1x and 2x.
 * Run against a production server: node scripts/raster-plates.mjs http://127.0.0.1:3456
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const base = process.argv[2] ?? "http://127.0.0.1:3456";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public/plates");

mkdirSync(out, { recursive: true });

const bands = [
  { band: 1100, min: 1, max: 1120, viewport: 1100 },
  { band: 1280, min: 1280, max: 1340, viewport: 1320 },
  { band: 1440, min: 1440, max: 1520, viewport: 1560 },
];

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

const measured = {};
let labelPx = 12;

for (const scale of [1, 2]) {
  for (const band of bands) {
    let viewport = band.viewport;
    let box = null;
    let page = null;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      page = await browser.newPage({ deviceScaleFactor: scale, viewport: { width: viewport, height: 900 } });
      // Bake the live drawing, never an older still laid over it.
      await page.route("**/plates/**", (route) => route.abort());
      await page.goto(base, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const frame = page.locator("#citebot .drawing-frame");
      await frame.scrollIntoViewIfNeeded();
      box = await frame.boundingBox();
      if (!box || box.width < 2) throw new Error(`citebot has no drawing box at ${viewport}`);
      if (box.width >= band.min && box.width <= band.max) break;
      await page.close();
      page = null;
      const next = Math.round(viewport * ((band.min + Math.min(band.max, band.min + 80)) / 2 / box.width));
      if (Math.abs(next - viewport) < 8) break;
      viewport = Math.max(1100, next);
    }
    if (!page || !box) throw new Error(`could not place the ${band.band} band`);
    if (scale === 1) {
      measured[band.band] = Math.round(box.width);
      labelPx = await page.evaluate(() => {
        const node = document.querySelector("#citebot .sheet-labels .leader-name");
        return node instanceof HTMLElement ? Number.parseFloat(getComputedStyle(node).fontSize) : 12;
      });
    }
    for (const id of ["citebot", "style"]) {
      const frame = page.locator(`#${id} .drawing-frame`);
      await frame.scrollIntoViewIfNeeded();
      const shot = await frame.boundingBox();
      if (!shot || shot.width < 2) throw new Error(`${id} has no drawing box`);
      const png = await page.screenshot({
        clip: { x: shot.x, y: shot.y, width: shot.width, height: shot.height },
        type: "png",
      });
      const file = join(out, `${id}@${band.band}@${scale}.webp`);
      await sharp(png).webp({ quality: 82, effort: 5 }).toFile(file);
      console.log(`${id}@${band.band}@${scale}`, Math.round(shot.width), Math.round(shot.height), "viewport", viewport);
    }
    await page.close();
  }
}

await browser.close();

const bake = `/** Width bands for baked plate textures. The band is chosen from the drawing box. */
export const PLATE_BANDS = [1100, 1280, 1440] as const;

export type PlateBand = (typeof PLATE_BANDS)[number];

/** CSS pixel size of the names baked into the plate. Measured by the raster. */
export const BAKED_LABEL_PX = ${Math.round(labelPx)};

/**
 * Pixel width of the citebot drawing in each bake.
 * A display at least this wide keeps the baked type at ${Math.round(labelPx)}px or larger.
 */
export const BAKED_WIDTH: Record<PlateBand, number> = {
  1100: ${measured[1100]},
  1280: ${measured[1280]},
  1440: ${measured[1440]},
};

export function bandForWidth(width: number): PlateBand {
  if (width < 1280) return 1100;
  if (width < 1440) return 1280;
  return 1440;
}
`;

writeFileSync(join(root, "lib/plate-bake.ts"), bake);
console.log("bands", measured, "label", labelPx);
