# Geminiを使った量産ワークフロー

このドキュメントでは、Gemini AIを使ってThree.jsシーンを効率的に量産する具体的なワークフローを説明します。

## 基本的な考え方

Geminiを使った量産では、以下の3ステップを繰り返します：

```
1. テンプレートの準備 → 2. Geminiへの指示 → 3. 微調整 → 完成
   ↑                                                    ↓
   └────────────────── 次のシーンへ ←──────────────────┘
```

## ワークフロー1: Base Sceneのカスタマイズ

### ステップ1: 既存のBase Sceneを確認

```bash
# プロジェクトを起動
npm run dev
```

ブラウザで http://localhost:3000 を開き、デフォルトのシーンを確認します。

### ステップ2: Geminiに指示

**プロンプト例**:

```
以下の要件でBaseSceneをカスタマイズしてください：

- src/templates/BaseScene.tsを参考に、新しいProductSceneクラスを作成
- カメラの初期位置を[2, 1, 4]に変更
- 背景色をグラデーション（上: #87ceeb、下: #ffffff）に変更
- 床（PlaneGeometry）を追加し、影を受けるように設定
- OrbitControlsの最小距離を1、最大距離を10に制限

新しいファイルは src/templates/ProductScene.ts に作成してください。
```

### ステップ3: 生成されたコードを確認

Geminiが生成したコードをレビューし、以下を確認：

- [ ] 型エラーがないか
- [ ] BaseSceneのパターンに従っているか
- [ ] コメントが適切に書かれているか

### ステップ4: 微調整

必要に応じてパラメータを調整：

```typescript
// カメラ位置の微調整
camera.position.set(2.5, 1.2, 4.5) // 元: [2, 1, 4]

// 床のサイズ調整
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20), // 元: 10, 10
  // ...
)
```

## ワークフロー2: 新しいシェーダーの作成

### ステップ1: 既存のシェーダーを分析

```bash
# Subsurface Scatteringシェーダーを確認
cat src/shaders/subsurface.vert
cat src/shaders/subsurface.frag
```

### ステップ2: Geminiに指示

**プロンプト例**:

```
以下の要件で新しいシェーダーを作成してください：

参考ファイル:
- src/shaders/subsurface.vert
- src/shaders/subsurface.frag
- src/shaders/SubsurfaceMaterial.ts

作成するシェーダー: Iridescence（イリデッセンス、虹色の輝き）

要件:
1. vertex shaderはsubsurface.vertと同じ構造を使用
2. fragment shaderに以下を追加:
   - 視線角度に応じて色が変化する虹色効果
   - uniform: uIridescenceIntensity (0.0 - 1.0)
   - uniform: uIridescenceColor1, uIridescenceColor2, uIridescenceColor3
3. SubsurfaceMaterial.tsを参考に、IridescenceMaterial.tsを作成
4. 真珠用のプリセットを用意

ファイル:
- src/shaders/iridescence.vert
- src/shaders/iridescence.frag
- src/shaders/IridescenceMaterial.ts
```

### ステップ3: シェーダーのテスト

生成されたシェーダーをシーンに適用してテスト：

```tsx
import { IridescenceMaterial } from '@/shaders/IridescenceMaterial'

// Sceneコンポーネントで使用
<mesh>
  <sphereGeometry args={[1, 64, 64]} />
  <primitive object={new IridescenceMaterial()} attach="material" />
</mesh>
```

### ステップ4: パラメータ調整

Levaでリアルタイムに調整しながら、最適なパラメータを見つける：

```typescript
useControls({
  'イリデッセンス': folder({
    '強度': {
      value: 0.8,
      min: 0,
      max: 1,
      step: 0.05,
      onChange: (v) => material.setIridescenceIntensity(v)
    }
  })
})
```

## ワークフロー3: 新しいコンポーネントの作成

### ステップ1: デザインをスケッチ

作成したいシーンを図やテキストで記述：

```
プロダクトショーケース:
┌────────────────────────┐
│                        │
│  ○      ○      ○      │  ← 3つのボトル
│ Skin   Wax   Cream     │
│                        │
│      ～～～～～～      │  ← 床
└────────────────────────┘
```

