import { expect, test, type Locator, type Page } from "@playwright/test";
import { findPublicFaceHits } from "../scripts/scan-copy";
import {
  CRAFT,
  FAIL_EVIDENCE,
  FAIL_SENTENCE,
  OPENING,
  PASS_SENTENCE,
  PASS_SPAN,
  SCORES,
  SHELF_COPY,
} from "./copy";
import { devices, type Device } from "./devices";

async function inFirstScreen(locator: Locator, height: number): Promise<boolean> {
  const box = await locator.boundingBox();
  return box !== null && box.y >= -1 && box.y + box.height <= height + 1;
}

async function foldProblems(page: Page, device: Device): Promise<string[]> {
  const problems: string[] = [];
  const opening = page.locator("[data-opening]");
  if ((await opening.count()) !== 1) {
    const lookbook = page.locator("#opening");
    const shown = (await lookbook.count())
      ? (await lookbook.innerText()).replace(/\s+/g, " ").trim()
      : "no opening";
    problems.push(`close-reading opening is missing; the page still shows: ${shown}`);
  } else {
    const text = (await opening.innerText()).replace(/\s+/g, " ").trim();
    if (text !== OPENING) problems.push(`opening is ${JSON.stringify(text)}`);
    if (!(await inFirstScreen(opening, device.height))) problems.push("opening is below the first screen");
  }
  for (const label of ["GitHub", "Email"] as const) {
    const link = page.getByRole("link", { name: label, exact: true });
    if ((await link.count()) < 1) problems.push(`${label} is not a word-only link`);
    else if (!(await inFirstScreen(link.first(), device.height))) problems.push(`${label} is below the first screen`);
  }
  const scene = page.locator("[data-flagship]");
  if ((await scene.count()) !== 1) problems.push("flagship scene is missing");
  else if (!(await inFirstScreen(scene.locator("[data-sentence]").first(), device.height))) {
    problems.push("flagship sentence is below the first screen");
  }
  for (const name of [PASS_SENTENCE, FAIL_SENTENCE, "Try it"]) {
    const target = name === "Try it" ? page.getByRole("link", { name, exact: true }).first() : page.getByText(name, { exact: name !== FAIL_SENTENCE }).first();
    if ((await target.count()) < 1) problems.push(`${name} is missing`);
    else if (!(await inFirstScreen(target, device.height))) problems.push(`${name} is below the first screen`);
  }
  return problems;
}

function onDevice(device: Device, project: string): boolean {
  return device.project === undefined || device.project === project;
}

for (const device of devices) {
  test.describe(`${device.name} ${device.width}x${device.height}`, () => {
    test.use({ viewport: { width: device.width, height: device.height } });

    test("fold shows the sentence, the flagship, and the words GitHub and Email before scroll", async ({ page }, info) => {
      test.skip(!onDevice(device, info.project.name), `${device.name} runs on ${device.project}`);
      await page.goto("/");
      expect(await foldProblems(page, device)).toEqual([]);
    });

    test("grid matches the breakpoint", async ({ page }, info) => {
      test.skip(!onDevice(device, info.project.name), `${device.name} runs on ${device.project}`);
      await page.goto("/");
      const grid = page.locator("[data-grid]");
      expect(await grid.count(), "grid is not on the page").toBe(1);
      await expect(grid).toHaveAttribute("data-columns", String(device.columns));
      const pad = await grid.evaluate((el) => Number.parseFloat(getComputedStyle(el).paddingLeft));
      expect(pad).toBe(device.margin);
    });

    test("nothing overlaps at any scroll position", async ({ page }, info) => {
      test.skip(!onDevice(device, info.project.name), `${device.name} runs on ${device.project}`);
      await page.goto("/");
      expect(await page.locator("[data-block]").count(), "close-reading blocks are not on the page").toBeGreaterThan(0);
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      const step = Math.max(120, Math.floor(device.height / 2));
      for (let top = 0; top < height; top += step) {
        await page.evaluate((y) => window.scrollTo(0, y), top);
        const hits = await page.evaluate(() => {
          const nodes = [...document.querySelectorAll("[data-block]")];
          const found: string[] = [];
          for (let i = 0; i < nodes.length; i += 1) {
            const a = nodes[i].getBoundingClientRect();
            if (a.width < 2 || a.height < 2) continue;
            for (let j = i + 1; j < nodes.length; j += 1) {
              const b = nodes[j].getBoundingClientRect();
              const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left);
              const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
              if (overlapX > 1 && overlapY > 1) {
                const name = (node: Element) => node.getAttribute("data-block") ?? node.id ?? node.tagName;
                found.push(`${name(nodes[i])} overlaps ${name(nodes[j])}`);
              }
            }
          }
          return found;
        });
        expect(hits, `scroll ${top}`).toEqual([]);
      }
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      expect(overflow).toBe(false);
    });

    test("footer and contact are reachable", async ({ page }, info) => {
      test.skip(!onDevice(device, info.project.name), `${device.name} runs on ${device.project}`);
      await page.goto("/");
      const contact = page.locator("footer #contact");
      expect(await contact.count(), "footer contact is not on the page").toBe(1);
      await contact.scrollIntoViewIfNeeded();
      const box = await contact.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.y).toBeGreaterThanOrEqual(-1);
      expect(box!.y + box!.height).toBeLessThanOrEqual(device.height + 1);
      await expect(contact.getByRole("link", { name: "Email", exact: true })).toBeVisible();
      await expect(contact.getByRole("link", { name: "GitHub", exact: true })).toBeVisible();
    });
  });
}

