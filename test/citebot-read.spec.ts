import { expect, test, type Page } from "@playwright/test";
import { CITEBOT_PLATE } from "../lib/diagrams";
import { BAKED_LABEL_PX, BAKED_WIDTH, bandForWidth } from "../lib/plate-bake";
import { loadSchnittRun } from "../lib/schnitt-run";

// CiteBot reads in one pass: question, then source, then answer with citations.
// Rows C1 to C9 of the stop 8 spec. Desktop geometry is read from the live
// drawing, which is the bake source; the still is that drawing at the same scale.

const run = loadSchnittRun();
const cited = run.sentences.find((sentence) => sentence.verdict === "pass");
const fail = run.sentences.find((sentence) => sentence.verdict === "fail");
const PHONES = [375, 390, 430];
const DESKTOPS = [1100, 1280, 1440, 1920];

async function open(page: Page, width: number, height = 900, blockStills = true) {
  if (blockStills) await page.route("**/plates/citebot@*.webp", (route) => route.abort());
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => {
    const frame = document.querySelector<HTMLElement>("#citebot .drawing-frame");
    const stack = document.querySelector<HTMLElement>("#citebot .cite-stack");
    return frame?.dataset.leaders === "ready" || stack?.dataset.leaders === "ready";
  });
}

/** What the reader sees in the figure: the stack on narrow screens, the drawing from 1100px. */
const readFigure = (page: Page) =>
  page.evaluate(() => {
    const figure = document.querySelector("#citebot figure");
    if (!figure) throw new Error("no figure");
    const stack = figure.querySelector<HTMLElement>(".cite-stack");
    const svg = figure.querySelector<SVGSVGElement>("svg.plate-drawing");
    const stacked = !!stack && getComputedStyle(stack).display !== "none";
    const scale = svg && !stacked ? svg.getBoundingClientRect().width / svg.viewBox.baseVal.width : 1;
    const laidOut = (node: Element) => {
      const style = getComputedStyle(node);
      const box = node.getBoundingClientRect();
      return style.display !== "none" && box.width > 2 && box.height > 2 && !node.closest(".cite-steps, title");
    };
    const leaves: { text: string; size: number; box: DOMRect; cls: string }[] = [];
    const root = stacked ? stack : svg;
    if (root) {
      const nodes = stacked ? root.querySelectorAll<HTMLElement>("p, span") : root.querySelectorAll<SVGTextElement>("text");
      for (const node of nodes) {
        if (!laidOut(node)) continue;
        const own = [...node.childNodes].filter((child) => child.nodeType === Node.TEXT_NODE).map((child) => child.textContent ?? "").join("").trim();
        if (!own) continue;
        leaves.push({ text: own, size: parseFloat(getComputedStyle(node).fontSize) * scale, box: node.getBoundingClientRect(), cls: node.getAttribute("class") ?? "" });
      }
    }
    const labels = [...(stacked ? stack.querySelectorAll<HTMLElement>(".leader-name") : figure.querySelectorAll<HTMLElement>(".sheet-labels .leader-name"))]
      .filter(laidOut)
      .map((node) => ({ text: (node.textContent ?? "").trim(), size: parseFloat(getComputedStyle(node).fontSize), top: node.getBoundingClientRect().top, left: node.getBoundingClientRect().left }));
    const red: { tag: string; area: number }[] = [];
    const redish = (value: string) => {
      const match = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(value);
      if (!match) return false;
      const [r, g, b] = [Number(match[1]), Number(match[2]), Number(match[3])];
      return r > 150 && g < 100 && b < 100;
    };
    for (const node of figure.querySelectorAll("*")) {
      if (!laidOut(node) && !(node instanceof SVGEllipseElement && node.getBoundingClientRect().width > 2)) continue;
      if (node.closest("svg.plate-drawing") && stacked) continue;
      if (node.closest(".cite-stack") && !stacked) continue;
      const style = getComputedStyle(node);
      const paints = node instanceof SVGElement ? [style.stroke, style.fill] : [style.color, style.borderTopColor, style.backgroundColor];
      if (paints.some(redish)) {
        const box = node.getBoundingClientRect();
        // An ellipse covers the inside of its box, not the corners.
        red.push({ tag: node.tagName, area: box.width * box.height * (node instanceof SVGEllipseElement ? Math.PI / 4 : 1) });
      }
    }
    const frame = figure.getBoundingClientRect();
    return { stacked, scale, leaves, labels, red, figureArea: frame.width * frame.height, figureHeight: frame.height };
  });

