import { expect, test, type Page } from "@playwright/test";
import { BACKGROUND } from "../lib/looks";

const sizes = {
  iphone: { width: 390, height: 844 },
  "ipad-mini": { width: 744, height: 1133 },
  desktop: { width: 1280, height: 800 },
  wide: { width: 1440, height: 900 },
  narrow: { width: 360, height: 740 },
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

const suiteSizes = [
  sizes.iphone,
  sizes["ipad-mini"],
  sizes.desktop,
  sizes.wide,
  sizes.narrow,
  { width: 390, height: 664 },
  { width: 844, height: 390 },
  { width: 844, height: 340 },
  { width: 375, height: 587 },
  { width: 375, height: 667 },
  { width: 1133, height: 610 },
  { width: 1133, height: 744 },
] as const;

async function tapTargets(page: Page) {
  return page.evaluate(() => {
    const bad: string[] = [];
    for (const el of document.querySelectorAll("a, button")) {
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || style.pointerEvents === "none") continue;
      const plane = el.closest(".plane");
      if (plane && getComputedStyle(plane).pointerEvents === "none") continue;
      const box = el.getBoundingClientRect();
      if (box.width < 44 || box.height < 44) {
        bad.push(`${box.width.toFixed(1)}x${box.height.toFixed(1)} ${(el.textContent ?? "").trim().slice(0, 40)}`);
      }
    }
    return bad;
  });
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
      for (const look of [
        { id: "citebot", name: "01 CiteBot", label: "01" },
        { id: "autopsy", name: "02 Retrieval Autopsy", label: "02" },
        { id: "voice", name: "03 Voice check", label: "03" },
      ] as const) {
        const link = page.locator(`#${look.id} nav[aria-label="Looks"]`).getByRole("link", { name: look.name });
        await expect(link).toHaveCount(1);
        await expect(link).toHaveText(look.label);
      }
      await expect(page.getByText("In progress", { exact: true })).toBeVisible();
      await expect(page.getByText("Free answer checker", { exact: true })).toBeVisible();
      await expect(page.getByText("Style Distance", { exact: true })).toBeVisible();
      await expect(page.locator("video")).toHaveCount(0);
      await expect(page.getByText("Checks each claim against the handbook passage. Development build, no AI model.")).toHaveCount(1);
      await expect(page.getByText("Shows where an answer drops a condition.", { exact: true })).toHaveCount(1);
      await expect(page.getByText("Measures how far a draft sits from a house voice.", { exact: true })).toHaveCount(1);
      await expect(page.getByText("The product page is coming.", { exact: true })).toHaveCount(1);
      await expect(page.locator('a[href*="citebot-chi.vercel.app"]')).toHaveCount(0);
      for (const look of [
        { id: "citebot", name: "CiteBot", live: false as const },
        { id: "autopsy", name: "Retrieval Autopsy", live: "https://retrieval-autopsy.vercel.app/" as const },
        { id: "voice", name: "Voice check", live: "https://style-distance.vercel.app/" as const },
      ]) {
        const section = page.locator(`#${look.id}`);
        const source = section.getByRole("link", { name: `Source · ${look.name}`, exact: true });
        const proof = section.getByRole("link", { name: `Proof · ${look.name}`, exact: true });
        await expect(source).toHaveCount(1);
        await expect(source).toHaveText("Source");
        await expect(proof).toHaveCount(1);
        await expect(proof).toHaveText("Proof");
        if (look.live) {
          const live = section.getByRole("link", { name: `Live · ${look.name}`, exact: true });
          const product = section.getByRole("link", { name: `Product page · ${look.name}`, exact: true });
          await expect(live).toHaveAttribute("href", look.live);
          await expect(live).toHaveText("Live");
          await expect(product).toHaveAttribute("href", look.live);
          await expect(product).toHaveText("Product page");
        } else {
          await expect(section.getByRole("link", { name: `Live · ${look.name}`, exact: true })).toHaveCount(0);
          await expect(section.getByRole("link", { name: `Product page · ${look.name}`, exact: true })).toHaveCount(0);
        }
      }
      await expect(page.getByText(BACKGROUND)).toBeVisible();
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
      expect(await tapTargets(page)).toEqual([]);
      expect(report.contrastFails).toEqual([]);
      expect(report.stray).toEqual([]);
      expect(report.iframes).toBe(0);
      expect(report.overflow).toBe(false);
      expect(report.ems.every((count) => count <= 1)).toBe(true);
      expect(report.ems.reduce((sum, count) => sum + count, 0)).toBe(1);
      const spatial = await page.evaluate(() => document.documentElement.classList.contains("spatial"));
      if (spatial) {
        const sheet = await page.locator("#top").boundingBox();
        expect(sheet).not.toBeNull();
        expect(sheet!.width).toBeGreaterThanOrEqual(Math.min(1000, viewport.width * 0.9) - 2);
        expect(sheet!.height).toBeGreaterThanOrEqual(viewport.height * 0.6);
      } else {
        for (const height of report.heights) {
          expect(height).toBeGreaterThanOrEqual(viewport.height - 2);
        }
      }
    });

    test("reduced motion keeps the diagrams readable", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
      await expect(page.locator("video")).toHaveCount(0);
      await expect(page.locator("canvas")).toHaveCount(0);
      const spatial = await page.evaluate(() => document.documentElement.classList.contains("spatial"));
      expect(spatial).toBe(false);
      for (const id of ["citebot", "autopsy", "voice"]) {
        await expect(page.locator(`#${id} img`)).toBeVisible();
        await expect(page.locator(`#${id} .flow`).getByText("Input", { exact: true })).toBeVisible();
        await expect(page.locator(`#${id} .flow`).getByText("Output", { exact: true })).toBeVisible();
        await expect(page.locator(`#${id} button[data-replay]`)).toBeHidden();
      }
      const report = await readPage(page);
      expect(report.small).toEqual([]);
      expect(await tapTargets(page)).toEqual([]);
    });
  });
}

