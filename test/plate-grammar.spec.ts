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

test("the FAIL sentence is the same in the drawing and the phone stack", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const verdict = (await page.locator("#citebot .verdict-fail-sentence").first().textContent())?.trim();
  const stacked = (await page.locator("#citebot .cite-stack .verdict-fail-sentence").first().textContent())?.trim();
  expect(verdict).toBe(stacked);
  expect(verdict).not.toBe((await page.locator("#citebot .verdict-fail-reason").first().textContent())?.trim());
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
