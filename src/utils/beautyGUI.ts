import GUI from 'lil-gui'
import * as THREE from 'three'
import { GlitterMaterial } from '@/shaders/GlitterMaterial'

/**
 * Beauty (Glitter) Simulator用 lil-gui セットアップ
 *
 * 化粧品のラメ・パール感をリアルタイムで調整できるGUI。
 * 色はカラーピッカーで直感的に変更可能。
 *
 * 使い方:
 * ```typescript
 * const material = new GlitterMaterial({ ... })
 * const guiParams = setupBeautyGUI(material)
 *
 * // アニメーションループ内で
 * material.updateTime(delta * guiParams.timeScale)
 * ```
 */
export function setupBeautyGUI(material: GlitterMaterial) {
  const gui = new GUI({ title: 'Texture Lab' })

  // 初期値をマテリアルから取得
  const params = {
    baseColor: '#' + material.uniforms.uBaseColor.value.getHexString(),
    glitterColor: '#' + material.uniforms.uGlitterColor.value.getHexString(),
    scale: material.uniforms.uGlitterScale.value,
    strength: material.uniforms.uGlitterStrength.value,

    // アニメーション速度調整用（JS側で制御）
    timeScale: 1.0,
  }

  // Folder: Material Properties
  const folder = gui.addFolder('Lipstick Texture')

  // 色の変更 (Color Picker)
  folder.addColor(params, 'baseColor')
    .name('Base Color')
    .onChange((val: string) => {
      material.uniforms.uBaseColor.value.set(val)
    })

  folder.addColor(params, 'glitterColor')
    .name('Glitter Color')
    .onChange((val: string) => {
      material.uniforms.uGlitterColor.value.set(val)
    })

  // 数値の変更 (Slider)
  folder.add(params, 'scale', 1.0, 200.0)
    .name('Glitter Density')
    .onChange((val: number) => {
      material.uniforms.uGlitterScale.value = val
    })

  folder.add(params, 'strength', 0.0, 10.0)
    .name('Shine Strength')
    .onChange((val: number) => {
      material.uniforms.uGlitterStrength.value = val
    })

  // アニメーション速度設定
  folder.add(params, 'timeScale', 0.0, 5.0)
    .name('Anim Speed')

  // プリセットボタン
  const presetFolder = gui.addFolder('Presets')

  presetFolder.add({
    lipstick: () => {
      params.baseColor = '#aa0022'
      params.glitterColor = '#ffd700'
      params.scale = 80.0
      params.strength = 3.5

      material.uniforms.uBaseColor.value.set(params.baseColor)
      material.uniforms.uGlitterColor.value.set(params.glitterColor)
      material.uniforms.uGlitterScale.value = params.scale
      material.uniforms.uGlitterStrength.value = params.strength

      gui.controllersRecursive().forEach(c => c.updateDisplay())
    }
  }, 'lipstick').name('Lipstick (Red + Gold)')

  presetFolder.add({
    eyeshadow: () => {
      params.baseColor = '#9b59b6'
      params.glitterColor = '#c0c0c0'
      params.scale = 100.0
      params.strength = 2.5

      material.uniforms.uBaseColor.value.set(params.baseColor)
      material.uniforms.uGlitterColor.value.set(params.glitterColor)
      material.uniforms.uGlitterScale.value = params.scale
      material.uniforms.uGlitterStrength.value = params.strength

      gui.controllersRecursive().forEach(c => c.updateDisplay())
    }
  }, 'eyeshadow').name('Eyeshadow (Purple + Silver)')

  presetFolder.add({
    nail: () => {
      params.baseColor = '#ff69b4'
      params.glitterColor = '#ffffff'
      params.scale = 60.0
      params.strength = 4.0

      material.uniforms.uBaseColor.value.set(params.baseColor)
      material.uniforms.uGlitterColor.value.set(params.glitterColor)
      material.uniforms.uGlitterScale.value = params.scale
      material.uniforms.uGlitterStrength.value = params.strength

      gui.controllersRecursive().forEach(c => c.updateDisplay())
    }
  }, 'nail').name('Nail (Pink + Hologram)')

  // アニメーションループ内で params.timeScale を参照するために返す
  return { params, gui }
}

/**
 * アニメーションループ内での使用例
 *
 * ```typescript
 * const { params } = setupBeautyGUI(material)
 * const clock = new THREE.Clock()
 *
 * function animate() {
 *   requestAnimationFrame(animate)
 *
 *   const delta = clock.getDelta()
 *
 *   // GUIで設定した倍率(timeScale)を掛けて時間を進める
 *   material.updateTime(delta * params.timeScale)
 *
 *   renderer.render(scene, camera)
 * }
 * ```
 */