test.describe("C1 reading order", () => {
  for (const width of [390, 1440]) {
    test(`question, then source, then answer at ${width}px`, async ({ page }) => {
      await open(page, width, width < 800 ? 844 : 900);
      const order = await page.evaluate(() => {
        const figure = document.querySelector("#citebot figure");
        const ids = (selector: string) => [...(figure?.querySelectorAll<HTMLElement>(selector) ?? [])].map((node) => node.dataset.for ?? node.dataset.col ?? "");
        const steps = [...(figure?.querySelectorAll(".cite-steps li") ?? [])].map((node) => (node.textContent ?? "").split(".")[0]);
        const stack = [...(figure?.querySelectorAll<HTMLElement>(".cite-stack > .leader-name") ?? [])];
        const tops = stack.map((node) => node.getBoundingClientRect().top);
        const cols = [...(figure?.querySelectorAll<SVGGElement>("svg.plate-drawing g[data-col]") ?? [])].map((node) => node.getBoundingClientRect().left);
        return { overlay: ids(".sheet-labels .leader-name"), stack: ids(".cite-stack > .leader-name"), cols: ids("svg.plate-drawing g[data-col]"), steps, tops, lefts: cols };
      });
      for (const list of [order.overlay, order.stack, order.cols]) expect(list).toEqual(["question", "source", "answer"]);
      expect(order.steps).toEqual(["Question", "Source", "Answer"]);
      if (width < 800) {
        expect(order.tops[0]).toBeLessThan(order.tops[1] ?? 0);
        expect(order.tops[1]).toBeLessThan(order.tops[2] ?? 0);
      } else {
        expect(order.lefts[0]).toBeLessThan(order.lefts[1] ?? 0);
        expect(order.lefts[1]).toBeLessThan(order.lefts[2] ?? 0);
      }
      const spoken = await page.locator("#citebot figure").ariaSnapshot();
      const at = (word: string) => spoken.indexOf(word);
      expect(at("Question.")).toBeGreaterThan(-1);
      expect(at("Question.")).toBeLessThan(at("Source."));
      expect(at("Source.")).toBeLessThan(at("Answer."));
      expect(spoken).toContain("FAIL");
    });
  }
});

test.describe("C2 labels", () => {
  for (const width of [390, 1440]) {
    test(`exactly three sentence-case labels at ${width}px`, async ({ page }) => {
      await open(page, width, width < 800 ? 844 : 900);
      const figure = await readFigure(page);
      expect(figure.labels.map((label) => label.text)).toEqual(["Question", "Source", "Answer"]);
      const shouted = await page.evaluate(() =>
        [...document.querySelectorAll("#citebot *")]
          .filter((node) => !node.closest(".cite-steps, title") && node.getBoundingClientRect().width > 2)
          .map((node) => [...node.childNodes].filter((child) => child.nodeType === Node.TEXT_NODE).map((child) => child.textContent ?? "").join("").trim())
          .filter((text) => /^(QUESTION|RETRIEVE|DRAFT|SPLIT|CHECK|VERDICT|Retrieve|Draft|Split|Check|Verdict)$/.test(text)),
      );
      expect(shouted).toEqual([]);
    });
  }
});

test.describe("C3 focal point", () => {
  for (const width of [...PHONES, ...DESKTOPS]) {
    test(`the failed sentence is the largest text and the only red at ${width}px`, async ({ page }) => {
      await open(page, width, width < 800 ? 844 : 900);
      const figure = await readFigure(page);
      const s2 = figure.leaves.filter((leaf) => leaf.text === fail?.text);
      expect(s2.length).toBe(1);
      const top = s2[0]?.size ?? 0;
      for (const leaf of figure.leaves) if (leaf.text !== fail?.text) expect(leaf.size, leaf.text).toBeLessThan(top);
      for (const label of figure.labels) expect(label.size * (figure.stacked ? 1 : 1), label.text).toBeLessThan(top);
      expect(figure.red.length, JSON.stringify(figure.red)).toBe(1);
      expect((figure.red[0]?.area ?? 1) / figure.figureArea).toBeLessThan(0.05);
    });
  }
});

