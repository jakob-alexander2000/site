import { expect, test, type Page } from "@playwright/test";

async function open(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  if (width <= 800) {
    await expect(page.locator("button.plus-mark").first()).toBeVisible();
  } else {
    await expect(page.locator(".schnitt .leader-note").first()).toBeVisible();
  }
}

function visibleMarks() {
  return [...document.querySelectorAll("[data-mark]")].map((node) => {
    const style = getComputedStyle(node);
    const box = node.getBoundingClientRect();
    const visible = style.display !== "none" && style.visibility !== "hidden" && box.width > 0 && box.height > 0;
    return {
      kind: node.getAttribute("data-mark"),
      tag: node.tagName,
      expanded: node.getAttribute("aria-expanded"),
      hidden: node.getAttribute("aria-hidden"),
      focusable: node instanceof HTMLElement && node.tabIndex >= 0 && node.getAttribute("aria-hidden") !== "true" && style.display !== "none",
      visible,
    };
  });
}

test.describe("P1 every plus is a control or a register mark", () => {
  test("at 1440 every plus is a register mark and no note is shown twice", async ({ page }) => {
    await open(page, 1440, 900);
    const report = await page.evaluate(visibleMarks);
    const visible = report.filter((item) => item.visible);
    expect(visible.length).toBeGreaterThan(0);
    expect(visible.some((item) => item.kind === "plus")).toBe(false);
    for (const item of visible) {
      expect(item.kind).toBe("register");
      expect(item.hidden).toBe("true");
      expect(item.focusable).toBe(false);
    }
    const copies = await page.evaluate(() => {
      const seen: string[] = [];
      for (const callout of document.querySelectorAll(".schnitt .callout")) {
        const texts = [...callout.querySelectorAll(".leader-note, .plus-callout")]
          .filter((node) => {
            const style = getComputedStyle(node);
            const box = node.getBoundingClientRect();
            return style.display !== "none" && style.visibility !== "hidden" && box.width > 0 && box.height > 0;
          })
          .map((node) => (node.textContent ?? "").replace(/\s+/g, " ").trim())
          .filter(Boolean);
        seen.push(...texts);
      }
      return seen;
    });
    expect(copies.length).toBeGreaterThan(0);
    expect(new Set(copies).size, copies.join(" | ")).toBe(copies.length);
  });

  test("at 390 every visible plus is a button or a hidden register mark", async ({ page }) => {
    await open(page, 390, 844);
    const report = await page.evaluate(visibleMarks);
    const visible = report.filter((item) => item.visible);
    expect(visible.some((item) => item.kind === "plus")).toBe(true);
    for (const item of visible) {
      if (item.kind === "plus") {
        expect(item.tag).toBe("BUTTON");
        expect(item.expanded).toBe("false");
      } else {
        expect(item.kind).toBe("register");
        expect(item.hidden).toBe("true");
        expect(item.focusable).toBe(false);
      }
    }
  });
});

test.describe("P2 click and Escape toggle the callout", () => {
  test("click opens the note and a second click or Escape closes it at 390px", async ({ page }) => {
    await open(page, 390, 844);
    const button = page.locator("button.plus-mark").first();
    await button.scrollIntoViewIfNeeded();
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    const panelId = await button.getAttribute("aria-controls");
    const panel = page.locator(`#${panelId}`);
    await expect(panel).toBeVisible();
    await expect(panel).not.toHaveText("");
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(panel).toBeHidden();
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(panel).toBeHidden();
  });
});

test.describe("P3 keyboard reaches each button and Enter toggles", () => {
  test("Tab reaches every plus button and Enter toggles it at 390px", async ({ page }) => {
    await open(page, 390, 844);
    const count = await page.locator("button.plus-mark").evaluateAll((nodes) =>
      nodes.filter((node) => getComputedStyle(node).display !== "none").length,
    );
    expect(count).toBeGreaterThan(0);
    await page.evaluate(() => {
      document.body.tabIndex = -1;
      document.body.focus();
    });
    const found: string[] = [];
    for (let step = 0; step < 40; step += 1) {
      await page.keyboard.press("Tab");
      const id = await page.evaluate(() => {
        const node = document.activeElement;
        if (!(node instanceof HTMLButtonElement) || !node.classList.contains("plus-mark")) return "";
        return node.getAttribute("aria-label") ?? node.getAttribute("aria-controls") ?? "plus";
      });
      if (!id || found.includes(id)) continue;
      found.push(id);
      const button = page.locator("button.plus-mark:focus");
      await expect(button).toHaveAttribute("aria-expanded", "false");
      await page.keyboard.press("Enter");
      await expect(button).toHaveAttribute("aria-expanded", "true");
      await page.keyboard.press("Enter");
      await expect(button).toHaveAttribute("aria-expanded", "false");
    }
    expect(found.length).toBe(count);
  });
});

