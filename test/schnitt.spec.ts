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
    const row = document.querySelector(".plane-row")?.getBoundingClientRect();
    return {
      small,
      copyY: copy ? Math.round(copy.y) : null,
      stageY: stage ? Math.round(stage.y) : null,
      rowW: row ? Math.round(row.width) : null,
      below: Boolean(copy && stage && stage.y >= copy.y + 24),
      wide: Boolean(row && row.width >= 200),
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
  const position = await page.locator(".flat-planes").evaluate((node) => getComputedStyle(node).position);
  expect(position).not.toBe("absolute");
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
  const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
  const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] ?? 0;
  const under16 = samples.filter((gap) => gap <= 16.7).length;
  console.log(
    JSON.stringify({
      frames: samples.length,
      medianMs: Number(median.toFixed(2)),
      p95Ms: Number(p95.toFixed(2)),
      shareAtMost16ms: Number((under16 / Math.max(samples.length, 1)).toFixed(3)),
    }),
  );
  expect(samples.length).toBeGreaterThan(10);
});
