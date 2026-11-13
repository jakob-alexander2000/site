import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { HERO_LINE, HERO_SUPPORT } from "../lib/schnitt-copy";

async function quiet(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (text.includes("favicon")) return;
    errors.push(text);
  });
  await page.addInitScript(() => {
    const windowWithShift = window as Window & { __cls?: number };
    windowWithShift.__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!shift.hadRecentInput) windowWithShift.__cls = (windowWithShift.__cls ?? 0) + (shift.value ?? 0);
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  return errors;
}

test("the sentence and the two claims are on the page", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("#opening")).toHaveText(HERO_LINE);
  await expect(page.locator("#opening em")).toHaveText("check");
  await expect(page.locator("em")).toHaveCount(1);
  await expect(page.getByText(HERO_SUPPORT)).toBeVisible();
  await expect(page.locator(".claim", { hasText: "Full-time employees receive 30 days." })).toBeVisible();
  await expect(page.locator(".is-fail", { hasText: "PTO is unlimited." })).toBeVisible();
  await expect(page.getByText("How many paid vacation days do full-time employees get?")).toBeVisible();
  await expect(page.getByText("The handbook says 30 days.")).toBeVisible();
  await expect(page.getByText("DATA FROM A RECORDED RUN, 9 NOV 2026")).toBeVisible();
  await expect(page.getByText("18 of 18 · offline eval · 29 OCT 2026")).toBeVisible();
  await expect(page.getByRole("link", { name: "See CiteBot run" })).toBeVisible();
  await expect(page.getByRole("link", { name: "How it is built" })).toHaveAttribute(
    "href",
    "https://github.com/jakob-alexander2000/citebot",
  );
  await expect(page.locator('a[href*="citebot-chi.vercel.app"]')).toHaveCount(0);
});

test("the passing sentence has a thread and the failing sentence has a loop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const stage = page.locator(".schnitt-stage");
  await expect(stage).toHaveAttribute("data-ties", "1");
  await expect(stage.locator("[data-thread='pass'] path")).toHaveAttribute("d", /.+/);
  await expect(page.locator("[data-thread='fail']")).toHaveCount(0);
  await expect(stage.locator("[data-fail='loop']")).toBeVisible();
  const failInk = await stage.locator(".is-fail .mark").evaluate((node) => getComputedStyle(node).color);
  expect(failInk).toBe("rgb(198, 48, 42)");
});

test("phone type is at least 11px and the stage is not a shrunk desktop", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".schnitt-stage")).toHaveAttribute("data-gl", /ready|off/);
  const report = await page.evaluate(() => {
    const root = document.querySelector("[data-schnitt]");
    const small: string[] = [];
    if (!root) return { small, stacked: false, overflow: true };
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    let node = walker.currentNode as Element | null;
    while (node) {
      const text = [...node.childNodes].some((child) => child.nodeType === Node.TEXT_NODE && (child.textContent ?? "").trim());
      if (text) {
        const size = Number.parseFloat(getComputedStyle(node).fontSize);
        if (size < 11) small.push(`${size}px ${(node.textContent ?? "").trim().slice(0, 40)}`);
        const box = node.getBoundingClientRect();
        if (box.height > 0 && box.height < 11 && node.classList.contains("leader-name")) {
          small.push(`visual ${box.height.toFixed(1)}px ${(node.textContent ?? "").trim().slice(0, 40)}`);
        }
      }
      node = walker.nextNode() as Element | null;
    }
    const copy = document.querySelector(".schnitt-copy")?.getBoundingClientRect();
    const stage = document.querySelector(".schnitt-stage")?.getBoundingClientRect();
    const row = document.querySelector(".sheet")?.getBoundingClientRect();
    return {
      small,
      copyY: copy ? Math.round(copy.y) : null,
      stageY: stage ? Math.round(stage.y) : null,
      rowW: row ? Math.round(row.width) : null,
      below: Boolean(copy && stage && stage.y >= copy.y + 24),
      wide: Boolean(row && row.width >= 140),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    };
  });
  expect(report.small).toEqual([]);
  expect(report.below, JSON.stringify(report)).toBe(true);
  expect(report.wide, JSON.stringify(report)).toBe(true);
  expect(report.overflow).toBe(false);
});

