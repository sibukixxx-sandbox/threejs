import GUI from 'lil-gui'
import { ChampagneTower } from './ChampagneTower'
import * as THREE from 'three'

/**
 * setupChampagneGUI - lil-guiを使ったChampagneTowerの設定
 *
 * 使い方:
 * ```typescript
 * const tower = new ChampagneTower({ ... })
 * const { params, gui } = setupChampagneGUI(tower)
 * scene.add(tower.getGroup())
 *
 * // アニメーションループ
 * function animate() {
 *   if (params.autoRotate) {
 *     tower.rotate(params.rotationSpeed)
 *   }
 * }
 * ```
 *
 * 特徴:
 * - タワーの構造パラメータ（段数、サイズ、間隔）
 * - マテリアル設定（色、透過、光沢等）
 * - プリセットボタン（Classic, Rose, Champagne, Crystal）
 * - ライティング制御
 * - 総グラス数の表示
 */
export function setupChampagneGUI(tower: ChampagneTower) {
  const gui = new GUI({ title: '🍾 Champagne Tower' })

  // パラメータオブジェクト
  const params = {
    // Tower Structure
    levels: 5,
    glassSize: 0.8,
    spacing: 0.9,

    // Material
    liquidColor: '#ffd700',
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.6,
    thickness: 1.0,
    clearcoat: 1.0,

    // Animation
    autoRotate: true,
    rotationSpeed: 0.005,

    // Lighting
    lightColor1: '#ffaa00',
    lightIntensity1: 100,
    lightColor2: '#00aaff',
    lightIntensity2: 50,

    // Statistics (read-only)
    totalGlasses: tower.getTotalGlasses(),
  }

  // 総グラス数を計算する関数
  const updateTotalGlasses = () => {
    let total = 0
    for (let i = 1; i <= params.levels; i++) {
      total += i * i
    }
    params.totalGlasses = total
    statsFolder.controllers[0].updateDisplay()
  }

  // === Tower Structure ===
  const structureFolder = gui.addFolder('Tower Structure')
  structureFolder
    .add(params, 'levels', 1, 10, 1)
    .name('Levels')
    .onChange((value: number) => {
      tower.updateParams({ levels: value })
      updateTotalGlasses()
    })

  structureFolder
    .add(params, 'glassSize', 0.3, 1.5, 0.1)
    .name('Glass Size')
    .onChange((value: number) => {
      tower.updateParams({ glassSize: value })
    })

  structureFolder
    .add(params, 'spacing', 0.5, 2.0, 0.1)
    .name('Spacing')
    .onChange((value: number) => {
      tower.updateParams({ spacing: value })
    })

  structureFolder.open()

  // === Material ===
  const materialFolder = gui.addFolder('Material')
  materialFolder
    .addColor(params, 'liquidColor')
    .name('Liquid Color')
    .onChange((value: string) => {
      tower.updateParams({ liquidColor: value })
    })

  materialFolder
    .add(params, 'metalness', 0, 1, 0.01)
    .name('Metalness')
    .onChange((value: number) => {
      tower.updateParams({ metalness: value })
    })

  materialFolder
    .add(params, 'roughness', 0, 1, 0.01)
    .name('Roughness')
    .onChange((value: number) => {
      tower.updateParams({ roughness: value })
    })

  materialFolder
    .add(params, 'transmission', 0, 1, 0.01)
    .name('Transmission')
    .onChange((value: number) => {
      tower.updateParams({ transmission: value })
    })

  materialFolder
    .add(params, 'thickness', 0, 5, 0.1)
    .name('Thickness')
    .onChange((value: number) => {
      tower.updateParams({ thickness: value })
    })

  materialFolder
    .add(params, 'clearcoat', 0, 1, 0.01)
    .name('Clearcoat')
    .onChange((value: number) => {
      tower.updateParams({ clearcoat: value })
    })

  materialFolder.open()

  // === Animation ===
  const animationFolder = gui.addFolder('Animation')
  animationFolder.add(params, 'autoRotate').name('Auto Rotate')
  animationFolder
    .add(params, 'rotationSpeed', 0, 0.05, 0.001)
    .name('Rotation Speed')

  animationFolder.open()

  // === Lighting ===
  const lightingFolder = gui.addFolder('Lighting')
  lightingFolder
    .addColor(params, 'lightColor1')
    .name('Main Light Color')

  lightingFolder
    .add(params, 'lightIntensity1', 0, 200, 5)
    .name('Main Light Intensity')

  lightingFolder
    .addColor(params, 'lightColor2')
    .name('Accent Light Color')

  lightingFolder
    .add(params, 'lightIntensity2', 0, 100, 5)
    .name('Accent Light Intensity')

  // === Presets ===
  const presetsFolder = gui.addFolder('Presets')

  const applyPreset = (preset: {
    liquidColor: string
    metalness: number
    roughness: number
    transmission: number
    thickness: number
    clearcoat: number
  }) => {
    Object.assign(params, preset)
    tower.updateParams(preset)
    materialFolder.controllersRecursive().forEach(c => c.updateDisplay())
  }

  presetsFolder.add(
    {
      'Classic Gold': () => {
        applyPreset({
          liquidColor: '#ffd700',
          metalness: 0.1,
          roughness: 0.1,
          transmission: 0.6,
          thickness: 1.0,
          clearcoat: 1.0,
        })
      },
    },
    'Classic Gold'
  )

  presetsFolder.add(
    {
      'Rose Pink': () => {
        applyPreset({
          liquidColor: '#ff69b4',
          metalness: 0.05,
          roughness: 0.15,
          transmission: 0.5,
          thickness: 0.8,
          clearcoat: 0.9,
        })
      },
    },
    'Rose Pink'
  )

  presetsFolder.add(
    {
      'Champagne Beige': () => {
        applyPreset({
          liquidColor: '#f5deb3',
          metalness: 0.2,
          roughness: 0.05,
          transmission: 0.7,
          thickness: 1.2,
          clearcoat: 1.0,
        })
      },
    },
    'Champagne Beige'
  )

  presetsFolder.add(
    {
      'Crystal Clear': () => {
        applyPreset({
          liquidColor: '#e0ffff',
          metalness: 0.0,
          roughness: 0.0,
          transmission: 0.95,
          thickness: 0.5,
          clearcoat: 1.0,
        })
      },
    },
    'Crystal Clear'
  )

  // === Statistics ===
  const statsFolder = gui.addFolder('Statistics')
  statsFolder
    .add(params, 'totalGlasses')
    .name('Total Glasses')
    .disable()
    .listen()

  statsFolder.open()

  return { params, gui }
}

/**
 * setupChampagneLights - ライトの設定ヘルパー
 *
 * 使い方:
 * ```typescript
 * const { light1, light2 } = setupChampagneLights(scene, params)
 *
 * // アニメーションループでライトを更新
 * function animate() {
 *   light1.intensity = params.lightIntensity1
 *   light1.color.set(params.lightColor1)
 *   light2.intensity = params.lightIntensity2
 *   light2.color.set(params.lightColor2)
 * }
 * ```
 */
export function setupChampagneLights(
  scene: THREE.Scene,
  params: { lightColor1: string; lightIntensity1: number; lightColor2: string; lightIntensity2: number }
) {
  const light1 = new THREE.PointLight(new THREE.Color(params.lightColor1), params.lightIntensity1, 50)
  light1.position.set(5, 10, 5)
  light1.castShadow = true
  scene.add(light1)

  const light2 = new THREE.PointLight(new THREE.Color(params.lightColor2), params.lightIntensity2, 50)
  light2.position.set(-5, 5, -5)
  scene.add(light2)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  return { light1, light2, ambientLight }
}
