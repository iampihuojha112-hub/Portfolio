"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useSceneMode } from "@/hooks/useSceneMode";

// three.js is loaded lazily and only in the browser.
const Scene = dynamic(() => import("./Scene"), { ssr: false });

/** Fixed full-viewport backdrop. Falls back to a plain gradient when WebGL is unavailable. */
export default function SceneCanvas() {
  const mode = useSceneMode();
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 opacity-90 max-md:opacity-70">
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_75%_40%,rgba(91,140,255,0.10),transparent_70%),radial-gradient(50%_40%_at_20%_80%,rgba(185,170,255,0.07),transparent_70%)]" />
      {mode !== "pending" && mode !== "none" && (
        <Suspense fallback={null}>
          <Scene mode={mode} />
        </Suspense>
      )}
    </div>
  );
}
