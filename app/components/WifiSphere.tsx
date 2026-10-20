"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

interface Props {
  confidence: number;
  occupied: boolean;
  calibrating: boolean;
  variance: number;
}

const R = 2.6;
const SPHERE_SEG = 80;
const WIRE_BLUE = "#3b82f6";

export default function WifiSphere({ confidence, occupied, calibrating, variance }: Props) {
  const outerRef = useRef<THREE.Group>(null);
  const coreRef  = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  const coreColor = calibrating ? "#f59e0b" : occupied ? "#60a5fa" : "#1e3a5f";
  const pulseColor = occupied ? "#4ade80" : "#2563eb";

  // Full wireframe sphere grid lines
  const gridLines = useMemo(() => {
    const lines: [number, number, number][][] = [];

    // Latitudes from -80° to 80° in 20° steps
    for (let lat = -80; lat <= 80; lat += 20) {
      const phi = (lat * Math.PI) / 180;
      const r = R * Math.cos(phi);
      const y = R * Math.sin(phi);
      const pts: [number, number, number][] = [];
      for (let i = 0; i <= SPHERE_SEG; i++) {
        const theta = (i / SPHERE_SEG) * Math.PI * 2;
        pts.push([r * Math.cos(theta), y, r * Math.sin(theta)]);
      }
      lines.push(pts);
    }

    // Longitudes — 18 meridians
    for (let lon = 0; lon < 360; lon += 20) {
      const theta = (lon * Math.PI) / 180;
      const pts: [number, number, number][] = [];
      for (let i = 0; i <= SPHERE_SEG; i++) {
        const phi = (i / SPHERE_SEG) * Math.PI - Math.PI / 2;
        pts.push([
          R * Math.cos(phi) * Math.cos(theta),
          R * Math.sin(phi),
          R * Math.cos(phi) * Math.sin(theta),
        ]);
      }
      lines.push(pts);
    }

    return lines;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const vNorm = Math.min(variance * 10, 1);

    if (outerRef.current) {
      outerRef.current.rotation.y = t * 0.09;
      outerRef.current.rotation.x = Math.sin(t * 0.04) * 0.06;
    }
    if (coreRef.current) {
      const s = 1 + vNorm * 0.18 * Math.sin(t * 2.8);
      coreRef.current.scale.setScalar(s);
    }
    if (pulseRef.current) {
      const s = 1 + 0.55 * ((Math.sin(t * 1.6) + 1) / 2);
      pulseRef.current.scale.setScalar(s);
      (pulseRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.18 * (1 - (s - 1) / 0.55);
    }
  });

  return (
    <group>
      {/* Wireframe globe */}
      <group ref={outerRef}>
        {gridLines.map((pts, i) => (
          <Line
            key={i}
            points={pts}
            color={WIRE_BLUE}
            lineWidth={0.6}
            transparent
            opacity={i < 9 ? 0.35 : 0.28}   // latitudes slightly brighter than meridians
          />
        ))}
      </group>

      {/* Very subtle inner volume */}
      <mesh>
        <sphereGeometry args={[R, 32, 32]} />
        <meshBasicMaterial color="#1e40af" transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>

      {/* Core glow sphere */}
      <mesh>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshBasicMaterial color={coreColor} transparent opacity={0.12} />
      </mesh>

      {/* Core dot */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={2.5}
          transparent
          opacity={0.9}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>

      {/* Pulsing ring */}
      <mesh ref={pulseRef}>
        <torusGeometry args={[R * 0.88, 0.025, 8, 120]} />
        <meshBasicMaterial color={pulseColor} transparent opacity={0.25} />
      </mesh>

      {/* Equatorial ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R, 0.012, 8, 120]} />
        <meshBasicMaterial color={WIRE_BLUE} transparent opacity={0.6} />
      </mesh>

      {/* Lights */}
      <pointLight color={coreColor} intensity={3} distance={5} decay={2} />
      <ambientLight intensity={0.08} />
    </group>
  );
}
