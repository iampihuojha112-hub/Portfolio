"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll-store";
import type { SceneMode } from "@/hooks/useSceneMode";

const LAV = new THREE.Color("#b9aaff");
const BLUE = new THREE.Color("#5b8cff");
const smooth = (x: number) => x * x * (3 - 2 * x);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Rings of an armillary: thin tori with a small node riding each. Purposeful depth cue, not decoration. */
function Ring({ radius, tilt, speed, color, lite }: { radius: number; tilt: [number, number, number]; speed: number; color: THREE.Color; lite: boolean }) {
  const ring = useRef<THREE.Group>(null);
  const node = useRef<THREE.Mesh>(null);
  useFrame((s, dt) => {
    if (ring.current) ring.current.rotation.z += dt * speed;
    if (node.current) node.current.position.set(Math.cos(s.clock.elapsedTime * speed * 2) * radius, Math.sin(s.clock.elapsedTime * speed * 2) * radius, 0);
  });
  return (
    <group rotation={tilt}>
      <group ref={ring}>
        <mesh>
          <torusGeometry args={[radius, 0.008, 8, lite ? 80 : 180]} />
          <meshBasicMaterial color={color} transparent opacity={0.55} />
        </mesh>
      </group>
      <mesh ref={node}>
        <sphereGeometry args={[0.045, lite ? 8 : 16, lite ? 8 : 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function Dust({ count }: { count: number }) {
  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 6, a = Math.random() * Math.PI * 2, y = (Math.random() - 0.5) * 8;
      pos.set([Math.cos(a) * r, y, Math.sin(a) * r - 2], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);
  const ref = useRef<THREE.Points>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.012; });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.02} color="#cfc8ff" transparent opacity={0.45} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Sculpture({ mode }: { mode: SceneMode }) {
  const root = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const rings = useRef<THREE.Group>(null);
  const { size, invalidate } = useThree();
  const lite = mode === "lite";
  const animated = mode === "full" || mode === "lite";
  const mouse = useRef({ x: 0, y: 0 });

  // Reduced motion: one still frame in the hero pose, no render loop.
  useEffect(() => {
    if (mode !== "static" || !root.current) return;
    const wide = size.width >= 900;
    root.current.position.set(wide ? 2.3 : 0, wide ? 0 : 1.1, 0);
    root.current.rotation.set(0.15, 0.5, 0);
    invalidate();
  }, [mode, size.width, invalidate]);

  useFrame((state, dt) => {
    if (mode === "static") return;
    const wide = size.width >= 900;
    const p = scrollState.progress;
    const ptr = state.pointer;
    mouse.current.x = THREE.MathUtils.damp(mouse.current.x, ptr.x, 3, dt);
    mouse.current.y = THREE.MathUtils.damp(mouse.current.y, ptr.y, 3, dt);

    // Scroll choreography: sits beside the hero text, drifts left/right through the content,
    // shrinks while people read, then opens into a "portal" at the contact section.
    const portal = smooth(clamp01((p - 0.86) / 0.14));
    const away = smooth(clamp01(p * 7));
    const drift = Math.cos(p * Math.PI * 5) * (wide ? 2.6 : 0);
    const targetX = wide ? THREE.MathUtils.lerp(2.3, drift, away) * (1 - portal) : 0;
    const targetY = wide ? 0 : THREE.MathUtils.lerp(1.1, 2.0, away);
    const targetScale = THREE.MathUtils.lerp(1, wide ? 0.6 : 0.5, away) * THREE.MathUtils.lerp(1, 1.5, portal);

    if (root.current) {
      root.current.position.x = THREE.MathUtils.damp(root.current.position.x, targetX, 4, dt);
      root.current.position.y = THREE.MathUtils.damp(root.current.position.y, targetY + (portal ? -portal * 0.2 : 0), 4, dt);
      const s = THREE.MathUtils.damp(root.current.scale.x, targetScale, 4, dt);
      root.current.scale.setScalar(s);
      root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, mouse.current.x * 0.35 + p * 5, 4, dt);
      root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, -mouse.current.y * 0.2, 4, dt);
    }
    if (core.current && animated) { core.current.rotation.y += dt * 0.18; core.current.rotation.x += dt * 0.07; }
    if (rings.current) {
      const open = 1 + portal * 0.9;
      rings.current.scale.setScalar(THREE.MathUtils.damp(rings.current.scale.x, open, 3, dt));
    }
  });

  return (
    <group ref={root}>
      <mesh ref={core}>
        <icosahedronGeometry args={[1.05, lite ? 0 : 1]} />
        <meshPhysicalMaterial color="#15151d" metalness={0.92} roughness={0.2} flatShading
          iridescence={lite ? 0 : 0.8} iridescenceIOR={1.4} clearcoat={1} clearcoatRoughness={0.15} envMapIntensity={1.15} />
      </mesh>
      <group ref={rings}>
        <Ring radius={1.75} tilt={[1.15, 0.2, 0]} speed={0.12} color={LAV} lite={lite} />
        <Ring radius={2.15} tilt={[0.35, 0.9, 0]} speed={-0.08} color={BLUE} lite={lite} />
        {!lite && <Ring radius={2.6} tilt={[1.5, -0.5, 0.4]} speed={0.05} color={LAV} lite={lite} />}
      </group>
    </group>
  );
}

export default function Scene({ mode }: { mode: SceneMode }) {
  const lite = mode === "lite";
  return (
    <Canvas
      frameloop={mode === "static" ? "demand" : "always"}
      dpr={lite ? 1 : [1, 1.75]}
      camera={{ position: [0, 0, 6.2], fov: 38 }}
      gl={{ antialias: !lite, alpha: true, powerPreference: lite ? "low-power" : "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      aria-hidden
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} color="#d9d2ff" />
      <pointLight position={[-4, -2, 2]} intensity={14} color="#5b8cff" distance={14} />
      {/* Procedural studio lighting: no HDR download, works offline */}
      <Environment resolution={lite ? 64 : 128}>
        <Lightformer form="rect" intensity={2.2} position={[0, 5, -4]} scale={[10, 3, 1]} color="#cfc7ff" />
        <Lightformer form="rect" intensity={1.4} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color="#5b8cff" />
        <Lightformer form="ring" intensity={1.6} position={[4, 1, 3]} scale={3} color="#ffffff" />
      </Environment>
      <Sculpture mode={mode} />
      {mode === "full" && <Dust count={320} />}
    </Canvas>
  );
}
