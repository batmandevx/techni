'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles() {
  const mesh = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const count = 200;
  
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      
      // Indigo/violet color palette
      colors[i * 3] = 0.4 + Math.random() * 0.2;     // R
      colors[i * 3 + 1] = 0.3 + Math.random() * 0.3; // G
      colors[i * 3 + 2] = 0.8 + Math.random() * 0.2; // B
    }
    
    return [positions, colors];
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    
    mesh.current.rotation.x = state.clock.getElapsedTime() * 0.02;
    mesh.current.rotation.y = state.clock.getElapsedTime() * 0.03;
    
    // Gentle floating animation
    const positions = mesh.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] += Math.sin(state.clock.getElapsedTime() + i) * 0.002;
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

function FloatingBoxes() {
  const group = useRef<THREE.Group>(null);
  
  const boxes = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5 - 3
      ] as [number, number, number],
      scale: 0.3 + Math.random() * 0.5,
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number],
    }));
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    
    group.current.children.forEach((child, i) => {
      child.rotation.x += 0.005;
      child.rotation.y += 0.01;
      child.position.y += Math.sin(state.clock.getElapsedTime() + i) * 0.005;
    });
  });

  return (
    <group ref={group}>
      {boxes.map((box) => (
        <mesh key={box.id} position={box.position} rotation={box.rotation}>
          <boxGeometry args={[box.scale, box.scale, box.scale]} />
          <meshStandardMaterial
            color="#6366f1"
            transparent
            opacity={0.15}
            wireframe
          />
        </mesh>
      ))}
    </group>
  );
}

function ConnectionLines() {
  const lines = useMemo(() => {
    const points = [];
    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) {
        points.push(
          new THREE.Vector3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5),
          new THREE.Vector3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5)
        );
      }
    }
    return points;
  }, []);

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(lines);
    return geometry;
  }, [lines]);

  return (
    <lineSegments geometry={lineGeometry}>
      <lineBasicMaterial color="#6366f1" transparent opacity={0.1} />
    </lineSegments>
  );
}

export default function ParticleBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <Particles />
        <FloatingBoxes />
        <ConnectionLines />
      </Canvas>
    </div>
  );
}
