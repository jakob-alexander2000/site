import { expect, test } from "@playwright/test";

test("a skill strip opens on hover, focus, and tap, with a hairline stroke", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const strip = page.locator("#skills .skill-strip").first();
  const step = strip.locator(".strip-steps");
  await strip.evaluate((node) => node.scrollIntoView({ block: "center", inline: "start" }));
  await expect(step).toBeHidden();
  const stroke = await strip.locator(".strip-sheet").first().evaluate((node) => Number.parseFloat(getComputedStyle(node).borderTopWidth));
  expect(stroke).toBeLessThanOrEqual(1.5);
  const summary = strip.locator("summary");
  const focused = await summary.evaluate((node) => {
    if (node instanceof HTMLElement) node.focus();
    const root = node.closest(".skill-strip");
    const steps = root?.querySelector(".strip-steps");
    return {
      active: document.activeElement?.tagName ?? "",
      within: root?.matches(":focus-within") ?? false,
      display: steps ? getComputedStyle(steps).display : "",
    };
  });
  expect(focused.display, JSON.stringify(focused)).toBe("grid");
  await page.keyboard.press("Enter");
  await expect(strip).toHaveAttribute("open", "");
  await page.keyboard.press("Enter");
  await expect(strip).not.toHaveAttribute("open", "");
  await summary.blur();
  await expect(step).toBeHidden();
  await summary.click({ position: { x: 8, y: 8 } });
  await expect(strip).toHaveAttribute("open", "");
  await expect(step).toBeVisible();
  await summary.hover({ position: { x: 8, y: 8 } });
  await expect(step).toBeVisible();
});
