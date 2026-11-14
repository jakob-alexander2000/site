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
      const drawing = plate.querySelector(".plate-drawing, .autopsy-draw");
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
    for (const root of document.querySelectorAll("#citebot figure, #style figure, #autopsy .autopsy-draw")) {
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

test("the verdict FAIL sentence is the split sentence that failed", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const verdict = (await page.locator("#citebot .verdict-fail-sentence").first().textContent())?.trim();
  const split = (await page.locator("#citebot .split-fail-sentence").first().textContent())?.trim();
  expect(verdict).toBe(split);
  expect(verdict).not.toBe((await page.locator("#citebot .verdict-fail-reason").first().textContent())?.trim());
});

test("a dashed hang does not cross a leader", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const crosses = await page.locator("#citebot .plate-drawing").evaluate((node) => {
    const lines = [...node.querySelectorAll("line")].map((line) => ({
      dashed: line.hasAttribute("stroke-dasharray"),
      leader: line.classList.contains("leader-line"),
      x1: line.x1.baseVal.value,
      y1: line.y1.baseVal.value,
      x2: line.x2.baseVal.value,
      y2: line.y2.baseVal.value,
    }));
    const hit = (a: (typeof lines)[number], b: (typeof lines)[number]) => {
      const det = (p: number, q: number, r: number, s: number) => p * s - q * r;
      const d = det(a.x2 - a.x1, b.x1 - b.x2, a.y2 - a.y1, b.y1 - b.y2);
      if (d === 0) return false;
      const t = det(b.x1 - a.x1, b.x1 - b.x2, b.y1 - a.y1, b.y1 - b.y2) / d;
      const u = det(a.x2 - a.x1, b.x1 - a.x1, a.y2 - a.y1, b.y1 - a.y1) / d;
      return t > 0.02 && t < 0.98 && u > 0.02 && u < 0.98;
    };
    const dashed = lines.filter((line) => line.dashed);
    const leaders = lines.filter((line) => line.leader);
    return dashed.filter((line) => leaders.some((leader) => hit(line, leader))).length;
  });
  expect(crosses).toBe(0);
});

test("the pen loop encloses the word FAIL", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const outside = await page.evaluate(() => {
    const misses: string[] = [];
    for (const mark of document.querySelectorAll(".fail-mark")) {
      const word = mark.querySelector(".fail-word")?.getBoundingClientRect();
      const loop = mark.querySelector(".pen-loop")?.getBoundingClientRect();
      const style = getComputedStyle(mark);
      if (style.display === "none" || style.visibility === "hidden" || !word || !loop || word.width === 0) continue;
      const contains = loop.left <= word.left + 0.5 && loop.top <= word.top + 0.5 && loop.right >= word.right - 0.5 && loop.bottom >= word.bottom - 0.5;
      if (!contains) misses.push(mark.closest("section")?.id ?? "fail");
    }
    return misses;
  });
  expect(outside).toEqual([]);
  const gap = await page.evaluate(() => {
    const loop = document.querySelector("#citebot .plate-drawing .pen-loop");
    const reason = document.querySelector("#citebot .verdict-fail-reason");
    if (!loop || !reason) return 0;
    return reason.getBoundingClientRect().top - loop.getBoundingClientRect().bottom;
  });
  expect(gap).toBeGreaterThanOrEqual(4);
});
