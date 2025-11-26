import { create } from 'zustand'
import { ContainerSpec, CargoSpec } from '@/utils/VanningSimulator'

/**
 * コンテナプリセット
 */
export const CONTAINER_PRESETS = {
  '20ft': {
    name: '20ft Container',
    width: 5.9,
    height: 2.39,
    depth: 2.35
  },
  '40ft': {
    name: '40ft Container',
    width: 12.03,
    height: 2.39,
    depth: 2.35
  },
  '40ftHC': {
    name: '40ft High Cube',
    width: 12.03,
    height: 2.69,
    depth: 2.35
  },
  custom: {
    name: 'Custom',
    width: 5.9,
    height: 2.39,
    depth: 2.35
  }
} as const

export type ContainerPresetKey = keyof typeof CONTAINER_PRESETS

/**
 * 貨物プリセット
 */
export const CARGO_PRESETS = {
  small: {
    name: 'Small Box (50x40x50cm)',
    width: 0.5,
    height: 0.4,
    depth: 0.5,
    gap: 0.01
  },
  medium: {
    name: 'Medium Box (80x60x80cm)',
    width: 0.8,
    height: 0.6,
    depth: 0.8,
    gap: 0.01
  },
  large: {
    name: 'Large Box (120x100x120cm)',
    width: 1.2,
    height: 1.0,
    depth: 1.2,
    gap: 0.01
  },
  custom: {
    name: 'Custom',
    width: 0.5,
    height: 0.4,
    depth: 0.5,
    gap: 0.01
  }
} as const

export type CargoPresetKey = keyof typeof CARGO_PRESETS

/**
 * アルゴリズムタイプ
 */
export type AlgorithmType = 'simpleStacking' | 'palletLoading' | 'optimizedPacking'

/**
 * 積載結果の統計情報
 */
export interface LoadingStats {
  count: number
  volumeUtilization: number
  centerOfGravity: { x: number; y: number; z: number }
  warningMessages: string[]
}

/**
 * Vanning Store State
 */
interface VanningState {
  // Container
  containerPreset: ContainerPresetKey
  container: ContainerSpec
  setContainerPreset: (preset: ContainerPresetKey) => void
  setContainerProperty: <K extends keyof ContainerSpec>(key: K, value: ContainerSpec[K]) => void

  // Cargo
  cargoPreset: CargoPresetKey
  cargo: CargoSpec
  setCargoPreset: (preset: CargoPresetKey) => void
  setCargoProperty: <K extends keyof CargoSpec>(key: K, value: CargoSpec[K]) => void

  // Algorithm
  algorithm: AlgorithmType
  setAlgorithm: (algorithm: AlgorithmType) => void

  // Loading Result
  loadingStats: LoadingStats | null
  setLoadingStats: (stats: LoadingStats) => void

  // Visualization
  showCenterOfGravity: boolean
  toggleCenterOfGravity: () => void
  cargoColor: string
  setCargoColor: (color: string) => void
  containerColor: string
  setContainerColor: (color: string) => void
}

export const useVanningStore = create<VanningState>((set) => ({
  // Container
  containerPreset: '20ft',
  container: CONTAINER_PRESETS['20ft'],
  setContainerPreset: (preset) =>
    set({
      containerPreset: preset,
      container: CONTAINER_PRESETS[preset]
    }),
  setContainerProperty: (key, value) =>
    set((state) => ({
      containerPreset: 'custom',
      container: { ...state.container, [key]: value }
    })),

  // Cargo
  cargoPreset: 'small',
  cargo: CARGO_PRESETS.small,
  setCargoPreset: (preset) =>
    set({
      cargoPreset: preset,
      cargo: CARGO_PRESETS[preset]
    }),
  setCargoProperty: (key, value) =>
    set((state) => ({
      cargoPreset: 'custom',
      cargo: { ...state.cargo, [key]: value }
    })),

  // Algorithm
  algorithm: 'simpleStacking',
  setAlgorithm: (algorithm) => set({ algorithm }),

  // Loading Result
  loadingStats: null,
  setLoadingStats: (stats) => set({ loadingStats: stats }),

  // Visualization
  showCenterOfGravity: true,
  toggleCenterOfGravity: () =>
    set((state) => ({ showCenterOfGravity: !state.showCenterOfGravity })),
  cargoColor: '#cd853f',
  setCargoColor: (color) => set({ cargoColor: color }),
  containerColor: '#00ff00',
  setContainerColor: (color) => set({ containerColor: color })
}))