test.describe("P4 phone hit area", () => {
  test("each plus button is at least 44 by 44 CSS pixels at 390x844", async ({ page }) => {
    await open(page, 390, 844);
    const sizes = await page.locator("button.plus-mark").evaluateAll((nodes) =>
      nodes
        .filter((node) => getComputedStyle(node).display !== "none")
        .map((node) => {
          const box = node.getBoundingClientRect();
          return { w: box.width, h: box.height };
        }),
    );
    expect(sizes.length).toBeGreaterThan(0);
    for (const size of sizes) {
      expect(size.w).toBeGreaterThanOrEqual(44);
      expect(size.h).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe("P5 callouts stay in the viewport and off the card heading", () => {
  test("an open callout stays in the viewport and does not cover the card heading at 390px", async ({ page }) => {
    await open(page, 390, 844);
    const buttons = page.locator("button.plus-mark");
    const count = await buttons.count();
    for (let index = 0; index < count; index += 1) {
      const button = buttons.nth(index);
      if (!(await button.isVisible())) continue;
      await button.scrollIntoViewIfNeeded();
      await button.click();
      const panelId = await button.getAttribute("aria-controls");
      const panel = page.locator(`#${panelId}`);
      await expect(panel).toBeVisible();
      await panel.evaluate((node) => node.scrollIntoView({ block: "nearest" }));
      const box = await panel.evaluate((node, size) => {
        const rect = node.getBoundingClientRect();
        const slot = node.closest(".plane-slot");
        const heading = slot?.querySelector(".file, .sheet-title");
        const head = heading?.getBoundingClientRect();
        const overlap = head
          ? !(rect.right < head.left + 0.5 || rect.left > head.right - 0.5 || rect.bottom < head.top + 0.5 || rect.top > head.bottom - 0.5)
          : false;
        return {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: size.width,
          height: size.height,
          overlap,
          heading: heading?.textContent?.trim() ?? "",
        };
      }, { width: 390, height: 844 });
      expect(box.left, JSON.stringify(box)).toBeGreaterThanOrEqual(-0.5);
      expect(box.top).toBeGreaterThanOrEqual(-0.5);
      expect(box.right).toBeLessThanOrEqual(box.width + 0.5);
      expect(box.bottom).toBeLessThanOrEqual(box.height + 0.5);
      expect(box.overlap, `covers ${box.heading}`).toBe(false);
      await page.keyboard.press("Escape");
    }
  });
});

for (const width of [900, 1024]) {
  test(`with 3D on at ${width}px the plus opens a visible note and has a 44px target`, async ({ page }) => {
    await page.setViewportSize({ width, height: 768 });
    await page.goto("/");
    await page.waitForFunction(() => document.querySelector(".schnitt-stage")?.getAttribute("data-gl") === "ready");
    const button = page.locator(".schnitt .callout button.plus-mark").first();
    await expect(button).toBeVisible();
    await expect(page.locator(".schnitt .callout .leader-note").first()).toBeHidden();
    const target = await button.evaluate((el) => {
      const glyph = el.getBoundingClientRect();
      const after = getComputedStyle(el, "::before");
      const inset = after.content === "none" ? 0 : -parseFloat(after.top);
      return Math.min(glyph.width, glyph.height) + 2 * inset;
    });
    expect(target).toBeGreaterThanOrEqual(44);
    await button.click();
    const note = page.locator(`#${await button.getAttribute("aria-controls")}`);
    await expect(note).toBeVisible();
    const box = await note.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(20);
    await page.keyboard.press("Escape");
    await expect(note).toBeHidden();
  });
}

test("tapping outside closes the plus note at mid-band and phone widths", async ({ page }) => {
  for (const width of [960, 390] as const) {
    if (width === 960) {
      await page.setViewportSize({ width, height: 768 });
      await page.goto("/");
      await page.waitForFunction(() => document.querySelector(".schnitt-stage")?.getAttribute("data-gl") === "ready");
    } else {
      await open(page, width, 844);
    }
    const button = width === 960
      ? page.locator(".schnitt .callout button.plus-mark").first()
      : page.locator("button.plus-mark").first();
    await button.scrollIntoViewIfNeeded();
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    const note = page.locator(`#${await button.getAttribute("aria-controls")}`);
    await expect(note).toBeVisible();
    const point = await page.evaluate(() => {
      const trigger = document.querySelector("button.plus-mark[aria-expanded='true']");
      const panelId = trigger?.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;
      const avoid = [trigger, panel].flatMap((node) => (node ? [node.getBoundingClientRect()] : []));
      const spots = [
        { x: 16, y: 16 },
        { x: 16, y: window.innerHeight - 16 },
        { x: window.innerWidth - 16, y: 16 },
        { x: window.innerWidth / 2, y: 16 },
      ];
      return spots.find((spot) =>
        avoid.every((box) => spot.x < box.left - 2 || spot.x > box.right + 2 || spot.y < box.top - 2 || spot.y > box.bottom + 2),
      ) ?? null;
    });
    expect(point, `no outside tap target at ${width}px`).not.toBeNull();
    await page.mouse.click(point!.x, point!.y);
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(note).toBeHidden();
  }
});
