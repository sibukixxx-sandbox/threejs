import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GlitterMaterial } from '@/shaders/GlitterMaterial'
import { useGlitterStore } from '@/store/glitterStore'

/**
 * Glitter Object Component
 * ラメ・パール感のある3Dオブジェクトを表示
 */
export function GlitterObject() {
  const meshRef = useRef<THREE.Mesh>(null!)

  // Zustandストアから状態を取得
  const params = useGlitterStore((state) => state.params)
  const objectType = useGlitterStore((state) => state.objectType)
  const rotationSpeed = useGlitterStore((state) => state.rotationSpeed)

  // GlitterMaterialをuseMemoでメモ化
  const glitterMaterial = useMemo(() => {
    return new GlitterMaterial({
      baseColor: params.baseColor,
      glitterColor: params.glitterColor,
      glitterScale: params.glitterScale,
      glitterStrength: params.glitterStrength
    })
  }, [])

  // マテリアルのパラメータを更新
  useEffect(() => {
    if (glitterMaterial) {
      glitterMaterial.setBaseColor(params.baseColor)
      glitterMaterial.setGlitterColor(params.glitterColor)
      glitterMaterial.setGlitterScale(params.glitterScale)
      glitterMaterial.setGlitterStrength(params.glitterStrength)
    }
  }, [params, glitterMaterial])

  // ジオメトリを動的に生成
  const geometry = useMemo(() => {
    switch (objectType) {
      case 'sphere':
        return new THREE.SphereGeometry(1, 64, 64)
      case 'cylinder':
        return new THREE.CylinderGeometry(0.7, 0.7, 2, 64)
      case 'torus':
        return new THREE.TorusGeometry(0.8, 0.3, 32, 64)
      default:
        return new THREE.SphereGeometry(1, 64, 64)
    }
  }, [objectType])

  // アニメーション
  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * rotationSpeed
      meshRef.current.rotation.x += delta * rotationSpeed * 0.5
    }

    // 時間を更新してきらめきアニメーション
    if (glitterMaterial) {
      glitterMaterial.updateTime(delta)
    }
  })

  // クリーンアップ
  useEffect(() => {
    return () => {
      geometry.dispose()
      glitterMaterial.dispose()
    }
  }, [geometry, glitterMaterial])

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
      <primitive object={glitterMaterial} attach="material" />
    </mesh>
  )
}
