import { expect, test, type Page } from "@playwright/test";

const stations = ["top", "citebot", "autopsy", "voice"] as const;

async function overflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
}

test("sheets overlap in depth on the way through", async ({ page }) => {
  test.skip(test.info().project.name !== "chromium", "Depth is measured in Chromium; WebKit repeats the readable stack.");
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains("spatial"))).toBe(true);
    const before = await page.locator("#top").boundingBox();
    expect(before).not.toBeNull();
    expect(before!.width).toBeGreaterThanOrEqual(Math.min(1000, viewport.width * 0.9) - 2);
    expect(before!.height).toBeGreaterThanOrEqual(viewport.height * 0.6);

    await page.evaluate(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, max / 6);
    });
    await page.waitForTimeout(50);
    const pair = await page.evaluate(() => {
      function box(id: string) {
        const node = document.getElementById(id);
        if (!node) return null;
        const rect = node.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom };
      }
      return { top: box("top"), cite: box("citebot"), width: window.innerWidth, height: window.innerHeight };
    });
    expect(pair.top).not.toBeNull();
    expect(pair.cite).not.toBeNull();
    const sheets = [pair.top!, pair.cite!];
    for (const sheet of sheets) {
      const x = Math.min(sheet.right, pair.width) - Math.max(sheet.x, 0);
      const y = Math.min(sheet.bottom, pair.height) - Math.max(sheet.y, 0);
      expect(x).toBeGreaterThan(24);
      expect(y).toBeGreaterThan(24);
    }
    const overlapX = Math.min(pair.top!.right, pair.cite!.right) - Math.max(pair.top!.x, pair.cite!.x);
    const overlapY = Math.min(pair.top!.bottom, pair.cite!.bottom) - Math.max(pair.top!.y, pair.cite!.y);
    expect(overlapX).toBeGreaterThan(8);
    expect(overlapY).toBeGreaterThan(8);
    const [near, far] = pair.top!.height >= pair.cite!.height ? [pair.top!, pair.cite!] : [pair.cite!, pair.top!];
    expect(far.height / near.height).toBeLessThanOrEqual(0.75);
  }
});

test("every plane and control can take focus", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const bad = await page.evaluate(() =>
    [...document.querySelectorAll("[tabindex]")]
      .filter((node) => Number(node.getAttribute("tabindex")) > 0)
      .map((node) => node.id),
  );
  expect(bad).toEqual([]);
  const controls = page.locator("a, button");
  const count = await controls.count();
  let seen = 0;
  for (let index = 0; index < count; index += 1) {
    const control = controls.nth(index);
    if (!(await control.isVisible())) continue;
    await control.focus();
    await expect(control).toBeFocused();
    await expect(control).toBeInViewport();
    seen += 1;
  }
  expect(seen).toBeGreaterThan(12);
  for (const id of stations) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
});

test("replay pauses and does not loop", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/#citebot");
  const button = page.getByRole("button", { name: "Replay the CiteBot diagram" });
  const elapsed = await button.evaluate((node) => {
    const start = performance.now();
    node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    return performance.now() - start;
  });
  expect(elapsed).toBeLessThanOrEqual(200);
  await expect(page.getByRole("button", { name: "Pause the CiteBot diagram" })).toBeVisible();
  const pause = await page.getByRole("button", { name: "Pause the CiteBot diagram" }).evaluate((node) => {
    const start = performance.now();
    node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const flow = node.closest(".flow");
    const trace = flow?.querySelector(".trace");
    const state = trace ? getComputedStyle(trace).animationPlayState : "";
    const count = trace ? getComputedStyle(trace).animationIterationCount : "";
    return { ms: performance.now() - start, paused: flow?.classList.contains("is-paused") === true, state, count };
  });
  expect(pause.ms).toBeLessThanOrEqual(200);
  expect(pause.paused).toBe(true);
  expect(pause.state === "paused" || pause.state === "running").toBe(true);
  expect(pause.count === "1" || pause.count === "").toBe(true);
});

test("scroll position moves on the next frame", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const result = await page.evaluate(
    () =>
      new Promise<{ ms: number; moved: boolean }>((resolve) => {
        const before = window.scrollY;
        const start = performance.now();
        window.scrollBy(0, 480);
        requestAnimationFrame(() => {
          resolve({ ms: performance.now() - start, moved: window.scrollY > before });
        });
      }),
  );
  expect(result.moved).toBe(true);
  expect(result.ms).toBeLessThanOrEqual(200);
});

test("the page loads without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.locator("#top a[href='#autopsy']").click();
  expect(errors.filter((line) => !/favicon/i.test(line))).toEqual([]);
});

test("diagrams stay in input then output order", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  for (const id of ["citebot", "autopsy", "voice"]) {
    const ordered = await page.locator(`#${id} .flow`).evaluate((flow) => {
      const kick = [...flow.querySelectorAll(".k")];
      const input = kick.find((node) => node.textContent === "Input");
      const output = kick.find((node) => node.textContent === "Output");
      if (!input || !output) return false;
      return Boolean(input.compareDocumentPosition(output) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(ordered, id).toBe(true);
    await expect(page.locator(`#${id}`).getByText("Input", { exact: true })).toBeVisible();
  }
  await expect(page.getByText("This plate does not call a model.")).toBeVisible();
  await expect(page.getByText("full-time employees only", { exact: true })).toBeVisible();
  await expect(page.getByText("off-voice", { exact: true })).toBeVisible();
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
  { width: 360, height: 740 },
  { width: 1133, height: 744 },
  { width: 375, height: 667 },
]) {
  test(`no sideways overflow at three scroll positions ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    for (const ratio of [0, 0.5, 1]) {
      await page.evaluate((at) => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo(0, max * at);
      }, ratio);
      expect(await overflow(page)).toBe(false);
    }
  });
}

for (const viewport of [
  { width: 360, height: 740 },
  { width: 1280, height: 800 },
]) {
  test(`zoom does not overflow at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.evaluate(() => {
      document.documentElement.style.zoom = "2";
    });
    expect(await overflow(page)).toBe(false);
  });
}

test.describe("no javascript", () => {
  test.use({ javaScriptEnabled: false });

  test("static stack keeps the diagrams and the hash", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const spatial = await page.evaluate(() => document.documentElement.classList.contains("spatial"));
    expect(spatial).toBe(false);
    await expect(page.locator("canvas")).toHaveCount(0);
    for (const id of ["citebot", "autopsy", "voice"]) {
      await expect(page.locator(`#${id} .flow`).getByText("Input", { exact: true })).toBeVisible();
      await expect(page.locator(`#${id} .flow`).getByText("Output", { exact: true })).toBeVisible();
    }
    await page.goto("/#voice");
    await expect(page.getByRole("heading", { name: "Voice check" })).toBeVisible();
    expect(await overflow(page)).toBe(false);
  });
});

test("unsupported 3D falls back to the readable stack", async ({ page }) => {
  await page.addInitScript(() => {
    window.CSS.supports = () => false;
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const spatial = await page.evaluate(() => document.documentElement.classList.contains("spatial"));
  expect(spatial).toBe(false);
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator("#autopsy .flow").getByText("Qualifier", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Source · CiteBot" })).toBeVisible();
  expect(await overflow(page)).toBe(false);
});
