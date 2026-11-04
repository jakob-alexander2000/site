export type Contact = {
  phone: string | null;
  email: string | null;
  github: string;
};

export type ContactEntry = {
  kind: "phone" | "email" | "github";
  label: "Phone" | "Email" | "GitHub";
  text: string;
  href: string | null;
};

/** Phone stays null: the row is omitted. Email and GitHub are the rendered contact. */
export const contact: Contact = {
  phone: null,
  email: "jdevacc2000@gmail.com",
  github: "https://github.com/jakob-alexander2000",
};

export function contactEntries(value: Contact): ContactEntry[] {
  const entries: ContactEntry[] = [];
  if (value.phone) {
    entries.push({
      kind: "phone",
      label: "Phone",
      text: value.phone,
      href: `tel:${value.phone}`,
    });
  }
  if (value.email) {
    entries.push({
      kind: "email",
      label: "Email",
      text: value.email,
      href: `mailto:${value.email}`,
    });
  } else {
    entries.push({ kind: "email", label: "Email", text: "to follow", href: null });
  }
  entries.push({
    kind: "github",
    label: "GitHub",
    text: value.github,
    href: value.github,
  });
  return entries;
}
