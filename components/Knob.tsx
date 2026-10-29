"use client";

type Props = {
  label: string;
  stops: readonly string[];
  index: number;
  onChange: (index: number) => void;
};

export function Knob({ label, stops, index, onChange }: Props) {
  const max = Math.max(stops.length - 1, 0);
  const angle = max === 0 ? 0 : -120 + (index / max) * 240;
  const current = stops[index] ?? "";

  return (
    <label className="knob-label">
      <span className="kicker">{label}</span>
      <span className="knob" aria-hidden="true">
        <span className="knob-face" style={{ transform: `rotate(${angle}deg)` }}>
          <span className="needle" />
        </span>
      </span>
      <input
        type="range"
        min={0}
        max={max}
        step={1}
        value={index}
        aria-valuetext={current}
        aria-label={label}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="knob-value">{current}</span>
    </label>
  );
}
