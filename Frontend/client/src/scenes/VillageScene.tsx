import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function House({ position, color = '#e7ddc9' }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 0.8, 1]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.95, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.85, 0.6, 4]} />
        <meshStandardMaterial color="#8a6a4f" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 0.6, 6]} />
        <meshStandardMaterial color="#8a6a4f" />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow>
        <sphereGeometry args={[0.42, 8, 8]} />
        <meshStandardMaterial color="#6fa172" roughness={0.85} />
      </mesh>
    </group>
  );
}

function Hospital({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.5, 1.6]} />
        <meshStandardMaterial color="#fbfaf5" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.58, 0]}>
        <boxGeometry args={[2.3, 0.16, 1.7]} />
        <meshStandardMaterial color="#4a9c7a" />
      </mesh>
      {/* cross sign */}
      <mesh position={[0, 1.1, 0.81]}>
        <boxGeometry args={[0.5, 0.14, 0.05]} />
        <meshStandardMaterial color="#c1554a" />
      </mesh>
      <mesh position={[0, 1.1, 0.81]}>
        <boxGeometry args={[0.14, 0.5, 0.05]} />
        <meshStandardMaterial color="#c1554a" />
      </mesh>
    </group>
  );
}

function Road() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
      <planeGeometry args={[2.4, 14]} />
      <meshStandardMaterial color="#d8cdb0" roughness={1} />
    </mesh>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#e9efe3" roughness={1} />
    </mesh>
  );
}

function Rig() {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime();
    camera.position.x = Math.sin(t * 0.05) * 0.6;
    camera.position.y = 3.4 + Math.sin(t * 0.08) * 0.15;
    camera.position.z = 8.5 - Math.min(t * 0.05, 1.4);
    camera.lookAt(0, 0.6, -1);
    if (group.current) group.current.rotation.y = Math.sin(t * 0.03) * 0.02;
  });
  return null;
}

function Scene() {
  const trees = useMemo(() => [
    [-3.4, 0, -2], [3.6, 0, -1], [-2.8, 0, 1.5], [3.2, 0, 2.6], [-4, 0, 3.6], [4.2, 0, -3.2]
  ] as [number, number, number][], []);

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[5, 8, 4]} intensity={1.1} castShadow color="#fff6e0" />
      <hemisphereLight args={['#eaf3e6', '#cdd8c2', 0.5]} />
      <Ground />
      <Road />
      <Hospital position={[0, 0, -3.6]} />
      <House position={[-1.7, 0, -0.6]} color="#f1e6cf" />
      <House position={[1.9, 0, 0.2]} color="#e9dcc4" />
      <House position={[-1.6, 0, 2.4]} color="#eee0c7" />
      <House position={[2.1, 0, 3]} color="#f0e3ca" />
      {trees.map((p, i) => <Tree key={i} position={p} />)}
      <Rig />
      <fog attach="fog" args={['#f4faf7', 8, 22]} />
    </>
  );
}

export default function VillageScene({ className = '' }: { className?: string }) {
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  return (
    <div className={className} aria-hidden="true">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 3.4, 8.5], fov: 42 }}
        frameloop={reduceMotion ? 'demand' : 'always'}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
