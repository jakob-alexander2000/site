import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Plates } from "../components/Plates";
import { CITEBOT_PLATE, DROPPED, STYLE_DISTANCE } from "../lib/diagrams";
import { SKILLS } from "../lib/skills";
import { findHits } from "../scripts/scan-copy";

const html = renderToStaticMarkup(<Plates />);

test("plate copy is real and the scan is clean", () => {
  assert.equal(html.includes(CITEBOT_PLATE.headline), true);
  assert.equal(html.includes(DROPPED.headline), true);
  assert.equal(html.includes(STYLE_DISTANCE.headline), true);
  assert.equal(html.includes("I check each sentence against the passage it came from and mark what fell out."), true);
  assert.equal(html.includes("[Draft"), false);
  assert.equal(html.includes("[Needs"), false);
  assert.equal(html.includes("[Optional"), false);
  assert.equal(html.includes("MCP"), false);
  assert.equal(html.includes("/ask"), false);
  assert.equal(html.includes("Voice check"), false);
  assert.deepEqual(findHits(html), []);
  assert.equal(SKILLS.some((skill) => skill.name === "MCP"), false);
  assert.equal(SKILLS.length, 5);
});

test("every rendered proof link returns 200", { timeout: 30000 }, async () => {
  const hrefs = new Set<string>([
    CITEBOT_PLATE.source,
    CITEBOT_PLATE.harness,
    DROPPED.demo,
    DROPPED.source,
    STYLE_DISTANCE.live,
    STYLE_DISTANCE.source,
    STYLE_DISTANCE.readme,
    "https://github.com/jakob-alexander2000/site",
    ...SKILLS.map((skill) => skill.proof.href),
  ]);
  for (const href of hrefs) {
    assert.equal(html.includes(href) || href === STYLE_DISTANCE.readme, true, href);
    const response = await fetch(href, { redirect: "follow" });
    assert.equal(response.status, 200, href);
  }
});

test("style figures are in the public readme", { timeout: 30000 }, async () => {
  const response = await fetch(STYLE_DISTANCE.readme);
  assert.equal(response.status, 200);
  const readme = await response.text();
  assert.equal(readme.includes(`${STYLE_DISTANCE.drifted}`), true);
  assert.equal(readme.includes(`${STYLE_DISTANCE.heldOut}`), true);
  assert.equal(readme.includes("Synthetic"), true);
});

test("the autopsy verdict sheet is the scorer's own output for the public sample", { timeout: 30000 }, async () => {
  const [scorerResponse, sampleResponse] = await Promise.all([fetch(DROPPED.scorer), fetch(DROPPED.sample)]);
  assert.equal(scorerResponse.status, 200, DROPPED.scorer);
  assert.equal(sampleResponse.status, 200, DROPPED.sample);
  const scorer = await scorerResponse.text();
  const sample = (await sampleResponse.text())
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as { passages: string[]; answer: string; expect: Record<string, string> })
    .find((row) => row.passages.includes(DROPPED.passage) && row.answer === DROPPED.answer);
  assert.ok(sample, "the passage and the answer are a public sample");
  for (const check of DROPPED.checks) {
    assert.equal(sample.expect[check.name.toLowerCase()], check.verdict, check.name);
    if (check.verdict === "pass") assert.equal(scorer.includes(`"${check.detail}"`), true, `${check.name}: ${check.detail}`);
  }
  const block = scorer.slice(scorer.indexOf("QUALIFIER_PATTERNS"), scorer.indexOf("OMISSION_PATTERNS"));
  const patterns = [...block.matchAll(/^\s*\/(.+)\/([a-z]*),\s*$/gm)].map((match) => new RegExp(match[1] ?? "", match[2] ?? ""));
  assert.ok(patterns.length > 3, "qualifier patterns parsed");
  const dropped = patterns
    .flatMap((pattern) => [...DROPPED.passage.matchAll(pattern)].map((match) => ({ at: match.index ?? 0, text: match[0].trim() })))
    .filter((span) => !DROPPED.answer.toLowerCase().includes(span.text.toLowerCase()))
    .sort((a, b) => a.at - b.at)
    .map((span) => `“${span.text}”`);
  const qualifier = DROPPED.checks.find((check) => check.name === "Qualifier");
  assert.equal(qualifier?.detail, `The answer drops ${dropped.join(" and ")}.`);
});

test("a caption only names what its drawing shows", () => {
  for (const figure of html.split("<figure>").slice(1).map((part) => part.slice(0, part.indexOf("</figure>")))) {
    const caption = /<figcaption>(.*?)<\/figcaption>/.exec(figure)?.[1] ?? "";
    if (/dashed/i.test(caption)) assert.match(figure, /stroke-dasharray/, caption);
    if (/struck|strike/i.test(caption)) assert.match(figure, /line-through|<s>|<del>/, caption);
  }
});
