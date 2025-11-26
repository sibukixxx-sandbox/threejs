/**
 * Base Scene Configuration
 * Geminiで量産するための基本設定テンプレート
 */

export interface CameraConfig {
  fov: number
  near: number
  far: number
  position: [number, number, number]
}

export interface RendererConfig {
  antialias: boolean
  alpha: boolean
  powerPreference: 'high-performance' | 'low-power' | 'default'
  toneMapping: number
  toneMappingExposure: number
}

export interface LightingConfig {
  keyLight: {
    intensity: number
    position: [number, number, number]
    color: number
  }
  fillLight: {
    intensity: number
    position: [number, number, number]
    color: number
  }
  backLight: {
    intensity: number
    position: [number, number, number]
    color: number
  }
  ambient: {
    intensity: number
    color: number
  }
}

/**
 * 美容系に最適化されたデフォルト設定
 * 柔らかい照明で肌の質感を美しく表現
 */
export const DEFAULT_CAMERA_CONFIG: CameraConfig = {
  fov: 50,
  near: 0.1,
  far: 1000,
  position: [0, 0, 5]
}

export const DEFAULT_RENDERER_CONFIG: RendererConfig = {
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
  toneMapping: 2, // ACESFilmicToneMapping
  toneMappingExposure: 1.0
}

/**
 * Studio Lighting: 3点照明
 * 美容系製品の撮影で使われる標準的な照明配置
 */
export const DEFAULT_LIGHTING_CONFIG: LightingConfig = {
  // Key Light: メインの照明（45度上方から）
  keyLight: {
    intensity: 1.2,
    position: [5, 5, 5],
    color: 0xffffff
  },
  // Fill Light: 影を柔らかくする補助光
  fillLight: {
    intensity: 0.6,
    position: [-5, 0, 3],
    color: 0xffffff
  },
  // Back Light: 輪郭を強調するバックライト
  backLight: {
    intensity: 0.8,
    position: [0, 5, -5],
    color: 0xffffff
  },
  // Ambient: 全体的な環境光
  ambient: {
    intensity: 0.3,
    color: 0xffffff
  }
}
