/** Remove Markdown heading markers from a displayed excerpt. Scoring still uses the original text. */
export function plainExcerpt(text: string): string {
  return text
    .replace(/^[ \t]*#{1,6}[ \t]+[^\n]*\n+/, "")
    .replace(/#{1,6}[ \t]+/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}
