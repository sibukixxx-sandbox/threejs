import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { StudioLighting } from './StudioLighting'
import {
  CameraConfig,
  RendererConfig,
  LightingConfig,
  DEFAULT_CAMERA_CONFIG,
  DEFAULT_RENDERER_CONFIG,
  DEFAULT_LIGHTING_CONFIG
} from './config'

/**
 * Base Scene Template
 * Geminiを使って量産するための基本シーンテンプレート
 *
 * 特徴:
 * - 軽量化されたボイラープレート
 * - 美容系に最適化されたStudio Lighting
 * - カメラ、レンダラー、OrbitControlsの基本設定
 */
export class BaseScene {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  controls: OrbitControls
  lighting: StudioLighting
  private animationId: number | null = null

  constructor(
    container: HTMLElement,
    cameraConfig: CameraConfig = DEFAULT_CAMERA_CONFIG,
    rendererConfig: RendererConfig = DEFAULT_RENDERER_CONFIG,
    lightingConfig: LightingConfig = DEFAULT_LIGHTING_CONFIG
  ) {
    // Scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xf0f0f0)

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      cameraConfig.fov,
      container.clientWidth / container.clientHeight,
      cameraConfig.near,
      cameraConfig.far
    )
    this.camera.position.set(...cameraConfig.position)

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: rendererConfig.antialias,
      alpha: rendererConfig.alpha,
      powerPreference: rendererConfig.powerPreference
    })
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.toneMapping = rendererConfig.toneMapping as THREE.ToneMapping
    this.renderer.toneMappingExposure = rendererConfig.toneMappingExposure
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(this.renderer.domElement)

    // OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.minDistance = 2
    this.controls.maxDistance = 20
    this.controls.maxPolarAngle = Math.PI / 2

    // Studio Lighting
    this.lighting = new StudioLighting(lightingConfig)
    this.lighting.addToScene(this.scene)

    // リサイズハンドラー
    this.handleResize = this.handleResize.bind(this)
    window.addEventListener('resize', this.handleResize)
  }

  /**
   * アニメーションループを開始
   */
  start(onUpdate?: (delta: number) => void): void {
    const clock = new THREE.Clock()

    const animate = () => {
      this.animationId = requestAnimationFrame(animate)

      const delta = clock.getDelta()

      // カスタム更新処理
      if (onUpdate) {
        onUpdate(delta)
      }

      this.controls.update()
      this.renderer.render(this.scene, this.camera)
    }

    animate()
  }

  /**
   * アニメーションループを停止
   */
  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  /**
   * シーンにオブジェクトを追加
   */
  add(...objects: THREE.Object3D[]): void {
    this.scene.add(...objects)
  }

  /**
   * シーンからオブジェクトを削除
   */
  remove(...objects: THREE.Object3D[]): void {
    this.scene.remove(...objects)
  }

  /**
   * リサイズ処理
   */
  private handleResize(): void {
    const container = this.renderer.domElement.parentElement
    if (!container) return

    this.camera.aspect = container.clientWidth / container.clientHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(container.clientWidth, container.clientHeight)
  }

  /**
   * クリーンアップ
   */
  dispose(): void {
    this.stop()
    window.removeEventListener('resize', this.handleResize)
    this.controls.dispose()
    this.lighting.dispose()
    this.renderer.dispose()

    // シーン内のジオメトリとマテリアルをクリーンアップ
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose()
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose())
        } else {
          object.material.dispose()
        }
      }
    })
  }
}

/**
 * 簡易的なシーン作成ヘルパー
 * Geminiで使いやすいように関数形式でも提供
 */
export function createBaseScene(
  container: HTMLElement,
  options?: {
    camera?: Partial<CameraConfig>
    renderer?: Partial<RendererConfig>
    lighting?: Partial<LightingConfig>
  }
): BaseScene {
  const cameraConfig = { ...DEFAULT_CAMERA_CONFIG, ...options?.camera }
  const rendererConfig = { ...DEFAULT_RENDERER_CONFIG, ...options?.renderer }
  const lightingConfig = { ...DEFAULT_LIGHTING_CONFIG, ...options?.lighting }

  return new BaseScene(container, cameraConfig, rendererConfig, lightingConfig)
}
