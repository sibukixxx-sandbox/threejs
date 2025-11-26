# Vanning Simulator ドキュメント

## 概要

Vanning Simulator（バンニング・シミュレーター）は、コンテナに貨物を積載する際の最適化をリアルタイムで可視化するツールです。

**バンニング（Vanning）**とは、貿易実務において貨物をコンテナに積み込む作業のことを指します。

## 主な機能

### 1. 複数の積載アルゴリズム（Strategy Pattern）

3種類のアルゴリズムを切り替えて使用できます：

#### Simple Stacking（シンプル積み）
- **説明**: XYZの3軸に沿って単純にグリッド配置
- **用途**: 同一サイズの貨物を高速に計算
- **メリット**: 最も計算が高速
- **デメリット**: 回転を考慮しないため利用率が低い場合がある

#### Pallet Loading（パレット積み）
- **説明**: 標準パレット（1.2m x 1.0m）上に積載してからコンテナに配置
- **用途**: 実際の物流現場に近い積載方法
- **メリット**: フォークリフトでの積み下ろしを想定した現実的な配置
- **デメリット**: パレットサイズに制約される

#### Optimized Packing（最適化積み）
- **説明**: 貨物を90度回転させても試し、最も多く積載できる方向を選択
- **用途**: 容積利用率を最大化したい場合
- **メリット**: 最も効率的な積載が可能
- **デメリット**: 計算時間がやや長い

### 2. コンテナプリセット

| プリセット | 内寸 (W x H x D) | 用途 |
|-----------|------------------|------|
| 20ft Container | 5.9m x 2.39m x 2.35m | 一般的な小型コンテナ |
| 40ft Container | 12.03m x 2.39m x 2.35m | 標準的な大型コンテナ |
| 40ft High Cube | 12.03m x 2.69m x 2.35m | 高さが必要な貨物用 |
| Custom | 任意のサイズ | カスタム設定 |

### 3. 貨物プリセット

| プリセット | サイズ (W x H x D) | 用途 |
|-----------|-------------------|------|
| Small Box | 50cm x 40cm x 50cm | 小型ダンボール |
| Medium Box | 80cm x 60cm x 80cm | 中型ダンボール |
| Large Box | 120cm x 100cm x 120cm | 大型ダンボール |
| Custom | 任意のサイズ | カスタム設定 |

### 4. リアルタイム統計情報

シミュレーション結果として以下の情報を表示：

- **積載数**: コンテナに入る貨物の個数
- **容積利用率**: コンテナの容積に対する貨物の占有率（%）
- **重心位置**: 積載された貨物全体の重心座標（X, Y, Z）
- **警告メッセージ**: 安全性に関する警告

### 5. 安全性チェック

以下の条件で警告を表示：

```typescript
// 容積利用率が低い
if (volumeUtilization < 0.5) {
  warning: "容積利用率が50%未満です"
}

// 重心が中心から大きくずれている
if (centerOfGravityOffset > 1.0m) {
  warning: "重心が中心から大きくずれています"
}

// 重心が高すぎる
if (centerOfGravity.y > container.height * 0.7) {
  warning: "重心が高すぎます。転倒のリスクがあります"
}
```

## 使い方

### 基本的な使い方

1. **シーン選択パネルで「Vanning Simulator」を選択**

2. **コンテナを選択**
   - プリセットから選択、または幅・高さ・奥行きを手動設定

3. **貨物を設定**
   - プリセットから選択、または寸法を手動設定
   - 隙間（gap）を調整して貨物間のマージンを設定

4. **アルゴリズムを選択**
   - Simple Stacking、Pallet Loading、Optimized Packingから選択

5. **統計情報を確認**
   - 積載数、容積利用率、重心位置をチェック
   - 警告メッセージがあれば対応

### 高度な使い方

#### カスタム貨物の設定

```typescript
// UI上で設定
貨物プリセット → カスタム
幅: 0.75m
高さ: 0.6m
奥行き: 0.8m
隙間: 0.02m (2cm)
```

#### 最適な積載方法の発見

1. **3つのアルゴリズムをすべて試す**
   - Simple Stacking
   - Pallet Loading
   - Optimized Packing

2. **容積利用率を比較**
   - 最も高い利用率のアルゴリズムを選択

3. **重心位置を確認**
   - 重心が中心に近いほど安定

4. **貨物サイズを微調整**
   - わずかなサイズ変更で積載数が大きく変わることがある

## 技術的な詳細

### InstancedMeshによる高速描画

```typescript
// 通常のMesh: N個の貨物 = Nドローコール ❌
for (let i = 0; i < 1000; i++) {
  scene.add(new THREE.Mesh(geometry, material))
}

// InstancedMesh: N個の貨物 = 1ドローコール ✅
const instancedMesh = new THREE.InstancedMesh(geometry, material, 1000)
scene.add(instancedMesh)
```

### Strategy Patternによる拡張性

新しいアルゴリズムの追加が容易：

```typescript
// 新しいアルゴリズムを実装
export class MyCustomStrategy implements LoadingStrategy {
  name = 'My Custom Algorithm'

  calculate(container: ContainerSpec, cargo: CargoSpec): LoadingResult {
    // カスタムロジック
    return { count, positions, volumeUtilization, centerOfGravity }
  }
}

// ストラテジーに登録
export const LOADING_STRATEGIES = {
  simpleStacking: new SimpleStackingStrategy(),
  palletLoading: new PalletLoadingStrategy(),
  optimizedPacking: new OptimizedPackingStrategy(),
  myCustom: new MyCustomStrategy() // ← 追加
}
```

### Zustandによるステート管理

React Three FiberとUIを同期：

