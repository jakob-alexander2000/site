"use client";

import { alignAutopsyLabels, alignCiteLeaders } from "@/lib/align-leaders";
import { useEffect } from "react";

export function AlignLeaders() {
  useEffect(() => {
    const align = () => {
      alignCiteLeaders();
      alignAutopsyLabels();
    };
    let width = window.innerWidth;
    // The labels follow the width. A toolbar showing or hiding only changes the height.
    const onResize = () => {
      if (window.innerWidth === width) return;
      width = window.innerWidth;
      align();
    };
    align();
    document.fonts.ready.then(align);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return null;
}
