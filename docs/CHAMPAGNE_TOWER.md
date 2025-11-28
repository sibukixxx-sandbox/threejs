# 🍾 Champagne Tower Simulator

シャンパンタワーを3Dで可視化・カスタマイズするためのシミュレーター。
MeshPhysicalMaterialを活用したリアルなガラス表現と、段数やマテリアルパラメータの動的制御が可能。

## 📖 概要

ChampagneTower Simulatorは、イベント・パーティー・ウェディング等の演出で使用されるシャンパンタワーを3D空間で再現し、視覚的にプレビュー・カスタマイズするためのツールです。

### 主な特徴

- **正四角錐構造**: 数学的に正確なピラミッド配置
- **MeshPhysicalMaterial**: リアルなガラスの透過・反射・クリアコート表現
- **動的パラメータ調整**: 段数、サイズ、間隔、マテリアル属性をリアルタイム変更
- **4つのプリセット**: Classic Gold, Rose Pink, Champagne Beige, Crystal Clear
- **自動回転**: タワーを回転させて全方位からプレビュー
- **統計情報**: 総グラス数の自動計算・表示

## 🎯 ユースケース

### 1. イベント企画・シミュレーション

**用途**: ウェディングプランナー、パーティー企画会社
- タワーの段数とグラス数を事前計算
- 会場の照明条件をシミュレーション
- シャンパンの種類（ロゼ、白、クリスタル）に応じた見た目の確認

### 2. 3Dモデリング教材

**用途**: Three.js学習者、3DCG初心者
- `MeshPhysicalMaterial`の各パラメータの効果を視覚的に理解
- `transmission`, `thickness`, `clearcoat`の実例
- InstancedMeshを使わない構造（個別Mesh）での配置ロジック学習

### 3. プロダクトビジュアライゼーション

**用途**: グラスメーカー、飲料ブランド
- 製品（グラス、シャンパン）の3Dビジュアル作成
- マーケティング素材のレンダリング
- AR/VRコンテンツのプロトタイピング

## 🏗️ アーキテクチャ

### ファイル構成

```
src/
├── utils/
│   ├── ChampagneTower.ts          # タワー生成ロジック
│   └── champagneGUI.ts            # lil-gui統合
├── store/
│   └── champagneStore.ts          # Zustand state管理
├── components/
│   ├── ChampagneTowerComponent.tsx      # React Three Fiberコンポーネント
│   ├── ChampagneTowerScene.tsx          # メインシーン
│   └── ChampagneTowerControlPanel.tsx   # Levaコントロールパネル
```

### データフロー

```
User Input (Leva/lil-gui)
    ↓
Zustand Store (champagneStore)
    ↓
React Component (ChampagneTowerComponent)
    ↓
ChampagneTower Class
    ↓
THREE.js Scene (MeshPhysicalMaterial + BoxGeometry)
```

## 🚀 使い方

### React Three Fiber版（推奨）

```tsx
import { ChampagneTowerScene } from './components/ChampagneTowerScene'
import { ChampagneTowerControlPanel } from './components/ChampagneTowerControlPanel'

function App() {
  return (
    <>
      <ChampagneTowerScene />
      <ChampagneTowerControlPanel />
    </>
  )
}
```

### Vanilla Three.js + lil-gui版

