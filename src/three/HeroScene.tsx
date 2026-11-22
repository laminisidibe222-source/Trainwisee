import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float } from '@react-three/drei';
import * as THREE from 'three';

const TorsoHologram = () => {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame((_state, delta) => {
    mesh.current.rotation.y += delta * 0.2;
  });
  return (
    <mesh ref={mesh}>
      <torusKnotGeometry args={[1, 0.3, 100, 32]} />
      {/* deeper cyan so the wireframe still reads on a white page */}
      <meshStandardMaterial color="#0E7490" emissive="#0E7490" emissiveIntensity={0.25} wireframe />
    </mesh>
  );
};

export const HeroScene = () => {
  return (
    <Canvas className="w-full h-[500px]" gl={{ alpha: true }}>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <TorsoHologram />
      </Float>
    </Canvas>
  );
};
