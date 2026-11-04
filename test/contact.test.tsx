import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ContactBlock } from "../components/ContactBlock";
import { contact, contactEntries } from "../lib/contact";
import { nullContact, setContact } from "./fixtures/contact";

test("production contact shows email and GitHub only", () => {
  assert.equal(contact.phone, null);
  assert.equal(contact.email, "jdevacc2000@gmail.com");
  assert.equal(contact.github, "https://github.com/jakob-alexander2000");
  const html = renderToStaticMarkup(<ContactBlock />);
  assert.equal(html.includes("Phone"), false);
  assert.equal(html.includes("to follow"), false);
  assert.equal(html.includes("tel:"), false);
  assert.match(html, /href="mailto:jdevacc2000@gmail.com"/);
  assert.match(html, /href="https:\/\/github.com\/jakob-alexander2000"/);
});

test("null contact omits phone and does not link an empty email", () => {
  const entries = contactEntries(nullContact);
  assert.equal(
    entries.some((entry) => entry.kind === "phone"),
    false,
  );
  const email = entries.find((entry) => entry.kind === "email");
  assert.equal(email?.text, "to follow");
  assert.equal(email?.href, null);
  const html = renderToStaticMarkup(<ContactBlock value={nullContact} />);
  assert.equal(html.includes("Phone"), false);
  assert.equal(html.includes("mailto:"), false);
  assert.equal(html.includes("tel:"), false);
  assert.match(html, /Email: to follow/);
});

test("a set phone and email become links", () => {
  const entries = contactEntries(setContact);
  assert.equal(entries.find((entry) => entry.kind === "phone")?.href, `tel:${setContact.phone}`);
  assert.equal(entries.find((entry) => entry.kind === "email")?.href, `mailto:${setContact.email}`);
  const html = renderToStaticMarkup(<ContactBlock value={setContact} />);
  assert.match(html, new RegExp(`href="tel:${setContact.phone}"`));
  assert.match(html, new RegExp(`href="mailto:${setContact.email}"`));
  assert.match(html, /Phone:/);
  assert.equal(html.includes("to follow"), false);
});
