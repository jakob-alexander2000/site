"use client";

import { playStage } from "@/components/play";

export function ReplayButton({ targetId }: { targetId: string }) {
  return (
    <button type="button" className="try" onClick={() => playStage(targetId)}>
      Try it
      <span>CiteBot</span>
    </button>
  );
}
