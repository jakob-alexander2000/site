import { expect, test, type Page } from "@playwright/test";

const views = [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
] as const;

async function open(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("button.plus-mark").first()).toBeVisible();
}

test.describe("P1 every plus is a control or a register mark", () => {
  for (const view of views) {
    test(`every visible plus is a button or a hidden register mark at ${view.width}px`, async ({ page }) => {
      await open(page, view.width, view.height);
      const report = await page.evaluate(() => {
        const marks = [...document.querySelectorAll("[data-mark]")];
        return marks.map((node) => {
          const style = getComputedStyle(node);
          const box = node.getBoundingClientRect();
          const visible = style.display !== "none" && style.visibility !== "hidden" && box.width > 0 && box.height > 0;
          return {
            kind: node.getAttribute("data-mark"),
            tag: node.tagName,
            expanded: node.getAttribute("aria-expanded"),
            hidden: node.getAttribute("aria-hidden"),
            focusable: node instanceof HTMLElement && node.tabIndex >= 0 && node.getAttribute("aria-hidden") !== "true",
            visible,
          };
        });
      });
      const visible = report.filter((item) => item.visible);
      expect(visible.length).toBeGreaterThan(0);
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
  }
});

test.describe("P2 click and Escape toggle the callout", () => {
  for (const view of views) {
    test(`click opens the note and a second click or Escape closes it at ${view.width}px`, async ({ page }) => {
      await open(page, view.width, view.height);
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
  }
});

test.describe("P3 keyboard reaches each button and Enter toggles", () => {
  for (const view of views) {
    test(`Tab reaches every plus button and Enter toggles it at ${view.width}px`, async ({ page }) => {
      await open(page, view.width, view.height);
      const count = await page.locator("button.plus-mark").count();
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
  }
});

test.describe("P4 phone hit area", () => {
  test("each plus button is at least 44 by 44 CSS pixels at 390x844", async ({ page }) => {
    await open(page, 390, 844);
    const sizes = await page.locator("button.plus-mark").evaluateAll((nodes) =>
      nodes.map((node) => {
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

test.describe("P5 callouts stay in the viewport", () => {
  for (const view of views) {
    test(`an open callout does not overflow the viewport at ${view.width}px`, async ({ page }) => {
      await open(page, view.width, view.height);
      const buttons = page.locator("button.plus-mark");
      const count = await buttons.count();
      for (let index = 0; index < count; index += 1) {
        const button = buttons.nth(index);
        await button.scrollIntoViewIfNeeded();
        await button.click();
        const panelId = await button.getAttribute("aria-controls");
        const box = await page.locator(`#${panelId}`).evaluate((node, size) => {
          const rect = node.getBoundingClientRect();
          return {
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
            width: size.width,
            height: size.height,
          };
        }, view);
        expect(box.left, JSON.stringify(box)).toBeGreaterThanOrEqual(-0.5);
        expect(box.top).toBeGreaterThanOrEqual(-0.5);
        expect(box.right).toBeLessThanOrEqual(box.width + 0.5);
        expect(box.bottom).toBeLessThanOrEqual(box.height + 0.5);
        await page.keyboard.press("Escape");
      }
    });
  }
});
