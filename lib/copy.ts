/** Visitor-facing spelling. The source notes stay unchanged for the checker. */
export function forReaders(value: string): string {
  return value
    .replaceAll(
      "CLI primary; optional localhost UI (`desk ui`)",
      "a command line, and a page on this computer",
    )
    .replaceAll("GEMINI_API_KEY", "a model key")
    .replaceAll("Gemini API via", "Gemini, using")
    .replaceAll("localhost UI", "a page on this computer")
    .replaceAll(/\bCLI\b/g, "command line")
    .replaceAll(/\bAPI key\b/gi, "secret key")
    .replaceAll(/\bAPI\b/g, "")
    .replaceAll(/\bsev-1\b/gi, "a serious incident")
    .replaceAll(/\bPTO\b/g, "paid time off")
    .replaceAll(/\bHR\b/g, "human resources")
    .replaceAll(/\bCEO\b/g, "chief executive")
    .replaceAll("Europe/Berlin", "Berlin time")
    .replaceAll(/\*\*/g, "")
    .replaceAll(/`/g, "")
    .replaceAll(/^#{1,6}\s+/gm, "")
    .replaceAll(/\s+/g, " ")
    .trim();
}
