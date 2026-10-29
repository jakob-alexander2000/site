import { TextLine } from "@/components/TextLine";
import { ALSO_BUILT } from "@/lib/copy";

export function AlsoBuilt() {
  return (
    <section
      id="also-built"
      className="band grid"
      aria-labelledby="also-built-label"
    >
      <h2 id="also-built-label" className="lab">
        Also built
      </h2>
      <div className="main">
        <ul className="items">
          {ALSO_BUILT.map((project) => (
            <li className="item" key={project.name}>
              <h3>
                <TextLine text={project.name} />
              </h3>
              <div className="b">
                <p>
                  <TextLine text={project.summary} />
                </p>
                <p className="meta">{project.stack}</p>
                <div className="links">
                  {project.links.map((link) => (
                    <a key={link.label} href={link.href}>
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
