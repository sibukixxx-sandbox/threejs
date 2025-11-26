import { useControls, button, folder } from 'leva'
import { useVanningStore, CONTAINER_PRESETS, CARGO_PRESETS, ContainerPresetKey, CargoPresetKey, AlgorithmType } from '@/store/vanningStore'

/**
 * Vanning Control Panel Component
 * Levaを使ったVanning Simulator用のUIコントロールパネル
 */
export function VanningControlPanel() {
  const {
    containerPreset,
    setContainerPreset,
    container,
    setContainerProperty,
    cargoPreset,
    setCargoPreset,
    cargo,
    setCargoProperty,
    algorithm,
    setAlgorithm,
    loadingStats,
    showCenterOfGravity,
    toggleCenterOfGravity,
    cargoColor,
    setCargoColor,
    containerColor,
    setContainerColor
  } = useVanningStore()

  useControls({
    // コンテナプリセット
    'コンテナプリセット': folder({
      'プリセット': {
        value: containerPreset,
        options: {
          '20ft': '20ft',
          '40ft': '40ft',
          '40ft High Cube': '40ftHC',
          'カスタム': 'custom'
        } as Record<string, ContainerPresetKey>,
        onChange: (v: ContainerPresetKey) => setContainerPreset(v)
      },
      '幅 (m)': {
        value: container.width,
        min: 1,
        max: 15,
        step: 0.1,
        onChange: (v) => setContainerProperty('width', v)
      },
      '高さ (m)': {
        value: container.height,
        min: 1,
        max: 5,
        step: 0.1,
        onChange: (v) => setContainerProperty('height', v)
      },
      '奥行き (m)': {
        value: container.depth,
        min: 1,
        max: 5,
        step: 0.1,
        onChange: (v) => setContainerProperty('depth', v)
      }
    }),

    // 貨物プリセット
    '貨物プリセット': folder({
      'プリセット': {
        value: cargoPreset,
        options: {
          '小型 (50x40x50cm)': 'small',
          '中型 (80x60x80cm)': 'medium',
          '大型 (120x100x120cm)': 'large',
          'カスタム': 'custom'
        } as Record<string, CargoPresetKey>,
        onChange: (v: CargoPresetKey) => setCargoPreset(v)
      },
      '幅 (m)': {
        value: cargo.width,
        min: 0.1,
        max: 3,
        step: 0.05,
        onChange: (v) => setCargoProperty('width', v)
      },
      '高さ (m)': {
        value: cargo.height,
        min: 0.1,
        max: 3,
        step: 0.05,
        onChange: (v) => setCargoProperty('height', v)
      },
      '奥行き (m)': {
        value: cargo.depth,
        min: 0.1,
        max: 3,
        step: 0.05,
        onChange: (v) => setCargoProperty('depth', v)
      },
      '隙間 (m)': {
        value: cargo.gap,
        min: 0,
        max: 0.1,
        step: 0.005,
        onChange: (v) => setCargoProperty('gap', v)
      }
    }),

    // アルゴリズム
    'アルゴリズム': folder({
      'タイプ': {
        value: algorithm,
        options: {
          'シンプル積み': 'simpleStacking',
          'パレット積み': 'palletLoading',
          '最適化積み': 'optimizedPacking'
        } as Record<string, AlgorithmType>,
        onChange: (v: AlgorithmType) => setAlgorithm(v)
      }
    }),

    // 統計情報
    '統計情報': folder({
      '積載数': {
        value: loadingStats?.count ?? 0,
        disabled: true
      },
      '容積利用率': {
        value: loadingStats ? `${(loadingStats.volumeUtilization * 100).toFixed(1)}%` : '0%',
        disabled: true
      },
      '重心 X': {
        value: loadingStats?.centerOfGravity.x.toFixed(2) ?? '0.00',
        disabled: true
      },
      '重心 Y': {
        value: loadingStats?.centerOfGravity.y.toFixed(2) ?? '0.00',
        disabled: true
      },
      '重心 Z': {
        value: loadingStats?.centerOfGravity.z.toFixed(2) ?? '0.00',
        disabled: true
      },
      '重心表示': {
        value: showCenterOfGravity,
        onChange: () => toggleCenterOfGravity()
      }
    }),

    // 見た目
    '見た目': folder({
      '貨物の色': {
        value: cargoColor,
        onChange: (v) => setCargoColor(v)
      },
      'コンテナの色': {
        value: containerColor,
        onChange: (v) => setContainerColor(v)
      }
    }),

    // 警告
    ...(loadingStats && loadingStats.warningMessages.length > 0 && {
      '⚠️ 警告': folder(
        loadingStats.warningMessages.reduce((acc, msg, i) => {
          acc[`警告 ${i + 1}`] = {
            value: msg,
            disabled: true
          }
          return acc
        }, {} as Record<string, any>)
      )
    })
  })

  return null
}