test.describe("C4 citation line", () => {
  for (const width of [390, 1100, 1280, 1440, 1920]) {
    test(`the hairline runs from [1] to the underlined span at ${width}px`, async ({ page }) => {
      await open(page, width, width < 800 ? 844 : 900);
      const report = await page.evaluate(() => {
        const stack = document.querySelector<HTMLElement>("#citebot .cite-stack");
        const stacked = !!stack && getComputedStyle(stack).display !== "none";
        const distance = (x: number, y: number, box: DOMRect) => {
          const dx = x < box.left ? box.left - x : x > box.right ? x - box.right : 0;
          const dy = y < box.top ? box.top - y : y > box.bottom ? y - box.bottom : 0;
          return Math.hypot(dx, dy);
        };
        let start = { x: 0, y: 0 };
        let end = { x: 0, y: 0 };
        let span: DOMRect;
        let mark: DOMRect;
        let s2: DOMRect;
        let lines = 0;
        let labels: DOMRect[];
        let segments: { x1: number; y1: number; x2: number; y2: number }[] = [];
        if (stacked && stack) {
          const path = stack.querySelector("svg.cite-link path");
          const root = stack.getBoundingClientRect();
          const numbers = (path?.getAttribute("d") ?? "").match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
          // M x y H g V y H x
          start = { x: root.left + (numbers[0] ?? 0), y: root.top + (numbers[1] ?? 0) };
          end = { x: root.left + (numbers[4] ?? 0), y: root.top + (numbers[3] ?? 0) };
          const gutter = root.left + (numbers[2] ?? 0);
          segments = [
            { x1: start.x, y1: start.y, x2: gutter, y2: start.y },
            { x1: gutter, y1: start.y, x2: gutter, y2: end.y },
            { x1: gutter, y1: end.y, x2: end.x, y2: end.y },
          ];
          span = stack.querySelector(".cite-passage .cite-span")!.getBoundingClientRect();
          mark = stack.querySelector(".cite-mark")!.getBoundingClientRect();
          s2 = stack.querySelector(".verdict-fail-sentence")!.getBoundingClientRect();
          lines = stack.querySelectorAll("svg.cite-link path").length;
          labels = [...stack.querySelectorAll(".leader-name")].map((node) => node.getBoundingClientRect());
        } else {
          const svg = document.querySelector<SVGSVGElement>("#citebot svg.plate-drawing")!;
          const ctm = svg.getScreenCTM()!;
          const point = svg.createSVGPoint();
          const screen = (x: number, y: number) => {
            point.x = x;
            point.y = y;
            const mapped = point.matrixTransform(ctm);
            return { x: mapped.x, y: mapped.y };
          };
          const line = svg.querySelector<SVGLineElement>("line.cite-line")!;
          start = screen(line.x1.baseVal.value, line.y1.baseVal.value);
          end = screen(line.x2.baseVal.value, line.y2.baseVal.value);
          span = svg.querySelector("text.cite-span")!.getBoundingClientRect();
          mark = svg.querySelector("text.cite-mark")!.getBoundingClientRect();
          s2 = svg.querySelector(".verdict-fail-sentence")!.getBoundingClientRect();
          lines = svg.querySelectorAll("line.cite-line").length;
          segments = [{ x1: start.x, y1: start.y, x2: end.x, y2: end.y }];
          labels = [...document.querySelectorAll("#citebot .sheet-labels .leader-name")].map((node) => node.getBoundingClientRect());
        }
        const crossesLabel = labels.some((box) =>
          segments.some((segment) => {
            const left = Math.min(segment.x1, segment.x2) - 0.5;
            const right = Math.max(segment.x1, segment.x2) + 0.5;
            const top = Math.min(segment.y1, segment.y2) - 0.5;
            const bottom = Math.max(segment.y1, segment.y2) + 0.5;
            return box.width > 1 && box.left < right && box.right > left && box.top < bottom && box.bottom > top;
          }),
        );
        return {
          lines,
          end: distance(end.x, end.y, span),
          start: distance(start.x, start.y, mark),
          s2: Math.min(distance(end.x, end.y, s2), distance(start.x, start.y, s2)),
          crossesLabel,
        };
      });
      expect(report.lines).toBe(1);
      expect(report.end, "end on the underlined span").toBeLessThanOrEqual(4);
      expect(report.start, "start at the [1] mark").toBeLessThanOrEqual(8);
      expect(report.s2, "no line touches the failed sentence").toBeGreaterThan(24);
      expect(report.crossesLabel).toBe(false);
    });
  }
});

