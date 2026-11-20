import type { ReactNode } from "react";

/** The one frame every project drawing sits in: same rule, inset, paper and type. */
export function WorkFrame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure className="work-frame" data-work-frame>
      <div className="work-board" role="img" aria-label={label}>
        {children}
      </div>
    </figure>
  );
}
