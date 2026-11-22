"use client";

import { useEffect, useState } from "react";

/** Draws the grid, margins and type sizes over the page, like a spec sheet. */
export function ConstructionToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.construction = on ? "on" : "off";
  }, [on]);

  return (
    <button type="button" className="btn meta toggle" aria-pressed={on} onClick={() => setOn((value) => !value)}>
      Show construction
    </button>
  );
}
