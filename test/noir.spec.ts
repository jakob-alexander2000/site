import { expect, test, type Locator, type Page } from "@playwright/test";
import { BACKGROUND } from "../lib/looks";

const sizes = {
  iphone: { width: 390, height: 844 },
  "ipad-mini": { width: 744, height: 1133 },
  desktop: { width: 1280, height: 800 },
} as const;

const opening = "I build AI tools whose answers you can check, sentence by sentence.";

async function readPage(page: Page) {
  return page.evaluate(() => {
    const skip = (node: Element) =>
      node.closest("script, style, noscript, svg") !== null ||
      node.tagName === "SCRIPT" ||
      node.tagName === "STYLE";

    function parse(color: string) {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (!match) return null;
      const alpha = match[4] === undefined ? 1 : Number(match[4]);
      if (alpha < 0.2) return null;
      return [Number(match[1]), Number(match[2]), Number(match[3])] as const;
    }

    function lin(channel: number) {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    }

    function contrast(a: readonly number[], b: readonly number[]) {
      const left = 0.2126 * lin(a[0]) + 0.7152 * lin(a[1]) + 0.0722 * lin(a[2]);
      const right = 0.2126 * lin(b[0]) + 0.7152 * lin(b[1]) + 0.0722 * lin(b[2]);
      const [hi, lo] = left > right ? [left, right] : [right, left];
      return (hi + 0.05) / (lo + 0.05);
    }

    function palette(rgb: readonly number[]) {
      const [r, g, b] = rgb;
      const white = r > 250 && g > 250 && b > 250;
      const black = r < 8 && g < 8 && b < 8;
      const grey = Math.abs(r - 140) <= 2 && Math.abs(g - 140) <= 2 && Math.abs(b - 140) <= 2;
      return white || black || grey;
    }

    function ground(node: Element) {
      let current: Element | null = node;
      while (current) {
        const rgb = parse(getComputedStyle(current).backgroundColor);
        if (rgb) return rgb;
        current = current.parentElement;
      }
      return [0, 0, 0] as const;
    }

    const small: string[] = [];
    const contrastFails: string[] = [];
    const stray: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let node = walker.currentNode as Element | null;
    while (node) {
      if (!skip(node)) {
        const hasText = [...node.childNodes].some(
          (child) => child.nodeType === Node.TEXT_NODE && (child.textContent ?? "").trim().length > 0,
        );
        if (hasText) {
          const style = getComputedStyle(node);
          const size = Number.parseFloat(style.fontSize);
          const sample = (node.textContent ?? "").trim().slice(0, 48);
          if (size < 16) small.push(`${size}px ${sample}`);
          const ink = parse(style.color);
          if (ink) {
            if (!palette(ink)) stray.push(`color ${style.color} ${sample}`);
            const ratio = contrast(ink, ground(node));
            if (ratio < 4.5) contrastFails.push(`${ratio.toFixed(2)} ${sample}`);
          }
        }
      }
      node = walker.nextNode() as Element | null;
    }

    const ems = [...document.querySelectorAll("section")].map((section) => section.querySelectorAll("em").length);
    const heights = [...document.querySelectorAll("section.screen")].map(
      (section) => section.getBoundingClientRect().height,
    );
    return {
      small,
      contrastFails,
      stray,
      ems,
      heights,
      iframes: document.querySelectorAll("iframe").length,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    };
  });
}

async function expectPlayed(stage: Locator) {
  await expect(stage).toHaveAttribute("data-state", "played", { timeout: 20000 });
  const elapsed = Number(await stage.getAttribute("data-elapsed"));
  expect(elapsed).toBeGreaterThanOrEqual(4000);
  expect(elapsed).toBeLessThanOrEqual(20000);
  const duration = Number(await stage.getAttribute("data-duration"));
  expect(duration).toBeGreaterThanOrEqual(4000);
  await stage.page().waitForTimeout(400);
  await expect(stage).toHaveAttribute("data-state", "played");
}