test("visible text has no raw url, third person, location, or money", async ({ page }) => {
  await page.goto("/");
  const hits = findPublicFaceHits(await page.locator("body").innerText());
  expect(hits.map((hit) => hit.rule)).toEqual([]);
});

test("proof shelf has three entries and each has a claim, an artifact, and a limit", async ({ page }) => {
  await page.goto("/");
  const problems: string[] = [];
  const text = await page.locator("body").innerText();
  const count = await page.locator("[data-shelf-entry]").count();
  if (count !== 3) problems.push(`shelf has ${count} entries, expected 3`);
  for (const banned of ["Vierspur", "planner workbench", "Voice check", "Style Distance", "desk-index"]) {
    if (text.includes(banned)) problems.push(`page contains ${banned}`);
  }
  if (/\bMCP\b/.test(text)) problems.push("page contains MCP");
  for (const entry of SHELF_COPY) {
    if (!text.includes(entry.claim)) problems.push(`missing claim: ${entry.claim}`);
    if (!text.includes(entry.limit)) problems.push(`missing limit: ${entry.limit}`);
    const link = page.locator(`a[data-artifact="${entry.id}"]`);
    if ((await link.count()) !== 1) problems.push(`missing artifact link ${entry.id}`);
    else {
      const href = await link.getAttribute("href");
      const label = (await link.innerText()).replace(/\s+/g, " ").trim();
      if (href !== entry.href) problems.push(`${entry.id} href is ${href}`);
      if (label !== entry.label) problems.push(`${entry.id} label is ${JSON.stringify(label)}`);
    }
  }
  expect(problems).toEqual([]);
});

test("labeled scores do not contradict each other", async ({ page }) => {
  await page.goto("/");
  const problems: string[] = [];
  for (const score of SCORES) {
    const node = page.locator(`[data-score="${score.id}"]`);
    if ((await node.count()) !== 1) {
      problems.push(`${score.id} score is missing`);
      continue;
    }
    const value = (await node.innerText()).replace(/\s+/g, " ").trim();
    if (!value.includes(score.value)) problems.push(`${score.id} value is ${value}`);
    if (!value.toLowerCase().includes(score.label)) problems.push(`${score.id} label is missing`);
    if (score.date && !value.includes(score.date)) problems.push(`${score.id} date is missing`);
    if (/\d+\s*\/\s*\d+/.test(value)) problems.push(`${score.id} uses a slash ratio`);
  }
  expect(problems).toEqual([]);
});

test("the scene uses the two clean fixture sentences", async ({ page }) => {
  await page.goto("/");
  const problems: string[] = [];
  const text = await page.locator("body").innerText();
  const pass = page.locator("[data-sentence][data-verdict='pass']");
  const fail = page.locator("[data-sentence][data-verdict='fail']");
  if ((await pass.count()) !== 1) problems.push("pass sentence is missing");
  else if ((await pass.innerText()).replace(/\s+/g, " ").trim() !== PASS_SENTENCE) {
    problems.push(`pass sentence is ${(await pass.innerText()).trim()}`);
  }
  if ((await fail.count()) !== 1) problems.push("fail sentence is missing");
  else {
    const failText = (await fail.innerText()).replace(/\s+/g, " ").trim();
    if (!failText.includes(FAIL_SENTENCE)) problems.push(`fail sentence is ${failText}`);
    if (!failText.includes("Fail")) problems.push("fail sentence is missing the word Fail");
  }
  if (!(await page.locator("body").innerText()).includes(FAIL_EVIDENCE)) problems.push("fail evidence is missing");
  const passage = page.locator("[data-passage]");
  if ((await passage.count()) !== 1) problems.push("passage is missing");
  else {
    const passageText = await passage.innerText();
    if (!passageText.includes(PASS_SPAN)) problems.push("passage is missing the vendored span");
    if (/berlin/i.test(passageText)) problems.push("passage includes the place clause");
  }
  if (text.includes("€") || text.includes("Chair budget") || text.includes("Daily lunches")) {
    problems.push("the currency case is on the page");
  }
  if ((await page.locator("[data-sentence][data-verdict='unsupported']").count()) !== 0) {
    problems.push("production scene has an unsupported sentence");
  }
  expect(problems).toEqual([]);
});