### ステップ2: Geminiに指示

**プロンプト例**:

```
以下の要件でプロダクトショーケースコンポーネントを作成してください：

参考ファイル:
- src/components/SubsurfaceSphere.tsx
- src/shaders/SubsurfaceMaterial.ts

要件:
1. 3つの球体を横に並べる（間隔: 2.5）
2. 各球体に異なるSubsurfaceプリセットを適用:
   - 左: Skin
   - 中央: Wax
   - 右: Cream
3. 各球体は独立して回転（速度は微妙に異なる）
4. 球体の下にラベル（Text3D）を追加
5. Zustandストアから回転速度を取得

ファイル:
- src/components/ProductShowcase.tsx

追加のnpmパッケージが必要な場合は教えてください。
```

### ステップ3: コンポーネントの統合

生成されたコンポーネントをメインシーンに統合：

```tsx
// src/components/Scene.tsx
import { ProductShowcase } from './ProductShowcase'

export function Scene() {
  return (
    <Canvas>
      <StudioLights />
      <ProductShowcase />  {/* ← 追加 */}
      <OrbitControls />
    </Canvas>
  )
}
```

### ステップ4: UIコントロールの追加

各ボトルを個別に制御できるようにUIを拡張：

```
Geminiに指示:

src/store/sceneStore.tsに以下を追加してください:
1. bottles配列（各ボトルのマテリアル設定を管理）
2. setBottleProperty(index, key, value)メソッド
3. resetBottle(index)メソッド

src/ui/ControlPanel.tsxに以下を追加してください:
1. 「ボトル1」「ボトル2」「ボトル3」のフォルダー
2. 各ボトルのマテリアルパラメータを変更できるコントロール
```

## ワークフロー4: UIパネルの拡張

### ステップ1: 必要な機能を洗い出す

例：
- [ ] カメラ位置の変更
- [ ] HDRIの読み込み
- [ ] スクリーンショットの保存
- [ ] アニメーションの一時停止

### ステップ2: Geminiに指示

**プロンプト例**:

```
src/ui/ControlPanel.tsxに以下の機能を追加してください：

1. カメラコントロール:
   - Position X, Y, Z のスライダー
   - 「初期位置にリセット」ボタン
   - React Three FiberのuseCameraを使用

2. スクリーンショット:
   - 「スクリーンショットを保存」ボタン
   - gl.domElement.toDataURL()を使用
   - ダウンロード機能を実装

3. アニメーション:
   - 「一時停止 / 再生」トグルボタン
   - ZustandストアにanimationPausedステートを追加

参考:
- src/store/sceneStore.ts (Zustandストア)
- React Three FiberのuseThreeフック
```

### ステップ3: 動作確認

各機能をテストし、期待通りに動作するか確認：

- [ ] カメラが移動する
- [ ] スクリーンショットが保存できる
- [ ] アニメーションが停止/再開する

## ワークフロー5: 複雑なシーンの構築

### ステップ1: シーンを段階的に構築

複雑なシーンは一度に作らず、段階的に構築します：

**フェーズ1: 基本形状**
```
Geminiに指示:
円形のテーブル（CylinderGeometry）を作成し、
その上に5つの製品を円形に配置してください。
```

**フェーズ2: マテリアル適用**
```
Geminiに指示:
各製品にSubsurfaceMaterialを適用し、
製品ごとに異なる色を設定してください。
```

**フェーズ3: アニメーション追加**
```
Geminiに指示:
テーブル全体がゆっくり回転するアニメーションを追加してください。
useFrameを使用し、回転速度は0.1にしてください。
```

**フェーズ4: ポストプロセッシング**
```
Geminiに指示:
@react-three/postprocessingを使って、
Bloom効果を追加してください。強度は0.5に設定してください。
```

### ステップ2: 各フェーズで動作確認

フェーズごとに動作を確認し、問題があれば修正してから次に進みます。

## Geminiへの効果的なプロンプト

### 良いプロンプトの例

✅ **具体的**:
```
sphere geometryのセグメント数を64から32に変更して、
パフォーマンスを改善してください。
```

