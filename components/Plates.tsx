import { CopyAddress } from "@/components/CopyAddress";
import { PortraitSlot } from "@/components/PortraitSlot";
import { WorkFrame } from "@/components/WorkFrame";
import { AutopsyDiagram, CitebotDiagram, PersonaDiagram, StyleDiagram } from "@/components/work-diagrams";
import { BACKGROUND } from "@/lib/looks";
import { contact } from "@/lib/contact";
import { portraitSource } from "@/lib/portrait";
import { PROJECTS, SKILLS, projectName, type Project } from "@/lib/work";

function ProjectVisual({ project }: { project: Project }) {
  const Diagram =
    project.id === "persona" ? PersonaDiagram : project.id === "citebot" ? CitebotDiagram : project.id === "autopsy" ? AutopsyDiagram : StyleDiagram;
  return (
    <WorkFrame label={project.visual.label}>
      <Diagram />
    </WorkFrame>
  );
}

export function Plates() {
  const [flagship, ...rest] = PROJECTS;
  const portrait = portraitSource();
  return (
    <div className="plates">
      <section className="plate" id="work" aria-labelledby="work-title">
        <h2 id="work-title">Selected work</h2>
        <div className="work-list">
          <article id={flagship.id} className="work work-flagship" data-project={flagship.id} aria-labelledby={`${flagship.id}-title`}>
            <ProjectVisual project={flagship} />
            <div className="work-text">
              <h3 id={`${flagship.id}-title`}>{flagship.name}</h3>
              <p className="body">{flagship.lead}</p>
              <p className="body work-detail">{flagship.detail}</p>
            </div>
          </article>
          <div className="work-rest">
            {rest.map((project) => (
              <article key={project.id} id={project.id} className="work work-compact" data-project={project.id} aria-labelledby={`${project.id}-title`}>
                <ProjectVisual project={project} />
                <div className="work-text">
                  <h3 id={`${project.id}-title`}>{project.name}</h3>
                  <p className="body">{project.lead}</p>
                  {project.links.length ? (
                    <p className="actions">
                      {project.links.map((link) => (
                        <a key={link.href} href={link.href}>
                          {link.label}
                        </a>
                      ))}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="plate" id="skills" aria-labelledby="skills-title">
        <h2 id="skills-title">Skills, with the work that shows them</h2>
        <ul className="skill-list">
          {SKILLS.map((skill) => (
            <li key={skill.name} data-skill>
              <span className="skill-name">{skill.name}</span>
              <span className="skill-shows">{skill.shows}</span>
              <a className="skill-proof" href={skill.proof?.href ?? `#${skill.project}`} data-proof>
                {skill.proof?.label ?? projectName(skill.project)}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="plate" id="about" aria-labelledby="about-title">
        <div className={portrait ? "about about-portrait" : "about"}>
          <PortraitSlot src={portrait} />
          <div className="about-text">
            <h2 id="about-title">About</h2>
            <p className="body">{BACKGROUND}</p>
            <p className="body">I build small AI products end to end, and each one ships with the tests and evals that show it works.</p>
          </div>
        </div>
      </section>

      <section className="plate" id="contact" aria-labelledby="contact-title">
        <h2 id="contact-title">Contact</h2>
        {contact.email ? <CopyAddress email={contact.email} /> : null}
      </section>

      <footer className="plate site-foot" id="footer">
        <p className="body">
          <a href="https://github.com/jakob-alexander2000/site">Source of this site</a>
        </p>
      </footer>
    </div>
  );
}
