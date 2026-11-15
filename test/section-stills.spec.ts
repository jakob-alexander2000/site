import { expect, test } from "@playwright/test";
import { SECTION_RAIL } from "../lib/section-rail";

test("re-enabling the section rail fails this test", () => {
  expect(SECTION_RAIL).toBe(false);
});

for (const width of [1280, 1366, 1440, 1920]) {
  test(`baked stills are decoded and distinct at ${width}px`, async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "The baked still is read in Chromium, where the plates are painted.");
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator(".schnitt-stage")).toHaveAttribute("data-rail", "off", { timeout: 20000 });
    await expect(page.locator(".schnitt-stage")).toHaveAttribute("data-gl", "ready", { timeout: 20000 });
    const report = await page.evaluate(async () => {
      const read = async (id: string) => {
        const img = document.querySelector(`#${id} .plate-still`);
        if (!(img instanceof HTMLImageElement)) return null;
        if (!img.complete || img.naturalWidth === 0) await img.decode().catch(() => undefined);
        return {
          src: img.currentSrc || img.src,
          width: img.naturalWidth,
          still: img.closest(".drawing-frame")?.getAttribute("data-still") ?? "",
        };
      };
      return { citebot: await read("citebot"), style: await read("style") };
    });
    expect(report.citebot?.width, "citebot decoded").toBeGreaterThan(10);
    expect(report.style?.width, "style decoded").toBeGreaterThan(10);
    expect(report.citebot?.still).toBe("citebot");
    expect(report.style?.still).toBe("style");
    expect(report.citebot?.src).not.toBe(report.style?.src);
  });
}
