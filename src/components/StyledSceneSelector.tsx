import { SceneSelector } from '../ui/UIComponents'
import { useAppStore, type SceneType } from '../store/appStore'

/**
 * StyledSceneSelector - スタイリッシュなシーン選択UI
 *
 * Levaのボタンに代わる、モダンなシーン切り替えUI
 */
export function StyledSceneSelector() {
  const { currentScene, setCurrentScene } = useAppStore()

  const scenes = [
    {
      id: 'floor' as SceneType,
      name: 'Floor Manager',
      icon: '🏢',
      description: 'ナイトクラブ/キャバクラの卓管理3Dマップ',
    },
    {
      id: 'champagne' as SceneType,
      name: 'Champagne Tower',
      icon: '🍾',
      description: 'シャンパンタワーシミュレーター',
    },
    {
      id: 'glitter' as SceneType,
      name: 'Glitter Demo',
      icon: '✨',
      description: '化粧品のラメ・パール感シミュレーター',
    },
    {
      id: 'subsurface' as SceneType,
      name: 'Subsurface Scattering',
      icon: '🌟',
      description: '美容系製品のマテリアル',
    },
    {
      id: 'vanning' as SceneType,
      name: 'Vanning Simulator',
      icon: '🚢',
      description: 'コンテナ積載最適化シミュレーター',
    },
  ]

  return (
    <SceneSelector
      scenes={scenes}
      currentScene={currentScene}
      onSceneChange={(sceneId) => setCurrentScene(sceneId as SceneType)}
    />
  )
}
