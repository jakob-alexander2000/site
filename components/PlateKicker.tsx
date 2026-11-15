export function PlateKicker({
  index,
  name,
  className,
}: {
  index: string;
  name: string;
  className?: string;
}) {
  return (
    <p className={className ? `kicker ${className}` : "kicker"}>
      <span className="plate-numeral">{index}</span>
      {" · "}
      <span className="plate-label">{name}</span>
    </p>
  );
}
