import { expect, test } from "@playwright/test";

test("the CiteBot drawing is the same paper as the page", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "The still is read from a Chromium screenshot.");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator(".schnitt-stage")).toHaveAttribute("data-gl", "ready", { timeout: 30000 });
  await page.locator("#citebot").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const spots = await page.evaluate(() => {
    const svg = document.querySelector("#citebot svg.plate-drawing");
    if (!(svg instanceof SVGSVGElement)) return null;
    const box = svg.getBoundingClientRect();
    const blocked = (x: number, y: number) =>
      document.elementsFromPoint(x, y).some((node) => node instanceof Element && !!node.closest(".sheet-face, .leader-name, text, line, .pen-loop"));
    let panel: { x: number; y: number } | null = null;
    for (let y = box.top + 6; y < box.bottom - 6 && !panel; y += 5) {
      for (let x = box.left + 6; x < box.right - 6; x += 5) {
        if (!blocked(x, y)) {
          panel = { x: Math.round(x), y: Math.round(y) };
          break;
        }
      }
    }
    return { panel, page: { x: 8, y: Math.round(box.top + 24) } };
  });
  if (!spots?.panel) throw new Error("no paper pixel in the drawing");
  const picked = { panel: spots.panel, page: spots.page };
  const shot = await page.screenshot({ scale: "css", type: "png" });
  const rgb = await page.evaluate(async ({ image, spots: sample }) => {
    const img = new Image();
    img.src = `data:image/png;base64,${image}`;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    const read = (spot: { x: number; y: number }) => {
      const pixel = ctx.getImageData(spot.x, spot.y, 1, 1).data;
      return { r: pixel[0], g: pixel[1], b: pixel[2] };
    };
    return { panel: read(sample.panel), page: read(sample.page) };
  }, { image: shot.toString("base64"), spots: picked });
  expect(rgb).toBeTruthy();
  const delta = Math.max(
    Math.abs(rgb!.panel.r - rgb!.page.r),
    Math.abs(rgb!.panel.g - rgb!.page.g),
    Math.abs(rgb!.panel.b - rgb!.page.b),
  );
  expect(delta, JSON.stringify(rgb)).toBeLessThanOrEqual(2);
});