for (const [name, viewport] of Object.entries(sizes)) {
  test.describe(name, () => {
    test.use({ viewport });

    test("looks, contact, type, and contrast", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("#opening")).toHaveText(opening);
      await expect(page.getByRole("heading", { name: "Jakob Alex" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "CiteBot" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Retrieval Autopsy" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Voice check" })).toBeVisible();
      await expect(page.getByText("LOOK 01", { exact: true })).toBeVisible();
      await expect(page.getByText("LOOK 02", { exact: true })).toBeVisible();
      await expect(page.getByText("LOOK 03", { exact: true })).toBeVisible();
      await expect(page.getByText("In progress", { exact: true })).toBeVisible();
      await expect(page.getByText("Free answer checker", { exact: true })).toBeVisible();
      await expect(page.getByText("Style Distance", { exact: true })).toBeVisible();
      await expect(page.getByText("Recording · development build · no AI model · 4 Nov 2026")).toHaveCount(1);
      await expect(page.getByText("Recording · 4 Nov 2026")).toHaveCount(2);
      await expect(page.getByText(BACKGROUND)).toBeVisible();
      await expect(page.locator("#citebot").getByRole("link", { name: "Live" })).toHaveCount(0);
      await expect(page.locator("#autopsy").getByRole("link", { name: "Live" })).toHaveAttribute(
        "href",
        "https://retrieval-autopsy.vercel.app/",
      );
      await expect(page.locator("#voice").getByRole("link", { name: "Live" })).toHaveAttribute(
        "href",
        "https://style-distance.vercel.app/",
      );
      await expect(page.locator('a[href^="mailto:"]')).toHaveCount(1);
      await expect(page.locator('a[href^="mailto:"]')).toHaveAttribute("href", "mailto:jdevacc2000@gmail.com");
      await expect(page.getByRole("link", { name: "GitHub: https://github.com/jakob-alexander2000" })).toHaveAttribute(
        "href",
        "https://github.com/jakob-alexander2000",
      );
      const text = await page.locator("body").innerText();
      expect(text).not.toContain("Phone");
      for (const address of text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? []) expect(address).toBe("jdevacc2000@gmail.com");
      expect(text).not.toContain("to follow");
      expect(text).not.toContain("desk-index");
      expect(text).not.toContain("citebot-evals");
      expect(text).not.toContain("agent cockpit");
      expect(text).not.toContain("voice test bench");
      expect(text).not.toContain("installer phone agent");
      const report = await readPage(page);
      expect(report.small).toEqual([]);
      expect(report.contrastFails).toEqual([]);
      expect(report.stray).toEqual([]);
      expect(report.iframes).toBe(0);
      expect(report.overflow).toBe(false);
      expect(report.ems.every((count) => count <= 1)).toBe(true);
      expect(report.ems.reduce((sum, count) => sum + count, 0)).toBe(1);
      for (const height of report.heights) {
        expect(height).toBeGreaterThanOrEqual(viewport.height - 2);
      }
    });

    test("keyboard plays a look once", async ({ page }) => {
      await page.goto("/");
      const stage = page.locator("#voice figure.stage");
      await page.getByRole("button", { name: "Play Voice check recording" }).focus();
      await expectPlayed(stage);
    });

    test("reduced motion keeps the still", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
      await expect(page.getByRole("button", { name: /Play / })).toHaveCount(0);
      await expect(page.locator("#citebot figure.stage")).toHaveAttribute("data-state", "still");
      await expect(page.locator("#citebot img")).toBeVisible();
      await expect(page.locator("#autopsy img")).toBeVisible();
      await expect(page.locator("#voice img")).toBeVisible();
      const report = await readPage(page);
      expect(report.small).toEqual([]);
    });
  });
}

test.describe("tap", () => {
  test.use({ viewport: sizes.iphone, hasTouch: true });

  test("tap plays on the phone", async ({ page }) => {
    await page.goto("/");
    const stage = page.locator("#citebot figure.stage");
    await page.getByRole("button", { name: "Play CiteBot recording" }).tap();
    await expectPlayed(stage);
  });
});

