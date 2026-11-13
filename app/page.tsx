import { SchnittHero } from "@/components/SchnittHero";
import { LookView } from "@/components/LookView";
import { BACKGROUND, LOOKS } from "@/lib/looks";
import { loadSchnittRun } from "@/lib/schnitt-run";
import "./schnitt.css";

export default function Home() {
  const run = loadSchnittRun();
  return (
    <main>
      <SchnittHero run={run} />
      <p className="quiet band">{BACKGROUND}</p>
      {LOOKS.map((look) => (
        <LookView key={look.id} look={look} />
      ))}
    </main>
  );
}
