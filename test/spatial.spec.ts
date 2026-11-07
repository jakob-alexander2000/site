import { expect, test, type Page } from "@playwright/test";

const stations = ["top", "citebot", "autopsy", "voice"] as const;

async function overflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
}

test("sheets overlap in depth on the way through", async ({ page }) => {
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
      const cite = document.getElementById("citebot");
      if (!cite) return;
      const top = cite.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, Math.max(0, top - window.innerHeight * 0.7));
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
    const scale = await page.evaluate(() => {
      function ratio(id: string) {
        const node = document.getElementById(id);
        if (!node) return 0;
        const visual = node.getBoundingClientRect().height;
        return visual / node.offsetHeight;
      }
      return { front: ratio("top"), rear: ratio("citebot") };
    });
    expect(scale.front).toBeGreaterThanOrEqual(0.95);
    expect(scale.rear).toBeLessThanOrEqual(0.75);
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
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve(undefined)))),
    );
    const revealed = await control.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      let top = rect.top;
      let bottom = rect.bottom;
      let left = rect.left;
      let right = rect.right;
      let parent = el.parentElement;
      while (parent) {
        const style = getComputedStyle(parent);
        const clips = [style.overflow, style.overflowX, style.overflowY].some(
          (value) => value === "hidden" || value === "clip" || value === "auto" || value === "scroll",
        );
        if (clips && parent !== document.body && parent !== document.documentElement) {
          const bounds = parent.getBoundingClientRect();
          top = Math.max(top, bounds.top);
          bottom = Math.min(bottom, bounds.bottom);
          left = Math.max(left, bounds.left);
          right = Math.min(right, bounds.right);
        }
        parent = parent.parentElement;
      }
      top = Math.max(0, top);
      left = Math.max(0, left);
      bottom = Math.min(window.innerHeight, bottom);
      right = Math.min(window.innerWidth, right);
      return bottom - top >= rect.height - 1 && right - left >= rect.width - 1 && rect.height >= 44 - 1;
    });
    expect(revealed).toBe(true);
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
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined))));
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
      await expect(page.locator(`#${id} button[data-replay]`)).toBeHidden();
      expect(await fullyPainted(page, `#${id} .limit`), id).toBe(true);
      await expect(page.locator(`#${id} .flow`).getByText("Input", { exact: true })).toBeVisible();
      await expect(page.locator(`#${id} .flow`).getByText("Output", { exact: true })).toBeVisible();
    }
    await page.goto("/#voice");
    await expect(page.getByRole("heading", { name: "Voice check" })).toBeVisible();
    expect(await overflow(page)).toBe(false);
  });
});

async function fullyPainted(page: Page, selector: string) {
  return page.locator(selector).evaluate((el) => {
    function painted(node: Element) {
      const rect = node.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return false;
      let top = rect.top;
      let bottom = rect.bottom;
      let left = rect.left;
      let right = rect.right;
      let parent = node.parentElement;
      while (parent) {
        const style = getComputedStyle(parent);
        const clips = [style.overflow, style.overflowX, style.overflowY].some(
          (value) => value === "hidden" || value === "clip" || value === "auto" || value === "scroll",
        );
        if (clips && parent !== document.body && parent !== document.documentElement) {
          const bounds = parent.getBoundingClientRect();
          top = Math.max(top, bounds.top);
          bottom = Math.min(bottom, bounds.bottom);
          left = Math.max(left, bounds.left);
          right = Math.min(right, bounds.right);
        }
        parent = parent.parentElement;
      }
      top = Math.max(0, top);
      left = Math.max(0, left);
      bottom = Math.min(window.innerHeight, bottom);
      right = Math.min(window.innerWidth, right);
      return bottom - top >= rect.height - 1 && right - left >= rect.width - 1;
    }

    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    for (let step = 0; step < 21; step += 1) {
      window.scrollTo(0, max * (step / 20));
      if (painted(el)) return true;
    }
    el.scrollIntoView({ block: "center", inline: "nearest" });
    return painted(el);
  });
}

const reachSizes = [
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
  { width: 360, height: 740 },
] as const;

