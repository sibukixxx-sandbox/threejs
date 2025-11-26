import { useControls, button } from 'leva'
import { Scene } from './components/Scene'
import { ControlPanel } from './ui/ControlPanel'
import { VanningScene } from './components/VanningScene'
import { VanningControlPanel } from './ui/VanningControlPanel'
import { GlitterScene } from './components/GlitterScene'
import { GlitterControlPanel } from './ui/GlitterControlPanel'
import { useAppStore } from './store/appStore'
import './App.css'

/**
 * Main Application
 * Geminiを使った量産戦略のデモアプリケーション
 *
 * 3つのデモシーンを提供:
 * 1. Glitter Demo - 化粧品のラメ・パール感シミュレーター
 * 2. Subsurface Scattering Demo - 美容系製品のマテリアル
 * 3. Vanning Simulator - コンテナ積載シミュレーター
 */
function App() {
  const { currentScene, setCurrentScene } = useAppStore()

  // シーン切り替えコントロール
  useControls('シーン選択', {
    'Glitter Demo': button(() => setCurrentScene('glitter')),
    'Subsurface Demo': button(() => setCurrentScene('subsurface')),
    'Vanning Simulator': button(() => setCurrentScene('vanning'))
  })

  return (
    <>
      {currentScene === 'glitter' ? (
        <>
          <GlitterScene />
          <GlitterControlPanel />
        </>
      ) : currentScene === 'subsurface' ? (
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
