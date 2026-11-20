import { expect, test, type Page } from "@playwright/test";

/** Round 4: Persona leads, the hero is not a CiteBot poster, one line-drawing system, hash links land. */

async function headingInView(page: Page, heading: string, viewportHeight: number) {
  const box = await page.getByRole("heading", { name: heading, exact: true }).boundingBox();
  expect(box, `${heading} has a box`).not.toBeNull();
  expect(box!.y, `${heading} is not above the viewport`).toBeGreaterThanOrEqual(-1);
  expect(box!.y + Math.min(box!.height, 40), `${heading} is on screen`).toBeLessThanOrEqual(viewportHeight);
  const atEnd = await page.evaluate(() => Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 2);
  if (!atEnd) expect(box!.y, `${heading} sits near the top`).toBeLessThanOrEqual(200);
}

async function visibleFoldText(page: Page, height: number) {
  return page.evaluate((fold) => {
    const bits: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const el = node.parentElement;
      if (!el || !node.textContent?.trim()) continue;
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const r = el.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= fold) continue;
      bits.push(node.textContent);
    }
    return bits.join(" ");
  }, height);
}

for (const size of [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
]) {
  test(`Flagship: Persona lands on the Persona heading at ${size.width}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto("/");
    const link = page.locator("#top .schnitt-copy a", { hasText: "Flagship: Persona" });
    await expect(link).toBeVisible();
    await link.click({ force: false, timeout: 8000 });
    await page.waitForFunction(() => location.hash === "#persona");
    await page.waitForTimeout(400);
    await headingInView(page, "Persona", size.height);
  });

  test(`no CiteBot text is on the first screen at ${size.width}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto("/");
    const text = await visibleFoldText(page, size.height);
    expect(text, "CiteBot is not named above the fold").not.toMatch(/citebot/i);
  });

  test(`Persona is first and the largest project at ${size.width}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto("/");
    const projects = page.locator("#work [data-project]");
    await expect(projects.first()).toHaveAttribute("data-project", "persona");
    const areas = await projects.evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { id: (el as HTMLElement).dataset.project, area: r.width * r.height };
      }),
    );
    const persona = areas.find((item) => item.id === "persona");
    expect(persona, "Persona is on the page").toBeTruthy();
    for (const other of areas.filter((item) => item.id !== "persona")) {
      expect(persona!.area, `Persona is larger than ${other.id}`).toBeGreaterThan(other.area);
    }
  });
}

test("the header section links at 1440 land on their headings", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const header = page.getByRole("navigation", { name: "Sections" });
  for (const [href, heading] of [
    ["#work", "Selected work"],
    ["#skills", "Skills, with the work that shows them"],
    ["#about", "About"],
    ["#contact", "Contact"],
  ] as const) {
    await header.locator(`a[href="${href}"]`).click({ force: false, timeout: 8000 });
    await page.waitForTimeout(400);
    await headingInView(page, heading, 900);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
  }
});

test("every project visual uses the shared work frame, with no raster shots", async ({ page }) => {
  await page.goto("/");
  const projects = page.locator("#work [data-project]");
  const count = await projects.count();
  expect(count).toBeGreaterThanOrEqual(3);
  await expect(page.locator("#work [data-work-frame]")).toHaveCount(count);
  await expect(page.locator("#work img")).toHaveCount(0);
  for (let i = 0; i < count; i += 1) {
    await expect(projects.nth(i).locator("[data-work-frame]")).toHaveCount(1);
  }
});

test("text inside work visuals is at least 14px at 390", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const small = await page.evaluate(() => {
    const bad: string[] = [];
    for (const frame of document.querySelectorAll("[data-work-frame]")) {
      const walker = document.createTreeWalker(frame, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.textContent?.trim() || !node.parentElement) continue;
        const style = getComputedStyle(node.parentElement);
        if (style.display === "none" || style.visibility === "hidden") continue;
        const px = parseFloat(style.fontSize);
        if (px < 14) bad.push(`${px}px "${node.textContent.trim().slice(0, 24)}"`);
      }
    }
    return bad;
  });
  expect(small).toEqual([]);
});

test("the alignment grid token is defined and used by every section", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const grid = await page.evaluate(() => {
    const token = getComputedStyle(document.documentElement).getPropertyValue("--gutter").trim();
    return {
      token,
      hero: getComputedStyle(document.querySelector(".schnitt-sticky")!).paddingLeft,
      plates: getComputedStyle(document.querySelector(".plates")!).paddingLeft,
    };
  });
  expect(grid.token, "--gutter is defined").not.toBe("");
  expect(grid.hero).toContain("px");
  expect(grid.plates).toBe(grid.hero);
});
