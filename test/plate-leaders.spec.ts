import { expect, test } from "@playwright/test";

for (const width of [1024, 1280, 1440]) {
  test(`each CiteBot leader meets its label and its sheet at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => document.querySelector("#citebot .drawing-frame")?.getAttribute("data-leaders") === "ready" || getComputedStyle(document.querySelector("#citebot svg.plate-drawing")!).display === "none");
    const report = await page.evaluate(() => {
      const svg = document.querySelector<SVGSVGElement>("#citebot svg.plate-drawing");
      const frame = document.querySelector("#citebot .drawing-frame");
      if (!(svg instanceof SVGSVGElement) || !frame || getComputedStyle(svg).display === "none" || svg.getBoundingClientRect().width < 2) {
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
      const lines = [...svg.querySelectorAll<SVGLineElement>("line.leader-line[data-for]")];
      for (const line of lines) {
        const id = line.dataset.for ?? "";
        const label = frame.querySelector<HTMLElement>(`.leader-name[data-for="${id}"]`);
        const face = svg.querySelector<SVGGraphicsElement>(`.draw-sheet[data-step="${id}"] > rect.sheet-face`);
        if (!label || !(face instanceof SVGGraphicsElement)) {
          misses.push(`${id} missing`);
          continue;
        }
        const start = toScreen(line.x1.baseVal.value, line.y1.baseVal.value);
        const end = toScreen(line.x2.baseVal.value, line.y2.baseVal.value);
        const labelBox = label.getBoundingClientRect();
        const faceBox = face.getBoundingClientRect();
        const labelY = (labelBox.top + labelBox.bottom) / 2;
        if (Math.abs(end.x - faceBox.left) > 2) misses.push(`${id} end ${Math.abs(end.x - faceBox.left).toFixed(1)}px from the sheet`);
        if (Math.abs(start.y - labelY) > 2) misses.push(`${id} start off its label row`);
        if (Math.abs(start.x - labelBox.right) > 2) misses.push(`${id} start off its label`);
      }
      return { shown: true, misses, count: lines.length };
    });
    if (!report.shown) {
      expect(width).toBeLessThan(1100);
      return;
    }
    expect(report.count).toBe(6);
    expect(report.misses).toEqual([]);
  });
}

for (const width of [1280, 1440]) {
  test(`dashed failure paths stay out of the step labels at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => document.querySelector("#citebot .drawing-frame")?.getAttribute("data-leaders") === "ready");
    const misses = await page.evaluate(() => {
      const svg = document.querySelector<SVGSVGElement>("#citebot svg.plate-drawing");
      const frame = document.querySelector("#citebot .drawing-frame");
      if (!(svg instanceof SVGSVGElement) || !frame) return ["missing drawing"];
      const ctm = svg.getScreenCTM();
      if (!ctm) return ["no matrix"];
      const point = svg.createSVGPoint();
      const toScreen = (x: number, y: number) => {
        point.x = x;
        point.y = y;
        const mapped = point.matrixTransform(ctm);
        return { x: mapped.x, y: mapped.y };
      };
      const grow = (box: DOMRect, pad: number) => ({ left: box.left - pad, right: box.right + pad, top: box.top - pad, bottom: box.bottom + pad });
      const hit = (a: { left: number; right: number; top: number; bottom: number }, b: { left: number; right: number; top: number; bottom: number }) =>
        a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      const leaders = [...svg.querySelectorAll<SVGLineElement>("line.leader-line")];
      const starts = leaders.map((line) => toScreen(line.x1.baseVal.value, line.y1.baseVal.value).x);
      const leaderStart = Math.min(...starts);
      const labels = [...frame.querySelectorAll<HTMLElement>(".leader-name")].map((label) => ({
        name: (label.textContent ?? "").trim(),
        box: label.getBoundingClientRect(),
      }));
      const found: string[] = [];
      for (const line of svg.querySelectorAll<SVGLineElement>("line.hang-leader")) {
        const start = toScreen(line.x1.baseVal.value, line.y1.baseVal.value);
        const end = toScreen(line.x2.baseVal.value, line.y2.baseVal.value);
        const path = {
          left: Math.min(start.x, end.x) - 1,
          right: Math.max(start.x, end.x) + 1,
          top: Math.min(start.y, end.y) - 1,
          bottom: Math.max(start.y, end.y) + 1,
        };
        if (Math.min(start.x, end.x) < leaderStart + 8) found.push(`${line.dataset.leader} enters the label column`);
        for (const label of labels) {
          if (label.box.width < 2) continue;
          if (hit(path, grow(label.box, 0))) found.push(`${line.dataset.leader} crosses ${label.name}`);
        }
      }
      return found;
    });
    expect(misses).toEqual([]);
  });
}
