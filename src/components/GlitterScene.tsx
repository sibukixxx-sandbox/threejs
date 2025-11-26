import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { GlitterObject } from './GlitterObject'
import { useGlitterStore } from '@/store/glitterStore'

/**
 * Glitter Scene Component
 * ラメ・パール感シミュレーター用のメインシーン
 */
export function GlitterScene() {
  const backgroundColor = useGlitterStore((state) => state.backgroundColor)

  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 4], fov: 50 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0
      }}
    >
      {/* 背景色 */}
      <color attach="background" args={[backgroundColor]} />

      {/* 照明 */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-5, 3, -5]} intensity={0.5} />
      <pointLight position={[0, 3, 0]} intensity={0.8} />

      {/* Glitterオブジェクト */}
      <GlitterObject />

      {/* OrbitControls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={10}
      />
    </Canvas>
  )
}