test.describe("C5 sizes and fit", () => {
  for (const width of PHONES) {
    test(`phone type sizes at ${width}px`, async ({ page }) => {
      await open(page, width, 844);
      const figure = await readFigure(page);
      expect(figure.stacked).toBe(true);
      for (const label of figure.labels) expect(label.size, label.text).toBeGreaterThanOrEqual(12);
      const size = (text: string | undefined) => figure.leaves.find((leaf) => leaf.text === text || leaf.text.endsWith(text ?? "?"))?.size ?? 0;
      expect(size(run.question)).toBeGreaterThanOrEqual(20);
      expect(size(cited?.text)).toBeGreaterThanOrEqual(22);
      expect(size(fail?.text)).toBeGreaterThanOrEqual(22);
    });
  }
  const screens = [
    ...PHONES.flatMap((width) => {
      const height = { 375: 812, 390: 844, 430: 932 }[width] ?? 844;
      return [{ width, height }, { width: height, height: width }];
    }),
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
  ];
  for (const screen of screens) {
    test(`no clipping and no sideways scroll at ${screen.width}x${screen.height}`, async ({ page }) => {
      await open(page, screen.width, screen.height);
      const report = await page.evaluate(() => {
        const cut: string[] = [];
        const figure = document.querySelector("#citebot figure")!;
        const width = document.documentElement.clientWidth;
        for (const node of figure.querySelectorAll<HTMLElement>("p, span, text")) {
          const box = node.getBoundingClientRect();
          if (getComputedStyle(node).display === "none" || box.width < 2 || node.closest(".cite-steps")) continue;
          if (box.left < -0.5 || box.right > width + 0.5) cut.push((node.textContent ?? "").trim().slice(0, 24));
        }
        return { cut, scroll: document.documentElement.scrollWidth - window.innerWidth };
      });
      expect(report.cut).toEqual([]);
      expect(report.scroll).toBeLessThanOrEqual(0);
    });
  }
  test("drawn labels and type stay 11px or more from 1100 to 1920", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "The bake band is picked from the Chromium drawing box.");
    for (const width of [1100, 1200, 1280, 1366, 1440, 1680, 1920]) {
      await open(page, width);
      const figure = await readFigure(page);
      const displayed = await page.evaluate(() => document.querySelector("#citebot .drawing-frame")?.getBoundingClientRect().width ?? 0);
      const band = bandForWidth(displayed);
      expect((BAKED_LABEL_PX * displayed) / BAKED_WIDTH[band], `labels at ${width}`).toBeGreaterThanOrEqual(11);
      for (const leaf of figure.leaves) expect(leaf.size, `${leaf.text} at ${width}`).toBeGreaterThanOrEqual(11);
    }
  });
});

test.describe("C6 copy truth", () => {
  for (const width of [390, 1440]) {
    test(`every string comes from the recorded run or the plate copy at ${width}px`, async ({ page }) => {
      await open(page, width, width < 800 ? 844 : 900);
      const corpus = [
        run.question,
        run.handbook.file,
        run.passage.text,
        ...run.sentences.flatMap((sentence) => [sentence.text, sentence.evidence]),
        ...Object.values(CITEBOT_PLATE),
      ];
      const fixed = new Set(["Question", "Source", "Answer", "[1]", "FAIL"]);
      const strings = await page.evaluate(() => {
        const figure = document.querySelector("#citebot figure")!;
        const out: string[] = [];
        for (const node of figure.querySelectorAll("p, span, text, figcaption")) {
          for (const child of node.childNodes) {
            if (child.nodeType !== Node.TEXT_NODE) continue;
            const own = (child.textContent ?? "").replace(/\s+/g, " ").trim();
            if (own) out.push(own);
          }
        }
        return out;
      });
      const strays = strings.filter((text) => !fixed.has(text) && !corpus.some((source) => source.includes(text)));
      expect(strays).toEqual([]);
      const spans = await page.locator("#citebot .cite-span").allTextContents();
      expect(spans.length).toBe(2);
      for (const span of spans) {
        expect(span).toBe(run.passage.span);
        expect(run.passage.text.includes(span)).toBe(true);
      }
      await expect(page.locator("#citebot figcaption")).toHaveText(CITEBOT_PLATE.body);
      const drawn = await page.locator("#citebot svg.plate-drawing text").allTextContents();
      expect(drawn.map((text) => text.trim())).toContain(cited?.text);
      expect(drawn.map((text) => text.trim())).toContain(fail?.text);
    });
  }
});

