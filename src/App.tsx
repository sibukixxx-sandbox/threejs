import { useControls, button } from 'leva'
import { Scene } from './components/Scene'
import { ControlPanel } from './ui/ControlPanel'
import { VanningScene } from './components/VanningScene'
import { VanningControlPanel } from './ui/VanningControlPanel'
import { useAppStore, SceneType } from './store/appStore'
import './App.css'

/**
 * Main Application
 * Geminiを使った量産戦略のデモアプリケーション
 *
 * 2つのデモシーンを提供:
 * 1. Subsurface Scattering Demo - 美容系製品のマテリアル
 * 2. Vanning Simulator - コンテナ積載シミュレーター
 */
function App() {
  const { currentScene, setCurrentScene } = useAppStore()

  // シーン切り替えコントロール
  useControls('シーン選択', {
    'Subsurface Demo': button(() => setCurrentScene('subsurface')),
    'Vanning Simulator': button(() => setCurrentScene('vanning'))
  })

  return (
    <>
      {currentScene === 'subsurface' ? (
        <>
          <Scene />
          <ControlPanel />
        </>
      ) : (
        <>
          <VanningScene />
          <VanningControlPanel />
        </>
      )}
    </>
  )
}

export default App
