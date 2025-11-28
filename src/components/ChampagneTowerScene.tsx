import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { ChampagneTowerComponent } from './ChampagneTowerComponent'
import { useChampagneStore } from '../store/champagneStore'

/**
 * ChampagneTowerScene - シャンパンタワーのメインシーン
 *
 * 構成:
 * - Canvas (React Three Fiber)
 * - ChampagneTowerComponent (タワー本体)
 * - ライティング (2つのポイントライト + アンビエントライト)
 * - OrbitControls (カメラ操作)
 * - Fog (奥行き感の演出)
 */
export function ChampagneTowerScene() {
  const {
    lightIntensity1,
    lightIntensity2,
    lightColor1,
    lightColor2,
  } = useChampagneStore()

  return (
    <Canvas
      camera={{ position: [8, 6, 8], fov: 50 }}
      onCreated={({ scene, camera }) => {
        scene.background = new THREE.Color(0x111111)
        scene.fog = new THREE.Fog(0x111111, 10, 50)
        camera.lookAt(0, 2, 0)
      }}
    >
      {/* アンビエントライト */}
      <ambientLight intensity={0.5} />

      {/* メインライト（ゴールド系） */}
      <pointLight
        position={[5, 10, 5]}
        intensity={lightIntensity1}
        distance={50}
        color={new THREE.Color(lightColor1)}
        castShadow
      />

      {/* アクセントライト（ブルー系） */}
      <pointLight
        position={[-5, 5, -5]}
        intensity={lightIntensity2}
        distance={50}
        color={new THREE.Color(lightColor2)}
      />

      {/* シャンパンタワー */}
      <ChampagneTowerComponent />

      {/* カメラコントロール */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        target={[0, 2, 0]}
      />
    </Canvas>
  )
}