test("craft line is present and the bootcamp arc is absent", async ({ page }) => {
  await page.goto("/");
  const text = await page.locator("body").innerText();
  const problems: string[] = [];
  if (!text.includes(CRAFT)) problems.push("craft line is missing");
  for (const banned of ["bootcamp", "LOOK 01", "The product page is coming.", "taught himself", "In progress"]) {
    if (text.includes(banned)) problems.push(`page contains ${banned}`);
  }
  if (/\bplate\b/i.test(text)) problems.push("page contains plate");
  expect(problems).toEqual([]);
});

test("reduced motion keeps the diagrams understandable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const problems: string[] = [];
  for (const size of [
    { width: 1280, height: 800 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(size);
    await page.goto("/");
    if ((await page.locator("[data-reduced='flat']").count()) !== 1) {
      problems.push(`reduced-motion layout is missing at ${size.width}x${size.height}`);
      continue;
    }
    if ((await page.locator("[data-tie]").count()) < 1) {
      problems.push(`numbered ties are missing at ${size.width}x${size.height}`);
    }
    const sentence = page.locator("[data-sentence]").first();
    if ((await sentence.count()) < 1) problems.push(`sentence control is missing at ${size.width}x${size.height}`);
  }
  expect(problems).toEqual([]);
});

test("keyboard selects a sentence and draws its thread", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const sentence = page.locator("[data-sentence]").first();
  expect(await sentence.count(), "sentences are not on the page").toBeGreaterThan(0);
  await sentence.focus();
  await page.keyboard.press("Enter");
  const id = await sentence.getAttribute("data-sentence-id");
  await expect(page.locator(`[data-active-sentence="${id}"]`)).toBeVisible();
  await expect(page.locator(`[data-thread][data-sentence-id="${id}"]`)).toBeVisible();
});

test.describe("touch", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test("touch selects a sentence and draws its thread", async ({ page }) => {
    await page.goto("/");
    const sentence = page.locator("[data-sentence]").first();
    expect(await sentence.count(), "sentences are not on the page").toBeGreaterThan(0);
    await sentence.tap();
    const id = await sentence.getAttribute("data-sentence-id");
    await expect(page.locator(`[data-active-sentence="${id}"]`)).toBeVisible();
    await expect(page.locator(`[data-thread][data-sentence-id="${id}"]`)).toBeVisible();
  });
});

test("body contrast is at least 7 to 1 and fail red is at least 4.5 to 1", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const body = page.locator("[data-role='body']").first();
  expect(await body.count(), "body text is not marked").toBeGreaterThan(0);
  expect(await contrastRatio(body)).toBeGreaterThanOrEqual(7);
  const fail = page.locator("[data-verdict='fail']").first();
  expect(await fail.count(), "fail verdict is not marked").toBeGreaterThan(0);
  await expect(fail).toContainText("Fail");
  expect(await contrastRatio(fail)).toBeGreaterThanOrEqual(4.5);
});

test("type ramp uses the four sizes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const problems: string[] = [];
  const expected = [
    ["display", 40, 72],
    ["heading", 32, 32],
    ["body", 17, 17],
    ["mono", 16, 16],
  ] as const;
  for (const [name, min, max] of expected) {
    const node = page.locator(`[data-type="${name}"]`).first();
    if ((await node.count()) !== 1) {
      problems.push(`${name} is not marked`);
      continue;
    }
    const size = await node.evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize));
    if (size < min - 0.5 || size > max + 0.5) problems.push(`${name} is ${size}px`);
  }
  expect(problems).toEqual([]);
});

test("replay restarts the thread", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const replay = page.locator("[data-replay]");
  expect(await replay.count(), "replay is not on the page").toBe(1);
  await replay.click();
  await expect(page.locator("[data-thread][data-playing='true']")).toBeVisible();
});

async function contrastRatio(locator: Locator): Promise<number> {
  return locator.evaluate((node) => {
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
    function ground(current: Element | null): readonly number[] {
      while (current) {
        const rgb = parse(getComputedStyle(current).backgroundColor);
        if (rgb) return rgb;
        current = current.parentElement;
      }
      return [10, 10, 10];
    }
    const ink = parse(getComputedStyle(node).color);
    if (!ink) return 0;
    return contrast(ink, ground(node));
  });
}
