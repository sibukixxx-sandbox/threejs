# アーキテクチャドキュメント

このドキュメントでは、プロジェクトのアーキテクチャと設計思想について説明します。

## 設計思想

このプロジェクトは、**Gemini AIを使ってThree.jsシーンを効率的に量産する**ことを目的としています。そのため、以下の設計原則に基づいています：

1. **テンプレート化**: 繰り返し使用される設定をテンプレート化し、再利用可能にする
2. **モジュール化**: 各機能を独立したモジュールとして実装し、組み合わせ可能にする
3. **型安全性**: TypeScriptを使用し、AIが生成したコードでも型エラーが出にくくする
4. **宣言的**: React Three Fiberを使用し、3Dシーンを宣言的に記述できるようにする

## レイヤー構造

```
┌─────────────────────────────────────┐
│         UI Layer (React)            │
│  - ControlPanel (Leva)              │
│  - App.tsx                          │
└─────────────────────────────────────┘
              ↕ (Zustand Store)
┌─────────────────────────────────────┐
│    Component Layer (R3F)            │
│  - Scene.tsx                        │
│  - SubsurfaceSphere.tsx             │
│  - StudioLights.tsx                 │
└─────────────────────────────────────┘
              ↕ (React Three Fiber)
┌─────────────────────────────────────┐
│    Template Layer (Three.js)        │
│  - BaseScene.ts                     │
│  - StudioLighting.ts                │
│  - config.ts                        │
└─────────────────────────────────────┘
              ↕ (Three.js API)
┌─────────────────────────────────────┐
│    Shader Layer (GLSL)              │
│  - subsurface.vert                  │
│  - subsurface.frag                  │
│  - SubsurfaceMaterial.ts            │
└─────────────────────────────────────┘
```

## 各レイヤーの役割

### 1. UI Layer

**責務**: ユーザーとのインタラクション、パラメータ調整

- `ControlPanel.tsx`: Levaを使ったGUIコントロールパネル
- `App.tsx`: アプリケーションのエントリーポイント

**技術**: React, Leva

### 2. Component Layer

**責務**: 3Dシーンの構築、アニメーション、状態管理との連携

- `Scene.tsx`: メインシーン（Canvas、カメラ、背景）
- `SubsurfaceSphere.tsx`: Subsurface Scatteringを適用した球体
- `StudioLights.tsx`: 3点照明システム

**技術**: React Three Fiber, @react-three/drei

### 3. Template Layer

**責務**: Three.jsの基本設定のテンプレート化、再利用可能なボイラープレート

- `BaseScene.ts`: カメラ、レンダラー、OrbitControlsの基本設定
- `StudioLighting.ts`: 3点照明（Key、Fill、Back Light）
- `config.ts`: デフォルト設定値

**技術**: Three.js, TypeScript

### 4. Shader Layer

**責務**: カスタムシェーダーの実装、マテリアルの生成

- `subsurface.vert`: Vertex Shader（頂点変換）
- `subsurface.frag`: Fragment Shader（ピクセル色計算）
- `SubsurfaceMaterial.ts`: ShaderMaterialのラッパークラス

**技術**: GLSL, Three.js ShaderMaterial

## ステート管理

```
┌──────────────────────────────────────────┐
│         sceneStore (Zustand)             │
│  ┌────────────────────────────────────┐  │
│  │ material: MaterialState            │  │
│  │  - baseColor                       │  │
│  │  - subsurfaceColor                 │  │
│  │  - subsurfaceIntensity             │  │
│  │  - ...                             │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ lighting: LightingState            │  │
│  │  - keyIntensity                    │  │
│  │  - fillIntensity                   │  │
│  │  - backIntensity                   │  │
│  │  - ambientIntensity                │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ scene: SceneState                  │  │
│  │  - backgroundColor                 │  │
│  │  - rotationSpeed                   │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
         ↕                    ↕
   ┌──────────┐        ┌──────────────┐
   │ UI       │        │ 3D Components│
   │ (Leva)   │        │ (R3F)        │
   └──────────┘        └──────────────┘
```

**Zustand**を使用する理由：

1. **軽量**: Redux比で非常に軽量（1KB未満）
2. **シンプル**: Boilerplateが少なく、直感的なAPI
3. **React Three Fiberとの相性**: hooksベースで扱いやすい
4. **AI生成コードとの親和性**: シンプルな構造なので、AIが生成しやすい

## データフロー

```
┌─────────────┐
│ User Input  │
│ (Leva UI)   │
└──────┬──────┘
       │
       ↓
┌──────────────────────────────────┐
│ Zustand Store                    │
│ - setMaterialProperty()          │
│ - setLightingProperty()          │
│ - setBackgroundColor()           │
└──────┬───────────────────────────┘
       │ (Subscribe)
       ↓
┌──────────────────────────────────┐
│ React Three Fiber Components     │
│ - useSceneStore()                │
│ - useEffect() でuniforms更新     │
└──────┬───────────────────────────┘
       │
       ↓
┌──────────────────────────────────┐
│ Three.js Scene                   │
│ - ShaderMaterial.uniforms        │
│ - Light.intensity                │
│ - Scene.background               │
└──────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────┐
│ WebGL Rendering                  │
└──────────────────────────────────┘
```