test.describe("ipad tap", () => {
  test.use({ viewport: sizes["ipad-mini"], hasTouch: true });

  test("tap plays on the ipad", async ({ page }) => {
    await page.goto("/");
    const stage = page.locator("#autopsy figure.stage");
    await page.getByRole("button", { name: "Play Retrieval Autopsy recording" }).tap();
    await expectPlayed(stage);
  });
});

test.describe("hover", () => {
  test.use({ viewport: sizes.desktop });

  test("hover plays on the desktop", async ({ page }) => {
    await page.goto("/");
    const stage = page.locator("#citebot figure.stage");
    await stage.hover();
    await expectPlayed(stage);
  });

  test("a missing clip keeps the still", async ({ page }) => {
    await page.route("**/citebot.mp4", (route) => route.abort());
    await page.goto("/");
    await page.getByRole("button", { name: "Play CiteBot recording" }).click();
    await expect(page.locator("#citebot figure.stage")).toHaveAttribute("data-state", "fallback");
    await expect(
      page.getByText("The recording did not play. The still is from the development build, no AI model, 4 Nov 2026."),
    ).toBeVisible();
    await expect(page.locator("#citebot img")).toBeVisible();
  });

  test("a missing canvas keeps the still", async ({ page }) => {
    await page.addInitScript(`
      const proto = HTMLCanvasElement.prototype;
      const original = proto.getContext;
      proto.getContext = function (kind) {
        if (kind === "2d") return null;
        return original.apply(this, arguments);
      };
    `);
    await page.goto("/");
    await expect(page.locator("#citebot figure.stage")).toHaveAttribute("data-state", "fallback");
    await expect(page.locator("#citebot img")).toBeVisible();
    await expect(
      page.getByText("The recording did not play. The still is from the development build, no AI model, 4 Nov 2026.").first(),
    ).toBeVisible();
  });
});

test("review stills at 390", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "One Chromium capture is the review set.");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  for (const id of ["citebot", "autopsy", "voice"]) {
    const plate = page.locator(`#${id} .plate`);
    await plate.scrollIntoViewIfNeeded();
    const path = testInfo.outputPath(`${id}-390.png`);
    await plate.screenshot({ path });
    await testInfo.attach(`${id}-390.png`, { path, contentType: "image/png" });
  }
});

for (const viewport of [
  { width: 390, height: 664 },
  { width: 844, height: 390 },
  { width: 844, height: 340 },
  { width: 744, height: 1133 },
  { width: 1280, height: 800 },
]) {
  test(`each look shows its main action without scrolling at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    for (const id of ["citebot", "autopsy", "voice"]) {
      await page.evaluate((target) => document.getElementById(target)?.scrollIntoView({ block: "start" }), id);
      const box = await page.locator(`#${id} .links a`).first().boundingBox();
      expect(box, id).not.toBeNull();
      expect(box!.y + box!.height, id).toBeLessThanOrEqual(viewport.height);
    }
  });
}

for (const viewport of [
  { width: 390, height: 664 },
  { width: 375, height: 587 },
  { width: 844, height: 390 },
  { width: 844, height: 340 },
  { width: 1133, height: 610 },
]) {
  test(`the first screen shows the opening and LOOK 01 at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    for (const target of [page.locator("#opening"), page.getByRole("link", { name: "01 CiteBot" })]) {
      const box = await target.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
    }
  });
}

test.describe("replay", () => {
  test.use({ viewport: sizes.iphone, hasTouch: true });

  test("a second tap replays the recording", async ({ page }) => {
    await page.goto("/");
    const stage = page.locator("#citebot figure.stage");
    await page.getByRole("button", { name: "Play CiteBot recording" }).tap();
    await expectPlayed(stage);
    await page.getByRole("button", { name: "Replay CiteBot recording" }).tap();
    await expect(stage).toHaveAttribute("data-state", "playing");
    await expectPlayed(stage);
  });
});

test("no page shows an email address other than the contact address", async ({ page }) => {
  for (const path of ["/", "/not-a-real-page"]) {
    await page.goto(path);
    const html = await page.content();
    for (const address of html.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? []) expect(address, path).toBe("jdevacc2000@gmail.com");
  }
});

test("about returns home", async ({ page }) => {
  await page.goto("/about");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Jakob Alex" })).toBeVisible();
});
