import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Icosahedron, TorusKnot, RoundedBox, Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';

interface HeroSceneProps {
  currentSlide: number;
}

// --- VISUAL 1: THE CORE (OS) ---
const TheCore = () => {
  return (
    <group position={[0, 0, 0]}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Icosahedron args={[1.5, 0]} position={[0, 0, 0]}>
          <MeshDistortMaterial
            color="#0ea5e9"
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0.2}
            metalness={0.8}
          />
        </Icosahedron>
      </Float>
      {/* Orbiting Rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.02, 16, 100]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.5} />
      </mesh>
      <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[3, 0.02, 16, 100]} />
        <meshStandardMaterial color="#bae6fd" emissive="#bae6fd" emissiveIntensity={0.2} />
      </mesh>
      <Sparkles count={50} scale={6} size={4} speed={0.4} opacity={0.5} color="#bae6fd" />
    </group>
  );
};

// --- VISUAL 2: WEALTH (Analytics) ---
const WealthMonoliths = () => {
  const bars = [
    { pos: [-1.5, -1, 0.5], scale: [0.8, 2, 0.8], color: '#10b981' },
    { pos: [0, -0.5, -0.5], scale: [1, 3.5, 1], color: '#34d399' },
    { pos: [1.5, -1.5, 0.5], scale: [0.8, 1.5, 0.8], color: '#059669' },
  ];

  return (
    <group position={[15, 0, 0]}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        {bars.map((bar, idx) => (
          <RoundedBox key={idx} args={bar.scale as [number, number, number]} radius={0.1} smoothness={4} position={bar.pos as [number, number, number]}>
            <meshStandardMaterial 
                color={bar.color} 
                roughness={0.1} 
                metalness={0.6} 
                envMapIntensity={1}
            />
          </RoundedBox>
        ))}
        {/* Floating Coins/Particles */}
        <Sparkles count={40} scale={5} size={3} speed={0.4} opacity={0.6} color="#d1fae5" />
      </Float>
    </group>
  );
};

// --- VISUAL 3: SECURITY (Swiss Vault) ---
const SecurityVault = () => {
  return (
    <group position={[30, 0, 0]}>
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
        {/* Outer Shield Shell */}
        <Sphere args={[1.8, 32, 32]} position={[0, 0, 0]}>
           <meshPhysicalMaterial 
              color="#ffffff" 
              transmission={0.6} 
              opacity={0.3} 
              transparent 
              roughness={0} 
              ior={1.5} 
              thickness={1}
           />
        </Sphere>
        
        {/* Inner Lock Core */}
        <TorusKnot args={[0.8, 0.25, 100, 16]} position={[0, 0, 0]}>
           <meshStandardMaterial color="#dc2626" roughness={0.3} metalness={0.8} emissive="#991b1b" emissiveIntensity={0.5} />
        </TorusKnot>

        {/* Floating Cross Elements */}
        <group position={[0, 0, 1.2]}>
             <mesh position={[0,0,0]}>
                <boxGeometry args={[0.8, 0.2, 0.1]} />
                <meshStandardMaterial color="white" />
             </mesh>
             <mesh position={[0,0,0]}>
                <boxGeometry args={[0.2, 0.8, 0.1]} />
                <meshStandardMaterial color="white" />
             </mesh>
        </group>
      </Float>
       <Sparkles count={50} scale={5} size={2} speed={0.2} opacity={0.8} color="#fecaca" />
    </group>
  );
};

const CameraController = ({ currentSlide }: { currentSlide: number }) => {
    // Using a ref to store the target vector to avoid recreating it on every render
    const targetPos = useRef(new THREE.Vector3(0, 0, 8));
    
    useEffect(() => {
        const xPos = currentSlide * 15; // 0, 15, 30
        targetPos.current.set(xPos, 0, 8);
    }, [currentSlide]);

    useFrame((state, delta) => {
        // Smooth interpolation
        state.camera.position.lerp(targetPos.current, 2.5 * delta);
        state.camera.lookAt(state.camera.position.x, 0, 0); // Always look forward relative to current position
    });

    return null;
}

export const HeroScene: React.FC<HeroSceneProps> = ({ currentSlide }) => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
         {/* Lights */}
         <ambientLight intensity={0.4} />
         <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
         <pointLight position={[-10, -10, -5]} intensity={0.5} color="#0ea5e9" />
         
         {/* Background */}
         <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
         
         {/* Scene Logic */}
         <CameraController currentSlide={currentSlide} />

         {/* Zones */}
         <TheCore />
         <WealthMonoliths />
         <SecurityVault />
         
         {/* Atmosphere */}
         <fog attach="fog" args={['#020617', 5, 25]} />
      </Canvas>
    </div>
  );
};