import { expect, test } from "@playwright/test";

test("the contact row copies the address and says so", async ({ page, context, browserName }) => {
  if (browserName === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const button = page.locator(".copy-address");
  const box = await button.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  const underline = await page.locator(".pen-line").evaluate((node) => getComputedStyle(node).boxShadow);
  expect(underline).not.toBe("none");
  await button.click();
  await expect(page.locator(".copy-status")).toHaveText("Copied");
});

test("the contact row says when the clipboard is missing", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator(".copy-address").click();
  await expect(page.locator(".copy-status")).toHaveText("Copy is unavailable");
});
