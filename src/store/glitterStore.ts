import { create } from 'zustand'

/**
 * 化粧品プリセット
 */
export const COSMETIC_PRESETS = {
  lipstick: {
    name: '口紅（深い赤 + ゴールド）',
    baseColor: '#aa0022',
    glitterColor: '#ffd700',
    glitterScale: 80,
    glitterStrength: 3.5
  },
  eyeshadow: {
    name: 'アイシャドウ（紫 + シルバー）',
    baseColor: '#9b59b6',
    glitterColor: '#c0c0c0',
    glitterScale: 100,
    glitterStrength: 2.5
  },
  nail: {
    name: 'ネイル（ピンク + ホログラム）',
    baseColor: '#ff69b4',
    glitterColor: '#ffffff',
    glitterScale: 60,
    glitterStrength: 4.0
  },
  custom: {
    name: 'カスタム',
    baseColor: '#aa0022',
    glitterColor: '#ffd700',
    glitterScale: 80,
    glitterStrength: 3.5
  }
} as const

export type CosmeticPresetKey = keyof typeof COSMETIC_PRESETS

/**
 * マテリアルパラメータ
 */
export interface GlitterParams {
  baseColor: string
  glitterColor: string
  glitterScale: number
  glitterStrength: number
}

/**
 * Glitter Store State
 */
interface GlitterState {
  // プリセット
  preset: CosmeticPresetKey
  setPreset: (preset: CosmeticPresetKey) => void

  // マテリアルパラメータ
  params: GlitterParams
  setParam: <K extends keyof GlitterParams>(key: K, value: GlitterParams[K]) => void

  // シーン設定
  objectType: 'sphere' | 'cylinder' | 'torus'
  setObjectType: (type: 'sphere' | 'cylinder' | 'torus') => void

  rotationSpeed: number
  setRotationSpeed: (speed: number) => void

  backgroundColor: string
  setBackgroundColor: (color: string) => void
}

export const useGlitterStore = create<GlitterState>((set) => ({
  // プリセット
  preset: 'lipstick',
  setPreset: (preset) =>
    set({
      preset,
      params: COSMETIC_PRESETS[preset]
    }),

  // マテリアルパラメータ
  params: COSMETIC_PRESETS.lipstick,
  setParam: (key, value) =>
    set((state) => ({
      preset: 'custom',
      params: { ...state.params, [key]: value }
    })),

  // シーン設定
  objectType: 'sphere',
  setObjectType: (type) => set({ objectType: type }),

  rotationSpeed: 0.3,
  setRotationSpeed: (speed) => set({ rotationSpeed: speed }),

  backgroundColor: '#1a1a1a',
  setBackgroundColor: (color) => set({ backgroundColor: color })
}))
