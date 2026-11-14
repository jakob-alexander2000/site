import { expect, test } from "@playwright/test";

// Drawn plates scale their type with the viewBox. Wherever a drawing is shown,
// its smallest text must still render at 11px or more; where it would not, the
// plate shows its sheet stack, and that stack must be readable.
for (const width of [801, 1024, 1099, 1100, 1280, 1339, 1340, 1440]) {
  test(`plate type renders at 11px or more at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const report = await page.evaluate(() => {
      const shown = (node: Element) => {
        const style = getComputedStyle(node);
        const box = node.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && box.width > 0 && box.height > 0;
      };
      const small: string[] = [];
      const empty: string[] = [];
      for (const id of ["citebot", "style"]) {
        const plate = document.getElementById(id);
        if (!plate) {
          empty.push(`${id} missing`);
          continue;
        }
        const drawing = plate.querySelector<SVGSVGElement>("svg.plate-drawing");
        const stack = plate.querySelector(".plate-stack");
        const drawn = drawing !== null && shown(drawing);
        const stacked = stack !== null && shown(stack);
        if (drawn === stacked) empty.push(`${id} drawn=${drawn} stacked=${stacked}`);
        if (drawn && drawing) {
          const scale = drawing.getBoundingClientRect().width / drawing.viewBox.baseVal.width;
          for (const text of drawing.querySelectorAll("text")) {
            if (!shown(text) || !(text.textContent ?? "").trim()) continue;
            const size = parseFloat(getComputedStyle(text).fontSize) * scale;
            if (size < 11) small.push(`${id}: "${text.textContent?.trim().slice(0, 24)}" ${size.toFixed(2)}px`);
          }
        }
        for (const label of plate.querySelectorAll(".leader-name")) {
          if (!shown(label) || !(label.textContent ?? "").trim()) continue;
          const svg = label.closest("svg");
          const scale = svg instanceof SVGSVGElement ? svg.getBoundingClientRect().width / svg.viewBox.baseVal.width : 1;
          const size = parseFloat(getComputedStyle(label).fontSize) * scale;
          if (size < 11) small.push(`${id} label: "${label.textContent?.trim().slice(0, 24)}" ${size.toFixed(2)}px`);
        }
        if (stacked && stack) {
          for (const node of stack.querySelectorAll("p, li, span")) {
            if (!shown(node) || !(node.textContent ?? "").trim() || node.querySelector("p, li, span")) continue;
            const size = parseFloat(getComputedStyle(node).fontSize);
            if (size < 11) small.push(`${id} stack: "${node.textContent?.trim().slice(0, 24)}" ${size}px`);
          }
        }
      }
      return { small, empty };
    });
    expect(report.empty).toEqual([]);
    expect(report.small).toEqual([]);
  });
}

test("every failed check says FAIL to a screen reader", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const qualifier = page.locator("#autopsy li", { hasText: "Qualifier" });
  await expect(qualifier).toHaveCount(1);
  expect(await qualifier.ariaSnapshot()).toContain("FAIL");
  for (const check of ["Support", "Scope", "Omission"]) {
    expect(await page.locator("#autopsy li", { hasText: check }).first().ariaSnapshot()).toContain("PASS");
  }
});

test("the FAIL mark keeps its drawn size on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const widths = await page.evaluate(() =>
    [...document.querySelectorAll<SVGSVGElement>("svg.fail-mark")]
      .filter((mark) => getComputedStyle(mark).display !== "none" && mark.getBoundingClientRect().width > 0)
      .map((mark) => Math.round(mark.getBoundingClientRect().width)),
  );
  expect(widths.length).toBeGreaterThan(0);
  for (const width of widths) expect(width).toBeLessThanOrEqual(80);
});
