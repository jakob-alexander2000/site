import { expect, test, type Page } from "@playwright/test";
import { CITEBOT_PLATE } from "../lib/diagrams";
import { PARTS_LABEL, PARTS_LINK } from "../lib/schnitt-copy";

const views = [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
] as const;

async function open(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
}

test.describe("H1 hero uses the section-header treatment", () => {
  for (const view of views) {
    test(`the hero shows 01 CiteBot in the kicker style at ${view.width}px`, async ({ page }) => {
      await open(page, view.width, view.height);
      const hero = page.locator(".schnitt-copy .hero-project");
      await expect(hero).toBeVisible();
      await expect(hero.locator(".plate-numeral")).toHaveText("01");
      await expect(hero.locator(".plate-label")).toHaveText("CITEBOT");
      const sample = page.locator("#autopsy > .kicker");
      await expect(sample).toBeVisible();
      const fonts = await hero.evaluate((node, other) => {
        const style = getComputedStyle(node);
        const peer = getComputedStyle(other as HTMLElement);
        return {
          family: style.fontFamily,
          size: style.fontSize,
          peerFamily: peer.fontFamily,
          peerSize: peer.fontSize,
          className: node.className,
        };
      }, await sample.elementHandle());
      expect(fonts.family).toBe(fonts.peerFamily);
      expect(fonts.size).toBe(fonts.peerSize);
      expect(fonts.className.split(/\s+/)).toContain("kicker");
    });
  }
});

test.describe("H2 CiteBot is one project", () => {
  for (const view of views) {
    test(`CiteBot is named once and section 1 does not re-introduce it at ${view.width}px`, async ({ page }) => {
      await open(page, view.width, view.height);
      const labels = await page.evaluate(() => {
        const nodes = document.querySelectorAll(".schnitt-copy .kicker, #citebot > h2, #citebot > .kicker");
        return [...nodes]
          .filter((node) => {
            const style = getComputedStyle(node);
            const box = node.getBoundingClientRect();
            return style.display !== "none" && box.width > 0 && box.height > 0;
          })
          .map((node) => (node.textContent ?? "").replace(/\s+/g, " ").trim());
      });
      const named = labels.filter((text) => /citebot/i.test(text));
      expect(named, labels.join(" | ")).toEqual(["01 · CITEBOT"]);
      const section = page.locator("#citebot");
      await expect(section.getByRole("heading", { name: "The parts in detail" })).toBeVisible();
      await expect(section.getByRole("heading", { name: CITEBOT_PLATE.headline })).toHaveCount(0);
      await expect(section).not.toContainText("01 · CITEBOT");
    });
  }
});

test.describe("H3 thread into section 1", () => {
  for (const view of views) {
    test(`a visible anchor from the hero reaches section 1 at ${view.width}px`, async ({ page }) => {
      await open(page, view.width, view.height);
      const link = page.locator("a[data-hero-thread]");
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", "#citebot");
      await expect(link).toHaveText(PARTS_LINK);
      await expect(link).not.toHaveText(PARTS_LABEL);
      const thread = link.locator(".hero-thread");
      await expect(thread).toBeVisible();
      await expect(page.locator("#citebot")).toContainText(PARTS_LABEL);
      const target = page.locator("#citebot");
      await expect(target).toHaveCount(1);
    });
  }
});

test.describe("H4 no sideways overflow on the phone", () => {
  test("the page does not scroll sideways at 390x844", async ({ page }) => {
    await open(page, 390, 844);
    const report = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(report.scroll, JSON.stringify(report)).toBeLessThanOrEqual(report.client);
  });
});