test("reduced motion keeps the exploded stack and skips the scroll scene", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-schnitt", "flat");
  await expect(page.locator(".schnitt-stage")).toHaveAttribute("data-gl", "off");
  await expect(page.locator(".claim", { hasText: "Full-time employees receive 30 days." })).toBeVisible();
  await expect(page.locator(".is-fail", { hasText: "PTO is unlimited." })).toBeVisible();
  await expect(page.locator(".schnitt-stage")).toHaveAttribute("data-ties", "1");
  const transform = await page.locator(".sheet").first().evaluate((node) => getComputedStyle(node).transform);
  expect(transform.includes("matrix")).toBe(true);
  const label = page.locator(".callout").first();
  await expect(label).toBeVisible();
  expect(await label.evaluate((node) => node.closest(".sheet") !== null)).toBe(false);
});

test("a WebGL context that throws after detection shows the static stack", async ({ page }) => {
  const errors = await quiet(page);
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    let seen = 0;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      const webgl = type === "webgl" || type === "webgl2" || type === "experimental-webgl";
      if (webgl) {
        seen += 1;
        if (seen > 1) throw new Error("webgl context failed");
      }
      return original.apply(this, [type, ...args] as unknown as [string, CanvasRenderingContext2DSettings]);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-schnitt", "flat");
  await expect(page.locator(".schnitt-stage")).toHaveAttribute("data-gl", "off");
  await expect(page.locator(".sheet")).toHaveCount(4);
  const transform = await page.locator(".sheet").first().evaluate((node) => getComputedStyle(node).transform);
  expect(transform.includes("matrix")).toBe(true);
  expect(await page.locator(".callout").first().evaluate((node) => node.closest(".sheet") === null)).toBe(true);
  await expect(page.locator(".is-fail", { hasText: "PTO is unlimited." })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const cls = await page.evaluate(() => (window as Window & { __cls?: number }).__cls ?? 0);
  expect(cls).toBe(0);
  expect(errors).toEqual([]);
});

test("a blocked WebGL context still shows the sheets", async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-schnitt", "flat");
  await expect(page.getByText("Paid time off", { exact: true })).toBeVisible();
  await expect(page.locator(".is-fail")).toBeVisible();
  const box = await page.locator(".sheet").first().boundingBox();
  expect(box?.height ?? 0).toBeGreaterThan(40);
});

test("the WebGL canvas draws ink", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Software WebGL is launched on Chromium.");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator(".schnitt-stage")).toHaveAttribute("data-gl", "ready");
  const ink = await page.locator("canvas.schnitt-gl").evaluate((canvas) => {
    const source = canvas as HTMLCanvasElement;
    const copy = document.createElement("canvas");
    copy.width = source.width;
    copy.height = source.height;
    const context = copy.getContext("2d");
    if (!context || source.width < 2) return 0;
    context.drawImage(source, 0, 0);
    const data = context.getImageData(0, 0, copy.width, copy.height).data;
    let count = 0;
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;
      const a = data[i + 3] ?? 0;
      const dark = a > 180 && r < 40 && g < 40 && b < 40;
      const red = a > 180 && r > 160 && g < 90 && b < 90;
      if (dark || red) count += 1;
    }
    return count;
  });
  expect(ink).toBeGreaterThan(80);
});

test("axe, console, and hero layout shift", async ({ page }) => {
  const errors = await quiet(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".schnitt").evaluate((node) => {
    const range = node.clientHeight - window.innerHeight;
    window.scrollTo(0, range * 0.5);
  });
  const results = await new AxeBuilder({ page }).include("[data-schnitt]").analyze();
  expect(results.violations).toEqual([]);
  const cls = await page.evaluate(() => (window as Window & { __cls?: number }).__cls ?? 0);
  expect(cls).toBe(0);
  expect(errors).toEqual([]);
});