```typescript
import * as THREE from 'three'
import { ChampagneTower } from './utils/ChampagneTower'
import { setupChampagneGUI, setupChampagneLights } from './utils/champagneGUI'

// シーン準備
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x111111)
scene.fog = new THREE.Fog(0x111111, 10, 50)

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(8, 6, 8)
camera.lookAt(0, 2, 0)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// タワー生成
const tower = new ChampagneTower({
  levels: 5,
  glassSize: 0.8,
  spacing: 0.9,
  liquidColor: '#ffd700',
  metalness: 0.1,
  roughness: 0.1,
  transmission: 0.6,
  thickness: 1.0,
  clearcoat: 1.0,
})
scene.add(tower.getGroup())

// GUI設定
const { params, gui } = setupChampagneGUI(tower)
const { light1, light2 } = setupChampagneLights(scene, params)

// アニメーションループ
function animate() {
  requestAnimationFrame(animate)

  // 自動回転
  if (params.autoRotate) {
    tower.rotate(params.rotationSpeed)
  }

  // ライト更新
  light1.intensity = params.lightIntensity1
  light1.color.set(params.lightColor1)
  light2.intensity = params.lightIntensity2
  light2.color.set(params.lightColor2)

  renderer.render(scene, camera)
}
animate()
```

## ⚙️ パラメータ解説

### Tower Structure（タワー構造）

| パラメータ | 範囲 | デフォルト | 説明 |
|----------|------|----------|------|
| `levels` | 1〜10 | 5 | タワーの段数。レベルnは n×n 個のグラス |
| `glassSize` | 0.3〜1.5 | 0.8 | 各グラスのサイズ（立方体の一辺） |
| `spacing` | 0.5〜2.0 | 0.9 | グラス間の間隔 |

**総グラス数の計算式**:
```
totalGlasses = 1² + 2² + 3² + ... + n²
            = n(n+1)(2n+1) / 6
```

例: 5段タワー = 1 + 4 + 9 + 16 + 25 = **55個**

### Material（マテリアル）

| パラメータ | 範囲 | デフォルト | 説明 |
|----------|------|----------|------|
| `liquidColor` | カラー | #ffd700 | シャンパンの色（ゴールド） |
| `metalness` | 0〜1 | 0.1 | 金属感。高いほど金属的な反射 |
| `roughness` | 0〜1 | 0.1 | 表面の粗さ。低いほど鏡面反射 |
| `transmission` | 0〜1 | 0.6 | 透過率。高いほど光が通過 |
| `thickness` | 0〜5 | 1.0 | 屈折の厚み。透過時の歪み量 |
| `clearcoat` | 0〜1 | 1.0 | クリアコート層。ガラスのツヤ感 |

### Animation（アニメーション）

| パラメータ | 範囲 | デフォルト | 説明 |
|----------|------|----------|------|
| `autoRotate` | true/false | true | 自動回転の有効/無効 |
| `rotationSpeed` | 0〜0.05 | 0.005 | 回転速度（rad/frame） |

### Lighting（ライティング）

| パラメータ | 範囲 | デフォルト | 説明 |
|----------|------|----------|------|
| `lightColor1` | カラー | #ffaa00 | メインライトの色（オレンジゴールド） |
| `lightIntensity1` | 0〜200 | 100 | メインライトの強度 |
| `lightColor2` | カラー | #00aaff | アクセントライトの色（ブルー） |
| `lightIntensity2` | 0〜100 | 50 | アクセントライトの強度 |

## 🎨 プリセット

### Classic Gold（クラシックゴールド）
```typescript
{
  liquidColor: '#ffd700',  // ゴールド
  metalness: 0.1,
  roughness: 0.1,
  transmission: 0.6,
  thickness: 1.0,
  clearcoat: 1.0,
}
```
**用途**: 伝統的なシャンパンタワー、ウェディング、高級イベント

### Rose Pink（ロゼピンク）
```typescript
{
  liquidColor: '#ff69b4',  // ピンク
  metalness: 0.05,
  roughness: 0.15,
  transmission: 0.5,
  thickness: 0.8,
  clearcoat: 0.9,
}
```
**用途**: 女性向けイベント、春夏のパーティー、ロゼワインタワー

### Champagne Beige（シャンパンベージュ）
```typescript
{
  liquidColor: '#f5deb3',  // ベージュ
  metalness: 0.2,
  roughness: 0.05,
  transmission: 0.7,
  thickness: 1.2,
  clearcoat: 1.0,
}
```
**用途**: ナチュラル・エレガント系イベント、シャンパン本来の色

