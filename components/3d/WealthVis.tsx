import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Billboard, RoundedBox, SoftShadows, Grid, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import { Asset, AssetType } from '../../types';

interface WealthVisProps {
  assets: Asset[];
}

interface AssetBarProps {
  position: [number, number, number];
  targetHeight: number;
  color: string;
  label: string;
  valueFormatted: string;
  index: number;
}

const AssetBar: React.FC<AssetBarProps> = ({ position, targetHeight, color, label, valueFormatted, index }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  
  // Change cursor to pointer on hover
  useCursor(hovered);
  
  // Animation logic: Smoothly grow bars on load
  useFrame((state, delta) => {
    if (meshRef.current) {
      const currentHeight = meshRef.current.scale.y;
      // Linear interpolation for smooth growth
      const lerpSpeed = 4;
      
      // Calculate new height
      const newHeight = THREE.MathUtils.lerp(currentHeight, targetHeight, delta * lerpSpeed);
      meshRef.current.scale.y = newHeight;
      
      // Adjust y position so it grows from bottom up (pivot is center by default)
      // Height of geometry is 1. If scale is 5, height is 5. Center is 2.5.
      meshRef.current.position.y = newHeight / 2;
      
      // Hover animation (pulse & color intensity)
      if (hovered) {
          // Subtle rotation pulse
          meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0.2, delta * 5);
          // Scale pulse
          meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, 1.1, delta * 10);
          meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, 1.1, delta * 10);
      } else {
          meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0, delta * 5);
          meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, 1, delta * 10);
          meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, 1, delta * 10);
      }
    }
  });

  return (
    <group position={position}>
      {/* The Bar */}
      <RoundedBox
        ref={meshRef}
        args={[1, 1, 1]} // Width, Height, Depth relative base
        radius={0.15} // Rounded corners
        smoothness={4}
        scale={[1, 0.01, 1]} // Start very small
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
        onPointerOut={() => setHover(false)}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial 
          color={color}
          roughness={0.2} 
          metalness={0.1}
          transmission={0.1} // Slight glass effect
          thickness={1}
          emissive={color}
          emissiveIntensity={hovered ? 0.6 : 0.2} // Glow on hover
        />
      </RoundedBox>

      {/* Label - Uses Billboard to always face camera */}
      <group position={[0, targetHeight + 0.8, 0]}>
        <Float speed={2} rotationIntensity={0} floatIntensity={0.2} floatingRange={[0, 0.2]}>
          <Billboard>
            <Text
              fontSize={0.35}
              color="white"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#000000"
              position={[0, 0.25, 0]}
            >
              {label}
            </Text>
            
            {/* Value Label (only visible on hover or if bar is large enough) */}
            <Text
              fontSize={0.28}
              color={hovered ? "#4ade80" : "#94a3b8"} // Green on hover, slate otherwise
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#000000"
              position={[0, -0.2, 0]}
              fillOpacity={hovered ? 1 : 0.7}
            >
              {valueFormatted}
            </Text>
          </Billboard>
        </Float>
      </group>
      
      {/* Base Ring for context */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.6, 0.65, 32]} />
        <meshBasicMaterial color={color} opacity={0.3} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

export const WealthVis: React.FC<WealthVisProps> = ({ assets }) => {
  // 1. Prepare Data for 3D
  // Group assets by Type
  const data = useMemo(() => {
    const grouped = assets.reduce((acc, curr) => {
       acc[curr.type] = (acc[curr.type] || 0) + curr.value;
       return acc;
    }, {} as Record<string, number>);

    // Determine max value for scaling height
    const vals = Object.values(grouped) as number[];
    const maxVal = Math.max(...vals, 1);
    const maxHeight = 6; // Max 3D units height

    return Object.entries(grouped).map(([type, value]: [string, number], idx, arr) => {
        const height = (value / maxVal) * maxHeight;
        // Position in a circle
        const angle = (idx / arr.length) * Math.PI * 2;
        const radius = 3;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        // Color mapping
        let color = '#cbd5e1';
        switch(type as AssetType) {
            case AssetType.CASH: color = '#3b82f6'; break;
            case AssetType.REAL_ESTATE: color = '#6366f1'; break;
            case AssetType.SECURITIES: color = '#10b981'; break;
            case AssetType.PILLAR_3A: color = '#f59e0b'; break;
            case AssetType.PENSION_FUND: color = '#ef4444'; break;
        }

        return {
            type,
            value,
            height: Math.max(height, 0.5), // Min height
            position: [x, 0, z] as [number, number, number],
            color,
            label: type.replace('_', ' '),
            valueFormatted: `CHF ${(value / 1000).toFixed(0)}k`
        };
    });
  }, [assets]);

  return (
    <div className="h-[400px] w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden relative">
      <Canvas shadows camera={{ position: [0, 6, 10], fov: 45 }}>
        <fog attach="fog" args={['#0f172a', 5, 20]} />
        
        {/* Lights */}
        <ambientLight intensity={0.5} />
        <spotLight 
            position={[10, 10, 10]} 
            angle={0.15} 
            penumbra={1} 
            intensity={1} 
            castShadow 
            shadow-mapSize={[2048, 2048]} 
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />

        {/* Controls */}
        <OrbitControls 
            enablePan={false} 
            minPolarAngle={Math.PI / 4} 
            maxPolarAngle={Math.PI / 2.2}
            autoRotate
            autoRotateSpeed={0.5}
        />

        {/* Scene Objects */}
        <group position={[0, -1, 0]}>
            {/* Floor */}
            <Grid 
                renderOrder={-1} 
                position={[0, 0, 0]} 
                infiniteGrid 
                cellSize={1} 
                sectionSize={3} 
                fadeDistance={20} 
                sectionColor="#334155" 
                cellColor="#1e293b" 
            />
            
            {/* The Bars */}
            {data.map((item, idx) => (
                <AssetBar 
                    key={item.type}
                    index={idx}
                    position={item.position}
                    targetHeight={item.height}
                    color={item.color}
                    label={item.label}
                    valueFormatted={item.valueFormatted}
                />
            ))}

            {/* Center Platform */}
            <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
                <circleGeometry args={[4, 32]} />
                <meshStandardMaterial color="#1e293b" transparent opacity={0.5} />
            </mesh>
        </group>

        <SoftShadows size={10} samples={10} focus={0} />
      </Canvas>

      <div className="absolute bottom-4 left-4 text-xs text-slate-400 pointer-events-none">
          <p>Interaktive 3D Ansicht</p>
          <p>Klicken & Ziehen zum Drehen</p>
      </div>
    </div>
  );
};