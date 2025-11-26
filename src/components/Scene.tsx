import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useSceneStore } from '../store/sceneStore'
import { SubsurfaceSphere } from './SubsurfaceSphere'
import { StudioLights } from './StudioLights'

/**
 * Main Scene Component
 * React Three Fiberを使ったメインシーン
 */
export function Scene() {
  const backgroundColor = useSceneStore((state) => state.backgroundColor)

  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 5], fov: 50 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0
      }}
    >
      {/* 背景色 */}
      <color attach="background" args={[backgroundColor]} />

      {/* Studio Lighting */}
      <StudioLights />

      {/* メインオブジェクト */}
      <SubsurfaceSphere />

      {/* OrbitControls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  )
}
