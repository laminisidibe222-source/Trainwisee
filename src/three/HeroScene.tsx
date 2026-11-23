import React, { useRef, useState } from 'react';
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

/**
 * Browsers drop the WebGL context for reasons we cannot prevent (GPU reset,
 * memory pressure on phones, tab suspension). Without handling, three.js throws
 * "Context Lost" in the console and the card goes blank forever. Here the canvas
 * is replaced by a plain message and a one-click remount.
 */
const Fallback = ({ onRetry, reason }: { onRetry: () => void; reason: 'lost' | 'unsupported' }) => (
  <div className="w-full h-[500px] flex flex-col items-center justify-center gap-3 px-8 text-center">
    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3 2 7.5 12 12l10-4.5L12 3Z" />
        <path d="M2 12.5 12 17l10-4.5M2 17.5 12 22l10-4.5" />
      </svg>
    </div>
    <p className="text-sm font-semibold text-slate-800">
      {reason === 'lost' ? '3D preview paused' : '3D preview unavailable'}
    </p>
    <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
      {reason === 'lost'
        ? 'Your browser released the graphics context — usually memory pressure or a driver reset. Everything else on the page still works.'
        : 'This browser does not expose WebGL, so the hologram is off. Your blueprint is unaffected.'}
    </p>
    {reason === 'lost' && (
      <button
        onClick={onRetry}
        className="mt-1 px-4 py-2 rounded-full border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-all"
      >
        Reload 3D
      </button>
    )}
  </div>
);

export const HeroScene = () => {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState<'lost' | 'unsupported' | null>(null);

  if (failed) {
    return (
      <Fallback
        reason={failed}
        onRetry={() => {
          setFailed(null);
          setAttempt((a) => a + 1);
        }}
      />
    );
  }

  return (
    <Canvas
      key={attempt}
      className="w-full h-[500px]"
      // High-DPI phones allocate huge framebuffers; 1.75 is the point where the
      // extra pixels stop being visible but still cost GPU memory.
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true, powerPreference: 'default' }}
      fallback={<Fallback reason="unsupported" onRetry={() => undefined} />}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener(
          'webglcontextlost',
          (event) => {
            // Without preventDefault the context can never be restored.
            event.preventDefault();
            setFailed('lost');
          },
          { once: true }
        );
      }}
    >
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
