import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { devices } from "./devices";

const phonesAndTablets = devices.filter((device) => device.columns < 12);

test("tap targets are at least 44px on phone and iPad", async ({ page }, info) => {
  for (const device of phonesAndTablets) {
    if (device.project && device.project !== info.project.name) continue;
    await page.setViewportSize({ width: device.width, height: device.height });
    await page.goto("/");
    const bad = await page.evaluate(() => {
      const hits: string[] = [];
      for (const el of document.querySelectorAll("a, button, [data-sentence]")) {
        const style = getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;
        const box = el.getBoundingClientRect();
        if (box.width < 44 || box.height < 44) {
          hits.push(`${box.width.toFixed(0)}x${box.height.toFixed(0)} ${(el.textContent ?? "").trim().slice(0, 40)}`);
        }
      }
      return hits;
    });
    expect(bad, device.name).toEqual([]);
  }
});

test("claims, scores, labels and links are at least 16px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const small = await page.evaluate(() => {
    const hits: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let node = walker.currentNode as Element | null;
    while (node) {
      const text = [...node.childNodes].some(
        (child) => child.nodeType === Node.TEXT_NODE && (child.textContent ?? "").trim().length > 0,
      );
      if (text && node.closest("script, style") === null) {
        const size = Number.parseFloat(getComputedStyle(node).fontSize);
        if (size < 16) hits.push(`${size}px ${(node.textContent ?? "").trim().slice(0, 40)}`);
      }
      node = walker.nextNode() as Element | null;
    }
    return hits;
  });
  expect(small).toEqual([]);
});

