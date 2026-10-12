import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  MeshDistortMaterial,
  OrbitControls,
  Stars,
} from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import React, { Component, ErrorInfo, ReactNode, useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ThreeErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("Three.js canvas encountered a non-fatal error, switching to fallback background:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function FloatingOrb() {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!mesh.current) return;

    mesh.current.rotation.x += 0.002;
    mesh.current.rotation.y += 0.004;

    mesh.current.position.y =
      Math.sin(state.clock.elapsedTime * 0.8) * 0.25;
  });

  return (
    <Float
      speed={2}
      rotationIntensity={2}
      floatIntensity={2}
    >
      <mesh ref={mesh}>
        <icosahedronGeometry args={[2, 64]} />

        <MeshDistortMaterial
          speed={2}
          distort={0.35}
          roughness={0.1}
          metalness={0.9}
          color="#8b5cf6"
          emissive="#4c1d95"
          emissiveIntensity={1.5}
        />
      </mesh>
    </Float>
  );
}

function Ring() {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (!ref.current) return;

    ref.current.rotation.z += 0.002;
    ref.current.rotation.x += 0.001;
  });

  return (
    <mesh
      ref={ref}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <torusGeometry args={[4.5, 0.05, 32, 200]} />

      <meshStandardMaterial
        color="#ffffff"
        emissive="#8b5cf6"
        emissiveIntensity={2}
        metalness={1}
        roughness={0.1}
      />
    </mesh>
  );
}

function ParticleField() {
  const ref = useRef<THREE.Points>(null!);

  const particles = useMemo(() => {
    const positions = new Float32Array(6000 * 3);

    for (let i = 0; i < positions.length; i++) {
      positions[i] = (Math.random() - 0.5) * 60;
    }

    return positions;
  }, []);

  useFrame(() => {
    if (!ref.current) return;

    ref.current.rotation.y += 0.0005;
    ref.current.rotation.x += 0.0002;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        size={0.03}
        color="#ffffff"
        transparent
        opacity={0.8}
      />
    </points>
  );
}

function CameraAnimation() {
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    state.camera.position.x = Math.sin(t * 0.2) * 1.2;
    state.camera.position.y = Math.cos(t * 0.2) * 0.4;
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

function FallbackBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none bg-[#02000d]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(139,92,246,0.18)_0%,rgba(76,29,149,0.08)_50%,transparent_80%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(56,189,248,0.12)_0%,transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.65)_100%)]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-60 w-full bg-gradient-to-t from-black via-black/70 to-transparent" />
    </div>
  );
}

export function ThreeBackground() {
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (!gl) {
        setIsSupported(false);
      }
    } catch {
      setIsSupported(false);
    }
  }, []);

  if (!isSupported) {
    return <FallbackBackground />;
  }

  return (
    <ThreeErrorBoundary fallback={<FallbackBackground />}>
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <Canvas
          camera={{
            position: [0, 0, 10],
            fov: 45,
          }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
          }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener("webglcontextlost", (e) => {
              e.preventDefault();
              console.warn("WebGL Context Lost. Fallback active.");
              setIsSupported(false);
            });
          }}
        >
          <fog attach="fog" args={["#000000", 10, 40]} />

          {/* Fully local lighting - No external HDR network dependencies */}
          <ambientLight intensity={0.4} color="#312e81" />
          <hemisphereLight args={["#8b5cf6", "#030014", 0.8]} />

          <directionalLight
            position={[5, 5, 5]}
            intensity={1.5}
            color="#e0e7ff"
          />

          <pointLight
            position={[-6, 4, 4]}
            intensity={8}
            color="#8b5cf6"
          />

          <pointLight
            position={[6, -4, 4]}
            intensity={5}
            color="#38bdf8"
          />

          <Stars
            radius={120}
            depth={80}
            count={4000}
            factor={5}
            fade
          />

          <ParticleField />

          <Ring />

          <FloatingOrb />

          <CameraAnimation />

          {/* Bloom Effects */}
          <EffectComposer>
            <Bloom
              intensity={1.4}
              luminanceThreshold={0.1}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
          </EffectComposer>

          {/* Mouse Interaction */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.35}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
        </Canvas>

        {/* Dark vignette overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.65)_100%)]" />

        {/* Bottom fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 h-60 w-full bg-gradient-to-t from-black via-black/70 to-transparent" />
      </div>
    </ThreeErrorBoundary>
  );
}
