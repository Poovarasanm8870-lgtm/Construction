import React, { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { RotateCcw, Camera } from 'lucide-react';

function OptimizedHouseMesh({ config }) {
  const { sqft = 2200, floors = 2, style = 'MODERN', roofType = 'FLAT', wallColor = '#d97706' } = config;

  const footprintSqft = sqft / floors;
  const sideLength = useMemo(() => Math.max(3.8, Math.min(10.5, Math.sqrt(footprintSqft) * 0.15)), [footprintSqft]);
  const floorHeight = 1.45;
  const totalBuildingHeight = floors * floorHeight;

  // Lightweight Materials
  const wallMaterial = useMemo(() => {
    switch (style) {
      case 'COLONIAL':
        return new THREE.MeshStandardMaterial({ color: wallColor || '#b91c1c', roughness: 0.8 });
      case 'MINIMALIST':
        return new THREE.MeshStandardMaterial({ color: wallColor || '#64748b', roughness: 0.85 });
      case 'NORDIC':
        return new THREE.MeshStandardMaterial({ color: wallColor || '#d97706', roughness: 0.7 });
      case 'FUTURISTIC':
        return new THREE.MeshStandardMaterial({ color: wallColor || '#7c3aed', roughness: 0.2, metalness: 0.5 });
      case 'MODERN':
      default:
        return new THREE.MeshStandardMaterial({ color: wallColor || '#d97706', roughness: 0.4, metalness: 0.2 });
    }
  }, [style, wallColor]);

  const glassMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.7,
    });
  }, []);

  const roofOverhang = sideLength + 0.5;

  return (
    <group position={[0, 0, 0]}>
      {/* Foundation Concrete Slab */}
      <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[sideLength + 0.8, 0.3, sideLength + 0.8]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.9} />
      </mesh>

      {/* Building Floors */}
      {Array.from({ length: floors }).map((_, idx) => {
        const floorY = 0.3 + idx * floorHeight + floorHeight / 2;
        return (
          <group key={`floor-${idx}`}>
            {/* Main Wall Box */}
            <mesh position={[0, floorY, 0]} material={wallMaterial} castShadow receiveShadow>
              <boxGeometry args={[sideLength, floorHeight - 0.04, sideLength]} />
            </mesh>

            {/* Front & Back Windows */}
            <mesh position={[0, floorY, sideLength / 2 + 0.02]} material={glassMaterial}>
              <boxGeometry args={[sideLength * 0.6, floorHeight * 0.5, 0.03]} />
            </mesh>
            <mesh position={[0, floorY, -sideLength / 2 - 0.02]} material={glassMaterial}>
              <boxGeometry args={[sideLength * 0.6, floorHeight * 0.5, 0.03]} />
            </mesh>

            {/* Trim Line */}
            <mesh position={[0, floorY + floorHeight / 2, 0]}>
              <boxGeometry args={[sideLength + 0.1, 0.06, sideLength + 0.1]} />
              <meshStandardMaterial color="#0f172a" roughness={0.3} />
            </mesh>
          </group>
        );
      })}

      {/* Roof Structure */}
      {roofType === 'GABLED' ? (
        <mesh position={[0, totalBuildingHeight + 0.7, 0]} castShadow>
          <coneGeometry args={[roofOverhang * 0.75, 1.4, 4]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
      ) : roofType === 'HIP' ? (
        <mesh position={[0, totalBuildingHeight + 0.6, 0]} castShadow rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[roofOverhang * 0.7, 1.2, 4]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>
      ) : roofType === 'SLANTED' ? (
        <mesh position={[0, totalBuildingHeight + 0.2, 0]} rotation={[0.12, 0, 0]} castShadow>
          <boxGeometry args={[roofOverhang, 0.2, roofOverhang]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} />
        </mesh>
      ) : (
        <mesh position={[0, totalBuildingHeight + 0.1, 0]} castShadow>
          <boxGeometry args={[roofOverhang, 0.2, roofOverhang]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
      )}

      {/* Floating 3D Dimension Tag */}
      <Html position={[0, totalBuildingHeight + 1.8, 0]} center distanceFactor={11}>
        <div className="bg-white/95 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold text-slate-900 border border-slate-300 shadow-lg flex items-center space-x-2 whitespace-nowrap">
          <span className="text-amber-600">{sqft.toLocaleString()} sq ft</span>
          <span className="text-slate-300">|</span>
          <span>{floors} {floors > 1 ? 'Floors' : 'Floor'}</span>
          <span className="text-slate-300">|</span>
          <span>{(totalBuildingHeight * 3.28).toFixed(1)} ft</span>
        </div>
      </Html>
    </group>
  );
}

export function HouseVisualizer({ config }) {
  const controlsRef = useRef();

  const setCameraPreset = (mode) => {
    if (!controlsRef.current) return;
    if (mode === 'top') {
      controlsRef.current.object.position.set(0, 16, 0.01);
      controlsRef.current.target.set(0, 0, 0);
    } else if (mode === 'front') {
      controlsRef.current.object.position.set(0, 4, 15);
      controlsRef.current.target.set(0, 2, 0);
    } else if (mode === 'iso') {
      controlsRef.current.object.position.set(11, 9, 11);
      controlsRef.current.target.set(0, 2, 0);
    } else {
      controlsRef.current.reset();
    }
    controlsRef.current.update();
  };

  return (
    <div className="relative w-full h-[480px] lg:h-[600px] rounded-3xl overflow-hidden bg-[#F1F5F9] border border-slate-200 shadow-lg group">
      
      {/* Top Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto bg-white/90 px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-800">3D Interactive Studio</span>
        </div>

        <div className="pointer-events-auto flex items-center space-x-1.5 p-1 rounded-xl bg-white/90 border border-slate-200 shadow-sm">
          <button
            onClick={() => setCameraPreset('iso')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
          >
            3D Iso
          </button>
          <button
            onClick={() => setCameraPreset('top')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
          >
            Top 2D
          </button>
          <button
            onClick={() => setCameraPreset('front')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
          >
            Front
          </button>
          <button
            onClick={() => setCameraPreset('reset')}
            className="p-1 rounded-lg text-slate-500 hover:text-amber-600"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* R3F High-Performance Canvas */}
      <Canvas
        shadows={false}
        camera={{ position: [10, 8, 12], fov: 45 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={['#f1f5f9']} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[12, 18, 10]} intensity={1.2} />
        <directionalLight position={[-10, 10, -10]} intensity={0.4} />

        <OptimizedHouseMesh config={config} />

        <gridHelper args={[28, 28, '#cbd5e1', '#e2e8f0']} position={[0, -0.01, 0]} />

        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2 - 0.02}
          minDistance={4}
          maxDistance={30}
        />
      </Canvas>
    </div>
  );
}
