import { expect, test } from "@playwright/test";

const skills = [
  {
    name: "Evaluation",
    line: "I score example answers against the handbook, and the run does not call a model.",
    steps: ["Example answers", "Score", "No model"],
    label: "Question set",
    href: "https://github.com/jakob-alexander2000/citebot-evals",
  },
  {
    name: "Verification",
    line: "I mark the condition a sample answer drops.",
    steps: ["Claim", "Passage", "Verdict"],
    label: "Checks",
    href: "https://retrieval-autopsy.vercel.app/",
  },
  {
    name: "Tool use",
    line: "I stop the handbook agent after three tool calls, then the draft is checked.",
    steps: ["Plan", "At most three tools", "Draft", "Check"],
    label: "Harness",
    href: "https://citebot-chi.vercel.app/harness",
  },
  {
    name: "TypeScript",
    line: "I typecheck the handbook app in CI, and that same CI builds it.",
    steps: ["Typecheck", "Build"],
    label: "CI",
    href: "https://github.com/jakob-alexander2000/citebot/blob/main/.github/workflows/ci.yml",
  },
  {
    name: "Retrieval",
    line: "I answer from one handbook and keep the passage next to the answer.",
    steps: ["Question", "Passage", "Cited answer"],
    label: "Ask",
    href: "https://citebot-chi.vercel.app/ask",
  },
] as const;

const omitted = ["MCP", "observability"];

test("skills gallery shows the five public skills", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const problems: string[] = [];
  const text = await page.locator("body").innerText();
  if ((await page.locator("[data-block='skills']").count()) !== 1) problems.push("skills section is missing");
  if ((await page.locator("[data-skill]").count()) !== 5) problems.push("expected 5 skills");
  for (const skill of skills) {
    if (!text.includes(skill.name)) problems.push(`missing name ${skill.name}`);
    if (!text.includes(skill.line)) problems.push(`missing line ${skill.line}`);
    const row = page.locator("[data-skill]", { hasText: skill.name });
    if ((await row.count()) !== 1) {
      problems.push(`missing row ${skill.name}`);
      continue;
    }
    const steps = (await row.locator("[data-diagram] li").allInnerTexts()).map((step) => step.replace(/\s+/g, " ").trim());
    if (steps.join("|") !== skill.steps.join("|")) problems.push(`${skill.name} diagram is ${steps.join("|")}`);
    const link = row.getByRole("link", { name: skill.label, exact: true });
    if ((await link.count()) !== 1) problems.push(`missing proof ${skill.name}`);
    else if ((await link.getAttribute("href")) !== skill.href) problems.push(`${skill.name} href is ${await link.getAttribute("href")}`);
  }
  for (const name of omitted) {
    if (new RegExp(`\\b${name}\\b`, "i").test(text)) problems.push(`page contains ${name}`);
  }
  const shelf = await page.locator("[data-block='shelf']").boundingBox();
  const gallery = await page.locator("[data-block='skills']").boundingBox();
  if (shelf && gallery && gallery.y < shelf.y) problems.push("gallery is above the shelf");
  expect(problems).toEqual([]);
});

const viewports = [
  { name: "iPhone 12 Pro", width: 390, height: 844 },
  { name: "small phone", width: 375, height: 667 },
  { name: "iPad mini landscape", width: 1133, height: 744 },
  { name: "iPad mini portrait", width: 744, height: 1133 },
];

test("skill diagrams fit the phone and the iPad", async ({ page }, info) => {
  const problems: string[] = [];
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    const fit = await page.evaluate(() => {
      const section = document.querySelector("[data-block='skills']");
      if (!section) return ["skills section is missing"];
      const hits: string[] = [];
      const width = document.documentElement.clientWidth;
      if (document.documentElement.scrollWidth > width + 1) hits.push("page overflows");
      for (const node of section.querySelectorAll("[data-skill], [data-diagram], [data-diagram] li, a")) {
        const box = node.getBoundingClientRect();
        if (box.width < 2 || box.height < 2) hits.push(`empty ${(node.textContent ?? "").trim().slice(0, 32)}`);
        if (box.right > width + 1 || box.left < -1) hits.push(`offscreen ${(node.textContent ?? "").trim().slice(0, 32)}`);
      }
      return hits;
    });
    for (const hit of fit) problems.push(`${info.project.name} ${viewport.name}: ${hit}`);
  }
  expect(problems).toEqual([]);
});

test("reduced motion keeps the skill diagrams", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const problems: string[] = [];
  const reduced = await page.locator("html").getAttribute("data-reduced");
  if (reduced !== "flat") problems.push("reduced motion is not flat");
  const steps = await page.locator("[data-diagram] li").count();
  if (steps < 5) problems.push(`diagram steps ${steps}`);
  const moving = await page.evaluate(() =>
    [...document.querySelectorAll("[data-block='skills'] *")].filter((node) => {
      const name = getComputedStyle(node).animationName;
      return name !== "none" && name !== "";
    }).length,
  );
  if (moving !== 0) problems.push(`${moving} skill animations`);
  expect(problems).toEqual([]);
});
