import { expect, test, type Browser, type Page } from "@playwright/test";

// iPhone Chrome runs WebKit. The toolbar showing and hiding changes only the height.
const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1";

async function phone(browser: Browser, browserName: string, width: number, height: number, init?: () => void) {
  const context = await browser.newContext({
    baseURL: "http://127.0.0.1:3456",
    viewport: { width, height },
    deviceScaleFactor: 3,
    isMobile: browserName === "chromium",
    hasTouch: true,
    userAgent: UA,
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.addInitScript(() => {
    const probe = { cls: 0, ys: [] as number[], canvas: [] as string[] };
    (window as unknown as { __probe: typeof probe }).__probe = probe;
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
          if (!entry.hadRecentInput) probe.cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    } catch {
      // WebKit has no layout-shift entries; the height checks still run.
    }
    const sample = () => {
      probe.ys.push(Math.round(window.scrollY));
      const canvas = document.querySelector("#schnitt-layers canvas");
      if (canvas instanceof HTMLCanvasElement) {
        const size = `${canvas.width}x${canvas.height}`;
        if (probe.canvas.at(-1) !== size) probe.canvas.push(size);
      }
      window.requestAnimationFrame(sample);
    };
    window.requestAnimationFrame(sample);
  });
  if (init) await page.addInitScript(init);
  return { page, errors, close: () => context.close() };
}

type Probe = { cls: number; ys: number[]; canvas: string[] };
const probe = (page: Page) => page.evaluate(() => (window as unknown as { __probe: Probe }).__probe);

async function toolbar(page: Page, width: number, height: number, toggles = 20) {
  const heights: number[] = [];
  for (let index = 0; index < toggles; index += 1) {
    await page.mouse.wheel(0, 260);
    await page.setViewportSize({ width, height: index % 2 ? height : height - 94 });
    await page.waitForTimeout(80);
    heights.push(await page.evaluate(() => document.documentElement.scrollHeight));
  }
  await page.setViewportSize({ width, height });
  await page.waitForTimeout(400);
  return heights;
}

test("phone toolbar resizes settle: no growth, no scroll oscillation, CLS under 0.1", async ({ browser, browserName }) => {
  const { page, errors, close } = await phone(browser, browserName, 390, 844);
  await page.goto("/");
  await page.waitForLoadState("load");
  await page.waitForTimeout(800);
  const start = await page.evaluate(() => document.documentElement.scrollHeight);
  const heights = await toolbar(page, 390, 844);
  const end = await page.evaluate(() => document.documentElement.scrollHeight);
  // Idle for a second: the page must not move by itself.
  await page.evaluate(() => {
    (window as unknown as { __probe: Probe }).__probe.ys = [];
  });
  await page.waitForTimeout(1000);
  const after = await probe(page);
  const moved = Math.max(...after.ys) - Math.min(...after.ys);
  expect(Math.max(...heights) - Math.min(...heights), `document height range over 20 toggles ${heights.join(",")}`).toBeLessThanOrEqual(200);
  expect(Math.abs(end - start), "document height returns to where it started").toBeLessThanOrEqual(1);
  expect(moved, "scrollY stays still while idle").toBe(0);
  expect(after.cls).toBeLessThan(0.1);
  expect(errors).toEqual([]);
  await close();
});

test("phone landscape 3D hero: toolbar resizes do not resize the canvas", async ({ browser, browserName }) => {
  const { page, errors, close } = await phone(browser, browserName, 844, 390);
  await page.goto("/");
  const stage = page.locator(".schnitt-stage");
  await expect(stage).toHaveAttribute("data-gl", "ready", { timeout: 30000 });
  await expect(stage).toHaveAttribute("data-ratio", "2");
  const before = (await probe(page)).canvas.length;
  for (let index = 0; index < 20; index += 1) {
    await page.mouse.wheel(0, index % 4 < 2 ? 40 : -40);
    await page.setViewportSize({ width: 844, height: index % 2 ? 390 : 296 });
    await page.waitForTimeout(80);
  }
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(400);
  const after = await probe(page);
  expect(after.canvas.slice(before), `canvas sizes after ready: ${after.canvas.join(" ")}`).toEqual([]);
  expect(after.cls).toBeLessThan(0.1);
  expect(errors).toEqual([]);
  await close();
});

async function expectStaticHero(page: Page) {
  await expect(page.locator("html")).toHaveAttribute("data-schnitt", "flat");
  const stage = page.locator(".schnitt-stage");
  await expect(stage).toHaveAttribute("data-gl", "off");
  await expect(page.locator(".schnitt-gl")).toBeHidden();
  const sheets = page.locator(".schnitt-stage .sheet");
  await expect(sheets).toHaveCount(4);
  for (let index = 0; index < 4; index += 1) {
    await expect(sheets.nth(index)).toBeVisible();
    const box = await sheets.nth(index).boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(120);
    expect(box?.height ?? 0).toBeGreaterThan(40);
  }
  await expect(page.locator("#name")).toBeVisible();
}

test("phone landscape: a lost WebGL context leaves the static hero and stops the scene", async ({ browser, browserName }) => {
  const { page, errors, close } = await phone(browser, browserName, 844, 390);
  await page.goto("/");
  const stage = page.locator(".schnitt-stage");
  await expect(stage).toHaveAttribute("data-gl", "ready", { timeout: 30000 });
  const lost = await page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("#schnitt-layers canvas");
    const gl = canvas?.getContext("webgl2");
    const ext = gl?.getExtension("WEBGL_lose_context");
    ext?.loseContext();
    return Boolean(ext);
  });
  expect(lost).toBe(true);
  await expectStaticHero(page);
  const frames = await stage.getAttribute("data-frames");
  await toolbar(page, 844, 390, 6);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  expect(await stage.getAttribute("data-frames"), "no frames drawn after the loss").toBe(frames);
  expect(await page.locator(".schnitt-world").count()).toBe(0);
  expect(errors).toEqual([]);
  await close();
});

for (const [width, height] of [[390, 844], [844, 390]] as const) {
  test(`phone ${width}x${height} with WebGL off shows the static hero`, async ({ browser, browserName }) => {
    const { page, errors, close } = await phone(browser, browserName, width, height, () => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, kind: string, ...rest: unknown[]) {
        if (/webgl/i.test(kind)) return null;
        return (original as (...args: unknown[]) => RenderingContext | null).call(this, kind, ...rest);
      } as typeof HTMLCanvasElement.prototype.getContext;
    });
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.waitForTimeout(1500);
    await expectStaticHero(page);
    await toolbar(page, width, height, 6);
    expect(errors).toEqual([]);
    await close();
  });
}
