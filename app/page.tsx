import { AlsoBuilt } from "@/components/AlsoBuilt";
import { CiteBotCheck } from "@/components/CiteBotCheck";
import { Shell } from "@/components/Shell";
import { HERO } from "@/lib/copy";

export default function Home() {
  return (
    <Shell current="work">
      <section className="hero grid" aria-labelledby="name">
        <h1 id="name" className="name">
          Jakob Alex
        </h1>
        <p className="state">{HERO}</p>
      </section>
      <section className="band lead grid rule" aria-labelledby="selected-work">
        <h2 id="selected-work" className="lab">
          Selected work
        </h2>
        <CiteBotCheck />
      </section>
      <AlsoBuilt />
    </Shell>
  );
}
