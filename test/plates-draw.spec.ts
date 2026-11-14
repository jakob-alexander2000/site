import { expect, test } from "@playwright/test";
import { CITEBOT_PLATE, DROPPED, STYLE_DISTANCE } from "../lib/diagrams";

test("the citebot plate is a six-step rail with source and harness only", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
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
  await page.goto("/");
  await expect(page.locator("#citebot .rail-sheet")).toHaveCount(6);
  for (const name of ["Question", "Retrieve", "Draft", "Split", "Check", "Verdict"]) {
    await expect(page.locator("#citebot .rail-sheet .kicker", { hasText: name })).toHaveCount(1);
  }
  await expect(page.locator("#citebot")).toContainText("How many paid vacation days do full-time employees get?");
  await expect(page.locator("#citebot .rail-fail")).toHaveCount(2);
  const dashed = await page.locator("#citebot .rail-fail").first().evaluate((node) => getComputedStyle(node).borderTopStyle);
  expect(dashed).toBe("dashed");
  const direction = await page.locator("#citebot .rail-steps").evaluate((node) => getComputedStyle(node).flexDirection);
  expect(direction).toBe("column");
  await expect(page.locator('#citebot a[href*="/ask"]')).toHaveCount(0);
  await expect(page.locator("#citebot").getByRole("link", { name: "Source" })).toHaveAttribute("href", CITEBOT_PLATE.source);
  await expect(page.locator("#citebot").getByRole("link", { name: "Harness" })).toHaveAttribute("href", CITEBOT_PLATE.harness);
  expect(three).toEqual([]);
});

test("the autopsy plate strikes only the dropped spans and names four checks", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("#autopsy")).toContainText(DROPPED.passage);
  await expect(page.locator("#autopsy")).toContainText(DROPPED.answer);
  for (const check of DROPPED.checks) {
    await expect(page.locator("#autopsy")).toContainText(check.name);
    await expect(page.locator("#autopsy")).toContainText(check.verdict === "fail" ? "FAIL" : "PASS");
  }
  const struck = [
    ...new Set(
      (await page.locator("#autopsy .offcut:visible").allTextContents()).map((text) => text.replace(/\s+/g, " ").trim()),
    ),
  ].sort();
  expect(struck).toEqual([...DROPPED.spans].map((span) => span.replace(/\s+/g, " ").trim()).sort());
  await expect(page.locator("#autopsy .hair:visible")).toHaveCount(0);
  const answer = await page.locator("#autopsy .answer-line:visible").first().evaluate((node) => getComputedStyle(node).color);
  const struckColor = await page.locator("#autopsy .offcut").first().evaluate((node) => getComputedStyle(node).color);
  expect(answer).toBe("rgb(17, 17, 17)");
  expect(struckColor).toBe("rgb(198, 48, 42)");
  const decoration = await page.locator("#autopsy .offcut").first().evaluate((node) => getComputedStyle(node).textDecorationLine);
  expect(decoration).toContain("line-through");
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator("#autopsy svg.hair:visible")).toHaveCount(9);
});

test("phone verdict names sit clear of the row above", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const gap = await page.locator("#autopsy .verdict-sheet li").nth(1).evaluate((node) => Number.parseFloat(getComputedStyle(node).marginTop));
  expect(gap).toBeGreaterThanOrEqual(12);
});

test("the style plate prints the synthetic demo once, with fins", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const plate = page.locator("#style");
  await expect(plate).toContainText("Synthetic demo");
  await expect(plate).toContainText(STYLE_DISTANCE.drifted);
  await expect(plate).toContainText(STYLE_DISTANCE.heldOut);
  await expect(plate.locator(`.figure-prose:visible`, { hasText: STYLE_DISTANCE.drifted })).toHaveCount(1);
  for (const fin of STYLE_DISTANCE.fins) await expect(plate.locator(".fins:visible")).toContainText(fin.word);
  await expect(plate.locator(".voice-sheet:visible, .draft-sheet:visible")).toHaveCount(2);
});

test("the style fins are drawn in true proportion, largest first", async ({ page }) => {
  for (const size of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(size);
    await page.goto("/");
    const bars = await page.locator("#style .fins:visible .fin-bar").evaluateAll((nodes) =>
      nodes.map((node) => ({ width: node.getBoundingClientRect().width, z: Number((node as HTMLElement).dataset.z) })),
    );
    expect(bars.map((bar) => bar.z)).toEqual(STYLE_DISTANCE.fins.map((fin) => fin.z));
    const first = bars[0];
    if (!first) throw new Error("no fins");
    for (const bar of bars) expect(Math.abs(bar.width / first.width - bar.z / first.z), JSON.stringify(bars)).toBeLessThan(0.02);
  }
});

test("the style reading only ever shows a measured figure through the scroll", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator(".schnitt-stage")).toHaveAttribute("data-gl", "ready");
  const readings = new Set<string>();
  const top = await page.locator("#style").evaluate((node) => node.getBoundingClientRect().top + window.scrollY);
  for (let y = top - 900; y <= top + 900; y += 60) {
    await page.evaluate((value) => window.scrollTo(0, value), y);
    await page.waitForTimeout(60);
    readings.add((await page.locator("#style .depth-read").first().textContent())?.trim() ?? "");
    await expect(page.locator("#style .figure-prose:visible", { hasText: STYLE_DISTANCE.drifted })).toHaveCount(1);
  }
  expect([...readings].sort()).toEqual([STYLE_DISTANCE.heldOut, STYLE_DISTANCE.drifted].sort());
});
