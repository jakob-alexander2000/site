import { expect, test } from "@playwright/test";

// The aligned word read is a desktop layout. On a phone the Autopsy plate must
// wrap inside the screen, with spaces between the answer's words.
for (const width of [375, 390]) {
  test(`Autopsy stays inside a ${width}px phone`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    await page.evaluate(() => document.getElementById("autopsy")?.scrollIntoView());
    const report = await page.evaluate(() => {
      const plate = document.getElementById("autopsy");
      if (!plate) return { missing: true, over: [] as string[], answer: "" };
      const over: string[] = [];
      for (const node of plate.querySelectorAll("*")) {
        const box = node.getBoundingClientRect();
        if (box.width > 0 && box.right > window.innerWidth + 1) over.push(`${node.tagName}.${String(node.getAttribute("class") ?? "")} ${Math.round(box.right)}`);
      }
      const answer = plate.querySelector(".word-read .answer-line");
      return { missing: false, over: over.slice(0, 5), answer: answer instanceof HTMLElement ? answer.innerText : "" };
    });
    expect(report.missing).toBe(false);
    expect(report.over).toEqual([]);
    expect(report.answer).toContain("In practice, employees receive");
  });
}
