import { expect, test } from "@playwright/test";
import { CITEBOT_PLATE } from "../lib/diagrams";
import { loadSchnittRun } from "../lib/schnitt-run";

// The CiteBot drawing prints the fixture on its sheets. Every line must sit
// inside its own sheet, lines must not run into each other, nothing may be cut
// off, and a pen loop may ring only its own FAIL.
for (const width of [1280, 1366, 1440]) {
  test(`CiteBot sheet text fits, stays whole, and keeps clear of the loops at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const report = await page.locator("#citebot svg.plate-drawing").evaluate((svg) => {
      const outside: string[] = [];
      const crowded: string[] = [];
      const ringed: string[] = [];
      const hangs: Record<string, string> = {};
      const groups = [...svg.querySelectorAll("g.draw-sheet, g[data-hang]")];
      for (const group of groups) {
        const face = group.querySelector(":scope > rect.sheet-face")?.getBoundingClientRect();
        const texts = [...group.querySelectorAll("text")].filter((text) => (text.textContent ?? "").trim());
        const boxes = texts.map((text) => ({ text: (text.textContent ?? "").trim(), box: text.getBoundingClientRect(), mark: !!text.closest(".fail-mark") }));
        const name = group.getAttribute("data-step") ?? group.getAttribute("data-hang") ?? "?";
        if (group.hasAttribute("data-hang")) hangs[name] = boxes.filter((item) => !item.mark).map((item) => item.text).join(" ");
        for (const item of boxes) {
          if (!face) continue;
          if (item.box.left < face.left - 1 || item.box.right > face.right + 1 || item.box.top < face.top - 1 || item.box.bottom > face.bottom + 1) outside.push(`${name}: "${item.text}"`);
        }
        for (let i = 0; i < boxes.length; i += 1) {
          for (let j = i + 1; j < boxes.length; j += 1) {
            const a = boxes[i].box;
            const b = boxes[j].box;
            const across = Math.min(a.right, b.right) - Math.max(a.left, b.left);
            const down = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
            if (across > 1 && down > 3) crowded.push(`${name}: "${boxes[i].text}" / "${boxes[j].text}" ${down.toFixed(1)}px`);
          }
        }
      }
      for (const loop of svg.querySelectorAll(".pen-loop")) {
        const ring = loop.getBoundingClientRect();
        const own = loop.closest(".fail-mark");
        const word = own?.querySelector("text")?.getBoundingClientRect();
        if (word && word.width > 0) {
          const pad = Math.min(word.left - ring.left, ring.right - word.right, word.top - ring.top, ring.bottom - word.bottom);
          if (pad < 4) ringed.push(`loop within ${pad.toFixed(1)}px of its word`);
        }
        for (const text of svg.querySelectorAll("text")) {
          if (own?.contains(text) || !(text.textContent ?? "").trim()) continue;
          const box = text.getBoundingClientRect();
          const grown = { left: box.left - 4, right: box.right + 4, top: box.top - 4, bottom: box.bottom + 4 };
          const across = Math.min(ring.right, grown.right) - Math.max(ring.left, grown.left);
          const down = Math.min(ring.bottom, grown.bottom) - Math.max(ring.top, grown.top);
          if (across > 0 && down > 0) ringed.push(`"${(text.textContent ?? "").trim()}"`);
        }
      }
      return { outside, crowded, ringed, hangs };
    });
    const fail = loadSchnittRun().sentences.find((sentence) => sentence.verdict === "fail");
    expect(report.outside).toEqual([]);
    expect(report.crowded).toEqual([]);
    expect(report.ringed).toEqual([]);
    expect(report.hangs.retrieve).toBe(CITEBOT_PLATE.refusal);
    expect(report.hangs.check).toBe(`${fail?.text} ${fail?.evidence}`);
  });
}

for (const width of [1024, 1280, 1440]) {
  test(`step labels sit off the sheet text at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const hits = await page.locator("#citebot").evaluate((plate) => {
      const hit = (a: DOMRect, b: DOMRect) => a.width > 1 && b.width > 1 && a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1;
      const found: string[] = [];
      for (const label of plate.querySelectorAll<HTMLElement>(".leader-name")) {
        const box = label.getBoundingClientRect();
        if (box.width < 2) continue;
        for (const face of plate.querySelectorAll(".sheet-face")) {
          if (hit(box, face.getBoundingClientRect())) found.push((label.textContent ?? "").trim());
        }
        for (const text of plate.querySelectorAll<HTMLElement>(".body, text")) {
          if (label.contains(text)) continue;
          if (hit(box, text.getBoundingClientRect())) found.push(`${(label.textContent ?? "").trim()} on ${(text.textContent ?? "").trim().slice(0, 24)}`);
        }
      }
      return found;
    });
    expect(hits).toEqual([]);
  });
}

test("desktop creates one WebGL context; phone, reduced motion and WebGL off create none", async ({ browser }) => {
  const count = async (options: Parameters<typeof browser.newContext>[0], blockWebGL = false) => {
    const context = await browser.newContext(options);
    await context.addInitScript((block: boolean) => {
      const win = window as unknown as { __created: number };
      win.__created = 0;
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement & { __counted?: boolean }, type: string, ...rest: unknown[]) {
        if (block && /webgl/.test(type)) return null;
        const made = (original as (...args: unknown[]) => unknown).call(this, type, ...rest);
        if (made && /webgl/.test(type) && !this.__counted) {
          this.__counted = true;
          win.__created += 1;
        }
        return made;
      } as typeof HTMLCanvasElement.prototype.getContext;
    }, blockWebGL);
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(300);
    const created = await page.evaluate(() => (window as unknown as { __created: number }).__created);
    const mode = await page.evaluate(() => document.documentElement.dataset.schnitt);
    await context.close();
    return { created, mode };
  };
  const desktop = await count({ viewport: { width: 1440, height: 900 } });
  expect(desktop.created).toBe(1);
  expect(desktop.mode).toBe("gl");
  expect((await count({ viewport: { width: 390, height: 844 } })).created).toBe(0);
  expect((await count({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" })).created).toBe(0);
  const off = await count({ viewport: { width: 1440, height: 900 } }, true);
  expect(off.created).toBe(0);
  expect(off.mode).toBe("flat");
});
