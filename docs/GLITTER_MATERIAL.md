## Glitter Material ドキュメント

## 概要

Glitter Material（ラメ・パールマテリアル）は、化粧品・美容分野で需要の高い「きらめき（ラメ・パール感）」を表現するカスタムシェーダーマテリアルです。

画像では伝わらない**「視点を動かしたときのキラキラ感」**をGLSLで実現しています。

## 主な特徴

### 1. リアルタイムきらめき表現

- **視線角度依存のスペキュラハイライト**: カメラ位置に応じて光り方が変化
- **ノイズ関数による微細な凹凸**: ランダムに配置されたラメ粒子
- **時間経過アニメーション**: 静止状態でも光が揺らめく

### 2. パラメータ調整

```typescript
interface GlitterMaterialParams {
  baseColor: string | number      // ベースとなる色（例: 口紅の色）
  glitterColor?: string | number  // ラメの色（省略時は白）
  glitterScale?: number           // ラメの細かさ（大きいほど細かい）
  glitterStrength?: number        // ラメの強さ（輝度）
}
```

### 3. プリセット

| プリセット | ベースカラー | ラメカラー | 用途 |
|-----------|------------|----------|------|
| Lipstick | #aa0022 (深い赤) | #ffd700 (ゴールド) | 口紅 |
| Eyeshadow | #9b59b6 (紫) | #c0c0c0 (シルバー) | アイシャドウ |
| Nail | #ff69b4 (ピンク) | #ffffff (ホログラム) | ネイル |

## 使い方

### 基本的な使い方

```typescript
import { GlitterMaterial } from '@/shaders/GlitterMaterial'

// マテリアルのインスタンス化
const lipstickMaterial = new GlitterMaterial({
  baseColor: 0xaa0022,   // 深い赤
  glitterColor: 0xffd700, // ゴールドのラメ
  glitterScale: 80.0,     // 細かいラメ
  glitterStrength: 3.5    // 強めに光らせる
})

// メッシュに適用
const sphereGeo = new THREE.SphereGeometry(1, 64, 64)
const lipstickMesh = new THREE.Mesh(sphereGeo, lipstickMaterial)
scene.add(lipstickMesh)

// レンダリングループ内で時間を更新
const clock = new THREE.Clock()
function animate() {
  requestAnimationFrame(animate)

  const delta = clock.getDelta()
  lipstickMaterial.updateTime(delta) // きらめきアニメーション

  renderer.render(scene, camera)
}
animate()
```

### プリセットの使用

```typescript
import { createLipstickMaterial, createEyeshadowMaterial, createNailMaterial } from '@/shaders/GlitterMaterial'

// 口紅プリセット
const lipstick = createLipstickMaterial()

// アイシャドウプリセット
const eyeshadow = createEyeshadowMaterial()

// ネイルプリセット
const nail = createNailMaterial()
```

### React Three Fiberでの使用

```tsx
import { GlitterScene } from '@/components/GlitterScene'
import { GlitterControlPanel } from '@/ui/GlitterControlPanel'

function App() {
  return (
    <>
      <GlitterScene />
      <GlitterControlPanel />
    </>
  )
}
```

## 技術的な詳細

### GLSL シェーダーの仕組み

#### Vertex Shader

```glsl
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
```

- 法線ベクトルをワールド空間に変換
- カメラから見た頂点位置を計算
- UV座標とともにフラグメントシェーダーに渡す

#### Fragment Shader

```glsl
// 1. ノイズ関数でランダムな粒子を生成
vec2 scaledUv = vUv * uGlitterScale;
vec2 gridId = floor(scaledUv);
float noiseVal = random(gridId);

// 2. 時間経過で明滅
float timeFactor = sin(uTime * 2.0 + noiseVal * 6.28) * 0.5 + 0.5;

// 3. 視線角度に応じたスペキュラハイライト
float specBase = max(0.0, dot(normal, viewDir));
float glitterIntensity = pow(specBase * noiseVal * timeFactor, 15.0);

// 4. 最終的な色を合成
vec3 finalColor = uBaseColor + uGlitterColor * glitterIntensity * uGlitterStrength;
```

**ポイント**:
- `uGlitterScale`: 値を大きくすると粒子が細かくなる
- `pow(..., 15.0)`: 指数関数で鋭いハイライトを作る
- `timeFactor`: sin波でゆらぎを表現

### パラメータ調整のコツ

#### ラメの細かさ（glitterScale）

- **10-30**: 大粒ラメ（グリッター）
- **50-80**: 標準的なラメ（口紅、ネイル）
- **100-200**: 微細なパール感（アイシャドウ）

#### ラメの強さ（glitterStrength）

- **0-1**: 控えめなパール感
- **2-4**: 標準的なラメ感
- **5以上**: 強烈なグリッター（パーティーメイク）

#### ベースカラーとラメカラーの組み合わせ

| ベース | ラメ | 効果 |
|-------|------|------|
| 赤系 | ゴールド | 高級感、華やかさ |
| 紫系 | シルバー | クールで洗練された印象 |
| ピンク系 | 白・虹色 | 可愛らしさ、透明感 |
| ブラウン系 | ゴールド | ナチュラルで上品 |

