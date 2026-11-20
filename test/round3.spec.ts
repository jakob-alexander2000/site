import { expect, test, type Page } from "@playwright/test";

/** Round 3: readable pictures, hero that always draws, no overlap on a phone. */

async function drawnInk(page: Page) {
  return page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("#schnitt-layers canvas");
    if (!canvas || !canvas.width || !canvas.height) return -1;
    const copy = document.createElement("canvas");
    copy.width = canvas.width;
    copy.height = canvas.height;
    const ctx = copy.getContext("2d");
    if (!ctx) return -1;
    ctx.drawImage(canvas, 0, 0);
    const data = ctx.getImageData(0, 0, copy.width, copy.height).data;
    let ink = 0;
    for (let i = 3; i < data.length; i += 16) if (data[i] > 0) ink += 1;
    return ink;
  });
}

for (const size of [
  { width: 1280, height: 800 },
  { width: 1296, height: 810 },
  { width: 1440, height: 900 },
]) {
  test(`a fresh load at ${size.width}x${size.height} draws the layers`, async ({ page, browserName }) => {
    await page.setViewportSize(size);
    await page.goto("/");
    const stage = page.locator("#schnitt-layers");
    await expect(stage).toHaveAttribute("data-gl", "ready", { timeout: 20000 });
    await expect(page.locator(".schnitt-stage .sheet").first()).toBeVisible();
    await expect(page.locator(".schnitt-stage .callout").first()).toBeVisible();
    if (browserName === "chromium") expect(await drawnInk(page), "canvas has drawn pixels").toBeGreaterThan(2000);
  });
}

test("a resize from 390 to 1440 re-lays the flat drawing for the new width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-schnitt", "flat");
  await expect(page.locator("#schnitt-layers")).toHaveAttribute("data-gl", "off", { timeout: 15000 });
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const stage = document.getElementById("schnitt-layers")!;
        const box = document.querySelector(".tie-svg")?.getAttribute("viewBox") ?? "";
        return Math.abs(Number(box.split(" ")[2]) - stage.clientWidth);
      }),
    { timeout: 10000 })
    .toBeLessThanOrEqual(1);
  const sheets = page.locator(".schnitt-stage .sheet");
  for (let i = 0; i < (await sheets.count()); i += 1) await expect(sheets.nth(i)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
});

test("a resize from 1440 to 390 and back keeps a drawn hero", async ({ page, browserName }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("#schnitt-layers")).toHaveAttribute("data-gl", "ready", { timeout: 20000 });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(600);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(900);
  await expect(page.locator("#schnitt-layers")).toHaveAttribute("data-gl", "ready");
  await expect(page.locator(".schnitt-stage .sheet").first()).toBeVisible();
  if (browserName === "chromium") expect(await drawnInk(page)).toBeGreaterThan(2000);
});

test("a scene that never starts falls back to the flat drawing instead of a blank hero", async ({ page }) => {
  await page.addInitScript(() => {
    // A background tab or a paused frame loop: no frame ever fires.
    window.requestAnimationFrame = () => 0;
  });
  await page.setViewportSize({ width: 1296, height: 810 });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-schnitt", "flat", { timeout: 20000 });
  await expect(page.locator(".schnitt-stage .sheet").first()).toBeVisible();
});

for (const height of [844, 780]) {
  test(`at 390x${height} the hero layer cards neither overlap nor leave the screen`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height });
    await page.goto("/");
    const boxes = await page.locator(".schnitt-stage .sheet").evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { left: r.left, right: r.right, top: r.top + scrollY, bottom: r.bottom + scrollY };
      }),
    );
    expect(boxes.length).toBeGreaterThanOrEqual(4);
    for (const box of boxes) {
      expect(box.left, "left edge on screen").toBeGreaterThanOrEqual(0);
      expect(box.right, "right edge on screen").toBeLessThanOrEqual(390);
    }
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        const apart = boxes[i].bottom <= boxes[j].top + 0.5 || boxes[j].bottom <= boxes[i].top + 0.5;
        expect(apart, `cards ${i} and ${j} are apart`).toBe(true);
      }
    }
    const fit = await page.evaluate(() => {
      const stage = document.querySelector(".schnitt-stage")!.getBoundingClientRect();
      const foot = document.querySelector(".schnitt-foot")!.getBoundingClientRect();
      const out: string[] = [];
      document.querySelectorAll<HTMLElement>(".schnitt-stage .sheet").forEach((el, i) => {
        const r = el.getBoundingClientRect();
        if (r.bottom > stage.bottom + 1) out.push(`card ${i} bottom ${r.bottom.toFixed(0)} is past the stage ${stage.bottom.toFixed(0)}`);
        if (r.bottom > foot.top + 1) out.push(`card ${i} runs into the footer`);
        if (el.scrollHeight > el.clientHeight + 1) out.push(`card ${i} text is cut off (${el.scrollHeight} > ${el.clientHeight})`);
      });
      return out;
    });
    expect(fit).toEqual([]);
    const tiny = await page.locator(".schnitt-stage .sheet").evaluateAll((els) => {
      const bad: string[] = [];
      for (const el of els) {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          if (!n.textContent?.trim() || !n.parentElement) continue;
          const px = parseFloat(getComputedStyle(n.parentElement).fontSize);
          if (px < 11) bad.push(`${px} ${n.textContent.trim().slice(0, 20)}`);
        }
      }
      return bad;
    });
    expect(tiny).toEqual([]);
    const foot = await page.evaluate(() => {
      const link = document.querySelector<HTMLElement>(".schnitt-foot [data-hero-thread]")!.getBoundingClientRect();
      const note = [...document.querySelectorAll(".schnitt-foot p")].pop()!.getBoundingClientRect();
      return { linkBottom: link.bottom, noteTop: note.top, linkRight: link.right, noteLeft: note.left };
    });
    expect(foot.linkBottom <= foot.noteTop + 0.5 || foot.linkRight <= foot.noteLeft + 0.5, "footer link has its own room").toBe(true);
  });
}

