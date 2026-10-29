import type { ReactNode } from "react";
import type { ProjectLink } from "@/lib/projects";

type Props = {
  id: string;
  model: string;
  mark: string;
  name: string;
  idea: string;
  caption: string;
  problem: string;
  made: string;
  stack: string;
  links: ProjectLink[];
  children: ReactNode;
};

export function Instrument({
  id,
  model,
  mark,
  name,
  idea,
  caption,
  problem,
  made,
  stack,
  links,
  children,
}: Props) {
  const titleId = `${id}-title`;
  const captionId = `${id}-caption`;
  const todoAt = made.indexOf("TODO:");
  const madeBody = todoAt >= 0 ? made.slice(0, todoAt) : made;
  const todo = todoAt >= 0 ? made.slice(todoAt) : null;

  return (
    <article className="instrument" id={id} aria-labelledby={titleId}>
      <div className="plate">
        <div className="plate-top">
          <span className="model">{model}</span>
          <span className="kicker">{mark}</span>
        </div>
        <h3 id={titleId}>{name}</h3>
        <p id={captionId} className="caption">
          {caption}
        </p>
        {children}
      </div>
      <div className="strip">
        <p className="idea">{idea}</p>
        <p className="problem">
          <span className="kicker">Problem</span>
          {problem}
        </p>
        <p className="made">
          {madeBody}
          {todo ? <span className="todo">{todo}</span> : null}
        </p>
        <p className="meta">{stack}</p>
        <ul className="links">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} target="_blank" rel="noreferrer">
                {link.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