### Crystal Clear（クリスタルクリア）
```typescript
{
  liquidColor: '#e0ffff',  // クリア
  metalness: 0.0,
  roughness: 0.0,
  transmission: 0.95,
  thickness: 0.5,
  clearcoat: 1.0,
}
```
**用途**: 空のグラス表示、水タワー、クリスタル製品プレビュー

## 🔧 カスタマイズ例

### 10段の巨大タワー

```typescript
const tower = new ChampagneTower({
  levels: 10,        // 総グラス数: 385個
  glassSize: 0.6,    // 小さめのグラス
  spacing: 0.7,      // 密集配置
  liquidColor: '#ffd700',
  metalness: 0.1,
  roughness: 0.1,
  transmission: 0.6,
  thickness: 1.0,
  clearcoat: 1.0,
})
```

### 青いカクテルタワー

```typescript
tower.updateParams({
  liquidColor: '#0088ff',  // 鮮やかなブルー
  metalness: 0.05,
  roughness: 0.2,
  transmission: 0.4,       // やや不透明
  thickness: 1.5,
})
```

### グラス形状の変更（BoxGeometryから変更）

`ChampagneTower.ts`の`buildTower()`メソッドを編集:

```typescript
// ボックスの代わりに円錐を使用
const geometry = new THREE.ConeGeometry(glassSize / 2, glassSize, 16)
geometry.rotateX(Math.PI) // 逆さに配置
```

## 📊 パフォーマンス

### レンダリング負荷

| 段数 | グラス数 | 三角形数 | FPS (60Hz) |
|------|---------|---------|-----------|
| 3    | 14      | 168     | ✅ 60     |
| 5    | 55      | 660     | ✅ 60     |
| 7    | 140     | 1,680   | ✅ 60     |
| 10   | 385     | 4,620   | ⚠️ 55     |

**最適化のヒント**:
- グラス数が多い場合は`InstancedMesh`への移行を検討
- `glassSize`を小さくして描画負荷を軽減
- `transmission`を下げると透過計算が軽くなる

## 🧩 拡張アイデア

### 1. 物理シミュレーション（液体の流れ）

Three.jsの物理エンジン（Cannon.js, Ammo.js）と組み合わせて、シャンパンが上段から下段へ流れ落ちるアニメーションを実装。

### 2. パーティクル効果

シャンパンの泡や炭酸をパーティクルで表現:

```typescript
const particleSystem = new THREE.Points(
  new THREE.BufferGeometry(),
  new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true })
)
```

### 3. AR対応

WebXRを使って、実際の会場にシャンパンタワーをARで配置してサイズ感を確認。

### 4. グラス形状のバリエーション

- クープ型（浅い皿型）
- フルート型（細長い）
- タンブラー型（円筒）

### 5. データ駆動型タワー

データビジュアライゼーションとして、各グラスの高さや色をデータに連動:

```typescript
const salesData = [100, 250, 180, 320, ...]
glasses.forEach((glass, i) => {
  glass.scale.y = salesData[i] / 100
  glass.material.color.setHex(dataToColor(salesData[i]))
})
```

## 🐛 トラブルシューティング

### グラスが正しく配置されない

**原因**: `spacing`が`glassSize`より小さい場合、グラスが重なる

**解決策**: `spacing >= glassSize * 1.1`を推奨

### 透過が効かない

**原因**: `transmission`が0、または`thickness`が極端に小さい

**解決策**: `transmission: 0.6`, `thickness: 1.0`を試す

### ライトが暗すぎる

**原因**: `lightIntensity`が低い、またはカメラから遠すぎる

**解決策**: `lightIntensity1`を100〜200に増やす

## 📚 参考リンク

- [Three.js MeshPhysicalMaterial](https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [lil-gui Documentation](https://lil-gui.georgealways.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。
