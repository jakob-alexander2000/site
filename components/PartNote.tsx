"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const OPEN = "partnote-open";

export function RegisterMark({ className }: { className?: string } = {}) {
  return (
    <span
      className={className ? `register-mark ${className}` : "register-mark"}
      data-mark="register"
      aria-hidden="true"
    />
  );
}

export function PartNote({ id, label, note }: { id: string; label: string; note: string }) {
  const [open, setOpen] = useState(false);
  const panelId = `${id}-note`;
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const onOpen = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== panelId) setOpen(false);
    };
    window.addEventListener(OPEN, onOpen);
    return () => window.removeEventListener(OPEN, onOpen);
  }, [panelId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && (trigger.current?.contains(target) || panel.current?.contains(target))) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useLayoutEffect(() => {
    const node = panel.current;
    if (!open || !node) return;
    node.style.translate = "";
    node.style.top = "";
    node.style.bottom = "";
    node.style.marginTop = "";
    node.style.marginBottom = "";
    if (getComputedStyle(node).position !== "absolute") {
      const inFlow = node.getBoundingClientRect();
      if (inFlow.bottom > window.innerHeight - 8) {
        window.scrollBy(0, inFlow.bottom - window.innerHeight + 8);
      }
      return;
    }
    node.style.translate = "0 0";
    node.style.top = "100%";
    node.style.bottom = "auto";
    node.style.marginTop = "4px";
    node.style.marginBottom = "0";
    const box = node.getBoundingClientRect();
    let shift = 0;
    if (box.right > window.innerWidth - 8) shift = window.innerWidth - 8 - box.right;
    if (box.left + shift < 8) shift = 8 - box.left;
    if (box.bottom > window.innerHeight - 8) {
      node.style.top = "auto";
      node.style.bottom = "100%";
      node.style.marginTop = "0";
      node.style.marginBottom = "4px";
    }
    node.style.translate = `${shift}px 0`;
  }, [open]);

  return (
    <span className="part-note">
      <RegisterMark className="part-note-register" />
      <button
        ref={trigger}
        type="button"
        className="plus-mark"
        data-mark="plus"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={label}
        onClick={() => {
          if (!open) window.dispatchEvent(new CustomEvent(OPEN, { detail: panelId }));
          setOpen((value) => !value);
        }}
      >
        <span className="plus-glyph" aria-hidden="true" />
      </button>
      <span ref={panel} id={panelId} className="plus-callout" hidden={!open} role="note">
        {note}
      </span>
    </span>
  );
}
