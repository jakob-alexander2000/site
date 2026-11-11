import { contact as siteContact, contactEntries, type Contact } from "@/lib/contact";

export function ContactBlock({ value = siteContact }: { value?: Contact }) {
  const entries = contactEntries(value);
  return (
    <ul className="contact" aria-label="Contact">
      {entries.map((entry) => (
        <li key={entry.kind}>
          {entry.href ? (
            <a href={entry.href}>{entry.label}</a>
          ) : (
            <span>
              {entry.label}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
