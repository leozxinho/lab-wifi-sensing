"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const GREEN = "#4ade80";
const FLOOR_Y = -2.5;

function StickFigure({
  position,
  phaseOffset,
  opacity,
}: {
  position: [number, number, number];
  phaseOffset: number;
  opacity: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime + phaseOffset;
    groupRef.current.rotation.y = Math.sin(t * 0.45) * 0.12;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.7) * 0.012;
  });

  const m = <meshBasicMaterial color={GREEN} transparent opacity={opacity} />;

  return (
    <group ref={groupRef} position={position}>
      {/* Head */}
      <mesh position={[0, 0.88, 0]}>
        <sphereGeometry args={[0.09, 10, 10]} />
        {m}
      </mesh>

      {/* Torso */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.4, 6]} />
        {m}
      </mesh>

      {/* Left arm */}
      <mesh position={[-0.18, 0.68, 0]} rotation={[0, 0, Math.PI / 3.5]}>
        <cylinderGeometry args={[0.016, 0.016, 0.33, 6]} />
        {m}
      </mesh>
      {/* Right arm */}
      <mesh position={[0.18, 0.68, 0]} rotation={[0, 0, -Math.PI / 3.5]}>
        <cylinderGeometry args={[0.016, 0.016, 0.33, 6]} />
        {m}
      </mesh>

      {/* Left leg */}
      <mesh position={[-0.1, 0.2, 0]} rotation={[0, 0, Math.PI / 9]}>
        <cylinderGeometry args={[0.019, 0.019, 0.42, 6]} />
        {m}
      </mesh>
      {/* Right leg */}
      <mesh position={[0.1, 0.2, 0]} rotation={[0, 0, -Math.PI / 9]}>
        <cylinderGeometry args={[0.019, 0.019, 0.42, 6]} />
        {m}
      </mesh>

      {/* Glow point */}
      <pointLight
        color={GREEN}
        intensity={1.8 * opacity}
        distance={2.0}
        decay={2}
        position={[0, 0.5, 0]}
      />
    </group>
  );
}

interface Props {
  personCount: number;
  detected: boolean;
}

export default function PersonFigures3D({ personCount, detected }: Props) {
  const count = personCount > 0 ? personCount : 0;

  const figures = Array.from({ length: count }, (_, i) => {
    const spread = (Math.PI * 2) / Math.max(count, 1);
    const angle = spread * i + 0.55 + (i % 2) * 1.1;
    const radius = 0.5 + (i % 3) * 0.38;
    return {
      pos: [Math.cos(angle) * radius, FLOOR_Y, Math.sin(angle) * radius] as [
        number,
        number,
        number,
      ],
      phase: i * 2.618,
    };
  });

  return (
    <group>
      {figures.map((f, i) => (
        <StickFigure
          key={i}
          position={f.pos}
          phaseOffset={f.phase}
          opacity={1}
        />
      ))}
    </group>
  );
}