test("frame time while the layers separate", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "CPU throttle is measured in Chromium.");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".schnitt-stage")).toHaveAttribute("data-gl", /ready|off/);
  const client = await page.context().newCDPSession(page);
  await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const samples = await page.evaluate(async () => {
    const root = document.querySelector(".schnitt");
    const range = root ? root.clientHeight - window.innerHeight : 0;
    const start = performance.now();
    const gaps: number[] = [];
    let previous = start;
    await new Promise<void>((resolve) => {
      const step = (now: number) => {
        gaps.push(now - previous);
        previous = now;
        const t = now - start;
        window.scrollTo(0, Math.min(range, (t / 1200) * range));
        if (t < 1200) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
    return gaps;
  });
  await client.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  const sorted = [...samples].sort((a, b) => a - b);
  const mid = sorted.length % 2 === 1 ? sorted[(sorted.length - 1) / 2] : ((sorted[sorted.length / 2 - 1] ?? 0) + (sorted[sorted.length / 2] ?? 0)) / 2;
  const p95 = sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)] ?? 0;
  const max = sorted[sorted.length - 1] ?? 0;
  const over20 = samples.filter((gap) => gap > 20).length;
  console.log(
    JSON.stringify({
      viewport: "390x844",
      frames: samples.length,
      medianMs: Number((mid ?? 0).toFixed(2)),
      p95Ms: Number(p95.toFixed(2)),
      maxMs: Number(max.toFixed(2)),
      shareOver20ms: Number((over20 / Math.max(samples.length, 1)).toFixed(3)),
    }),
  );
  expect(samples.length).toBeGreaterThan(10);
});

test("scroll pulls the tilted planes apart", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator(".schnitt-stage")).toHaveAttribute("data-gl", "ready");
  const gap = () =>
    page.evaluate(() => {
      const tops = [...document.querySelectorAll(".sheet")].map((node) => node.getBoundingClientRect().top).sort((a, b) => a - b);
      return (tops[1] ?? 0) - (tops[0] ?? 0);
    });
  const start = await gap();
  await page.evaluate(() => {
    const node = document.querySelector(".schnitt");
    const range = node ? node.clientHeight - window.innerHeight : 0;
    window.scrollTo(0, range);
  });
  await page.waitForTimeout(80);
  const end = await gap();
  expect(end - start).toBeGreaterThan(48);
});

