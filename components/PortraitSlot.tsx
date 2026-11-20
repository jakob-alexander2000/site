/** The portrait frame. It renders only when the drawing file exists (see lib/portrait.ts). */
export function PortraitSlot({ src }: { src: string | null }) {
  if (!src) return null;
  return (
    <div className="portrait-slot" data-portrait-slot>
      {/* eslint-disable-next-line @next/next/no-img-element -- one drawing, sized by the frame */}
      <img src={src} alt="Line drawing portrait of Jakob Alex" decoding="async" />
    </div>
  );
}
