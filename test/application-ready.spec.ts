import { expect, test, type Page } from "@playwright/test";

/**
 * The page a reviewer reads in thirty seconds: who I am, a few projects with
 * Persona first, one distinct picture each, skills that point at proof, one
 * email, a portrait slot, and type that comes only from the scale.
 */

const SIZES = [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
] as const;

const WHO = /I’m Jakob Alex\. I build AI products you can check\./;

for (const size of SIZES) {
  test(`the who-I-am line is on the first screen at ${size.width}x${size.height}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto("/");
    const who = page.locator("#opening");
    await expect(who).toBeVisible();
    await expect(who).toHaveText(WHO);
    const box = await who.boundingBox();
    expect(box, "who line has a box").not.toBeNull();
    expect(box!.y + box!.height, "who line ends above the fold").toBeLessThanOrEqual(size.height);
  });
}

test("three or four selected projects, Persona first", async ({ page }) => {
  await page.goto("/");
  const projects = page.locator("#work [data-project]");
  const count = await projects.count();
  expect(count).toBeGreaterThanOrEqual(3);
  expect(count).toBeLessThanOrEqual(4);
  await expect(projects.first()).toHaveAttribute("data-project", "persona");
  await expect(projects.first().locator("h3")).toHaveText("Persona");
  await expect(projects.first()).toContainText("formerly Dockbot");
});

test("every project has exactly one picture and none repeat", async ({ page }) => {
  await page.goto("/");
  const projects = page.locator("#work [data-project]");
  const seen = new Set<string>();
  for (let i = 0; i < (await projects.count()); i += 1) {
    const visual = projects.nth(i).locator("[data-visual]");
    await expect(visual, `project ${i} has one visual`).toHaveCount(1);
    const key = await visual.getAttribute("data-visual");
    expect(key, `project ${i} visual has a source`).toBeTruthy();
    expect(seen.has(key!), `visual ${key} is not repeated`).toBe(false);
    seen.add(key!);
    const alt = await visual.getAttribute("aria-label") ?? (await visual.locator("img").getAttribute("alt"));
    expect((alt ?? "").length, `project ${i} visual is described`).toBeGreaterThan(20);
  }
  const imgs = await page.locator("main img").evaluateAll((els) => els.map((el) => (el as HTMLImageElement).currentSrc || (el as HTMLImageElement).src));
  expect(new Set(imgs).size, "no image src repeats on the page").toBe(imgs.length);
});

test("every skill links to the project that shows it", async ({ page }) => {
  await page.goto("/");
  const skills = page.locator("#skills [data-skill]");
  expect(await skills.count()).toBeGreaterThanOrEqual(3);
  const anchors = await page.locator("#work [data-project]").evaluateAll((els) => els.map((el) => el.id));
  for (let i = 0; i < (await skills.count()); i += 1) {
    const link = skills.nth(i).locator("a[data-proof]");
    await expect(link).toHaveCount(1);
    const href = await link.getAttribute("href");
    expect(href, "proof is an in-page project anchor").toMatch(/^#/);
    expect(anchors).toContain(href!.slice(1));
  }
});

test("the only contact is one mailto link", async ({ page }) => {
  await page.goto("/");
  const contact = page.locator("#contact");
  await expect(contact.locator("a")).toHaveCount(1);
  await expect(contact.locator("a")).toHaveAttribute("href", /^mailto:[^@\s]+@[^@\s]+$/);
  const mailtos = await page.locator('a[href^="mailto:"]').evaluateAll((els) => [...new Set(els.map((el) => el.getAttribute("href")))]);
  expect(mailtos).toHaveLength(1);
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
});

test("a marked slot waits for the line-drawing portrait", async ({ page }) => {
  await page.goto("/");
  const slot = page.locator("[data-portrait-slot]");
  await expect(slot).toHaveCount(1);
  await expect(slot).toHaveAttribute("aria-label", /portrait/i);
});

async function textSizes(page: Page) {
  return page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const tokens = ["--t-label", "--t-body", "--t-lead", "--t-title", "--t-display"];
    const probe = document.createElement("span");
    document.body.appendChild(probe);
    const scale = tokens.map((token) => {
      probe.style.fontSize = `var(${token})`;
      return getComputedStyle(probe).fontSize;
    });
    probe.remove();
    const missing = tokens.filter((token) => !root.getPropertyValue(token).trim());
    const off: string[] = [];
    const walker = document.createTreeWalker(document.querySelector("main")!, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const el = node.parentElement;
      if (!el || !node.textContent?.trim()) continue;
      if (el.closest("svg, .schnitt-stage, [aria-hidden='true'], .skip")) continue;
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;
      if (!scale.includes(style.fontSize)) off.push(`${style.fontSize} ${el.tagName}.${el.className} "${node.textContent.trim().slice(0, 30)}"`);
    }
    return { scale, missing, off };
  });
}

for (const size of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
  test(`type sizes come only from the five-step scale at ${size.width}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto("/");
    const { scale, missing, off } = await textSizes(page);
    expect(missing, "all five tokens are defined").toEqual([]);
    expect(new Set(scale).size, "five distinct steps").toBe(5);
    expect(off, "text outside the scale").toEqual([]);
  });
}

test("iPhone portrait keeps the hero drawing still", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-schnitt", "flat");
  await expect(page.locator("canvas.schnitt-gl")).toBeHidden();
});

test("the page carries none of the banned framing", async ({ page }) => {
  await page.goto("/");
  const text = (await page.locator("body").innerText()).toLowerCase();
  for (const word of [/tascam/, /\bteac\b/, /\bincome\b/, /salary/, /€/, /\bhir(e|ed|ing)\b/, /ledger/, /grounded docs/, /berlin/, /vierspur/]) {
    expect(text, String(word)).not.toMatch(word);
  }
});

for (const width of [390, 768, 1440]) {
  test(`the page does not scroll sideways at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}
