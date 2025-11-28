import { create } from 'zustand'
import type { ChampagneTowerParams } from '../utils/ChampagneTower'

interface ChampagneState extends ChampagneTowerParams {
  autoRotate: boolean
  rotationSpeed: number
  lightIntensity1: number
  lightIntensity2: number
  lightColor1: string
  lightColor2: string
  setLevels: (levels: number) => void
  setGlassSize: (size: number) => void
  setSpacing: (spacing: number) => void
  setLiquidColor: (color: string) => void
  setMetalness: (value: number) => void
  setRoughness: (value: number) => void
  setTransmission: (value: number) => void
  setThickness: (value: number) => void
  setClearcoat: (value: number) => void
  setAutoRotate: (enabled: boolean) => void
  setRotationSpeed: (speed: number) => void
  setLightIntensity1: (intensity: number) => void
  setLightIntensity2: (intensity: number) => void
  setLightColor1: (color: string) => void
  setLightColor2: (color: string) => void
  applyPreset: (preset: 'classic' | 'rose' | 'champagne' | 'crystal') => void
}

/**
 * ChampagneTower用のZustandストア
 *
 * パラメータ:
 * - levels: タワーの段数（1〜10）
 * - glassSize: 各グラスのサイズ
 * - spacing: グラス間の間隔
 * - liquidColor: シャンパンの色
 * - metalness, roughness, transmission, thickness, clearcoat: マテリアルパラメータ
 * - autoRotate: 自動回転の有効/無効
 * - rotationSpeed: 回転速度
 * - lightIntensity1/2: ライトの強度
 * - lightColor1/2: ライトの色
 */
export const useChampagneStore = create<ChampagneState>((set) => ({
  // 構造パラメータ
  levels: 5,
  glassSize: 0.8,
  spacing: 0.9,

  // マテリアルパラメータ（デフォルトはゴールドシャンパン）
  liquidColor: '#ffd700',
  metalness: 0.1,
  roughness: 0.1,
  transmission: 0.6,
  thickness: 1.0,
  clearcoat: 1.0,

  // アニメーション
  autoRotate: true,
  rotationSpeed: 0.005,

  // ライティング
  lightIntensity1: 100,
  lightIntensity2: 50,
  lightColor1: '#ffaa00',
  lightColor2: '#00aaff',

  // セッター
  setLevels: (levels) => set({ levels }),
  setGlassSize: (size) => set({ glassSize: size }),
  setSpacing: (spacing) => set({ spacing }),
  setLiquidColor: (color) => set({ liquidColor: color }),
  setMetalness: (value) => set({ metalness: value }),
  setRoughness: (value) => set({ roughness: value }),
  setTransmission: (value) => set({ transmission: value }),
  setThickness: (value) => set({ thickness: value }),
  setClearcoat: (value) => set({ clearcoat: value }),
  setAutoRotate: (enabled) => set({ autoRotate: enabled }),
  setRotationSpeed: (speed) => set({ rotationSpeed: speed }),
  setLightIntensity1: (intensity) => set({ lightIntensity1: intensity }),
  setLightIntensity2: (intensity) => set({ lightIntensity2: intensity }),
  setLightColor1: (color) => set({ lightColor1: color }),
  setLightColor2: (color) => set({ lightColor2: color }),

  // プリセット適用
  applyPreset: (preset) => {
    const presets = {
      classic: {
        liquidColor: '#ffd700', // ゴールド
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.6,
        thickness: 1.0,
        clearcoat: 1.0,
      },
      rose: {
        liquidColor: '#ff69b4', // ロゼピンク
        metalness: 0.05,
        roughness: 0.15,
        transmission: 0.5,
        thickness: 0.8,
        clearcoat: 0.9,
      },
      champagne: {
        liquidColor: '#f5deb3', // シャンパンベージュ
        metalness: 0.2,
        roughness: 0.05,
        transmission: 0.7,
        thickness: 1.2,
        clearcoat: 1.0,
      },
      crystal: {
        liquidColor: '#e0ffff', // クリアクリスタル
        metalness: 0.0,
        roughness: 0.0,
        transmission: 0.95,
        thickness: 0.5,
        clearcoat: 1.0,
      },
    }

    set(presets[preset])
  },
}))
