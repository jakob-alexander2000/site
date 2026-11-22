import { expect, test } from "@playwright/test";

const sizes = {
  iphone: { width: 390, height: 844 },
  "ipad-mini": { width: 744, height: 1133 },
  desktop: { width: 1280, height: 800 },
} as const;

test("home: opening line, work index and the four studio layers", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1#opening")).toHaveText("I build AI tools that show their working.");
  await expect(page.locator("#work .index-row")).toHaveCount(3);
  for (const id of ["research", "design", "code", "checks"]) {
    await expect(page.locator(`#studio-${id}`)).toBeVisible();
  }
  await expect(page.locator("#studio-checks")).toContainText("Back to research");
  await expect(page.locator("video")).toHaveCount(0);
});

test("contact shows the one address and GitHub, no phone", async ({ page }) => {
  await page.goto("/");
  const contact = page.getByRole("list", { name: "Contact" });
  await expect(contact.locator('a[href="mailto:jdevacc2000@gmail.com"]')).toHaveCount(1);
  await expect(contact.locator('a[href="https://github.com/jakob-alexander2000"]')).toHaveCount(1);
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  const text = await page.locator("body").innerText();
  for (const address of text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? []) {
    expect(address).toBe("jdevacc2000@gmail.com");
  }
});

test("show construction draws the grid and type specs, and turns off again", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Show construction" });
  const overlay = page.locator(".overlay").first();
  await expect(overlay).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(overlay).toBeVisible();
  await expect(page.locator(".spec").first()).toBeVisible();
  await toggle.click();
  await expect(overlay).toBeHidden();
});

test("playground has its own page with Vierspur", async ({ page }) => {
  await page.goto("/playground");
  await expect(page.locator("h1")).toHaveText("Playground");
  await expect(page.locator("#vierspur h2")).toHaveText("Vierspur");
  await expect(page.getByRole("link", { name: "Playground" }).first()).toHaveAttribute("aria-current", "page");
});

for (const [name, viewport] of Object.entries(sizes)) {
  for (const path of ["/", "/playground"]) {
    test(`${path} at ${name}: no sideways scroll, links are big enough to tap`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      const small = await page.evaluate(() =>
        [...document.querySelectorAll("a, button")]
          .filter((node) => {
            const box = node.getBoundingClientRect();
            if (box.width === 0 || box.height === 0) return false;
            if (node.closest(".skip, .figcaption, .status, p")) return false;
            return box.height < 44;
          })
          .map((node) => (node.textContent ?? "").trim()),
      );
      expect(small).toEqual([]);
    });
  }
}
