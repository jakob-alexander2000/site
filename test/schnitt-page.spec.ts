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
