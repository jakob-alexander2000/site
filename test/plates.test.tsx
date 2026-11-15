import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Plates } from "../components/Plates";
import { contact } from "../lib/contact";
import { CITEBOT_PLATE, DROPPED, STYLE_DISTANCE } from "../lib/diagrams";
import { BACKGROUND } from "../lib/looks";
import { FOOTER_SHEETS } from "../lib/plates";
import { SKILLS } from "../lib/skills";
import { loadSchnittRun } from "../lib/schnitt-run";
import { findHits } from "../scripts/scan-copy";

const html = renderToStaticMarkup(<Plates run={loadSchnittRun()} />);

test("plate copy is real and the scan is clean", () => {
  assert.equal(html.includes("The parts in detail"), true);
  assert.equal(html.includes(CITEBOT_PLATE.headline), false);
  assert.equal(html.includes(DROPPED.headline), true);
  assert.equal(html.includes(STYLE_DISTANCE.headline), true);
  assert.equal(html.includes("I check each sentence against the passage it came from and mark what fell out."), true);
  assert.equal(html.includes("[Draft"), false);
  assert.equal(html.includes("[Needs"), false);
  assert.equal(html.includes("[Optional"), false);
  assert.equal(html.includes("MCP"), false);
  assert.equal(html.includes("/ask"), false);
  assert.equal(html.includes("Voice check"), false);
  assert.equal(html.includes("Recorded fixture"), false);
  assert.equal(html.includes(loadSchnittRun().recordedLabel), true);
  assert.deepEqual(findHits(html), []);
  assert.equal(SKILLS.some((skill) => skill.name === "MCP"), false);
  assert.equal(SKILLS.length, 5);
  assert.equal(html.includes(BACKGROUND), true);
  assert.equal(typeof contact.email, "string");
  assert.equal((html.match(/mailto:/g) ?? []).length, 1);
  assert.equal(contact.email ? html.includes(`mailto:${contact.email}`) : false, true);
  assert.equal(contact.phone, null);
  assert.equal(html.includes('href="#footer"'), false);
  assert.deepEqual(
    FOOTER_SHEETS.map((sheet) => sheet.index),
    ["00", "01", "02", "03", "04", "05", "06"],
  );
  for (const sheet of FOOTER_SHEETS) assert.equal(html.includes(`aria-label="${sheet.label}"`), true);
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

/** Burrows' Delta as the style-distance README defines it (English, steps 1 to 7). */
function tokens(text: string): string[] {
  const value = text
    .replace(/[\u2019\u2018\u02bc\u2032]/g, "'")
    .replace(/[\u201c\u201d\u201e\u00ab\u00bb"\u2014\u2013\u2015\u00a0\u202f]/g, " ")
    .replace(/_/g, "")
    .toLowerCase();
  return value.match(/[A-Za-zÀ-ÖØ-öø-ÿ]+(?:'[A-Za-zÀ-ÖØ-öø-ÿ]+)*/g) ?? [];
}

function relative(doc: string[]) {
  const rel = new Map<string, number>();
  for (const word of doc) rel.set(word, (rel.get(word) ?? 0) + 1 / doc.length);
  return rel;
}

function delta(references: string[], drafts: string[], n = 150) {
  const refs = references.map(tokens);
  const counts = new Map<string, number>();
  const spread = new Map<string, number>();
  for (const doc of refs) {
    for (const word of doc) counts.set(word, (counts.get(word) ?? 0) + 1);
    for (const word of new Set(doc)) spread.set(word, (spread.get(word) ?? 0) + 1);
  }
  const words = [...counts.keys()]
    .filter((word) => (spread.get(word) ?? 0) >= 2)
    .sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0) || (a < b ? -1 : 1))
    .slice(0, n);
  const refRel = refs.map(relative);
  const draftRel = drafts.map((text) => relative(tokens(text)));
  const rows: { word: string; z: number }[] = [];
  for (const word of words) {
    const values = refRel.map((rel) => rel.get(word) ?? 0);
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const sd = Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1));
    if (!sd) continue;
    const draft = draftRel.reduce((sum, rel) => sum + (rel.get(word) ?? 0), 0) / draftRel.length;
    rows.push({ word, z: Math.abs((draft - mean) / sd) });
  }
  rows.sort((a, b) => b.z - a.z);
  return { delta: rows.reduce((sum, row) => sum + row.z, 0) / rows.length, rows };
}

test("style figures and fins are recomputed from the pinned public sample", { timeout: 30000 }, async () => {
  assert.match(STYLE_DISTANCE.sample, /\/style-distance\/[0-9a-f]{40}\//);
  const response = await fetch(STYLE_DISTANCE.sample);
  assert.equal(response.status, 200);
  const sample = (await response.json()) as { synthetic: boolean; references: { text: string }[]; drafts: { text: string }[]; heldOut: { text: string } };
  assert.equal(sample.synthetic, true);
  const references = sample.references.map((row) => row.text);
  const drifted = delta(references, sample.drafts.map((row) => row.text));
  const held = delta(references, [sample.heldOut.text]);
  assert.equal(drifted.delta.toFixed(2), STYLE_DISTANCE.drifted);
  assert.equal(held.delta.toFixed(2), STYLE_DISTANCE.heldOut);
  assert.deepEqual(
    STYLE_DISTANCE.fins.map((fin) => fin.word),
    drifted.rows.slice(0, STYLE_DISTANCE.fins.length).map((row) => row.word),
  );
  STYLE_DISTANCE.fins.forEach((fin, index) => assert.ok(Math.abs(fin.z - (drifted.rows[index]?.z ?? 0)) < 0.01, fin.word));
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
