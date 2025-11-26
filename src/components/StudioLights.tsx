import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useSceneStore } from '../store/sceneStore'

/**
 * Studio Lights Component
 * React Three Fiberを使った3点照明
 */
export function StudioLights() {
  const keyLightRef = useRef<THREE.DirectionalLight>(null!)
  const fillLightRef = useRef<THREE.DirectionalLight>(null!)
  const backLightRef = useRef<THREE.DirectionalLight>(null!)
  const ambientLightRef = useRef<THREE.AmbientLight>(null!)

  const lighting = useSceneStore((state) => state.lighting)

  // 照明の強度を更新
  useEffect(() => {
    if (keyLightRef.current) keyLightRef.current.intensity = lighting.keyIntensity
    if (fillLightRef.current) fillLightRef.current.intensity = lighting.fillIntensity
    if (backLightRef.current) backLightRef.current.intensity = lighting.backIntensity
    if (ambientLightRef.current) ambientLightRef.current.intensity = lighting.ambientIntensity
  }, [lighting])

  return (
    <>
      {/* Key Light */}
      <directionalLight
        ref={keyLightRef}
        position={[5, 5, 5]}
        intensity={lighting.keyIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Fill Light */}
      <directionalLight
        ref={fillLightRef}
        position={[-5, 0, 3]}
        intensity={lighting.fillIntensity}
      />

      {/* Back Light */}
      <directionalLight
        ref={backLightRef}
        position={[0, 5, -5]}
        intensity={lighting.backIntensity}
      />

      {/* Ambient Light */}
      <ambientLight
        ref={ambientLightRef}
        intensity={lighting.ambientIntensity}
      />
    </>
  )
}
