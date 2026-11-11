export const DPR_CAP = 2;
export const MAX_PLANES = 4;
export const MAX_DRAW_CALLS = 50;

export function handleContextLost(event?: Event) {
  event?.preventDefault();
}

export function pauseWhenHidden() {
  return typeof document !== "undefined" && document.hidden;
}

export function renderOnDemand() {
  if (pauseWhenHidden()) return;
}
