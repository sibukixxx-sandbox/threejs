import GUI from 'lil-gui'
import { VanningSimulator, ContainerSpec, CargoSpec } from './VanningSimulator'

/**
 * Vanning Simulator用 lil-gui セットアップ
 *
 * 軽量でシンプルなGUIライブラリ lil-gui を使用した実装例。
 * プロトタイピングやクライアントとのパラメータ調整に最適。
 *
 * 使い方:
 * ```typescript
 * const simulator = new VanningSimulator(scene, strategy)
 * setupVanningGUI(simulator)
 * ```
 */
export function setupVanningGUI(simulator: VanningSimulator) {
  const gui = new GUI({ title: 'Vanning Config' })

  // シミュレーション用のパラメータ状態管理
  const state = {
    // コンテナ (初期値: 20ftドライ)
    containerWidth: 5.9,
    containerHeight: 2.39,
    containerDepth: 2.35,
    preset: '20ft Dry',

    // 貨物 (ダンボール)
    boxWidth: 0.5,
    boxHeight: 0.4,
    boxDepth: 0.5,
    gap: 0.01,

    // 結果表示用
    totalCount: 0,
  }

  // ヘルパー関数: 更新処理
  const updateSimulation = () => {
    const container: ContainerSpec = {
      width: state.containerWidth,
      height: state.containerHeight,
      depth: state.containerDepth
    }

    const cargo: CargoSpec = {
      width: state.boxWidth,
      height: state.boxHeight,
      depth: state.boxDepth,
      gap: state.gap
    }

    // 1. 枠線の更新
    simulator.updateContainer(container)

    // 2. 積載計算と描画
    const result = simulator.simulateLoading(container, cargo)

    // 3. GUI上の数値を更新
    state.totalCount = result.count

    // 数値表示用コントローラーを強制更新
    totalController.updateDisplay()
  }

  // GUI構築
  // Folder 1: Container Settings
  const folderContainer = gui.addFolder('Container Spec')

  // プリセット切り替え機能
  const presets = {
    '20ft Dry': { w: 5.9, h: 2.39, d: 2.35 },
    '40ft Dry': { w: 12.03, h: 2.39, d: 2.35 },
    '40ft High Cube': { w: 12.03, h: 2.69, d: 2.35 },
  }

  folderContainer.add(state, 'preset', Object.keys(presets))
    .name('Type Preset')
    .onChange((val: string) => {
      const size = presets[val as keyof typeof presets]
      state.containerWidth = size.w
      state.containerHeight = size.h
      state.containerDepth = size.d

      // スライダーの見た目も同期させる（GUI更新の定石）
      gui.controllersRecursive().forEach(c => c.updateDisplay())
      updateSimulation()
    })

  folderContainer.add(state, 'containerWidth', 2.0, 15.0)
    .name('Length (m)')
    .onChange(updateSimulation)

  folderContainer.add(state, 'containerHeight', 2.0, 3.5)
    .name('Height (m)')
    .onChange(updateSimulation)

  folderContainer.add(state, 'containerDepth', 2.0, 3.0)
    .name('Width (m)')
    .onChange(updateSimulation)

  // Folder 2: Cargo Settings
  const folderCargo = gui.addFolder('Cargo (Carton)')

  folderCargo.add(state, 'boxWidth', 0.1, 2.0)
    .name('W (m)')
    .onChange(updateSimulation)

  folderCargo.add(state, 'boxHeight', 0.1, 2.0)
    .name('H (m)')
    .onChange(updateSimulation)

  folderCargo.add(state, 'boxDepth', 0.1, 2.0)
    .name('D (m)')
    .onChange(updateSimulation)

  folderCargo.add(state, 'gap', 0.0, 0.1)
    .name('Gap (m)')
    .onChange(updateSimulation)

  // Result Display
  const totalController = gui.add(state, 'totalCount')
    .name('Total Boxes')
    .disable() // 編集不可にする

  // 初回実行
  updateSimulation()

  return gui
}
