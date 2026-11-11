import { expect, test } from "@playwright/test";

const skills = [
  {
    name: "Evaluation",
    line: "I run the handbook questions through the agent loop, and a failed question stops the build.",
    steps: ["Questions", "Stand-in", "Check"],
    label: "Evals",
    href: "https://citebot-chi.vercel.app/evals",
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
    steps: ["Lint", "Tests", "Eval", "Build"],
    label: "Runs",
    href: "https://github.com/jakob-alexander2000/citebot/actions/workflows/ci.yml",
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

test("skills gallery shows the public skills", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const problems: string[] = [];
  const text = await page.locator("body").innerText();
  const gallery = page.locator("[data-block='skills']");
  if ((await gallery.count()) !== 1) problems.push("skills section is missing");
  if ((await gallery.getByRole("heading", { level: 2 }).count()) !== 1) problems.push("section heading is missing");
  if ((await gallery.locator("h3").count()) !== skills.length) problems.push("skill names are not h3");
  if ((await page.locator("[data-skill]").count()) !== skills.length) problems.push(`expected ${skills.length} skills`);
  const shelfHrefs = await page.locator("[data-artifact]").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("href")),
  );
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
    const marks = await row.locator("[data-diagram] svg[aria-hidden='true']").count();
    if (marks !== skill.steps.length - 1) problems.push(`${skill.name} direction marks ${marks}`);
    const boxy = await row.locator("[data-diagram] li").evaluateAll((nodes) =>
      nodes.filter((node) => {
        const style = getComputedStyle(node);
        return Number.parseFloat(style.minHeight) >= 44 || Number.parseFloat(style.borderTopWidth) > 0;
      }).length,
    );
    if (boxy !== 0) problems.push(`${skill.name} steps look like buttons`);
    const link = row.getByRole("link", { name: skill.label, exact: true });
    if ((await link.count()) !== 1) problems.push(`missing proof ${skill.name}`);
    else if ((await link.getAttribute("href")) !== skill.href) problems.push(`${skill.name} href is ${await link.getAttribute("href")}`);
    else if (shelfHrefs.includes(skill.href)) problems.push(`${skill.name} repeats a shelf link`);
  }
  const galleryText = await gallery.innerText();
  if (galleryText.includes("does not call a model")) problems.push("gallery repeats the shelf limit");
  for (const name of omitted) {
    if (new RegExp(`\\b${name}\\b`, "i").test(text)) problems.push(`page contains ${name}`);
  }
  const shelf = await page.locator("[data-block='shelf']").boundingBox();
  const galleryBox = await gallery.boundingBox();
  if (shelf && galleryBox && galleryBox.y < shelf.y) problems.push("gallery is above the shelf");
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
  if (steps < 1) problems.push(`diagram steps ${steps}`);
  const motion = await page.evaluate(() => {
    const section = document.querySelector("[data-block='skills']");
    if (!section) return { transitions: -1, animations: -1, running: -1 };
    const nodes = [section, ...section.querySelectorAll("*")];
    let transitions = 0;
    let animations = 0;
    for (const node of nodes) {
      const style = getComputedStyle(node);
      const duration = style.transitionDuration.split(",").some((part) => Number.parseFloat(part) > 0);
      if (duration) transitions += 1;
      const name = style.animationName;
      if (name && name !== "none") animations += 1;
    }
    const running = section.getAnimations({ subtree: true }).length;
    return { transitions, animations, running };
  });
  if (motion.transitions !== 0) problems.push(`${motion.transitions} skill transitions`);
  if (motion.animations !== 0) problems.push(`${motion.animations} skill animations`);
  if (motion.running !== 0) problems.push(`${motion.running} running skill animations`);
  expect(problems).toEqual([]);
});