✅ **参考ファイルを明示**:
```
src/components/SubsurfaceSphere.tsxを参考に、
同じ構造でCubeコンポーネントを作成してください。
```

✅ **制約を明確に**:
```
新しい依存関係は追加せず、既存のThree.jsとR3Fの機能のみを使用してください。
```

✅ **期待する出力を指定**:
```
ファイル:
- src/components/NewComponent.tsx
- src/components/NewComponent.test.tsx (Jest test)
```

### 悪いプロンプトの例

❌ **曖昧**:
```
もっときれいにして
```

❌ **参考なし**:
```
かっこいいシェーダーを作って
```

❌ **制約が不明確**:
```
最新の技術を使って実装して
```

## トラブルシューティング

### 問題1: シェーダーがコンパイルエラー

**解決策**:
```
Geminiに指示:
以下のGLSLエラーを修正してください:

エラーメッセージ:
ERROR: 0:15: 'uSubsurfaceIntesity' : undeclared identifier

ファイル: src/shaders/subsurface.frag
```

### 問題2: パフォーマンスが悪い

**解決策**:
```
Geminiに指示:
以下のコンポーネントのパフォーマンスを最適化してください:

ファイル: src/components/HeavyComponent.tsx

問題:
- FPSが30以下に落ちる
- 100個のオブジェクトを描画している

最適化案:
- InstancedMeshを使用
- LOD (Level of Detail)を実装
```

### 問題3: React Three Fiberのフックエラー

**解決策**:
```
Geminiに指示:
以下のエラーを修正してください:

エラー: useFrame must be called within a Canvas component

ファイル: src/components/MyComponent.tsx

React Three Fiberのルールに従って修正してください。
```

## ベストプラクティス

### 1. 小さく始める

```
❌ 最初から完璧なシーンを作ろうとしない
✅ 基本的な形状から始めて、徐々に複雑にする
```

### 2. バージョン管理

```bash
# 各フェーズでコミット
git commit -m "Add basic product showcase"
git commit -m "Apply subsurface materials"
git commit -m "Add rotation animation"
```

### 3. パラメータの記録

```typescript
// 良いパラメータは定数化して記録
export const PRODUCT_SPACING = 2.5
export const ROTATION_SPEED = 0.5
export const CAMERA_DEFAULT_POSITION = [0, 2, 5]
```

### 4. ドキュメント化

```typescript
/**
 * Product Showcase Component
 *
 * 3つの製品を横に並べて表示するコンポーネント
 *
 * 作成日: 2025-01-15
 * Geminiプロンプト: "3つの球体を横に並べて..."
 * 調整内容:
 * - spacing: 2.5 → 3.0 に変更（2025-01-16）
 * - rotation speed: 0.5 → 0.3 に変更（2025-01-17）
 */
```

## 量産のコツ

### コツ1: テンプレートを育てる

初回は時間がかかりますが、テンプレートが充実すると量産が加速します：

```
1回目: 5時間（ゼロから）
2回目: 2時間（テンプレート活用）
3回目: 30分（テンプレート + プリセット）
4回目以降: 10分（完全にパターン化）
```

### コツ2: プリセットを増やす

よく使う設定はプリセット化：

```typescript
// src/templates/presets.ts
export const BEAUTY_PRESETS = {
  skinCare: { baseColor: '#ffd4b8', ... },
  hairCare: { baseColor: '#f4e4c1', ... },
  bodyCare: { baseColor: '#ffe4e1', ... },
  // ...
}
```

### コツ3: コンポーネントをコンポーズ

小さなコンポーネントを組み合わせて大きなシーンを作る：

```tsx
<Scene>
  <StudioLights />
  <ProductShowcase products={skinCareProducts} />
  <Floor />
  <Background />
</Scene>
```

## まとめ

Geminiを使った量産ワークフローのポイント：

1. **テンプレート化**: 繰り返し使う設定をテンプレート化
2. **段階的構築**: 小さく始めて、徐々に複雑に
3. **明確な指示**: Geminiに具体的で明確な指示を出す
4. **継続的改善**: テンプレートとプリセットを育てる

このワークフローを繰り返すことで、Three.jsシーンの量産速度が劇的に向上します！
