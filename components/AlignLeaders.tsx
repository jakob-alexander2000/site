"use client";

import { alignCiteLeaders } from "@/lib/align-leaders";
import { useEffect } from "react";

export function AlignLeaders() {
  useEffect(() => {
    const align = () => alignCiteLeaders();
    align();
    document.fonts.ready.then(align);
    window.addEventListener("resize", align);
    return () => window.removeEventListener("resize", align);
  }, []);
  return null;
}
