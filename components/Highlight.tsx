type Props = {
  text: string;
  tokens: string[];
};

export function Highlight({ text, tokens }: Props) {
  if (tokens.length === 0) return <>{text}</>;
  const pattern = tokens
    .map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const parts = text.split(new RegExp(`(${pattern})`, "ig"));
  const wanted = new Set(tokens.map((token) => token.toLowerCase()));
  return (
    <>
      {parts.map((part, i) =>
        wanted.has(part.toLowerCase()) ? (
          <mark key={`${part}-${i}`}>{part}</mark>
        ) : (
          <span key={`${part}-${i}`}>{part}</span>
        ),
      )}
    </>
  );
}
