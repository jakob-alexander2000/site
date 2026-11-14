import { expect, test } from "@playwright/test";

for (const width of [801, 900, 1024]) {
  test(`hero labels stay apart and sheets stay inside the stage at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator(".schnitt-stage")).toHaveAttribute("data-gl", "ready");
    const report = await page.locator(".schnitt-stage").evaluate((stage) => {
      const overlaps: string[] = [];
      const clips: string[] = [];
      const cuts: string[] = [];
      const root = stage.getBoundingClientRect();
      const labels = [...stage.querySelectorAll<HTMLElement>(".callout")].filter((node) => node.getBoundingClientRect().width > 0);
      const sheets = [...stage.querySelectorAll<HTMLElement>(".sheet")];
      const hit = (a: DOMRect, b: DOMRect) => a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1;
      for (let i = 0; i < labels.length; i += 1) {
        const box = labels[i].getBoundingClientRect();
        if (box.right > root.right + 1 || box.left < root.left - 1) clips.push(labels[i].textContent?.trim().slice(0, 16) ?? "label");
        for (const sheet of sheets) if (hit(box, sheet.getBoundingClientRect())) overlaps.push(labels[i].textContent?.trim().slice(0, 16) ?? "label");
        for (let j = i + 1; j < labels.length; j += 1) if (hit(box, labels[j].getBoundingClientRect())) overlaps.push("labels");
      }
      for (const sheet of sheets) {
        const box = sheet.getBoundingClientRect();
        if (box.right > root.right + 1) clips.push("sheet");
      }
      const svg = stage.querySelector(".leaders");
      if (svg instanceof SVGSVGElement) {
        for (const path of svg.querySelectorAll("path")) {
          const line = path.getBoundingClientRect();
          for (const sheet of sheets) {
            const face = sheet.getBoundingClientRect();
            const across = Math.min(line.right, face.right) - Math.max(line.left, face.left);
            const down = Math.min(line.bottom, face.bottom) - Math.max(line.top, face.top);
            if (across > 4 && down > 4) cuts.push("leader");
          }
        }
      }
      const boxes = [
        ...labels.map((label) => {
          const box = label.getBoundingClientRect();
          return `L ${label.textContent?.trim().slice(0, 12)} ${Math.round(box.left)},${Math.round(box.top)} ${Math.round(box.width)}x${Math.round(box.height)}`;
        }),
        ...sheets.map((sheet) => {
          const box = sheet.getBoundingClientRect();
          return `S ${(sheet.style.transform || "no-tf").slice(80, 180)}`;
        }),
      ];
      return { overlaps, clips, cuts, boxes, inner: window.innerWidth };
    });
    expect(report.overlaps, `${report.inner} ${report.boxes.join(" | ")}`).toEqual([]);
    expect(report.clips).toEqual([]);
    expect(report.cuts).toEqual([]);
  });
}
