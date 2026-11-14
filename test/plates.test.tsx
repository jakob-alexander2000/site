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
