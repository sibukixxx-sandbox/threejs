import { create } from 'zustand'

/**
 * シーンタイプ
 */
export type SceneType = 'subsurface' | 'vanning'

/**
 * App Store State
 * アプリケーション全体の状態管理
 */
interface AppState {
  currentScene: SceneType
  setCurrentScene: (scene: SceneType) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentScene: 'vanning', // デフォルトはVanning Simulator
  setCurrentScene: (scene) => set({ currentScene: scene })
}))
