import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { CloseReadingPage } from "../components/CloseReadingPage";
import { SKILLS, type Skill } from "../lib/skills";

function row(html: string, id: string): string {
  const start = html.indexOf(`data-skill="${id}"`);
  assert.ok(start >= 0, id);
  const next = html.indexOf("data-skill=", start + 12);
  return html.slice(start, next === -1 ? html.length : next);
}

test("the shipped skills are the five public proofs", () => {
  const spec = readFileSync("docs/specs/skills-gallery.md", "utf8");
  const page = readFileSync("components/CloseReadingPage.tsx", "utf8");
  const html = renderToStaticMarkup(<CloseReadingPage />);
  const problems: string[] = [];
  if (!html.includes('data-block="skills"')) problems.push("skills section is missing");
  if (SKILLS.length !== 5) problems.push(`module has ${SKILLS.length}`);
  if (page.includes("use client")) problems.push("page is a client component");
  if (page.includes("citebot") || page.includes("retrieval-autopsy")) problems.push("component hard-codes a proof");
  for (const skill of SKILLS) {
    if (!spec.includes(skill.line)) problems.push(`spec missing line ${skill.id}`);
    if (!spec.includes(skill.proof.href)) problems.push(`spec missing href ${skill.id}`);
    const rendered = row(html, skill.id);
    if (!rendered.includes(skill.name)) problems.push(`row missing name ${skill.id}`);
    if (!rendered.includes(skill.line)) problems.push(`row missing line ${skill.id}`);
    if (!rendered.includes(`href="${skill.proof.href}"`)) problems.push(`row missing href ${skill.id}`);
    if (!rendered.includes(skill.proof.label)) problems.push(`row missing label ${skill.id}`);
    for (const step of skill.steps) {
      if (!rendered.includes(step)) problems.push(`row missing step ${skill.id} ${step}`);
    }
  }
  assert.deepEqual(problems, []);
});

test("five dummy skills render from a test definition", () => {
  const dummy: Skill[] = Array.from({ length: 5 }, (_, index) => ({
    id: `dummy-skill-${index}`,
    name: `Dummy skill ${index}`,
    line: `I built dummy skill ${index} for the test.`,
    steps: [`Step ${index}`, "Next"],
    proof: { href: `https://example.com/dummy-skill-${index}`, label: "Open" },
  }));
  const html = renderToStaticMarkup(<CloseReadingPage skills={dummy} />);
  const problems: string[] = [];
  if ((html.match(/data-skill="/g) ?? []).length !== 5) problems.push("expected 5 dummy rows");
  if (html.includes('data-skill="evaluation"')) problems.push("shipped id still rendered");
  if (html.includes(SKILLS[0].line)) problems.push("shipped line still rendered");
  if (!html.includes("https://example.com/dummy-skill-4")) problems.push("last dummy proof is missing");
  if (!html.includes("I built dummy skill 0 for the test.")) problems.push("first dummy line is missing");
  assert.deepEqual(problems, []);
});