for (const height of [844, 780]) {
  test(`phone sheets render type at 11px or more, the loop rings the claim, and the thread starts at the sentence at 390x${height}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height });
    await page.goto("/");
    await expect(page.locator(".schnitt-stage")).toHaveAttribute("data-ties", "1");
    await page.evaluate(() => document.fonts.ready);
    const report = await page.evaluate(() => {
      const small: string[] = [];
      for (const sheet of document.querySelectorAll<HTMLElement>(".sheet")) {
        const probe = (top: string) => {
          const dot = document.createElement("i");
          dot.style.cssText = `position:absolute;left:0;top:${top};width:0;height:0;margin:0;padding:0`;
          sheet.appendChild(dot);
          const box = dot.getBoundingClientRect();
          dot.remove();
          return box;
        };
        const a = probe("0");
        const b = probe("100%");
        const scale = Math.hypot(b.left - a.left, b.top - a.top) / sheet.offsetHeight;
        for (const node of sheet.querySelectorAll("p, span")) {
          const own = [...node.childNodes].some((child) => child.nodeType === Node.TEXT_NODE && (child.textContent ?? "").trim());
          if (!own) continue;
          const rendered = Number.parseFloat(getComputedStyle(node).fontSize) * scale;
          if (rendered < 11) small.push(`${rendered.toFixed(1)}px ${(node.textContent ?? "").trim().slice(0, 30)}`);
        }
      }
      const holder = document.querySelector(".fail-text");
      const loop = holder?.querySelector("svg")?.getBoundingClientRect();
      const words = [...(holder?.childNodes ?? [])].find((child) => child.nodeType === Node.TEXT_NODE);
      const range = document.createRange();
      if (words) range.selectNodeContents(words);
      const text = range.getBoundingClientRect();
      const ring = loop
        ? {
            dy: Math.abs((loop.top + loop.bottom) / 2 - (text.top + text.bottom) / 2),
            margin: Math.min(text.left - loop.left, loop.right - text.right, text.top - loop.top, loop.bottom - text.bottom),
          }
        : null;
      const stage = document.querySelector(".schnitt-stage")?.getBoundingClientRect();
      const start = document.querySelector(".tie-svg path")?.getAttribute("d")?.match(/-?[\d.]+/g)?.map(Number) ?? [];
      const sentence = document.querySelector("[data-anchor='sentence']")?.firstChild;
      let tie: { dx: number; dy: number } | null = null;
      if (stage && start.length >= 2 && sentence?.textContent) {
        const x = stage.left + start[0];
        const y = stage.top + start[1];
        const glyph = document.createRange();
        for (let index = 0; index < sentence.textContent.length; index += 1) {
          glyph.setStart(sentence, index);
          glyph.setEnd(sentence, index + 1);
          const box = glyph.getBoundingClientRect();
          if (box.width === 0) continue;
          const dx = x < box.left ? box.left - x : x > box.right ? x - box.right : 0;
          const dy = Math.abs(y - (box.top + box.bottom) / 2);
          if (!tie || dx + dy < tie.dx + tie.dy) tie = { dx, dy };
        }
      }
      return { small, ring, tie };
    });
    expect(report.small).toEqual([]);
    expect(report.ring, "the fail loop is drawn").not.toBeNull();
    expect(report.ring!.dy, JSON.stringify(report.ring)).toBeLessThanOrEqual(2);
    expect(report.ring!.margin, JSON.stringify(report.ring)).toBeGreaterThanOrEqual(4);
    expect(report.tie, "the pass thread is drawn").not.toBeNull();
    expect(report.tie!.dx, JSON.stringify(report.tie)).toBeLessThanOrEqual(3);
    expect(report.tie!.dy, JSON.stringify(report.tie)).toBeLessThanOrEqual(3);
  });
}

test("desktop sheet titles stay uncovered and the verdict stays in frame through the scroll", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator(".schnitt-stage")).toHaveAttribute("data-gl", "ready");
  await page.evaluate(() => document.fonts.ready);
  for (const share of [0, 0.5, 1]) {
    await page.evaluate((value) => {
      const node = document.querySelector(".schnitt");
      const range = node ? node.clientHeight - window.innerHeight : 0;
      window.scrollTo(0, range * value);
    }, share);
    await page.waitForTimeout(120);
    const report = await page.evaluate(() => {
      const covered: string[] = [];
      for (const title of document.querySelectorAll<HTMLElement>(".sheet .file")) {
        const words = title.firstChild;
        if (!words?.textContent) continue;
        const glyph = document.createRange();
        const length = words.textContent.length;
        const hidden = [0, Math.floor(length / 2), length - 1].some((index) => {
          glyph.setStart(words, index);
          glyph.setEnd(words, index + 1);
          const box = glyph.getBoundingClientRect();
          const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
          return !hit || !(title.contains(hit) || hit.contains(title));
        });
        if (hidden) covered.push((title.textContent ?? "").trim());
      }
      const stage = document.querySelector(".schnitt-stage")?.getBoundingClientRect();
      const foot = document.querySelector(".schnitt-foot")?.getBoundingClientRect();
      const verdict = document.querySelector(".sheet.verdict")?.getBoundingClientRect();
      return { covered, below: stage && verdict ? verdict.bottom - stage.bottom : 99, foot: foot && verdict ? verdict.bottom - foot.top : 99 };
    });
    expect(report.covered, `scroll ${share}`).toEqual([]);
    expect(report.below, `scroll ${share}`).toBeLessThanOrEqual(0);
    expect(report.foot, `scroll ${share}`).toBeLessThanOrEqual(0);
  }
});
