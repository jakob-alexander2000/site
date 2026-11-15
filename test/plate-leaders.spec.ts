import { expect, test } from "@playwright/test";

for (const width of [1024, 1280, 1440]) {
  test(`the CiteBot citation line meets its mark and its span at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => document.querySelector("#citebot .drawing-frame")?.getAttribute("data-leaders") === "ready" || getComputedStyle(document.querySelector("#citebot svg.plate-drawing")!).display === "none");
    const report = await page.evaluate(() => {
      const svg = document.querySelector<SVGSVGElement>("#citebot svg.plate-drawing");
      if (!(svg instanceof SVGSVGElement) || getComputedStyle(svg).display === "none" || svg.getBoundingClientRect().width < 2) {
        return { shown: false, misses: [] as string[], count: 0 };
      }
      const ctm = svg.getScreenCTM();
      if (!ctm) return { shown: true, misses: ["no matrix"], count: 0 };
      const point = svg.createSVGPoint();
      const toScreen = (x: number, y: number) => {
        point.x = x;
        point.y = y;
        const mapped = point.matrixTransform(ctm);
        return { x: mapped.x, y: mapped.y };
      };
      const misses: string[] = [];
      const lines = [...svg.querySelectorAll<SVGLineElement>("line.cite-line")];
      const span = svg.querySelector("text.cite-span")?.getBoundingClientRect();
      const mark = svg.querySelector("text.cite-mark")?.getBoundingClientRect();
      for (const line of lines) {
        if (!span || !mark) {
          misses.push("missing span or mark");
          continue;
        }
        const start = toScreen(line.x1.baseVal.value, line.y1.baseVal.value);
        const end = toScreen(line.x2.baseVal.value, line.y2.baseVal.value);
        if (Math.abs(end.x - span.right) > 4) misses.push(`end ${Math.abs(end.x - span.right).toFixed(1)}px from the span`);
        if (end.y < span.top || end.y > span.bottom) misses.push("end off the span row");
        if (Math.abs(start.x - mark.left) > 6) misses.push("start off the mark");
        if (start.y < mark.top || start.y > mark.bottom) misses.push("start off the mark row");
      }
      return { shown: true, misses, count: lines.length };
    });
    if (!report.shown) {
      expect(width).toBeLessThan(1100);
      return;
    }
    expect(report.count).toBe(1);
    expect(report.misses).toEqual([]);
  });
}
