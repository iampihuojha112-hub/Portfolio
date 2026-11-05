"use client";

import { useEffect, useState } from "react";

export type SceneMode = "pending" | "full" | "lite" | "static" | "none";

/** Picks how much 3D to render: full desktop, simplified mobile/low-power, a single static frame, or none. */
export function useSceneMode(): SceneMode {
  const [mode, setMode] = useState<SceneMode>("pending");
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) { setMode("none"); return; }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const small = window.innerWidth < 768;
    const weak = (nav.deviceMemory ?? 8) < 4 || (navigator.hardwareConcurrency ?? 8) <= 2;
    setMode(reduce ? "static" : small || weak ? "lite" : "full");
  }, []);
  return mode;
}
