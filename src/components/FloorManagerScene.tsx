import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { FloorManagerComponent } from './FloorManagerComponent'
import { useFloorStore } from '../store/floorStore'

/**
 * FloorManagerScene - フロア管理3Dマップのメインシーン
 *
 * 構成:
 * - Canvas (React Three Fiber)
 * - FloorManagerComponent (フロア＋テーブル)
 * - ライティング (Ambient + Spotlight)
 * - OrbitControls (カメラ操作)
 * - Fog (奥行き感の演出)
 */
export function FloorManagerScene() {
  const {
    ambientIntensity,
    spotlightIntensity,
    spotlightColor,
  } = useFloorStore()

  return (
    <Canvas
      camera={{ position: [0, 15, 15], fov: 45 }}
      shadows
      onCreated={({ scene, gl }) => {
        scene.background = new THREE.Color(0x050505)
        scene.fog = new THREE.FogExp2(0x050505, 0.03)
        gl.shadowMap.enabled = true
        gl.shadowMap.type = THREE.PCFSoftShadowMap
      }}
    >
      {/* アンビエントライト */}
      <ambientLight intensity={ambientIntensity} />

      {/* スポットライト（メイン照明） */}
      <spotLight
        position={[0, 20, 0]}
        angle={Math.PI / 4}
        penumbra={0.5}
        intensity={spotlightIntensity}
        color={new THREE.Color(spotlightColor)}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* アクセントライト（ムーディーな照明） */}
      <pointLight
        position={[-10, 8, -10]}
        intensity={30}
        distance={30}
        color={new THREE.Color(0xff00ff)}
      />

      <pointLight
        position={[10, 8, 10]}
        intensity={30}
        distance={30}
        color={new THREE.Color(0x00ffff)}
      />

      {/* フロア管理システム */}
      <FloorManagerComponent />

      {/* カメラコントロール */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={5}
        maxDistance={40}
      />
    </Canvas>
  )
}
