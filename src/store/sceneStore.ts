import { create } from 'zustand'

/**
 * Scene State Store
 * UIとThree.jsシーンを連携させるためのZustandストア
 */

interface MaterialState {
  baseColor: string
  subsurfaceColor: string
  subsurfaceIntensity: number
  subsurfacePower: number
  shininess: number
  specularStrength: number
}

interface LightingState {
  keyIntensity: number
  fillIntensity: number
  backIntensity: number
  ambientIntensity: number
}

interface SceneState {
  // Material
  material: MaterialState
  setMaterialProperty: <K extends keyof MaterialState>(key: K, value: MaterialState[K]) => void
  loadPreset: (preset: 'skin' | 'wax' | 'cream') => void

  // Lighting
  lighting: LightingState
  setLightingProperty: <K extends keyof LightingState>(key: K, value: LightingState[K]) => void

  // Scene
  backgroundColor: string
  setBackgroundColor: (color: string) => void
  rotationSpeed: number
  setRotationSpeed: (speed: number) => void
}

const PRESETS = {
  skin: {
    baseColor: '#ffd4b8',
    subsurfaceColor: '#ff6b6b',
    subsurfaceIntensity: 0.6,
    subsurfacePower: 2.0,
    shininess: 16.0,
    specularStrength: 0.2
  },
  wax: {
    baseColor: '#fff8dc',
    subsurfaceColor: '#ffeaa7',
    subsurfaceIntensity: 0.8,
    subsurfacePower: 1.5,
    shininess: 64.0,
    specularStrength: 0.5
  },
  cream: {
    baseColor: '#fff5ee',
    subsurfaceColor: '#ffe4e1',
    subsurfaceIntensity: 0.7,
    subsurfacePower: 1.8,
    shininess: 32.0,
    specularStrength: 0.4
  }
}

export const useSceneStore = create<SceneState>((set) => ({
  // Material
  material: PRESETS.skin,
  setMaterialProperty: (key, value) =>
    set((state) => ({
      material: { ...state.material, [key]: value }
    })),
  loadPreset: (preset) =>
    set(() => ({
      material: PRESETS[preset]
    })),

  // Lighting
  lighting: {
    keyIntensity: 1.2,
    fillIntensity: 0.6,
    backIntensity: 0.8,
    ambientIntensity: 0.3
  },
  setLightingProperty: (key, value) =>
    set((state) => ({
      lighting: { ...state.lighting, [key]: value }
    })),

  // Scene
  backgroundColor: '#f0f0f0',
  setBackgroundColor: (color) => set({ backgroundColor: color }),
  rotationSpeed: 0.5,
  setRotationSpeed: (speed) => set({ rotationSpeed: speed })
}))
