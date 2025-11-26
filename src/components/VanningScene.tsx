import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import * as THREE from 'three'
import { VanningSimulatorComponent, CenterOfGravityMarker, GroundPlane } from './VanningSimulatorComponent'

/**
 * Vanning Scene Component
 * Vanning Simulator用のメインシーン
 */
export function VanningScene() {
  return (
    <Canvas
      shadows
      camera={{ position: [8, 6, 8], fov: 50 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0
      }}
    >
      {/* 背景色 */}
      <color attach="background" args={['#1a1a1a']} />

      {/* 照明 */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />

      {/* グリッド */}
      <Grid
        args={[50, 50]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6f6f6f"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#9d4b4b"
        fadeDistance={50}
        fadeStrength={1}
        followCamera={false}
      />

      {/* 床面 */}
      <GroundPlane />

      {/* Vanning Simulator */}
      <VanningSimulatorComponent />

      {/* 重心マーカー */}
      <CenterOfGravityMarker />

      {/* OrbitControls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  )
}
