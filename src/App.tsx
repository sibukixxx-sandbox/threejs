import { Scene } from './components/Scene'
import { ControlPanel } from './ui/ControlPanel'
import { VanningScene } from './components/VanningScene'
import { VanningControlPanel } from './ui/VanningControlPanel'
import { GlitterScene } from './components/GlitterScene'
import { GlitterControlPanel } from './ui/GlitterControlPanel'
import { ChampagneTowerScene } from './components/ChampagneTowerScene'
import { ChampagneTowerControlPanel } from './components/ChampagneTowerControlPanel'
import { FloorManagerScene } from './components/FloorManagerScene'
import { FloorManagerControlPanel } from './components/FloorManagerControlPanel'
import { FloorManagerHUD } from './components/FloorManagerHUD'
import { ChampagneTowerHUD } from './components/ChampagneTowerHUD'
import { VanningSimulatorHUD } from './components/VanningSimulatorHUD'
import { StyledSceneSelector } from './components/StyledSceneSelector'
import { useAppStore } from './store/appStore'
import './App.css'

/**
 * Main Application
 * Geminiを使った量産戦略のデモアプリケーション
 *
 * 5つのデモシーンを提供:
 * 1. Floor Manager - ナイトクラブ/キャバクラの卓管理3Dマップ
 * 2. Champagne Tower - シャンパンタワーシミュレーター
 * 3. Glitter Demo - 化粧品のラメ・パール感シミュレーター
 * 4. Subsurface Scattering Demo - 美容系製品のマテリアル
 * 5. Vanning Simulator - コンテナ積載シミュレーター
 */
function App() {
  const { currentScene } = useAppStore()

  return (
    <>
      {/* Modern Scene Selector UI */}
      <StyledSceneSelector />

      {/* Render current scene */}
      {currentScene === 'floor' ? (
        <>
          <FloorManagerScene />
          <FloorManagerHUD />
          <FloorManagerControlPanel />
        </>
      ) : currentScene === 'champagne' ? (
        <>
          <ChampagneTowerScene />
          <ChampagneTowerHUD />
          <ChampagneTowerControlPanel />
        </>
      ) : currentScene === 'glitter' ? (
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
          <VanningSimulatorHUD />
          <VanningControlPanel />
        </>
      )}
    </>
  )
}

export default App
