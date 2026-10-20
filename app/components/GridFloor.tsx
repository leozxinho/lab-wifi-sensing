"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import * as THREE from "three";

export default function GridFloor() {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = -2.5 + Math.sin(state.clock.elapsedTime * 0.3) * 0.015;
    }
  });

  return (
    <group ref={ref} position={[0, -2.5, 0]}>
      <Grid
        args={[30, 30]}
        cellSize={0.7}
        cellThickness={0.4}
        cellColor="#0d3320"
        sectionSize={3.5}
        sectionThickness={0.8}
        sectionColor="#16a34a"
        fadeDistance={18}
        fadeStrength={2.5}
        infiniteGrid
      />
    </group>
  );
}
