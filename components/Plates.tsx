import { RegisterMark } from "@/components/PartNote";
import { CopyAddress } from "@/components/CopyAddress";
import { PersonaReceipt } from "@/components/PersonaReceipt";
import { BACKGROUND } from "@/lib/looks";
import { contact } from "@/lib/contact";
import { PROJECTS, REVISION, SKILLS, projectName, type Project } from "@/lib/work";

function SheetRule({ index }: { index: string }) {
  return (
    <div className="sheet-rule" aria-hidden="true">
      <RegisterMark />
      <RegisterMark />
      <RegisterMark />
      <RegisterMark />
      <span className="sheet-no">{index}</span>
      <span className="cut-mark" />
    </div>
  );
}

function ProjectVisual({ project }: { project: Project }) {
  const { visual } = project;
  return (
    <figure className="work-figure">
      {visual.kind === "drawing" ? (
        <PersonaReceipt id={visual.id} label={visual.label} />
      ) : (
        <div className="work-shot" data-visual={visual.src}>
          {/* eslint-disable-next-line @next/next/no-img-element -- static captures, sized up front */}
          <img src={visual.src} width={visual.width} height={visual.height} alt={visual.alt} decoding="async" />
        </div>
      )}
      <figcaption>{visual.caption}</figcaption>
    </figure>
  );
}

export function Plates() {
  const [flagship, ...rest] = PROJECTS;
  return (
    <div className="plates">
      <section className="plate" id="work" aria-labelledby="work-title">
        <SheetRule index="01" />
        <h2 id="work-title">Selected work</h2>
        <div className="work-list">
          {[flagship, ...rest].map((project) => (
            <article
              key={project.id}
              id={project.id}
              className={project === flagship ? "work work-flagship" : "work"}
              data-project={project.id}
              aria-labelledby={`${project.id}-title`}
            >
              <ProjectVisual project={project} />
              <div className="work-text">
                <p className="kicker">
                  {project.index} · {project.mark}
                </p>
                <h3 id={`${project.id}-title`}>{project.name}</h3>
                <p className="body">{project.lead}</p>
                <p className="body work-detail">{project.detail}</p>
                {project.links.length ? (
                  <p className="actions">
                    {project.links.map((link) => (
                      <a key={link.href} href={link.href}>
                        {link.label}
                      </a>
                    ))}
                  </p>
                ) : (
                  <p className="kicker work-private">Source is private while it is in progress.</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="plate" id="skills" aria-labelledby="skills-title">
        <SheetRule index="02" />
        <h2 id="skills-title">Skills, with the work that shows them</h2>
        <ul className="skill-list">
          {SKILLS.map((skill) => (
            <li key={skill.name} data-skill>
              <span className="skill-name">{skill.name}</span>
              <span className="skill-shows">{skill.shows}</span>
              <a className="skill-proof" href={`#${skill.project}`} data-proof>
                {projectName(skill.project)}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="plate" id="about" aria-labelledby="about-title">
        <SheetRule index="03" />
        <div className="about">
          <div className="portrait-slot" data-portrait-slot role="img" aria-label="Portrait slot: a line drawing goes here">
            <span className="kicker" aria-hidden="true">PORTRAIT · LINE DRAWING</span>
          </div>
          <div className="about-text">
            <h2 id="about-title">About</h2>
            <p className="body">{BACKGROUND}</p>
            <p className="body">I build small AI products end to end, and each one ships with the tests and evals that show it works.</p>
          </div>
        </div>
      </section>

      <section className="plate" id="contact" aria-labelledby="contact-title">
        <SheetRule index="04" />
        <h2 id="contact-title">Contact</h2>
        {contact.email ? <CopyAddress email={contact.email} /> : null}
      </section>

      <footer className="plate site-foot" id="footer">
        <p className="kicker">
          Drawn by Jakob Alex · {REVISION} ·{" "}
          <a href="https://github.com/jakob-alexander2000/site">Source of this site</a>
        </p>
      </footer>
    </div>
  );
}
