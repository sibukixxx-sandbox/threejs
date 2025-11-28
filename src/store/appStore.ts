import { create } from 'zustand'

/**
 * シーンタイプ
 */
export type SceneType = 'subsurface' | 'vanning' | 'glitter' | 'champagne' | 'floor'

/**
 * App Store State
 * アプリケーション全体の状態管理
 */
interface AppState {
  currentScene: SceneType
  setCurrentScene: (scene: SceneType) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentScene: 'floor', // デフォルトはFloor Manager Demo
  setCurrentScene: (scene) => set({ currentScene: scene })
}))
