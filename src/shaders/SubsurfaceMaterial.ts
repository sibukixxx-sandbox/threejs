import * as THREE from 'three'
import vertexShader from './subsurface.vert'
import fragmentShader from './subsurface.frag'

/**
 * Subsurface Scattering Material
 * 美容系製品（肌、石鹸、ワックスなど）の半透明な質感を表現
 *
 * 使い方:
 * ```ts
 * const material = new SubsurfaceMaterial({
 *   baseColor: new THREE.Color(0xffd4b8), // 肌色
 *   subsurfaceColor: new THREE.Color(0xff6b6b), // 血色
 * })
 * ```
 */

export interface SubsurfaceMaterialOptions {
  baseColor?: THREE.Color
  subsurfaceColor?: THREE.Color
  subsurfaceIntensity?: number
  subsurfacePower?: number
  ambientIntensity?: number
  shininess?: number
  specularStrength?: number
  lightPosition?: THREE.Vector3
  lightColor?: THREE.Color
}

export class SubsurfaceMaterial extends THREE.ShaderMaterial {
  constructor(options: SubsurfaceMaterialOptions = {}) {
    const uniforms = {
      uLightPosition: { value: options.lightPosition || new THREE.Vector3(5, 5, 5) },
      uLightColor: { value: options.lightColor || new THREE.Color(0xffffff) },
      uBaseColor: { value: options.baseColor || new THREE.Color(0xffd4b8) },
      uSubsurfaceColor: { value: options.subsurfaceColor || new THREE.Color(0xff6b6b) },
      uSubsurfaceIntensity: { value: options.subsurfaceIntensity ?? 0.5 },
      uSubsurfacePower: { value: options.subsurfacePower ?? 2.0 },
      uAmbientIntensity: { value: options.ambientIntensity ?? 0.2 },
      uShininess: { value: options.shininess ?? 32.0 },
      uSpecularStrength: { value: options.specularStrength ?? 0.3 }
    }

    super({
      uniforms,
      vertexShader,
      fragmentShader,
      side: THREE.FrontSide,
      transparent: false
    })
  }

  /**
   * ベースカラーを更新
   */
  setBaseColor(color: THREE.Color): void {
    this.uniforms.uBaseColor.value = color
  }

  /**
   * サブサーフェスカラーを更新
   */
  setSubsurfaceColor(color: THREE.Color): void {
    this.uniforms.uSubsurfaceColor.value = color
  }

  /**
   * サブサーフェス強度を更新
   */
  setSubsurfaceIntensity(intensity: number): void {
    this.uniforms.uSubsurfaceIntensity.value = intensity
  }

  /**
   * ライト位置を更新
   */
  setLightPosition(position: THREE.Vector3): void {
    this.uniforms.uLightPosition.value = position
  }

  /**
   * ライトカラーを更新
   */
  setLightColor(color: THREE.Color): void {
    this.uniforms.uLightColor.value = color
  }
}

/**
 * プリセット: 肌
 */
export function createSkinMaterial(): SubsurfaceMaterial {
  return new SubsurfaceMaterial({
    baseColor: new THREE.Color(0xffd4b8),
    subsurfaceColor: new THREE.Color(0xff6b6b),
    subsurfaceIntensity: 0.6,
    subsurfacePower: 2.0,
    shininess: 16.0,
    specularStrength: 0.2
  })
}

/**
 * プリセット: 石鹸・ワックス
 */
export function createWaxMaterial(): SubsurfaceMaterial {
  return new SubsurfaceMaterial({
    baseColor: new THREE.Color(0xfff8dc),
    subsurfaceColor: new THREE.Color(0xffeaa7),
    subsurfaceIntensity: 0.8,
    subsurfacePower: 1.5,
    shininess: 64.0,
    specularStrength: 0.5
  })
}

/**
 * プリセット: ミルク・クリーム
 */
export function createCreamMaterial(): SubsurfaceMaterial {
  return new SubsurfaceMaterial({
    baseColor: new THREE.Color(0xfff5ee),
    subsurfaceColor: new THREE.Color(0xffe4e1),
    subsurfaceIntensity: 0.7,
    subsurfacePower: 1.8,
    shininess: 32.0,
    specularStrength: 0.4
  })
}
