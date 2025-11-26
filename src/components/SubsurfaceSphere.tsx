import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSceneStore } from '../store/sceneStore'
import vertexShader from '../shaders/subsurface.vert'
import fragmentShader from '../shaders/subsurface.frag'

/**
 * Subsurface Scattering Sphere Component
 * React Three Fiberを使ったサブサーフェススキャッタリングの球体
 */
export function SubsurfaceSphere() {
  const meshRef = useRef<THREE.Mesh>(null!)

  // Zustandストアから状態を取得
  const material = useSceneStore((state) => state.material)
  const rotationSpeed = useSceneStore((state) => state.rotationSpeed)

  // ShaderMaterialをuseMemoでメモ化
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uLightPosition: { value: new THREE.Vector3(5, 5, 5) },
        uLightColor: { value: new THREE.Color(0xffffff) },
        uBaseColor: { value: new THREE.Color(material.baseColor) },
        uSubsurfaceColor: { value: new THREE.Color(material.subsurfaceColor) },
        uSubsurfaceIntensity: { value: material.subsurfaceIntensity },
        uSubsurfacePower: { value: material.subsurfacePower },
        uAmbientIntensity: { value: 0.2 },
        uShininess: { value: material.shininess },
        uSpecularStrength: { value: material.specularStrength }
      },
      vertexShader,
      fragmentShader,
      side: THREE.FrontSide
    })
  }, [])

  // マテリアルのパラメータを更新
  useEffect(() => {
    if (shaderMaterial) {
      shaderMaterial.uniforms.uBaseColor.value = new THREE.Color(material.baseColor)
      shaderMaterial.uniforms.uSubsurfaceColor.value = new THREE.Color(material.subsurfaceColor)
      shaderMaterial.uniforms.uSubsurfaceIntensity.value = material.subsurfaceIntensity
      shaderMaterial.uniforms.uSubsurfacePower.value = material.subsurfacePower
      shaderMaterial.uniforms.uShininess.value = material.shininess
      shaderMaterial.uniforms.uSpecularStrength.value = material.specularStrength
    }
  }, [material, shaderMaterial])

  // アニメーション
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * rotationSpeed
    }
  })

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <sphereGeometry args={[1, 64, 64]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  )
}
