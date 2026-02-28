import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";

/**
 * HACKATHON INSTRUCTIONS:
 * 
 * If you watched the "JavaScript Mastery" 3D portfolio tutorial and want 
 * the literal computer desk (like in your screenshot), you MUST:
 * 1. Put the `desktop_pc` directory into your `public/` folder.
 * 2. Delete the `<AdaptiveCore>` component usage below.
 * 3. Uncomment and use the exact `<ComputerSetup>` component here:
 * 
 * import { useGLTF } from "@react-three/drei";
 * 
 * const ComputerSetup = ({ isMobile }) => {
 *   const computer = useGLTF('./desktop_pc/scene.gltf')
 *   return (
 *     <mesh>
 *       <hemisphereLight intensity={0.15} groundColor="black" />
 *       <pointLight intensity={1} />
 *       <spotLight position={[-20, 50, 10]} angle={0.12} penumbra={1} intensity={1} castShadow shadow-mapSize={1024} />
 *       <primitive 
 *         object={computer.scene} 
 *         scale={isMobile ? 0.7 : 0.75} 
 *         position={isMobile ? [0, -3, -2.2] : [0, -3.25, -1.5]} 
 *         rotation={[-0.01, -0.2, -0.1]} 
 *       />
 *     </mesh>
 *   )
 * }
 */

// Procedural 3D model that works out-of-the-box without needing external assets
const AdaptiveCore = () => {
  return (
    <Float speed={2.5} rotationIntensity={1.5} floatIntensity={2}>
      {/* Inner glowing morphing sphere representing the "AI Brain" */}
      <mesh scale={1.8}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial 
          color="#4FC3F7" 
          distort={0.4} 
          speed={3} 
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.8}
        />
      </mesh>
      {/* Outer structural wireframe representing "System Structure/Control" */}
      <mesh scale={1.8}>
        <icosahedronGeometry args={[1.2, 2]} />
        <meshStandardMaterial color="#10B981" wireframe transparent opacity={0.3} />
      </mesh>
    </Float>
  )
}

export default function ComputerModel() {
  return (
    <div style={{ height: "100%", width: "100%", minHeight: "400px", position: "relative" }}>
      <Canvas 
        frameloop="always" 
        shadows 
        camera={{ position: [0, 0, 10], fov: 45 }} 
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        style={{ zIndex: 10 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#4FC3F7" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#EF4444" />
        <pointLight position={[0, 0, 0]} intensity={2} color="#10B981" />
        
        <Suspense fallback={null}>
          <OrbitControls 
            enableZoom={false} 
            autoRotate 
            autoRotateSpeed={0.8}
            maxPolarAngle={Math.PI / 2 + 0.2} 
            minPolarAngle={Math.PI / 2 - 0.2} 
          />
          
          {/* To swap to your PC model, replace <AdaptiveCore /> with <ComputerSetup isMobile={false} /> */}
          <AdaptiveCore />
          
          <Sparkles count={300} scale={12} size={2.5} color="#4FC3F7" speed={0.4} opacity={0.6} />
          <Sparkles count={100} scale={8} size={4} color="#10B981" speed={0.8} opacity={0.8} />
        </Suspense>
        
        <Preload all />
      </Canvas>
    </div>
  );
}