```typescript
// ストアの状態が変更されると...
setCargoProperty('width', 0.8)

// → VanningSimulatorComponentが自動的に再計算
useEffect(() => {
  const result = simulator.simulateLoading(container, cargo)
  setLoadingStats(result)
}, [container, cargo, algorithm])

// → UIパネルに結果が表示される
useControls({
  '積載数': { value: loadingStats.count }
})
```

## プログラムから使う

### VanningSimulatorクラスの直接使用

```typescript
import * as THREE from 'three'
import { VanningSimulator } from '@/utils/VanningSimulator'
import { SimpleStackingStrategy } from '@/utils/loadingStrategies'

// シーンを作成
const scene = new THREE.Scene()

// ストラテジーを選択
const strategy = new SimpleStackingStrategy()

// シミュレーターを初期化
const simulator = new VanningSimulator(scene, strategy)

// コンテナを定義
const container = {
  width: 5.9,
  height: 2.39,
  depth: 2.35
}

// 貨物を定義
const cargo = {
  width: 0.5,
  height: 0.4,
  depth: 0.5,
  gap: 0.01
}

// コンテナを描画
simulator.updateContainer(container)

// シミュレーション実行
const result = simulator.simulateLoading(container, cargo)

console.log(`積載数: ${result.count}`)
console.log(`容積利用率: ${result.volumeUtilization * 100}%`)
console.log(`重心: (${result.centerOfGravity.x}, ${result.centerOfGravity.y}, ${result.centerOfGravity.z})`)

// クリーンアップ
simulator.dispose()
```

### React Three Fiberでの使用

```tsx
import { VanningScene } from '@/components/VanningScene'
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

## 実務での活用例

### 1. 見積もり段階での使用

**シナリオ**: 顧客から「このサイズの製品を1000個輸送したい」と相談された

**手順**:
1. 貨物サイズを入力（例: 60cm x 50cm x 60cm）
2. 20ftコンテナで試す → 150個しか入らない
3. 40ftコンテナで試す → 350個入る
4. → 3コンテナ必要と見積もり

### 2. 積載計画の最適化

**シナリオ**: 容積利用率を上げてコストを削減したい

**手順**:
1. 現状の貨物サイズで計算 → 利用率55%
2. Optimized Packingアルゴリズムに変更 → 利用率68%
3. 貨物サイズをわずかに調整（58cm → 60cm） → 利用率75%
4. → コンテナ数を削減できる

### 3. 安全性チェック

**シナリオ**: 重量物の輸送で転倒リスクを確認したい

**手順**:
1. 貨物を配置
2. 重心表示をON
3. 重心が高すぎる場合は警告が表示される
4. → 積載方法を変更して重心を下げる

## FAQ

### Q1: 実際の物流現場でこのシミュレーターを使えますか？

**A**: はい、ただし以下の点に注意してください：
- このシミュレーターは「理論的な最大値」を計算します
- 実際には、荷崩れ防止のための固定材、通気スペース、作業スペースなどが必要です
- 安全率として、計算結果の90%程度を目安にすることをお勧めします

### Q2: 異なるサイズの貨物を混載できますか？

**A**: 現在のバージョンでは単一サイズのみ対応しています。今後のバージョンで混載機能を追加予定です。

Geminiに以下のようなプロンプトを投げることで拡張できます：

```
utils/loadingStrategies.tsに、異なるサイズの貨物を混載できる
MixedSizeLoadingStrategyを実装してください。
貨物の配列を受け取り、大きいものから順に配置するアルゴリズムを使用してください。
```

### Q3: パフォーマンスの限界はどれくらいですか？

**A**: InstancedMeshを使用しているため、数千個の貨物でも60FPSを維持できます。

- 1,000個: 問題なし
- 5,000個: やや重くなる
- 10,000個以上: LOD（Level of Detail）の実装を推奨

### Q4: 重量を考慮できますか？

**A**: 現在のバージョンでは容積のみを考慮しています。重量考慮版の実装は以下のようにGeminiに依頼できます：

```
VanningSimulator.tsに重量考慮機能を追加してください：
- CargoSpecにweight（重量）プロパティを追加
- 最大積載重量を超えた場合は警告を表示
- 重心計算で重量を考慮（現在は均等重量を仮定）
```

## トラブルシューティング

### 問題: 積載数が0になる

**原因**: 貨物がコンテナより大きい、または隙間の設定が大きすぎる

**解決策**:
1. 貨物サイズを確認
2. 隙間を小さくする（0.01m = 1cm推奨）
3. コンテナサイズを確認

### 問題: 重心が大きくずれる警告が出る

**原因**: アルゴリズムの特性上、片側に寄った配置になっている

**解決策**:
1. アルゴリズムを変更（Optimized Packingを試す）
2. 実際の積載では、手動で中心寄せする
3. コードで中心寄せロジックを追加（Geminiに依頼可能）

### 問題: パフォーマンスが悪い

**原因**: 積載数が多すぎる（10,000個以上）

**解決策**:
1. InstancedMeshのインスタンス数を減らす
2. カメラの距離に応じてLODを実装
3. 統計情報のみを計算し、描画を間引く

## まとめ

Vanning Simulatorは、コンテナ積載の最適化をリアルタイムで可視化する強力なツールです。

**主な利点**:
- ✅ 複数のアルゴリズムで最適な積載方法を発見
- ✅ リアルタイムで統計情報を確認
- ✅ 安全性チェックで転倒リスクを低減
- ✅ Geminiで簡単に機能拡張可能

**今後の拡張案**:
- 混載機能（異なるサイズの貨物）
- 重量考慮
- エクスポート機能（積載計画をPDF出力）
- アニメーション（積載プロセスの可視化）

これらの機能は、Geminiに指示を出すことで簡単に追加できます！
