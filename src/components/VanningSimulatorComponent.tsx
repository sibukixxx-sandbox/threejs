import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { VanningSimulator } from '@/utils/VanningSimulator'
import { LOADING_STRATEGIES } from '@/utils/loadingStrategies'
import { useVanningStore } from '@/store/vanningStore'

/**
 * Vanning Simulator Component
 * React Three Fiberを使ったVanningシミュレーターの統合
 */
export function VanningSimulatorComponent() {
  const simulatorRef = useRef<VanningSimulator | null>(null)
  const { scene } = useThree()

  // Zustandストアから状態を取得
  const container = useVanningStore((state) => state.container)
  const cargo = useVanningStore((state) => state.cargo)
  const algorithm = useVanningStore((state) => state.algorithm)
  const setLoadingStats = useVanningStore((state) => state.setLoadingStats)
  const cargoColor = useVanningStore((state) => state.cargoColor)

  // 初期化
  useEffect(() => {
    const strategy = LOADING_STRATEGIES[algorithm]
    simulatorRef.current = new VanningSimulator(scene, strategy)

    return () => {
      if (simulatorRef.current) {
        simulatorRef.current.dispose()
      }
    }
  }, [scene])

  // アルゴリズム変更時
  useEffect(() => {
    if (simulatorRef.current) {
      const strategy = LOADING_STRATEGIES[algorithm]
      simulatorRef.current.setStrategy(strategy)
    }
  }, [algorithm])

  // 貨物の色変更
  useEffect(() => {
    if (simulatorRef.current) {
      const mesh = simulatorRef.current.getCargoMesh()
      if (mesh) {
        const material = mesh.material as THREE.MeshStandardMaterial
        material.color.set(cargoColor)
      }
    }
  }, [cargoColor])

  // コンテナ・貨物の更新
  useEffect(() => {
    if (!simulatorRef.current) return

    // コンテナ更新
    simulatorRef.current.updateContainer(container)

    // シミュレーション実行
    const result = simulatorRef.current.simulateLoading(container, cargo)

    // 警告メッセージの生成
    const warnings: string[] = []

    // 容積利用率が低い場合の警告
    if (result.volumeUtilization < 0.5) {
      warnings.push('容積利用率が50%未満です。貨物サイズの見直しを検討してください。')
    }

    // 重心が中心から大きくずれている場合の警告
    const cogOffset = Math.sqrt(
      result.centerOfGravity.x ** 2 +
      result.centerOfGravity.z ** 2
    )
    if (cogOffset > 1.0) {
      warnings.push('重心が中心から大きくずれています。荷崩れの危険性があります。')
    }

    // 高さ方向の重心チェック
    if (result.centerOfGravity.y > container.height * 0.7) {
      warnings.push('重心が高すぎます。転倒のリスクがあります。')
    }

    // 統計情報を更新
    setLoadingStats({
      count: result.count,
      volumeUtilization: result.volumeUtilization,
      centerOfGravity: {
        x: result.centerOfGravity.x,
        y: result.centerOfGravity.y,
        z: result.centerOfGravity.z
      },
      warningMessages: warnings
    })
  }, [container, cargo, algorithm, setLoadingStats])

  return null
}

/**
 * Center of Gravity Marker
 * 重心位置を表示するマーカー
 */
export function CenterOfGravityMarker() {
  const loadingStats = useVanningStore((state) => state.loadingStats)
  const showCenterOfGravity = useVanningStore((state) => state.showCenterOfGravity)

  if (!loadingStats || !showCenterOfGravity) return null

  const { centerOfGravity } = loadingStats

  return (
    <group position={[centerOfGravity.x, centerOfGravity.y, centerOfGravity.z]}>
      {/* 中心の球 */}
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>

      {/* X軸（赤） */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([-0.5, 0, 0, 0.5, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ff0000" linewidth={2} />
      </line>

      {/* Y軸（緑） */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, -0.5, 0, 0, 0.5, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00ff00" linewidth={2} />
      </line>

      {/* Z軸（青） */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, -0.5, 0, 0, 0.5])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#0000ff" linewidth={2} />
      </line>
    </group>
  )
}

/**
 * Ground Plane
 * 床面を表示
 */
export function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color="#808080" roughness={0.8} />
    </mesh>
  )
}