test("review stills at 390", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "One Chromium capture is the review set.");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  for (const id of ["citebot", "autopsy", "voice"]) {
    const plate = page.locator(`#${id} .flow`);
    await plate.scrollIntoViewIfNeeded();
    const path = testInfo.outputPath(`${id}-390.png`);
    await plate.screenshot({ path });
    await testInfo.attach(`${id}-390.png`, { path, contentType: "image/png" });
  }
});

for (const viewport of [
  { width: 390, height: 664 },
  { width: 390, height: 844 },
  { width: 844, height: 390 },
  { width: 844, height: 340 },
  { width: 744, height: 1133 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 360, height: 740 },
]) {
  test(`each look shows its main action without scrolling at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    for (const id of ["citebot", "autopsy", "voice"]) {
      await page.locator(`#top a[href="#${id}"]`).click();
      const link = page.locator(`#${id} .links a`).first();
      await expect(link).toBeInViewport();
    }
  });
}

for (const viewport of suiteSizes) {
  test(`the main link is on the first screen at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator("video")).toHaveCount(0);
    expect(await tapTargets(page)).toEqual([]);
    for (const target of [page.locator("#opening"), page.locator("#top").getByRole("link", { name: "01 CiteBot" })]) {
      const box = await target.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
    }
  });
}

test("no page shows an email address other than the contact address", async ({ page }) => {
  for (const path of ["/", "/not-a-real-page"]) {
    await page.goto(path);
    const html = await page.content();
    for (const address of html.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? []) expect(address, path).toBe("jdevacc2000@gmail.com");
  }
});

test("a still that fails to load says so in words", async ({ page }) => {
  await page.route("**/recordings/*.jpg", (route) => route.abort());
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  for (const id of ["citebot", "autopsy", "voice"]) {
    await page.locator(`#${id} .still`).scrollIntoViewIfNeeded();
    await page.evaluate((target) => {
      const image = document.querySelector(`#${target} .still img`);
      if (!(image instanceof HTMLImageElement)) return;
      image.loading = "eager";
      const src = image.getAttribute("src");
      if (!src) return;
      image.src = "";
      image.src = src;
    }, id);
    await expect(page.locator(`#${id} .still`)).toContainText("The still did not load.");
    await expect(page.locator(`#${id} .still img`)).toHaveCount(0);
  }
});

test("about returns home", async ({ page }) => {
  await page.goto("/about");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Jakob Alex" })).toBeVisible();
});