## 実務での活用例

### 1. ECサイトの商品ビジュアライゼーション

**課題**: 静止画では伝わらないラメ感をどう表現するか

**解決策**:
```typescript
// 自動回転で様々な角度から見せる
function ProductViewer() {
  const material = createLipstickMaterial()

  useFrame((state, delta) => {
    mesh.rotation.y += delta * 0.3
    material.updateTime(delta)
  })

  return <mesh geometry={productModel} material={material} />
}
```

### 2. バーチャル試着（AR/VR）

**課題**: リアルタイムで質感を再現する必要がある

**解決策**:
```typescript
// UIスライダーと連携してリアルタイム調整
const { glitterScale } = useGlitterStore()

useEffect(() => {
  material.setGlitterScale(glitterScale)
}, [glitterScale])
```

### 3. 営業ツール・プレゼンテーション

**課題**: 新商品の質感を事前にシミュレートしたい

**解決策**:
```typescript
// プリセットをワンクリックで切り替え
<button onClick={() => loadPreset('lipstick')}>口紅</button>
<button onClick={() => loadPreset('eyeshadow')}>アイシャドウ</button>
<button onClick={() => loadPreset('nail')}>ネイル</button>
```

## 量産化・拡張のヒント

### 1. テクスチャとの組み合わせ

```glsl
uniform sampler2D uTexture;

void main() {
  vec4 texColor = texture2D(uTexture, vUv);
  vec3 baseColor = texColor.rgb * uBaseColor;
  // ... ラメ計算
  vec3 finalColor = baseColor + glitterEffect;
}
```

実際の製品画像やロゴを重ねることができます。

### 2. 環境マップ（HDRI）の活用

```glsl
uniform samplerCube uEnvMap;

void main() {
  vec3 reflectDir = reflect(-viewDir, normal);
  vec3 envColor = textureCube(uEnvMap, reflectDir).rgb;
  // 環境反射を加えることでよりリアルに
  vec3 finalColor = baseColor + glitterEffect + envColor * reflectivity;
}
```

### 3. UIライブラリとの連携

```tsx
// React側でスライダーを動かすと即座に反映
function MaterialEditor() {
  const [scale, setScale] = useState(80)

  return (
    <div>
      <Slider value={scale} onChange={setScale} />
      <GlitterObject glitterScale={scale} />
    </div>
  )
}
```

### 4. Geminiでの自動生成プロンプト例

```
「GlitterMaterial.tsを参考に、虹色のイリデッセンス（玉虫色）効果を追加してください。
視線角度に応じてRGB値が連続的に変化するようにし、
uIridescenceIntensityパラメータで強度を調整できるようにしてください。」
```

## FAQ

### Q1: パフォーマンスへの影響は？

**A**: ピクセルシェーダーでの計算なので、解像度とポリゴン数に依存します。

- **最適化のコツ**:
  - ジオメトリは必要最小限のポリゴン数に
  - ラメの細かさ（glitterScale）は適度に（100以下推奨）
  - モバイルでは pow() の指数を下げる（15.0 → 10.0）

### Q2: 他のマテリアルと組み合わせられますか？

**A**: はい、Three.jsの標準的なマテリアルシステムと併用できます。

```typescript
// MeshStandardMaterialと併用
const baseMaterial = new THREE.MeshStandardMaterial({ ... })
const glitterMaterial = new GlitterMaterial({ ... })

// レイヤーを分けて描画
scene.add(baseMesh)
scene.add(glitterMesh)
```

### Q3: 実際の製品モデルに適用できますか？

**A**: はい、GLTFなどでインポートしたモデルにも適用可能です。

```typescript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const loader = new GLTFLoader()
loader.load('lipstick.gltf', (gltf) => {
  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      child.material = new GlitterMaterial({ ... })
    }
  })
})
```

## トラブルシューティング

### 問題: ラメが全く見えない

**原因**: 照明が暗い、またはカメラが動いていない

**解決策**:
1. DirectionalLightの強度を1.0以上に
2. カメラを動かすか、オブジェクトを回転させる
3. glitterStrengthを大きくする（5.0など）

### 問題: ラメが粗すぎる / 細かすぎる

**原因**: glitterScaleの値が適切でない

**解決策**:
- 粗い → glitterScaleを大きく（100-200）
- 細かい → glitterScaleを小さく（30-50）

### 問題: 色が真っ白になる

**原因**: glitterStrengthが大きすぎる

**解決策**:
- glitterStrengthを下げる（0.5-3.0の範囲で調整）

## まとめ

Glitter Materialは、化粧品ECや美容業界で強力なビジュアライゼーションツールになります。

**主な利点**:
- ✅ 画像では伝わらないきらめきを表現
- ✅ リアルタイムでパラメータ調整可能
- ✅ UIと連携して営業ツール化
- ✅ Geminiで簡単に機能拡張

**応用例**:
- ECサイトの商品ビジュアライゼーション
- AR/VRメイクアップシミュレーター
- 新商品のプレゼンテーション
- バーチャル試着アプリ

このマテリアルをベースに、Geminiに指示を出すことでさらなる機能拡張が可能です！
