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

/** Phone and email stay null: no row is rendered for them. GitHub is the only public contact. */
export const contact: Contact = {
  phone: null,
  email: null,
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
  }
  entries.push({
    kind: "github",
    label: "GitHub",
    text: value.github,
    href: value.github,
  });
  return entries;
}
