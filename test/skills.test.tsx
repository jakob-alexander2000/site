import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { CloseReadingPage } from "../components/CloseReadingPage";

const skills = [
  {
    name: "Evaluation",
    line: "I score example answers against the handbook, and the run does not call a model.",
    href: "https://github.com/jakob-alexander2000/citebot-evals",
  },
  {
    name: "Verification",
    line: "I mark the condition a sample answer drops.",
    href: "https://retrieval-autopsy.vercel.app/",
  },
  {
    name: "Tool use",
    line: "I stop the handbook agent after three tool calls, then the draft is checked.",
    href: "https://citebot-chi.vercel.app/harness",
  },
  {
    name: "TypeScript",
    line: "I typecheck CiteBot in CI, and that same CI builds it.",
    href: "https://github.com/jakob-alexander2000/citebot/blob/main/.github/workflows/ci.yml",
  },
  {
    name: "Retrieval",
    line: "I answer from one handbook and keep the passage next to the answer.",
    href: "https://citebot-chi.vercel.app/ask",
  },
];

test("the shipped skills are the five public proofs", () => {
  const spec = readFileSync("docs/specs/skills-gallery.md", "utf8");
  const html = renderToStaticMarkup(<CloseReadingPage />);
  const problems: string[] = [];
  if (!html.includes('data-block="skills"')) problems.push("skills section is missing");
  for (const skill of skills) {
    if (!spec.includes(skill.line)) problems.push(`spec missing ${skill.line}`);
    if (!spec.includes(skill.href)) problems.push(`spec missing ${skill.href}`);
    if (!html.includes(skill.line)) problems.push(`page missing ${skill.line}`);
    if (!html.includes(`href="${skill.href}"`)) problems.push(`page missing ${skill.href}`);
  }
  assert.deepEqual(problems, []);
});
