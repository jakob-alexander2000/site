import { LAYERS } from "@/lib/studio";

/** Fig. 1: an exploded section through one project. Checks sit on top, in solid black. */
export function Axonometric() {
  const byId = Object.fromEntries(LAYERS.map((layer) => [layer.id, layer]));
  const rows = [
    { id: "checks", y: 80, solid: true },
    { id: "code", y: 180, solid: false },
    { id: "design", y: 280, solid: false },
    { id: "research", y: 380, solid: false },
  ] as const;
  return (
    <svg
      viewBox="0 0 800 440"
      role="img"
      aria-label="Exploded section through one project: research at the bottom, then design, code, and the checks on top in solid black, where one check fails"
    >
      <path d="M60 380 V80 M520 380 V80" stroke="var(--rule)" fill="none" />
      {rows
        .slice()
        .reverse()
        .map((row) => (
          <path
            key={row.id}
            d={`M60 ${row.y} L290 ${row.y - 60} L520 ${row.y} L290 ${row.y + 60} Z`}
            fill={row.solid ? "var(--ink)" : "var(--sheet)"}
            stroke="var(--ink)"
          />
        ))}
      {rows.map((row) => (
        <g key={`label-${row.id}`}>
          <path d={`M520 ${row.y} H580`} stroke="var(--ink)" />
          <text x="592" y={row.y - 4} fontSize="12" fontWeight="600" letterSpacing="0.72" fill="var(--ink)">
            {byId[row.id].name.toUpperCase()}
          </text>
          <text x="592" y={row.y + 16} fontSize="13" fill="var(--grey)">
            {byId[row.id].caption}
          </text>
        </g>
      ))}
      <text x="592" y="116" fontSize="12" fontWeight="600" letterSpacing="0.72" fill="var(--fault)">
        1 FAIL · “UNLESS” DROPPED
      </text>
    </svg>
  );
}
