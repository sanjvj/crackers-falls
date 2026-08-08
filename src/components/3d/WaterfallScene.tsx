import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// 3D Waterfall Particle System
function WaterfallParticles() {
  const count = 1600;
  const meshRef = useRef<THREE.Points>(null);

  const [positions, speeds, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const col = new Float32Array(count * 3);

    const colorWaterfall1 = new THREE.Color('#22d3ee'); // Waterfall Cyan
    const colorWaterfall2 = new THREE.Color('#0891b2'); // Deep teal
    const colorGold = new THREE.Color('#f59e0b');       // Gold sparkle

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;      // X width
      pos[i * 3 + 1] = (Math.random() - 0.5) * 24;  // Y height
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;   // Z depth

      spd[i] = 0.04 + Math.random() * 0.14;

      const rand = Math.random();
      const chosenColor = rand > 0.82 ? colorGold : (rand > 0.35 ? colorWaterfall1 : colorWaterfall2);
      col[i * 3] = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;
    }
    return [pos, spd, col];
  }, [count]);

  useFrame(() => {
    if (!meshRef.current) return;
    const positionsAttr = meshRef.current.geometry.attributes.position;
    const array = positionsAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      array[i * 3 + 1] -= speeds[i]; // Flow downwards
      if (array[i * 3 + 1] < -12) {
        array[i * 3 + 1] = 12;
        array[i * 3] = (Math.random() - 0.5) * 16;
      }
    }
    positionsAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        vertexColors
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

// 3D Ascending Firework Sparks System
function FireworkSparks() {
  const count = 500;
  const meshRef = useRef<THREE.Points>(null);

  const [positions, velocities, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const gold = new THREE.Color('#fbbf24');
    const red = new THREE.Color('#ef4444');
    const cyan = new THREE.Color('#22d3ee');

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 1] = 3 + (Math.random() - 0.5) * 3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.035 + Math.random() * 0.09;

      vel[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      vel[i * 3 + 1] = Math.cos(phi) * speed;
      vel[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;

      const c = i % 3 === 0 ? gold : (i % 3 === 1 ? red : cyan);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, vel, col];
  }, [count]);

  useFrame(() => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.attributes.position;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      array[i * 3] += velocities[i * 3];
      array[i * 3 + 1] += velocities[i * 3 + 1] - 0.0006;
      array[i * 3 + 2] += velocities[i * 3 + 2];

      if (Math.abs(array[i * 3]) > 12 || array[i * 3 + 1] < -10) {
        array[i * 3] = (Math.random() - 0.5) * 4;
        array[i * 3 + 1] = 3 + (Math.random() - 0.5) * 3;
        array[i * 3 + 2] = (Math.random() - 0.5) * 4;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        vertexColors
        transparent
        opacity={0.95}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export const WaterfallScene: React.FC = () => {
  const isReducedMotion = useReducedMotion();

  if (isReducedMotion) {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1f15] via-[#0f3742]/40 to-[#050b08] pointer-events-none" />
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-90">
      <Canvas
        camera={{ position: [0, 0, 13], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <WaterfallParticles />
        <FireworkSparks />
      </Canvas>
    </div>
  );
};
