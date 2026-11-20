import { expect, test } from "@playwright/test";

for (const width of [801, 1024, 1280, 1440]) {
  test(`hero labels stay apart and sheets stay inside the stage at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator(".schnitt-stage")).toHaveAttribute("data-gl", "ready", { timeout: 20000 });
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
      for (let i = 0; i < sheets.length; i += 1) {
        const box = sheets[i].getBoundingClientRect();
        if (box.right > root.right + 1 || box.bottom > root.bottom + 1 || box.left < root.left - 1) clips.push("sheet");
        const type = sheets[i].querySelector(".file, .body");
        if (type) {
          const words = type.getBoundingClientRect();
          if (words.bottom > root.bottom + 1 || words.right > root.right + 1 || words.top < root.top - 1) clips.push("type");
        }
        for (let j = i + 1; j < sheets.length; j += 1) if (hit(box, sheets[j].getBoundingClientRect())) overlaps.push("sheets");
      }
      const strokes: string[] = [];
      const anchors = [...stage.querySelectorAll("[data-anchor]")].map((node) => node.getBoundingClientRect());
      const nearAnchor = (x: number, y: number) => anchors.some((box) => x >= box.left - 4 && x <= box.right + 4 && y >= box.top - 4 && y <= box.bottom + 4);
      const letters: { box: DOMRect; text: string }[] = [];
      for (const glyph of stage.querySelectorAll<HTMLElement>(".sheet p, .sheet span")) {
        const words = [...glyph.childNodes].find((child) => child.nodeType === Node.TEXT_NODE && (child.textContent ?? "").trim());
        if (!words?.textContent) continue;
        const range = document.createRange();
        const text = words.textContent;
        for (let index = 0; index < text.length; index += 4) {
          if (!text[index].trim()) continue;
          range.setStart(words, index);
          range.setEnd(words, index + 1);
          const box = range.getBoundingClientRect();
          if (box.width > 0.4) letters.push({ box, text: text.trim().slice(0, 24) });
        }
      }
      for (const path of stage.querySelectorAll("path")) {
        if (!(path instanceof SVGPathElement) || !path.getAttribute("d")) continue;
        const svg = path.ownerSVGElement;
        const origin = svg?.getBoundingClientRect();
        if (!svg || !origin) continue;
        const box = svg.viewBox.baseVal;
        const sx = origin.width / (box.width || origin.width || 1);
        const sy = origin.height / (box.height || origin.height || 1);
        const total = path.getTotalLength();
        for (let distance = 0; distance <= total; distance += 3) {
          const point = path.getPointAtLength(distance);
          const x = origin.left + point.x * sx;
          const y = origin.top + point.y * sy;
          if (nearAnchor(x, y)) continue;
          for (const letter of letters) {
            const box = letter.box;
            if (x > box.left + 0.5 && x < box.right - 0.5 && y > box.top + 0.5 && y < box.bottom - 0.5) strokes.push(letter.text);
          }
        }
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
          return `S ${Math.round(box.right)} ${(sheet.style.transform || "no-tf").slice(80, 140)}`;
        }),
      ];
      return { overlaps, clips, cuts, strokes, boxes, inner: window.innerWidth };
    });
    expect(report.overlaps, `${report.inner} ${report.boxes.join(" | ")}`).toEqual([]);
    expect(report.clips).toEqual([]);
    expect(report.cuts).toEqual([]);
    expect(report.strokes, `${report.inner}`).toEqual([]);
  });
}
