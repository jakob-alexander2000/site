import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { CITEBOT_PLATE, DROPPED, STYLE_DISTANCE } from "../lib/diagrams";

test("every plate is in the served html", async ({ page }) => {
  await page.goto("/");
  const html = await page.content();
  for (const line of [
    CITEBOT_PLATE.headline,
    CITEBOT_PLATE.body,
    DROPPED.headline,
    DROPPED.passage,
    DROPPED.answer,
    "FAIL",
    STYLE_DISTANCE.headline,
    STYLE_DISTANCE.label,
    STYLE_DISTANCE.drifted,
    STYLE_DISTANCE.heldOut,
    "I check each sentence against the passage it came from and mark what fell out.",
    "I came into software through a coding bootcamp and am finishing a distance-learning degree in computer science.",
  ]) {
    expect(html, line).toContain(line);
  }
  expect(html).not.toContain("[Draft");
  expect(html).not.toContain("[Needs");
  expect(html).not.toContain("[Optional");
  expect(html).not.toContain("MCP");
  expect(html).not.toContain("LOOK 01");
  expect(html).not.toContain("The product page is coming.");
  expect(html).not.toContain("citebot-chi.vercel.app/ask");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h2")).toHaveCount(8);
  await expect(page.locator("svg")).not.toHaveCount(0);
});

test("the sheet index reaches every plate", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const header = page.getByRole("navigation", { name: "Sheets" });
  for (const label of ["00 Hero", "01 CiteBot", "02 Retrieval Autopsy", "03 Style Distance", "04 Skills", "05 About", "06 Contact", "07 Footer"]) {
    const link = header.getByRole("link", { name: label });
    await expect(link).toHaveCount(1);
    const box = await link.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
  const footer = page.getByRole("navigation", { name: "Sheet index" });
  await expect(footer.getByRole("link", { name: "07 Footer" })).toHaveCount(0);
  await expect(footer.getByRole("link", { name: "06 Contact" })).toHaveCount(1);
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toBeVisible();
  const outline = await focused.evaluate((node) => getComputedStyle(node).outlineStyle);
  expect(outline === "none" || outline === "auto" ? await focused.evaluate((node) => getComputedStyle(node).outlineWidth) : outline).not.toBe("0px");
});

test("javascript off still serves the plate text and drawings", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { name: CITEBOT_PLATE.headline })).toBeVisible();
  await expect(page.getByRole("heading", { name: DROPPED.headline })).toBeVisible();
  await expect(page.locator("#citebot").getByRole("link", { name: "Harness" })).toBeVisible();
  await expect(page.locator("svg")).not.toHaveCount(0);
  await context.close();
});

test("reduced motion has no running animation and no three download", async ({ page }) => {
  const three: string[] = [];
  page.on("response", async (response) => {
    const url = response.url();
    if (!url.includes("/_next/")) return;
    if (/three/i.test(url)) three.push(url);
    const type = response.headers()["content-type"] ?? "";
    if (!type.includes("javascript") && !url.endsWith(".js")) return;
    const body = await response.text().catch(() => "");
    if (body.includes("WebGLRenderer")) three.push(url);
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForTimeout(1000);
  const running = await page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === "running").length);
  expect(running).toBe(0);
  await expect(page.getByRole("button", { name: "Pause" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Replay" })).toHaveCount(0);
  expect(three).toEqual([]);
});

test("axe and console stay clear on the plates", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("favicon")) errors.push(message.text());
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const results = await new AxeBuilder({ page }).include("main").analyze();
  expect(results.violations).toEqual([]);
  expect(errors).toEqual([]);
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

for (const viewport of [
  { width: 390, height: 844 },
  { width: 390, height: 780 },
  { width: 375, height: 667 },
  { width: 390, height: 664 },
  { width: 744, height: 1133 },
  { width: 844, height: 390 },
  { width: 844, height: 340 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
]) {
  test(`the limits kept from the old page hold at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const report = await page.evaluate(() => {
      const parse = (color: string) => {
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (!match || (match[4] !== undefined && Number(match[4]) < 0.2)) return null;
        return [Number(match[1]), Number(match[2]), Number(match[3])];
      };
      const lin = (value: number) => {
        const channel = value / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      };
      const luminance = (rgb: number[]) => 0.2126 * lin(rgb[0] ?? 0) + 0.7152 * lin(rgb[1] ?? 0) + 0.0722 * lin(rgb[2] ?? 0);
      const ratio = (a: number[], b: number[]) => {
        const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
        return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
      };
      const ground = (node: Element | null) => {
        while (node) {
          const rgb = parse(getComputedStyle(node).backgroundColor);
          if (rgb) return rgb;
          node = node.parentElement;
        }
        return [255, 255, 255];
      };
      const shown = (node: Element) => {
        const style = getComputedStyle(node);
        const box = node.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && box.width > 0 && box.height > 0;
      };
      const contrast: string[] = [];
      const body: string[] = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
      let node = walker.currentNode as Element | null;
      while (node) {
        const text = [...node.childNodes].some((child) => child.nodeType === Node.TEXT_NODE && (child.textContent ?? "").trim());
        if (text && shown(node) && !node.closest("script, style, noscript, svg, .schnitt-stage, .skip")) {
          const ink = parse(getComputedStyle(node).color);
          if (ink) {
            const value = ratio(ink, ground(node));
            const sample = `${value.toFixed(2)} ${(node.textContent ?? "").trim().slice(0, 32)}`;
            if (value < 4.5) contrast.push(sample);
            if (node.matches(".plate .body, .plate li") && value < 7) body.push(sample);
          }
        }
        node = walker.nextNode() as Element | null;
      }
      const taps = [...document.querySelectorAll("a, button")]
        .filter((item) => shown(item) && !item.classList.contains("skip"))
        .map((item) => ({ box: item.getBoundingClientRect(), name: (item.getAttribute("aria-label") ?? item.textContent ?? "").trim().slice(0, 24) }))
        .filter(({ box }) => box.width < 44 || box.height < 44)
        .map(({ box, name }) => `${box.width.toFixed(0)}x${box.height.toFixed(0)} ${name}`);
      const main = document.querySelector(".schnitt-copy .actions a")?.getBoundingClientRect();
      return {
        contrast,
        body,
        taps,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        iframes: document.querySelectorAll("iframe").length,
        mainOnFirstScreen: !!main && main.top >= 0 && main.bottom <= window.innerHeight,
      };
    });
    const where = `${viewport.width}x${viewport.height}`;
    expect(report.contrast, where).toEqual([]);
    expect(report.body, where).toEqual([]);
    expect(report.taps, where).toEqual([]);
    expect(report.overflow, where).toBe(false);
    expect(report.iframes, where).toBe(0);
    expect(report.mainOnFirstScreen, where).toBe(true);
  });
}