## Subsurface Scatteringの実装

### 物理的背景

Subsurface Scattering（表面下散乱）は、光が物体の表面下に侵入し、内部で散乱してから再び外に出る現象です。

```
     Light ↓
        ↓
  ┌─────┴─────┐
  │   Surface │
  ├───────────┤
  │           │ ← Scattering inside
  │  Material │
  │           │
  └─────┬─────┘
        ↓
   Transmitted
```

### シェーダーでの近似

本プロジェクトでは、以下の技法を組み合わせて実装しています：

1. **Translucency（半透明性）**:
   ```glsl
   float subsurface = max(0.0, dot(-normal, lightDir));
   ```
   光が裏側から透過してくる効果

2. **Subsurface Color**:
   ```glsl
   vec3 subsurfaceLight = subsurface * uSubsurfaceColor * uLightColor;
   ```
   内部で散乱した光の色（肌なら血色、ワックスなら黄色）

3. **Power Function**:
   ```glsl
   subsurface = pow(subsurface, uSubsurfacePower) * uSubsurfaceIntensity;
   ```
   散乱の強さを制御

### プリセット

| プリセット | baseColor | subsurfaceColor | 用途 |
|-----------|-----------|-----------------|------|
| Skin | #ffd4b8 | #ff6b6b (血色) | 肌、フェイスマスク |
| Wax | #fff8dc | #ffeaa7 | 石鹸、キャンドル、バーム |
| Cream | #fff5ee | #ffe4e1 | クリーム、ローション、ミルク |

## Studio Lightingの実装

### 3点照明（Three-Point Lighting）

映画やプロダクト撮影で使われる標準的な照明配置です。

```
        Back Light ↓
            ┌───┐
            │   │
        ┌───┴─┬─┴───┐
Key → ← │     │     │ ← Fill
Light   │     ●     │   Light
        │  Object   │
        └───────────┘
```

#### 1. Key Light（キーライト）

**役割**: メインの照明、シーンの主要な光源

**設定**:
- Position: `[5, 5, 5]` (45度上方から)
- Intensity: `1.2`
- CastShadow: `true`

#### 2. Fill Light（フィルライト）

**役割**: 影を柔らかくする補助光

**設定**:
- Position: `[-5, 0, 3]` (Key Lightの反対側)
- Intensity: `0.6` (Key Lightの約50%)
- CastShadow: `false`

#### 3. Back Light（バックライト）

**役割**: 輪郭を強調、被写体を背景から分離

**設定**:
- Position: `[0, 5, -5]` (後方上部)
- Intensity: `0.8`
- CastShadow: `false`

#### 4. Ambient Light（アンビエントライト）

**役割**: 全体的な環境光、完全な暗闇を防ぐ

**設定**:
- Intensity: `0.3`

## パフォーマンス最適化

### 1. ジオメトリの最適化

```typescript
// 適切なセグメント数
new THREE.SphereGeometry(1, 64, 64) // 高品質
new THREE.SphereGeometry(1, 32, 32) // 中品質（推奨）
new THREE.SphereGeometry(1, 16, 16) // 低品質
```

### 2. シャドウマップの最適化

```typescript
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap // ソフトシャドウ
light.shadow.mapSize.width = 2048 // 高品質
```

### 3. レンダラーの最適化

```typescript
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // 最大2まで
```

### 4. React Three Fiberの最適化

```typescript
// useMemoでShaderMaterialをメモ化
const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({...}), [])

// useFrameで効率的なアニメーション
useFrame((state, delta) => {
  meshRef.current.rotation.y += delta * rotationSpeed
})
```

## 拡張ポイント

このアーキテクチャは、以下のような拡張が容易です：

### 1. 新しいマテリアルの追加

```typescript
// src/shaders/iridescence.vert
// src/shaders/iridescence.frag
// src/shaders/IridescenceMaterial.ts
export class IridescenceMaterial extends THREE.ShaderMaterial {...}
```

### 2. 新しいプリセットの追加

```typescript
// src/templates/config.ts
export const PEARL_PRESET = {
  baseColor: '#f8f8ff',
  iridescenceIntensity: 0.9,
  // ...
}
```

### 3. 新しいコンポーネントの追加

```tsx
// src/components/ProductBottle.tsx
export function ProductBottle() {
  return (
    <group>
      <mesh>...</mesh>
    </group>
  )
}
```

### 4. 新しいUIコントロールの追加

```typescript
// src/ui/ControlPanel.tsx
useControls({
  'カメラ': folder({
    '位置X': { value: 0, onChange: (v) => ... }
  })
})
```

## まとめ

このアーキテクチャは、**Gemini AIがコードを理解・生成しやすい**ように設計されています：

- **明確な責任分離**: 各レイヤーが独立している
- **型安全性**: TypeScriptで型が明確
- **テンプレート化**: 再利用可能なパターン
- **宣言的**: React Three Fiberで直感的

これにより、Geminiに「〇〇を追加して」と指示するだけで、適切な場所に適切なコードを生成できます。
