# Three.js Gemini Automation

Geminiを使ってThree.jsシーンを量産するための包括的なプロジェクトテンプレート。美容系製品のビジュアライゼーションに特化。

## 🎯 プロジェクトの目的

このプロジェクトは、**Gemini AIを活用してThree.jsシーンを効率的に量産する**ための戦略を実装したものです。特に美容系製品（スキンケア、コスメ、ボディケアなど）のビジュアライゼーションに最適化されています。

## 🚀 Geminiを使った量産戦略

### 1. Base Sceneのテンプレート化

カメラ、照明（Studio Lighting）、レンダラー、OrbitControlsなどの基本設定を記述したボイラープレートを用意。

- **カメラ**: 美容系に適したFOV 50°の設定
- **Studio Lighting**: 3点照明システム（Key、Fill、Back Light）
- **レンダラー**: ACESFilmic Tone Mapping、高品質アンチエイリアス
- **OrbitControls**: スムーズなダンピング設定

### 2. シェーダー生成の自動化

美容系で必須となる複雑なマテリアル（Subsurface Scatteringなど）をテンプレート化。

- **Subsurface Scattering**: 肌、石鹸、ワックスなどの半透明素材
- **プリセット**: 肌、ワックス、クリームの3種類
- **リアルタイム調整**: UIから即座にパラメータを変更可能

### 3. UIと3Dの連携ロジック

ReactとThree.jsのCanvas内のオブジェクトを連動させるState管理。

- **React Three Fiber**: 宣言的なThree.jsコンポーネント
- **Zustand**: 軽量なステート管理
- **Leva**: デバッグUIではなく、プロダクションレベルのコントロールパネル

## 📦 セットアップ

### 必要要件

- Node.js 18+
- npm or yarn or pnpm

### インストール

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev

# ビルド
npm run build
```

## 🏗️ プロジェクト構造

```
threejs/
├── src/
│   ├── templates/          # Base Sceneテンプレート
│   │   ├── BaseScene.ts    # カメラ、レンダラー、OrbitControls
│   │   ├── StudioLighting.ts  # 3点照明システム
│   │   └── config.ts       # 設定ファイル
│   ├── shaders/            # GLSLシェーダー
│   │   ├── subsurface.vert # Vertex Shader
│   │   ├── subsurface.frag # Fragment Shader
│   │   └── SubsurfaceMaterial.ts  # ShaderMaterialラッパー
│   ├── components/         # React Three Fiberコンポーネント
│   │   ├── Scene.tsx       # メインシーン
│   │   ├── SubsurfaceSphere.tsx  # サブサーフェスオブジェクト
│   │   └── StudioLights.tsx  # 照明コンポーネント
│   ├── ui/                 # UIコンポーネント
│   │   └── ControlPanel.tsx  # Levaコントロールパネル
│   ├── store/              # ステート管理
│   │   └── sceneStore.ts   # Zustandストア
│   ├── utils/              # ユーティリティ
│   ├── App.tsx             # メインアプリケーション
│   └── main.tsx            # エントリーポイント
├── docs/                   # ドキュメント
│   ├── ARCHITECTURE.md     # アーキテクチャ
│   └── GEMINI_WORKFLOW.md  # Geminiワークフロー
├── public/                 # 静的ファイル
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🎨 使い方

### 1. Base Sceneの使用

```typescript
import { BaseScene } from '@/templates/BaseScene'

// コンテナ要素
const container = document.getElementById('canvas-container')!

// Base Sceneを作成
const scene = new BaseScene(container, {
  camera: {
    fov: 50,
    position: [0, 0, 5]
  },
  lighting: {
    keyLight: { intensity: 1.2 }
  }
})

// アニメーションを開始
scene.start((delta) => {
  // カスタム更新処理
})
```

### 2. Subsurface Scatteringマテリアル

```typescript
import { SubsurfaceMaterial, createSkinMaterial } from '@/shaders/SubsurfaceMaterial'

// プリセットを使用
const skinMaterial = createSkinMaterial()

// カスタム設定
const customMaterial = new SubsurfaceMaterial({
  baseColor: new THREE.Color(0xffd4b8),
  subsurfaceColor: new THREE.Color(0xff6b6b),
  subsurfaceIntensity: 0.6
})

// メッシュに適用
const mesh = new THREE.Mesh(
  new THREE.SphereGeometry(1, 64, 64),
  skinMaterial
)
```

### 3. React Three Fiberとの統合

```tsx
import { Canvas } from '@react-three/fiber'
import { SubsurfaceSphere } from '@/components/SubsurfaceSphere'
import { StudioLights } from '@/components/StudioLights'

function App() {
  return (
    <Canvas>
      <StudioLights />
      <SubsurfaceSphere />
    </Canvas>
  )
}
```

## 🤖 Geminiとの連携方法

このプロジェクトは、Geminiに以下のようなプロンプトを投げることで、シーンを量産できるように設計されています。

### 例1: 新しいマテリアルの作成

```
Three.jsで「真珠のような光沢」を持つShaderMaterialを書いて。
subsurface.vert と subsurface.frag を参考に、
真珠特有のイリデッセンス（虹色の輝き）を追加してください。
```

### 例2: 新しいシーンの作成

```
BaseSceneテンプレートを使って、
化粧品ボトルを3つ並べたプロダクトショーケースを作成してください。
それぞれのボトルにはSubsurfaceMaterialの異なるプリセットを適用し、
ゆっくり回転させてください。
```

### 例3: UIパネルの拡張

```
ControlPanel.tsxに、以下のコントロールを追加してください:
- カメラの位置を変更するスライダー
- 背景にHDRI環境マップを読み込むボタン
- シーンをスクリーンショット保存するボタン
```

詳細なワークフローは [docs/GEMINI_WORKFLOW.md](docs/GEMINI_WORKFLOW.md) を参照してください。

## 📚 技術スタック

- **Three.js**: 3Dグラフィックスライブラリ
- **React**: UIフレームワーク
- **React Three Fiber**: ReactでThree.jsを使うためのレンダラー
- **@react-three/drei**: 便利なヘルパー（OrbitControlsなど）
- **Zustand**: 軽量ステート管理
- **Leva**: GUIコントロールパネル
- **TypeScript**: 型安全性
- **Vite**: 高速ビルドツール
- **vite-plugin-glsl**: GLSLシェーダーのインポート

## 🎓 学習リソース

- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber/)
- [Subsurface Scattering Theory](https://en.wikipedia.org/wiki/Subsurface_scattering)
- [Studio Lighting Techniques](https://en.wikipedia.org/wiki/Three-point_lighting)

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

Issue、Pull Requestを歓迎します。

---

**Geminiを活用して、美しいThree.jsシーンを効率的に量産しましょう！** 🚀
