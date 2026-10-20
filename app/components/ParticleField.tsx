"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  count?: number;
  variance: number;
}

export default function ParticleField({ count = 180, variance }: Props) {
  const meshRef = useRef<THREE.Points>(null);

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 2.8 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      pos[i * 3] = r * Math.cos(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi);
      pos[i * 3 + 2] = r * Math.cos(phi) * Math.sin(theta);
      spd[i] = 0.3 + Math.random() * 0.7;
    }
    return [pos, spd];
  }, [count]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
    return g;
  }, [positions]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const pos = meshRef.current.geometry.attributes.position;
    const arr = pos.array as Float32Array;
    const vNorm = Math.min(variance * 8, 1);

    for (let i = 0; i < count; i++) {
      const ox = positions[i * 3];
      const oy = positions[i * 3 + 1];
      const oz = positions[i * 3 + 2];
      const s = speeds[i];
      const drift = vNorm * 0.08;
      arr[i * 3] = ox + Math.sin(t * s + i) * drift;
      arr[i * 3 + 1] = oy + Math.cos(t * s * 0.7 + i) * drift;
      arr[i * 3 + 2] = oz + Math.sin(t * s * 0.5 + i * 2) * drift;
    }
    pos.needsUpdate = true;
    meshRef.current.rotation.y = t * 0.02;
  });

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial color="#22d3ee" size={0.03} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}
