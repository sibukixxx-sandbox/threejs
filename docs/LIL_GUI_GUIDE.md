# lil-gui 使用ガイド

## 概要

**lil-gui**（旧dat.GUIの現代版）は、Three.jsプロトタイピングで最も標準的で扱いやすい軽量GUIライブラリです。

このプロジェクトでは、Leva（React統合UI）と lil-gui（ピュアJS UI）の両方を提供しています。

## lil-gui vs Leva の使い分け

| 項目 | lil-gui | Leva |
|------|---------|------|
| **用途** | プロトタイピング、クライアント確認 | 本番アプリ、React統合 |
| **セットアップ** | 数行で完了 | Zustand + React hooks |
| **デザイン** | 開発者向けシンプルUI | モダンでカスタマイズ可能 |
| **TypeScript** | 完全対応 | 完全対応 |
| **サイズ** | 超軽量（~10KB） | やや重い（Reactに依存） |
| **React不要** | ✅ | ❌ |

**推奨**:
- **プロトタイプ段階**: lil-gui でパラメータと機能を決定
- **本番アプリ化**: Leva または HTML/CSS UIに置き換え

## インストール

```bash
npm install lil-gui
```

既に `package.json` に追加済みです。

## 使い方

### 1. Vanning Simulator用 GUI

```typescript
import { setupVanningGUI } from '@/utils/vanningGUI'
import { VanningSimulator } from '@/utils/VanningSimulator'
import { SimpleStackingStrategy } from '@/utils/loadingStrategies'

// シミュレーターを作成
const simulator = new VanningSimulator(scene, new SimpleStackingStrategy())

// GUIをセットアップ（自動的にパラメータ調整可能になる）
setupVanningGUI(simulator)
```

**機能**:
- コンテナプリセット選択（20ft / 40ft / 40ft High Cube）
- 長さ・高さ・幅のスライダー調整
- 貨物サイズの調整
- 積載数のリアルタイム表示

### 2. Glitter Material用 GUI

```typescript
import { setupBeautyGUI } from '@/utils/beautyGUI'
import { GlitterMaterial } from '@/shaders/GlitterMaterial'

// マテリアルを作成
const material = new GlitterMaterial({
  baseColor: 0xaa0022,
  glitterColor: 0xffd700
})

// GUIをセットアップ
const { params, gui } = setupBeautyGUI(material)

// アニメーションループ内で使用
const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)

  const delta = clock.getDelta()

  // GUIで設定した速度倍率を使用
  material.updateTime(delta * params.timeScale)

  renderer.render(scene, camera)
}
```

**機能**:
- ベースカラーのカラーピッカー
- ラメカラーのカラーピッカー
- ラメの細かさ調整（1-200）
- ラメの強さ調整（0-10）
- アニメーション速度調整
- プリセットボタン（口紅、アイシャドウ、ネイル）

## 実装例の詳細解説

### Vanning Simulator GUI

```typescript
const state = {
  containerWidth: 5.9,
  containerHeight: 2.39,
  containerDepth: 2.35,
  preset: '20ft Dry',
  // ...
}

// プリセット切り替え
const presets = {
  '20ft Dry': { w: 5.9, h: 2.39, d: 2.35 },
  '40ft Dry': { w: 12.03, h: 2.39, d: 2.35 },
  '40ft High Cube': { w: 12.03, h: 2.69, d: 2.35 },
}

folderContainer.add(state, 'preset', Object.keys(presets))
  .name('Type Preset')
  .onChange((val: string) => {
    const size = presets[val as keyof typeof presets]
    state.containerWidth = size.w
    state.containerHeight = size.h
    state.containerDepth = size.d

    // 他のコントローラーも更新
    gui.controllersRecursive().forEach(c => c.updateDisplay())

    updateSimulation()
  })
```

**ポイント**:
1. `state`オブジェクトで全パラメータを管理
2. `onChange`で値が変わったら`updateSimulation()`を呼ぶ
3. プリセット選択時は`updateDisplay()`で他のスライダーも同期

### Glitter Material GUI

```typescript
// 色の変更（カラーピッカー）
folder.addColor(params, 'baseColor')
  .name('Base Color')
  .onChange((val: string) => {
    // THREE.Colorに変換
    material.uniforms.uBaseColor.value.set(val)
  })

// 数値の変更（スライダー）
folder.add(params, 'scale', 1.0, 200.0)
  .name('Glitter Density')
  .onChange((val: number) => {
    material.uniforms.uGlitterScale.value = val
  })
```

**ポイント**:
1. `addColor()`でカラーピッカーを作成
2. `onChange`内で`THREE.Color.set()`を使って変換
3. uniformsを直接更新することでリアルタイム反映

## プリセット機能の実装パターン

プリセットボタンを実装する2つの方法:

### 方法1: ボタンオブジェクト方式

```typescript
presetFolder.add({
  lipstick: () => {
    params.baseColor = '#aa0022'
    params.glitterColor = '#ffd700'
    // ... 他のパラメータ

    // マテリアルに反映
    material.uniforms.uBaseColor.value.set(params.baseColor)
    material.uniforms.uGlitterColor.value.set(params.glitterColor)

    // GUIを更新
    gui.controllersRecursive().forEach(c => c.updateDisplay())
  }
}, 'lipstick').name('Lipstick Preset')
```

### 方法2: 直接ボタン方式（シンプル）

