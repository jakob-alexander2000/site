import { TextLine } from "@/components/TextLine";
import { Shell } from "@/components/Shell";
import { ABOUT, GITHUB_PROFILE } from "@/lib/copy";

export default function AboutPage() {
  return (
    <Shell current="about">
      <section className="band grid rule" aria-labelledby="about-label">
        <h1 id="about-label" className="lab">
          About
        </h1>
        <div className="main">
          <p className="big">{ABOUT}</p>
        </div>
      </section>
      <section className="band grid rule" aria-labelledby="contact-label">
        <h2 id="contact-label" className="lab">
          Contact
        </h2>
        <div className="main">
          <p>
            <a href={GITHUB_PROFILE}>
              <TextLine text="github.com/jakob-alexander2000" />
            </a>
          </p>
        </div>
      </section>
    </Shell>
  );
}