for (const viewport of [
  { width: 360, height: 740 },
  { width: 320, height: 640 },
]) {
  test(`no horizontal scroll at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflow).toBe(false);
  });
}

test("no horizontal scroll at 200 percent zoom", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.evaluate(() => {
    document.documentElement.style.zoom = "2";
  });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(overflow).toBe(false);
});

test("keyboard order, focus, and space select a sentence", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await expect(page.locator("#top")).toHaveCount(1);
  await expect(page.locator("a.skip")).toHaveAttribute("href", "#top");
  const order = await page.evaluate(() => {
    const names: string[] = [];
    const root = document.querySelector("[data-page]");
    if (!root) return names;
    for (const el of root.querySelectorAll("a, button")) names.push((el.textContent ?? "").trim());
    return names;
  });
  const github = order.indexOf("GitHub");
  const email = order.indexOf("Email");
  const tryIt = order.indexOf("Try it");
  const replay = order.indexOf("Replay");
  expect(github).toBeGreaterThanOrEqual(0);
  expect(email).toBeGreaterThan(github);
  expect(tryIt).toBeGreaterThan(email);
  expect(replay).toBeGreaterThan(tryIt);
  await page.locator("[data-sentence]").nth(1).focus();
  const outline = await page.locator("[data-sentence]").nth(1).evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe("none");
  await page.keyboard.press("Space");
  await expect(page.locator("[data-sentence]").nth(1)).toHaveAttribute("aria-pressed", "true");
});

test("reduced motion at every viewport", async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const device of devices) {
    if (device.project && device.project !== info.project.name) continue;
    await page.setViewportSize({ width: device.width, height: device.height });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-reduced", "flat");
    const running = await page.evaluate(
      () => document.getAnimations().filter((animation) => animation.playState === "running").length,
    );
    expect(running, device.name).toBe(0);
    await page.locator("[data-sentence]").first().click();
    await expect(page.locator("[data-sentence]").first()).toHaveAttribute("aria-pressed", "true");
    await page.locator("[data-replay]").click();
  }
});

test("thread and verdict motion play once", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.locator("[data-sentence]").first().click();
  const durations = await page.evaluate(() =>
    document.getAnimations().map((animation) => {
      const timing = animation.effect?.getComputedTiming();
      const name = "animationName" in animation ? String(animation.animationName) : "";
      return { name, duration: timing?.duration, iterations: timing?.iterations };
    }),
  );
  expect(durations.some((item) => item.name === "draw-thread" && Number(item.duration) >= 600 && Number(item.duration) <= 900)).toBe(true);
  expect(durations.some((item) => item.name === "fade-verdict" && Number(item.duration) >= 150 && Number(item.duration) <= 250)).toBe(true);
  expect(durations.every((item) => item.iterations !== Infinity)).toBe(true);
  await page.waitForTimeout(2000);
  const running = await page.evaluate(
    () => document.getAnimations().filter((animation) => animation.playState === "running").length,
  );
  expect(running).toBe(0);
});

test("static fold survives a blocked stage script", async ({ page }) => {
  await page.route("**/close-reading-stage.js", (route) => route.abort());
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("[data-sentence]").first()).toBeVisible();
  await page.locator("[data-sentence]").nth(1).click();
  await expect(page.locator("[data-sentence]").nth(1)).toHaveAttribute("aria-pressed", "true");
  expect(errors).toEqual([]);
});

test("static fold survives missing WebGL", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, kind: string) {
      if (String(kind).includes("webgl")) return null;
      return original.call(this, kind as "2d");
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.locator("[data-sentence]").first().click();
  await expect(page.locator("[data-sentence]").first()).toHaveAttribute("aria-pressed", "true");
  expect(errors).toEqual([]);
});

test("context loss does not surface an error", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.waitForFunction(() => Boolean((window as unknown as { __closeReadingStage?: { state: { gl: unknown } } }).__closeReadingStage?.state.gl));
  await page.evaluate(() => {
    const stage = (window as unknown as {
      __closeReadingStage: {
        state: { gl: WebGLRenderingContext; canvas: HTMLCanvasElement | null };
        handleContextLost: (event: Event) => void;
      };
    }).__closeReadingStage;
    const ext = stage.state.gl.getExtension("WEBGL_lose_context");
    stage.state.canvas = document.querySelector("canvas");
    ext?.loseContext();
    stage.handleContextLost(new Event("webglcontextlost"));
  });
  await page.locator("[data-sentence]").first().click();
  expect(errors).toEqual([]);
});

test.describe("renderer caps", () => {
  test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });

  test("pixel ratio stays at most 2 and idle rendering stays still", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => Boolean((window as unknown as { __closeReadingStage?: { state: { pixelRatio: number } } }).__closeReadingStage?.state.pixelRatio));
    const ratio = await page.evaluate(() => (window as unknown as { __closeReadingStage: { state: { pixelRatio: number; renderCount: number } } }).__closeReadingStage.state.pixelRatio);
    expect(ratio).toBeLessThanOrEqual(2);
    const before = await page.evaluate(() => (window as unknown as { __closeReadingStage: { state: { renderCount: number } } }).__closeReadingStage.state.renderCount);
    await page.waitForTimeout(1100);
    const after = await page.evaluate(() => (window as unknown as { __closeReadingStage: { state: { renderCount: number } } }).__closeReadingStage.state.renderCount);
    expect(after).toBe(before);
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.waitForTimeout(300);
    const hiddenCount = await page.evaluate(() => (window as unknown as { __closeReadingStage: { state: { renderCount: number } } }).__closeReadingStage.state.renderCount);
    expect(hiddenCount).toBe(after);
  });
});

test("console stays quiet on the main path", async ({ page }) => {
  const problems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(message.text());
  });
  page.on("pageerror", (error) => problems.push(error.message));
  page.on("requestfailed", (request) => problems.push(request.url()));
  await page.goto("/");
  await page.locator("[data-sentence]").first().click();
  await page.locator("[data-replay]").click();
  await page.locator("footer #contact").scrollIntoViewIfNeeded();
  await page.locator("[data-artifact]").first().scrollIntoViewIfNeeded();
  expect(problems).toEqual([]);
});

for (const viewport of [
  { width: 1280, height: 800 },
  { width: 390, height: 844 },
  { width: 375, height: 547 },
]) {
  test(`axe finds no serious or critical issues at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    const bad = results.violations.filter((item) => item.impact === "serious" || item.impact === "critical");
    expect(bad.map((item) => item.id)).toEqual([]);
  });
}

test("diagrams 1 and 2 are written out", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#diagrams")).toContainText("Diagram 1");
  await expect(page.locator("#diagrams")).toContainText("Diagram 2");
});
