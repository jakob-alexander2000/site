import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { CloseReadingPage } from "../components/CloseReadingPage";
import type { Flagship, ShelfEntry } from "../lib/close-reading";
import { flagship } from "../lib/flagship";
import { PROOF_SHELF } from "../lib/proof-shelf";

const dummyFlagship: Flagship = {
  id: "dummy-flagship",
  title: "Dummy Flagship",
  passage: "A dummy passage sits behind the claim.",
  sentences: [
    {
      id: "one",
      text: "Dummy sentence one.",
      verdict: "pass",
      span: "dummy passage",
      evidence: "dummy passage",
    },
    {
      id: "two",
      text: "Dummy sentence two.",
      verdict: "fail",
      span: "dummy passage",
      evidence: "The dummy passage says otherwise.",
    },
    {
      id: "three",
      text: "Dummy sentence three.",
      verdict: "unsupported",
      span: "",
      evidence: "No dummy passage states this.",
    },
  ],
};

const dummyShelf: ShelfEntry[] = [1, 2, 3, 4, 5].map((n) => ({
  id: `dummy-${n}`,
  claim: `Dummy claim ${n}.`,
  artifact: { href: `https://example.com/dummy-${n}`, label: `Dummy ${n}` },
  limit: `Dummy limit ${n}.`,
}));

test("the production flagship is the CiteBot definition", () => {
  assert.ok(flagship, "production flagship definition is not filled");
  assert.equal(flagship.id, "citebot");
  const html = renderToStaticMarkup(<CloseReadingPage />);
  assert.match(html, /CiteBot/);
});

test("a second dummy flagship renders in place of CiteBot", () => {
  const html = renderToStaticMarkup(<CloseReadingPage flagship={dummyFlagship} shelf={[]} />);
  const problems: string[] = [];
  if (!html.includes("Dummy Flagship")) problems.push("dummy title is not rendered");
  if (html.includes("CiteBot")) problems.push("CiteBot is still rendered for the dummy definition");
  if (!html.includes("Dummy sentence one.")) problems.push("dummy pass sentence is not rendered");
  if (!html.includes('data-thread-end="open"')) problems.push("unsupported thread does not end open");
  assert.deepEqual(problems, []);
});

test("the shipped shelf is the three public entries", () => {
  assert.deepEqual(
    PROOF_SHELF.map((entry) => entry.id),
    ["citebot-evals", "retrieval-autopsy", "citebot"],
  );
});

test("five dummy shelf entries render from a test definition", () => {
  assert.equal(PROOF_SHELF.length === 5, false);
  for (const entry of dummyShelf) {
    assert.equal(
      PROOF_SHELF.some((shipped) => shipped.id === entry.id),
      false,
      entry.id,
    );
  }
  const html = renderToStaticMarkup(<CloseReadingPage flagship={dummyFlagship} shelf={dummyShelf} />);
  const problems: string[] = [];
  const rendered = html.match(/data-shelf-entry=/g) ?? [];
  if (rendered.length !== 5) problems.push(`rendered ${rendered.length} shelf entries`);
  for (const entry of dummyShelf) {
    if (!html.includes(entry.claim)) problems.push(`missing ${entry.claim}`);
    if (!html.includes(entry.limit)) problems.push(`missing ${entry.limit}`);
    if (!html.includes(`href="${entry.artifact.href}"`)) problems.push(`missing ${entry.artifact.href}`);
  }
  assert.deepEqual(problems, []);
});
