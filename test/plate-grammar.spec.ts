import { expect, test } from "@playwright/test";

/**
 * 0.7 of the plate box. The old rail was about 28rem inside a plate near 72rem,
 * roughly 0.39, which left most of the width empty. 0.7 keeps the leader lane
 * inside the drawing and makes the drawing the span of the plate.
 */
const WIDTH_FLOOR = 0.7;

test("each plate drawing spans the plate and keeps one verdict sheet", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  for (const id of ["citebot", "autopsy", "style"]) {
    const share = await page.locator(`#${id}`).evaluate((plate) => {
      const drawing = plate.querySelector(".plate-drawing, .drawing-grid");
      if (!(drawing instanceof Element)) return 0;
      return drawing.getBoundingClientRect().width / plate.getBoundingClientRect().width;
    });
    expect(share, id).toBeGreaterThanOrEqual(WIDTH_FLOOR);
    await expect(page.locator(`#${id} .verdict-sheet:visible`)).toHaveCount(1);
  }
});

test("leaders sit off the sheets", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const hits = await page.evaluate(() => {
    const overlaps: string[] = [];
    for (const root of document.querySelectorAll("#citebot .plate-drawing, #style .plate-drawing, #autopsy .drawing-grid")) {
      const labels = [...root.querySelectorAll(".leader-name")];
      const sheets = [...root.querySelectorAll(".sheet-face")];
      for (const label of labels) {
        const box = label.getBoundingClientRect();
        for (const sheet of sheets) {
          const face = sheet.getBoundingClientRect();
          const hit = box.width > 0 && face.width > 0 && box.left < face.right && box.right > face.left && box.top < face.bottom && box.bottom > face.top;
          if (hit) overlaps.push(`${label.textContent?.trim().slice(0, 16)}`);
        }
      }
    }
    return overlaps;
  });
  expect(hits).toEqual([]);
});

test("failure sheets hang from their step", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const misses = await page.locator("#citebot .plate-drawing").evaluate((node) => {
    const svg = node as SVGSVGElement;
    const point = (x: number, y: number) => {
      const spot = svg.createSVGPoint();
      spot.x = x;
      spot.y = y;
      const matrix = svg.getScreenCTM();
      if (!matrix) return null;
      const mapped = spot.matrixTransform(matrix);
      return { x: mapped.x, y: mapped.y };
    };
    const near = (spot: { x: number; y: number } | null, rect: DOMRect) => {
      if (!spot) return false;
      const dx = spot.x < rect.left ? rect.left - spot.x : spot.x > rect.right ? spot.x - rect.right : 0;
      const dy = spot.y < rect.top ? rect.top - spot.y : spot.y > rect.bottom ? spot.y - rect.bottom : 0;
      return Math.hypot(dx, dy) < 16;
    };
    const found: string[] = [];
    for (const hang of svg.querySelectorAll("[data-hang]")) {
      const id = hang.getAttribute("data-hang") ?? "";
      const step = svg.querySelector(`[data-step="${id}"] .sheet-face`);
      const lines = [...hang.querySelectorAll("line")];
      const face = hang.querySelector(".hang-sheet");
      const first = lines[0];
      const last = lines.at(-1);
      if (!(step instanceof SVGGraphicsElement) || !(first instanceof SVGLineElement) || !(last instanceof SVGLineElement) || !(face instanceof SVGGraphicsElement)) {
        found.push(id || "missing");
        continue;
      }
      const start = point(first.x1.baseVal.value, first.y1.baseVal.value);
      const end = point(last.x2.baseVal.value, last.y2.baseVal.value);
      if (!near(start, step.getBoundingClientRect()) || !near(end, face.getBoundingClientRect())) found.push(id);
    }
    return found;
  });
  expect(misses).toEqual([]);
});
