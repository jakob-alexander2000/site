import type { LayerId } from "@/lib/studio";

const DOTS: ReadonlyArray<readonly [number, number]> = [
  [120, 66], [150, 52], [168, 78], [196, 60], [214, 44], [232, 88], [256, 70], [280, 58], [300, 80], [176, 96], [244, 40],
];

function Marks({ id }: { id: LayerId }) {
  if (id === "research") {
    return (
      <g>
        {DOTS.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.2" fill="var(--ink)" />
        ))}
        <path d="M120 66 L196 60 L256 70 L300 80" stroke="var(--ink)" fill="none" />
      </g>
    );
  }
  if (id === "design") {
    return (
      <g stroke="var(--ink)" fill="none">
        <path d="M100 70 L200 40 L300 70 L200 100 Z" />
        <path d="M150 55 L250 85 M250 55 L150 85" stroke="var(--rule)" />
        <path d="M60 70 H100 M300 70 H340 M60 64 V76 M340 64 V76" />
      </g>
    );
  }
  if (id === "code") {
    return (
      <g stroke="var(--ink)" strokeWidth="1.4">
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const length = i % 3 ? 110 : 150;
          const x = 110 + 18 * i;
          const y = 58 + 5.4 * i;
          return <path key={i} d={`M${x} ${y} L${x + length} ${y - 30 * (length / 200)}`} />;
        })}
      </g>
    );
  }
  return (
    <g>
      <circle cx="200" cy="70" r="26" fill="none" stroke="var(--ground)" />
      <path d="M170 60 L230 80 M230 60 L170 80" stroke="var(--fault)" strokeWidth="3" />
    </g>
  );
}

/** One slab of Fig. 1, drawn on its own row of the Studio section. */
export function Plane({ id }: { id: LayerId }) {
  const solid = id === "checks";
  return (
    <div className="plane">
      <svg viewBox="0 0 400 150" aria-hidden="true">
        <path
          d="M0 70 V82 L200 142 L400 82 V70 L200 130 Z"
          fill={solid ? "var(--ink)" : "#e6e6e3"}
          stroke="var(--ink)"
        />
        <path d="M0 70 L200 10 L400 70 L200 130 Z" fill={solid ? "var(--ink)" : "var(--sheet)"} stroke="var(--ink)" />
        <Marks id={id} />
      </svg>
      <span className="leader" aria-hidden="true" />
    </div>
  );
}