```typescript
const actions = {
  loadLipstick: () => {
    // プリセット適用処理
  },
  loadEyeshadow: () => {
    // プリセット適用処理
  }
}

gui.add(actions, 'loadLipstick').name('Load Lipstick')
gui.add(actions, 'loadEyeshadow').name('Load Eyeshadow')
```

## 量産アプリ化への移行

### プロトタイプ段階（lil-gui）

```typescript
// 開発中: lil-guiで素早くパラメータ調整
import { setupVanningGUI } from '@/utils/vanningGUI'
setupVanningGUI(simulator)
```

**メリット**:
- コピペで即使える
- クライアントと画面を見ながら調整
- 「機能」と「パラメータの範囲」を決定

### 本番アプリ化（Leva or HTML/CSS）

```typescript
// 本番: Levaでモダンなデザイン
import { VanningControlPanel } from '@/ui/VanningControlPanel'

function App() {
  return (
    <>
      <VanningScene />
      <VanningControlPanel />
    </>
  )
}
```

**メリット**:
- デザインをカスタマイズ可能
- Reactエコシステムと統合
- プロダクションレベルのUI

### ロジックとビューの分離

**重要**: UIライブラリを置き換えても、ロジック部分（`VanningSimulator`、`GlitterMaterial`クラス）はそのまま流用できます。

```typescript
// ロジック（変更なし）
const simulator = new VanningSimulator(scene, strategy)
const result = simulator.simulateLoading(container, cargo)

// UI（lil-gui → Leva → カスタムUIに置き換え可能）
// どのUIでも、最終的には simulator.simulateLoading() を呼ぶだけ
```

## lil-gui の高度な機能

### フォルダーの折りたたみ

```typescript
const folder = gui.addFolder('Advanced Settings')
folder.close() // デフォルトで閉じる
```

### 値の範囲とステップ

```typescript
// スライダー: 最小値、最大値、ステップ
folder.add(params, 'value', 0, 100, 1)

// または
folder.add(params, 'value').min(0).max(100).step(1)
```

### ドロップダウン

```typescript
// オブジェクトで選択肢を指定
folder.add(params, 'algorithm', {
  'Simple Stacking': 'simple',
  'Pallet Loading': 'pallet',
  'Optimized Packing': 'optimized'
})
```

### 読み取り専用

```typescript
// 計算結果を表示するだけ（編集不可）
folder.add(state, 'totalCount').name('Result').disable()
```

### カスタム変更イベント

```typescript
folder.add(params, 'value')
  .onChange((value) => {
    // 値が変わるたびに実行
    console.log('Changed:', value)
  })
  .onFinishChange((value) => {
    // ユーザーが変更を完了したときのみ実行（スライダーを離したとき）
    console.log('Finished:', value)
    saveToDatabase(value) // 例: DBに保存
  })
```

## トラブルシューティング

### 問題: GUIが表示されない

**原因**: lil-guiがインストールされていない

**解決策**:
```bash
npm install lil-gui
```

### 問題: 色が正しく反映されない

**原因**: THREE.Colorへの変換が必要

**解決策**:
```typescript
// ❌ 間違い
material.color = params.color

// ✅ 正しい
material.color.set(params.color)
```

### 問題: プリセット選択後、スライダーが古い値を表示

**原因**: `updateDisplay()`を呼んでいない

**解決策**:
```typescript
// プリセット適用後に必ず呼ぶ
gui.controllersRecursive().forEach(c => c.updateDisplay())
```

### 問題: GUIが他の要素に隠れる

**原因**: z-indexが低い

**解決策**:
```typescript
// GUIのDOM要素にスタイルを適用
const gui = new GUI()
gui.domElement.style.zIndex = '9999'
```

## ベストプラクティス

### 1. フォルダーで整理

```typescript
const gui = new GUI()

const folderMaterial = gui.addFolder('Material')
const folderLighting = gui.addFolder('Lighting')
const folderCamera = gui.addFolder('Camera')
```

### 2. 状態オブジェクトでパラメータ管理

```typescript
// ❌ バラバラに管理
let baseColor = '#ff0000'
let glitterScale = 80

// ✅ オブジェクトで一元管理
const params = {
  baseColor: '#ff0000',
  glitterScale: 80
}
```

### 3. 更新処理を関数化

```typescript
const updateSimulation = () => {
  // シミュレーション更新処理
}

// 全てのコントローラーで再利用
folder.add(params, 'width').onChange(updateSimulation)
folder.add(params, 'height').onChange(updateSimulation)
```

### 4. GUIオブジェクトを返す

```typescript
export function setupGUI(material: Material) {
  const gui = new GUI()
  // ... セットアップ

  // 後でクリーンアップできるようにGUIを返す
  return gui
}

// 使用側
const gui = setupGUI(material)

// クリーンアップ時
gui.destroy()
```

## まとめ

**lil-gui の利点**:
- ✅ 軽量でシンプル
- ✅ TypeScript完全対応
- ✅ プロトタイピングに最適
- ✅ Reactなしで動作

**Leva の利点**:
- ✅ モダンなデザイン
- ✅ React統合
- ✅ 本番アプリ向け
- ✅ カスタマイズ性が高い

**推奨ワークフロー**:
1. **プロトタイプ**: lil-gui で機能とパラメータを決定
2. **本番アプリ**: Leva または カスタムUIに移行
3. **ロジック**: `VanningSimulator`、`GlitterMaterial`クラスはそのまま流用

このプロジェクトでは両方のアプローチを提供しているので、用途に応じて選択してください！