test.describe("C7 reduced motion", () => {
  for (const motion of ["reduce", "no-preference"] as const) {
    test(`the figure is still and final with motion ${motion}`, async ({ browser }) => {
      const context = await browser.newContext({ baseURL: "http://127.0.0.1:3456", viewport: { width: 390, height: 844 }, reducedMotion: motion });
      const page = await context.newPage();
      await open(page, 390, 844);
      const animations = await page.evaluate(() =>
        document
          .getAnimations()
          .filter((animation) => {
            const target = (animation.effect as KeyframeEffect | null)?.target;
            return target instanceof Element && !!target.closest("#citebot");
          })
          .map((animation) => Number((animation.effect?.getComputedTiming().endTime ?? 0).toString())),
      );
      if (motion === "reduce") expect(animations).toEqual([]);
      else for (const end of animations) expect(end).toBeLessThanOrEqual(600);
      await page.waitForTimeout(700);
      const shot = await page.locator("#citebot figure").screenshot();
      await context.close();
      test.info().attachments.push({ name: `figure-${motion}`, contentType: "image/png", body: shot });
      const other = await browser.newContext({ baseURL: "http://127.0.0.1:3456", viewport: { width: 390, height: 844 }, reducedMotion: motion === "reduce" ? "no-preference" : "reduce" });
      const second = await other.newPage();
      await open(second, 390, 844);
      await second.waitForTimeout(700);
      const compare = await second.locator("#citebot figure").screenshot();
      await other.close();
      expect(compare.equals(shot), "the final frame is the reduced-motion frame").toBe(true);
    });
  }
});

test.describe("C8 fit", () => {
  test("no runway, and the figure fits a phone and a laptop screen", async ({ page }) => {
    await open(page, 390, 844);
    await expect(page.locator("#citebot .cut-runway")).toHaveCount(0);
    expect((await readFigure(page)).figureHeight).toBeLessThanOrEqual(844 * 1.2);
    await open(page, 1280, 800);
    expect((await readFigure(page)).figureHeight).toBeLessThanOrEqual(800);
  });
});

test.describe("C9 stills", () => {
  test("every CiteBot bake is the new drawing", async ({ page }) => {
    await page.goto("/");
    const report = await page.evaluate(async () => {
      const svg = document.querySelector<SVGSVGElement>("#citebot svg.plate-drawing")!;
      const aspect = svg.viewBox.baseVal.height / svg.viewBox.baseVal.width;
      const out: { name: string; width: number; height: number; aspect: number }[] = [];
      for (const band of [1100, 1280, 1440]) {
        for (const scale of [1, 2]) {
          const name = `citebot@${band}@${scale}.webp`;
          const blob = await (await fetch(`/plates/${name}`)).blob();
          const bitmap = await createImageBitmap(blob);
          out.push({ name, width: bitmap.width, height: bitmap.height, aspect });
        }
      }
      return out;
    });
    const widths: Record<string, number> = { "1100": 1060, "1280": 1280, "1440": 1520 };
    for (const item of report) {
      const [, band, scale] = item.name.replace(".webp", "").split("@");
      expect(Math.abs(item.width - widths[band ?? ""]! * Number(scale)), item.name).toBeLessThanOrEqual(2);
      expect(Math.abs(item.height / item.width - item.aspect), item.name).toBeLessThan(0.01);
    }
  });
});
