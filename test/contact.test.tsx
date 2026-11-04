import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ContactBlock } from "../components/ContactBlock";
import { contact, contactEntries } from "../lib/contact";
import { nullContact, setContact } from "./fixtures/contact";

test("production contact shows the one address and GitHub", () => {
  assert.equal(contact.phone, null);
  assert.equal(contact.email, "jdevacc2000@gmail.com");
  assert.equal(contact.github, "https://github.com/jakob-alexander2000");
  const html = renderToStaticMarkup(<ContactBlock />);
  for (const word of ["Phone", "to follow", "tel:"]) assert.equal(html.includes(word), false, word);
  assert.match(html, /href="mailto:jdevacc2000@gmail\.com"/);
  const found = html.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? [];
  assert.ok(found.length > 0);
  for (const address of found) assert.equal(address, "jdevacc2000@gmail.com");
  assert.match(html, /href="https:\/\/github.com\/jakob-alexander2000"/);
});

test("null contact renders no phone and no email row", () => {
  const entries = contactEntries(nullContact);
  assert.deepEqual(
    entries.map((entry) => entry.kind),
    ["github"],
  );
  const html = renderToStaticMarkup(<ContactBlock value={nullContact} />);
  for (const word of ["Phone", "Email", "mailto:", "tel:"]) assert.equal(html.includes(word), false, word);
});

test("a set phone and email become links", () => {
  const entries = contactEntries(setContact);
  assert.equal(entries.find((entry) => entry.kind === "phone")?.href, `tel:${setContact.phone}`);
  assert.equal(entries.find((entry) => entry.kind === "email")?.href, `mailto:${setContact.email}`);
  const html = renderToStaticMarkup(<ContactBlock value={setContact} />);
  assert.match(html, new RegExp(`href="tel:${setContact.phone}"`));
  assert.match(html, new RegExp(`href="mailto:${setContact.email}"`));
});
