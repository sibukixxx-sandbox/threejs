import * as THREE from 'three'
import { LightingConfig, DEFAULT_LIGHTING_CONFIG } from './config'

/**
 * Studio Lighting Setup
 * 美容系製品用の3点照明システム
 * Geminiで量産する際のテンプレート
 */
export class StudioLighting {
  private keyLight: THREE.DirectionalLight
  private fillLight: THREE.DirectionalLight
  private backLight: THREE.DirectionalLight
  private ambientLight: THREE.AmbientLight
  private group: THREE.Group

  constructor(config: LightingConfig = DEFAULT_LIGHTING_CONFIG) {
    this.group = new THREE.Group()

    // Key Light: メインの照明
    this.keyLight = new THREE.DirectionalLight(
      config.keyLight.color,
      config.keyLight.intensity
    )
    this.keyLight.position.set(...config.keyLight.position)
    this.keyLight.castShadow = true
    this.keyLight.shadow.mapSize.width = 2048
    this.keyLight.shadow.mapSize.height = 2048
    this.keyLight.shadow.camera.near = 0.5
    this.keyLight.shadow.camera.far = 50
    this.group.add(this.keyLight)

    // Fill Light: 影を柔らかくする
    this.fillLight = new THREE.DirectionalLight(
      config.fillLight.color,
      config.fillLight.intensity
    )
    this.fillLight.position.set(...config.fillLight.position)
    this.group.add(this.fillLight)

    // Back Light: 輪郭を強調
    this.backLight = new THREE.DirectionalLight(
      config.backLight.color,
      config.backLight.intensity
    )
    this.backLight.position.set(...config.backLight.position)
    this.group.add(this.backLight)

    // Ambient Light: 全体的な環境光
    this.ambientLight = new THREE.AmbientLight(
      config.ambient.color,
      config.ambient.intensity
    )
    this.group.add(this.ambientLight)
  }

  /**
   * シーンに照明を追加
   */
  addToScene(scene: THREE.Scene): void {
    scene.add(this.group)
  }

  /**
   * 照明の強度を調整
   */
  updateIntensity(light: 'key' | 'fill' | 'back' | 'ambient', intensity: number): void {
    switch (light) {
      case 'key':
        this.keyLight.intensity = intensity
        break
      case 'fill':
        this.fillLight.intensity = intensity
        break
      case 'back':
        this.backLight.intensity = intensity
        break
      case 'ambient':
        this.ambientLight.intensity = intensity
        break
    }
  }

  /**
   * 照明の位置を調整
   */
  updatePosition(light: 'key' | 'fill' | 'back', position: [number, number, number]): void {
    const targetLight = light === 'key' ? this.keyLight : light === 'fill' ? this.fillLight : this.backLight
    targetLight.position.set(...position)
  }

  /**
   * 全照明を取得（デバッグ用）
   */
  getLights() {
    return {
      key: this.keyLight,
      fill: this.fillLight,
      back: this.backLight,
      ambient: this.ambientLight
    }
  }

  /**
   * 照明をクリーンアップ
   */
  dispose(): void {
    this.keyLight.dispose()
    this.fillLight.dispose()
    this.backLight.dispose()
    this.ambientLight.dispose()
  }
}
