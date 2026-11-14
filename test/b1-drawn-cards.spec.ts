import { expect, test } from "@playwright/test";

// Required test for B1 (add to test/schnitt.spec.ts). Chromium only, like "the WebGL canvas draws ink",
// because it reads back the WebGL canvas (preserveDrawingBuffer is on). At 5d46cf21 it fails:
// D · VERDICT has 6075 to 6165 of 6165 pixels on the drawn black card; A, B and C cover 1590 to 3420 card pixels.
test("desktop label boxes stay off the drawn cards through the scroll", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Reads back WebGL pixels in Chromium.");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator(".schnitt-stage")).toHaveAttribute("data-gl", "ready");
  await page.evaluate(() => document.fonts.ready);
  for (const share of [0, 0.5, 1]) {
    await page.evaluate((value) => {
      const hero = document.querySelector<HTMLElement>(".schnitt");
      if (hero) window.scrollTo(0, (hero.clientHeight - window.innerHeight) * value);
    }, share);
    await page.waitForTimeout(400);
    const covered = await page.evaluate(() => {
      const gl = document.querySelector<HTMLCanvasElement>(".schnitt-stage canvas");
      if (!gl) return ["no canvas"];
      const frame = gl.getBoundingClientRect();
      const copy = document.createElement("canvas");
      copy.width = gl.width;
      copy.height = gl.height;
      const context = copy.getContext("2d");
      if (!context) return ["no 2d context"];
      context.drawImage(gl, 0, 0);
      const sx = gl.width / frame.width;
      const sy = gl.height / frame.height;
      const hits: string[] = [];
      for (const label of document.querySelectorAll<HTMLElement>(".callout")) {
        const box = label.getBoundingClientRect();
        const data = context.getImageData(
          Math.max(0, Math.floor((box.left - frame.left) * sx)),
          Math.max(0, Math.floor((box.top - frame.top) * sy)),
          Math.max(1, Math.floor(box.width * sx)),
          Math.max(1, Math.floor(box.height * sy)),
        ).data;
        let card = 0;
        for (let index = 3; index < data.length; index += 4) if ((data[index] ?? 0) > 32) card += 1;
        if (card > 0) hits.push(`${(label.textContent ?? "").trim().slice(0, 16)}: ${card} card pixels`);
      }
      return hits;
    });
    expect(covered, `scroll ${share}`).toEqual([]);
  }
});

test("desktop sheet separation only increases through the hero scroll", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Measured with the drawn-card scroll in Chromium.");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator(".schnitt-stage")).toHaveAttribute("data-gl", "ready");
  await page.evaluate(() => document.fonts.ready);
  const spreads: number[] = [];
  for (const share of [0, 0.25, 0.5, 0.75, 1]) {
    await page.evaluate((value) => {
      const hero = document.querySelector<HTMLElement>(".schnitt");
      if (hero) window.scrollTo(0, (hero.clientHeight - window.innerHeight) * value);
    }, share);
    await page.waitForTimeout(200);
    const spread = await page.evaluate(() => {
      const tops = [...document.querySelectorAll(".sheet")].map((node) => node.getBoundingClientRect().top).sort((a, b) => a - b);
      return (tops[tops.length - 1] ?? 0) - (tops[0] ?? 0);
    });
    spreads.push(spread);
  }
  for (let index = 1; index < spreads.length; index += 1) {
    expect(spreads[index], `spread ${spreads.join(" → ")}`).toBeGreaterThanOrEqual((spreads[index - 1] ?? 0) - 1);
  }
  expect(spreads[spreads.length - 1], spreads.join(" → ")).toBeGreaterThan(spreads[0] ?? 0);
});
