import { Plates } from "@/components/Plates";
import { SchnittHero } from "@/components/SchnittHero";
import { loadSchnittRun } from "@/lib/schnitt-run";
import "./schnitt.css";

export default function Home() {
  const run = loadSchnittRun();
  return (
    <main>
      <SchnittHero run={run} />
      <Plates />
    </main>
  );
}
