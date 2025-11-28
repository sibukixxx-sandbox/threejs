import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ChampagneTower } from '../utils/ChampagneTower'
import { useChampagneStore } from '../store/champagneStore'

/**
 * ChampagneTowerComponent - React Three Fiberでシャンパンタワーを表示
 *
 * 機能:
 * - Zustandストアからパラメータを取得
 * - パラメータ変更時に自動的にタワーを更新
 * - autoRotateが有効な場合、タワーを回転
 */
export function ChampagneTowerComponent() {
  const towerRef = useRef<ChampagneTower | null>(null)
  const groupRef = useRef<THREE.Group>(null)

  const {
    levels,
    glassSize,
    spacing,
    liquidColor,
    metalness,
    roughness,
    transmission,
    thickness,
    clearcoat,
    autoRotate,
    rotationSpeed,
  } = useChampagneStore()

  // 初期化: ChampagneTowerインスタンスを作成
  useEffect(() => {
    const tower = new ChampagneTower({
      levels,
      glassSize,
      spacing,
      liquidColor,
      metalness,
      roughness,
      transmission,
      thickness,
      clearcoat,
    })

    towerRef.current = tower

    // グループに追加
    if (groupRef.current) {
      groupRef.current.add(tower.getGroup())
    }

    return () => {
      tower.dispose()
      towerRef.current = null
    }
  }, [])

  // パラメータ変更時に更新
  useEffect(() => {
    if (towerRef.current) {
      towerRef.current.updateParams({
        levels,
        glassSize,
        spacing,
        liquidColor,
        metalness,
        roughness,
        transmission,
        thickness,
        clearcoat,
      })
    }
  }, [levels, glassSize, spacing, liquidColor, metalness, roughness, transmission, thickness, clearcoat])

  // アニメーションループ
  useFrame(() => {
    if (autoRotate && towerRef.current) {
      towerRef.current.rotate(rotationSpeed)
    }
  })

  return <group ref={groupRef} />
}
