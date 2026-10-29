import { PROJECTS } from "@/lib/projects";

export function SelectedIndex() {
  return (
    <ul className="try-list">
      {PROJECTS.map((project) => (
        <li key={project.id}>
          <a href={`#${project.id}`}>
            <span className="try-name">{project.name}</span>
            <span className="try-proof">{project.proof}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