for (const viewport of reachSizes) {
  test(`active sheet lower content is fully painted at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    for (const id of ["citebot", "autopsy", "voice"] as const) {
      for (const selector of [`#${id} .limit`, `#${id} button[data-replay]`, `#${id} .frame figcaption`, `#${id} .still img`]) {
        expect(await fullyPainted(page, selector), selector).toBe(true);
      }
    }
    const hidden = await page.evaluate(() => {
      const stuck: string[] = [];
      for (const el of document.querySelectorAll("a, button")) {
        if (!(el instanceof HTMLElement)) continue;
        const style = getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;
        el.focus({ preventScroll: false });
        el.scrollIntoView({ block: "center", inline: "nearest" });
        const rect = el.getBoundingClientRect();
        let top = rect.top;
        let bottom = rect.bottom;
        let left = rect.left;
        let right = rect.right;
        let parent = el.parentElement;
        while (parent) {
          const parentStyle = getComputedStyle(parent);
          const clips = [parentStyle.overflow, parentStyle.overflowX, parentStyle.overflowY].some(
            (value) => value === "hidden" || value === "clip" || value === "auto" || value === "scroll",
          );
          if (clips && parent !== document.body && parent !== document.documentElement) {
            const bounds = parent.getBoundingClientRect();
            top = Math.max(top, bounds.top);
            bottom = Math.min(bottom, bounds.bottom);
            left = Math.max(left, bounds.left);
            right = Math.min(right, bounds.right);
          }
          parent = parent.parentElement;
        }
        top = Math.max(0, top);
        left = Math.max(0, left);
        bottom = Math.min(window.innerHeight, bottom);
        right = Math.min(window.innerWidth, right);
        if (bottom - top < rect.height - 1 || right - left < rect.width - 1) {
          stuck.push((el.getAttribute("aria-label") || el.textContent || el.tagName).trim().slice(0, 60));
        }
      }
      return stuck;
    });
    expect(hidden).toEqual([]);
  });
}

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`voice ruler labels sit on their ranges at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.locator("#voice .ruler").scrollIntoViewIfNeeded();
    const alignment = await page.locator("#voice .ruler").evaluate((ruler) => {
      const labels = [...ruler.querySelectorAll("span")].map((node) => ({
        name: (node.textContent || "").trim(),
        box: node.getBoundingClientRect(),
      }));
      const line = ruler.getBoundingClientRect();
      const tops = labels.map((label) => label.box.top);
      return {
        names: labels.map((label) => label.name),
        sameRow: Math.max(...tops) - Math.min(...tops) <= 2,
        inRange: labels.map((label, index) => {
          const mid = label.box.left + label.box.width / 2;
          const start = line.left + (line.width / 3) * index;
          const end = start + line.width / 3;
          return mid >= start - 4 && mid <= end + 4;
        }),
      };
    });
    expect(alignment.names).toEqual(["close", "drifting", "off-voice"]);
    expect(alignment.sameRow).toBe(true);
    expect(alignment.inRange).toEqual([true, true, true]);
  });
}

for (const viewport of [
  { width: 390, height: 844 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
]) {
  test(`a later sheet does not cover the words or controls at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const covered = await page.evaluate(async () => {
      const nodes = [
        ...document.querySelectorAll(
          "#citebot .copy, #autopsy .copy, #voice .copy, .limit, button[data-replay], .frame figcaption, .links a, .product-link",
        ),
      ].filter((node): node is HTMLElement => node instanceof HTMLElement);
      const hits: string[] = [];
      for (const el of nodes) {
        const style = getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;
        let y = 0;
        let node: HTMLElement | null = el;
        while (node) {
          y += node.offsetTop;
          node = node.offsetParent instanceof HTMLElement ? node.offsetParent : null;
        }
        window.scrollTo(0, Math.max(0, y - window.innerHeight * 0.35));
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve(undefined))));
        const rect = el.getBoundingClientRect();
        const plane = el.closest(".plane");
        const samples = [
          [rect.left + Math.min(28, Math.max(8, rect.width / 2)), rect.top + Math.min(18, rect.height / 2)],
          [rect.left + rect.width / 2, rect.top + rect.height / 2],
          [rect.right - Math.min(28, rect.width / 2), rect.bottom - Math.min(14, rect.height / 2)],
        ];
        for (const [x, py] of samples) {
          if (py < 2 || py > window.innerHeight - 2 || x < 2 || x > window.innerWidth - 2) continue;
          const hit = document.elementFromPoint(x, py);
          const hitPlane = hit?.closest(".plane");
          if (hit && hitPlane && plane && hitPlane !== plane) {
            const label = (el.getAttribute("aria-label") || el.textContent || el.tagName).trim().replace(/\s+/g, " ").slice(0, 48);
            hits.push(`${plane.id} “${label}” covered by ${hitPlane.id} ${hit.tagName}.${String(hit.className).slice(0, 24)}`);
            break;
          }
        }
      }
      return hits;
    });
    expect(covered).toEqual([]);
  });
}

test("opening the spatial sheet does not shift the body", async ({ page }) => {
  await page.addInitScript(() => {
    const shifts: number[] = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!shift.hadRecentInput && typeof shift.value === "number") shifts.push(shift.value);
      }
    }).observe({ type: "layout-shift", buffered: true });
    Object.defineProperty(window, "__shifts", { get: () => shifts });
  });
  await page.setViewportSize({ width: 412, height: 823 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const values = await page.evaluate(() => (window as unknown as { __shifts: number[] }).__shifts);
  const total = values.reduce((sum, value) => sum + value, 0);
  expect(total).toBeLessThan(0.1);
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
  for (const id of ["citebot", "autopsy", "voice"]) {
    expect(await fullyPainted(page, `#${id} .limit`), id).toBe(true);
    await expect(page.locator(`#${id} .frame figcaption`)).toBeVisible();
  }
  expect(await overflow(page)).toBe(false);
});
