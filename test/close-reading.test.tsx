import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { CloseReadingPage } from "../components/CloseReadingPage";
import type { Flagship, ShelfEntry } from "../lib/close-reading";
import { flagshipSlot, getFlagship } from "../lib/flagship";
import { PROOF_SHELF } from "../lib/proof-shelf";

const dummyFlagship: Flagship = {
  id: "dummy-flagship",
  title: "Dummy Flagship",
  passage: "A dummy passage sits behind the claim.",
  recorded: "Recorded fixture.",
  tryHref: "https://example.com/dummy-try",
  useCases: [
    { question: "Dummy question one?", source: "one.md" },
    { question: "Dummy question two?", source: "two.md" },
  ],
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
  const flagship = getFlagship();
  assert.equal(flagship.id, "citebot");
  assert.equal(flagship.tryHref, "https://citebot-chi.vercel.app/ask");
  const html = renderToStaticMarkup(<CloseReadingPage />);
  assert.match(html, /CiteBot/);
  assert.equal(html.includes("agents with checks"), false);
});

test("the default page shows a fourth shelf entry appended on the module", () => {
  const extra = {
    id: "dummy-extra",
    claim: "Dummy claim extra.",
    artifact: { href: "https://example.com/dummy-extra", label: "Dummy extra" },
    limit: "Dummy limit extra.",
  };
  PROOF_SHELF.push(extra);
  try {
    const html = renderToStaticMarkup(<CloseReadingPage />);
    assert.equal((html.match(/data-shelf-entry=/g) ?? []).length, 4);
    assert.ok(html.indexOf(PROOF_SHELF[0].id) < html.indexOf(PROOF_SHELF[1].id));
    assert.ok(html.includes("Dummy claim extra."));
  } finally {
    PROOF_SHELF.pop();
  }
});

test("the default page follows a swapped flagship module", () => {
  const previous = flagshipSlot.value;
  flagshipSlot.value = dummyFlagship;
  try {
    const html = renderToStaticMarkup(<CloseReadingPage />);
    assert.match(html, /Dummy Flagship/);
    assert.equal(html.includes("CiteBot"), false);
  } finally {
    flagshipSlot.value = previous;
  }
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
