"use client";

import { Component, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import WifiSphere from "./WifiSphere";
import GridFloor from "./GridFloor";
import PersonFigures3D from "./PersonFigures3D";
import { WifiData } from "../hooks/useWifiData";

interface Props {
  data: WifiData;
}

// ── WebGL availability check ───────────────────────────────────────────────────
export function isWebGLAvailable(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

// ── Error boundary ─────────────────────────────────────────────────────────────
class WebGLBoundary extends Component<
  { children: ReactNode; onFail?: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFail?.(); }
  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function Scene({ data }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 2.2, 7.5], fov: 52 }}
      style={{ background: "#000814" }}
      gl={{ antialias: false, alpha: false, powerPreference: "default" }}
    >
      <fog attach="fog" args={["#000814", 14, 32]} />

      <WifiSphere
        confidence={data.confidence}
        occupied={data.occupied}
        calibrating={data.calibrating}
        variance={data.variance}
      />

      <GridFloor />

      <PersonFigures3D
        personCount={data.person_count}
        detected={data.detected}
      />

      <OrbitControls
        enablePan={false}
        minDistance={4.5}
        maxDistance={13}
        maxPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={0.35}
        enableDamping
        dampingFactor={0.05}
      />
    </Canvas>
  );
}

export default function Scene3D({ data, onUnavailable }: Props & { onUnavailable?: () => void }) {
  return (
    <WebGLBoundary onFail={onUnavailable}>
      <Scene data={data} />
    </WebGLBoundary>
  );
}
