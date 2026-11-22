import { contact as siteContact, contactEntries, type Contact } from "@/lib/contact";

/** The one address and GitHub, as buttons. Phone stays null in lib/contact.ts, so no phone row renders. */
export function ContactBlock({ value = siteContact }: { value?: Contact }) {
  const entries = contactEntries(value);
  return (
    <ul className="actions" aria-label="Contact" style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {entries.map((entry, index) => (
        <li key={entry.kind}>
          {entry.href ? (
            <a href={entry.href} className={`btn${index === 0 ? " btn-primary" : ""}`} style={{ fontWeight: 500 }}>
              {entry.kind === "github" ? entry.label : entry.text}
            </a>
          ) : (
            <span className="btn">{entry.text}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