test("text inside the work pictures is at least 11px as rendered at 390", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const small = await page.evaluate(() => {
    const bad: string[] = [];
    for (const svg of document.querySelectorAll<SVGSVGElement>("#work svg")) {
      const vb = svg.viewBox.baseVal;
      const scale = vb && vb.width ? svg.getBoundingClientRect().width / vb.width : 1;
      for (const text of svg.querySelectorAll("text")) {
        const px = parseFloat(getComputedStyle(text).fontSize) * scale;
        if (px < 11) bad.push(`svg ${px.toFixed(1)}px "${text.textContent?.slice(0, 20)}"`);
      }
    }
    for (const img of document.querySelectorAll<HTMLImageElement>("#work img")) {
      const min = Number(img.dataset.minTextPx);
      const scale = img.getBoundingClientRect().width / img.naturalWidth;
      const px = min * scale;
      if (!(min > 0)) bad.push(`${img.getAttribute("src")} has no data-min-text-px`);
      else if (px < 11) bad.push(`${img.getAttribute("src")} text ${px.toFixed(1)}px`);
    }
    return bad;
  });
  expect(small).toEqual([]);
  expect(await page.locator("#work img").count()).toBe(3);
});

test("the Persona picture is real text, so it scales with the page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const receipt = page.locator("#persona [data-visual]");
  await expect(receipt).toHaveCount(1);
  expect(await receipt.evaluate((el) => el.tagName.toLowerCase())).toBe("div");
  await expect(receipt.locator("svg")).toHaveCount(0);
  await expect(receipt).toContainText("required-headings");
});

test("the portrait slot is not shown while the drawing file is missing", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-portrait-slot]")).toHaveCount(0);
  await expect(page.locator(".portrait-slot")).toHaveCount(0);
  expect((await page.request.get("/portrait.svg")).status()).toBe(404);
  expect((await page.request.get("/portrait.png")).status()).toBe(404);
});

for (const size of [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
]) {
  test(`a Flagship: Persona link sits under the who-I-am line at ${size.width}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto("/");
    const link = page.locator("#top .schnitt-copy a", { hasText: "Flagship: Persona" });
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute("href", "#persona");
    const [who, flag] = await Promise.all([page.locator("#opening").boundingBox(), link.boundingBox()]);
    expect(flag!.y).toBeGreaterThanOrEqual(who!.y + who!.height - 1);
    expect(flag!.y + flag!.height).toBeLessThanOrEqual(size.height);
    await link.click();
    await expect.poll(async () => (await page.locator("#persona").boundingBox())!.y).toBeLessThan(size.height * 0.5);
  });

  test(`"I build" never breaks after the I at ${size.width}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto("/");
    expect(await page.locator("#opening").textContent()).toContain("I\u00a0build");
    const tops = await page.evaluate(() => {
      const node = document.getElementById("opening")!.firstChild as Text;
      const at = node.textContent!.indexOf("I\u00a0build");
      const r = document.createRange();
      r.setStart(node, at);
      r.setEnd(node, at + 1);
      const a = r.getBoundingClientRect().top;
      r.setStart(node, at + 2);
      r.setEnd(node, at + 3);
      return [a, r.getBoundingClientRect().top];
    });
    expect(Math.abs(tops[0] - tops[1])).toBeLessThan(4);
  });
}

test("every skill points at public proof or the project that shows it", async ({ page }) => {
  await page.goto("/");
  const links = page.locator("#skills [data-skill] a[data-proof]");
  const count = await links.count();
  expect(count).toBeGreaterThanOrEqual(5);
  const ts = page.locator("#skills [data-skill]", { hasText: "TypeScript and Playwright" }).locator("a[data-proof]");
  await expect(ts).toHaveAttribute("href", /^https:\/\/github\.com\/jakob-alexander2000\/site(\/|$)/);
  for (let i = 0; i < count; i += 1) {
    const href = (await links.nth(i).getAttribute("href")) ?? "";
    expect(href.startsWith("#") || href.startsWith("https://github.com/jakob-alexander2000/") || href.startsWith("https://citebot-chi.vercel.app/"), href).toBe(true);
  }
  const persona = await page.locator('#skills a[href="#persona"]').count();
  expect(persona, "Persona has no public proof, so it carries one skill").toBeLessThanOrEqual(1);
});

test("the work pictures have no clipped sliver: each image shows whole cards", async ({ page }) => {
  await page.goto("/");
  for (const img of await page.locator("#work img").all()) {
    const fit = await img.evaluate((el) => getComputedStyle(el).objectFit);
    expect(fit, "the whole picture is shown, not cropped by the frame").toBe("contain");
    const frame = await img.evaluate((node) => {
      const el = node as HTMLImageElement;
      const r = el.getBoundingClientRect();
      return Math.abs(r.height / r.width - el.naturalHeight / el.naturalWidth);
    });
    expect(frame, "frame matches the picture ratio").toBeLessThan(0.02);
  }
});
