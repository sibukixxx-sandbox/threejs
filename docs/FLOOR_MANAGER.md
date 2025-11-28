# 🏢 Floor Manager - リアルタイム卓管理3Dマップ

ナイトクラブ・キャバクラ・ラウンジなどの接客業で、**黒服（運営スタッフ）が「神の視点」でフロア全体を把握し、瞬時に指示を出せる**リアルタイム3D管理システム。

## 📖 概要

従来の2D平面図では把握しづらかった「VIP席からの視線」「ホール全体の混雑感」「各テーブルの状況」を、3D空間で直感的に可視化します。

### 主な特徴

- **3Dフロアマップ**: VIP席（高台）、一般席、カウンターを立体的に配置
- **ヒートマップ（状態可視化）**:
  - 🔴 **Red (HOT)**: 高額オーダー発生中 / 盛り上がり
  - 🟡 **Gold (VIP)**: VIP客滞在中
  - 🟢 **Green (ACTIVE)**: 通常稼働中
  - ⚫ **Grey (EMPTY)**: 空席 / 案内可能
  - 🟠 **Orange (CHECK)**: 会計要請
  - 🔴 **Red Blinking (SOS)**: トラブル / 緊急対応
- **情報フローティング**: 各席の上に「滞在時間」と「売上額」を常時表示
- **インタラクティブ**: テーブルをクリックで詳細情報表示、指示送信
- **リアルタイムシミュレーション**: 自動でテーブル状態が更新される

## 🎯 ユースケース

### 1. ナイトクラブ / ラウンジ運営

**用途**: 黒服（マネージャー）によるフロア監視
- iPadで3Dマップを確認しながら巡回
- HOT（赤）テーブル = シャンパンオーダー発生 → すぐにアイス・グラス補充
- CHECK（橙）テーブル = 会計要請 → キャッシャーに通知
- SOS（赤点滅）= トラブル発生 → 即座に対応

### 2. キャバクラ / クラブ指名管理

**用途**: ホールスタッフによる女の子のアサイン管理
- VIPテーブルの滞在時間監視 → 延長交渉のタイミング把握
- 売上ランク表示 → ボトルが出た卓を優先ケア
- 空席可視化 → 新規客の案内先を瞬時に判断

### 3. レストラン / カフェのテーブル管理

**用途**: ホールスタッフの効率化
- 満席状況の一目確認
- 滞在時間の長いテーブルを把握 → 回転率向上
- オーダー頻度が高いテーブルを優先対応

### 4. イベント会場 / パーティー運営

**用途**: イベントスタッフの配置最適化
- VIPエリアの監視
- ドリンク補充タイミングの最適化
- トラブル発生時の迅速な対応

## 🏗️ アーキテクチャ

### ファイル構成

```
src/
├── utils/
│   ├── FloorManager.ts       # フロア管理ロジック
│   └── floorGUI.ts           # lil-gui統合
├── store/
│   └── floorStore.ts         # Zustand state管理
├── components/
│   ├── FloorManagerComponent.tsx      # React Three Fiberコンポーネント
│   ├── FloorManagerScene.tsx          # メインシーン
│   └── FloorManagerControlPanel.tsx   # Levaコントロールパネル
```

### データフロー

```
POS/レジ API (外部)
    ↓
Zustand Store (floorStore)
    ↓
React Component (FloorManagerComponent)
    ↓
FloorManager + Table3D Classes
    ↓
THREE.js Scene (MeshStandardMaterial + CanvasTexture)
```

## 🚀 使い方

### React Three Fiber版（推奨）

```tsx
import { FloorManagerScene } from './components/FloorManagerScene'
import { FloorManagerControlPanel } from './components/FloorManagerControlPanel'

function App() {
  return (
    <>
      <FloorManagerScene />
      <FloorManagerControlPanel />
    </>
  )
}
```

### Vanilla Three.js + lil-gui版

```typescript
import * as THREE from 'three'
import { FloorManager } from './utils/FloorManager'
import { setupFloorGUI } from './utils/floorGUI'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// シーン準備
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x050505)
scene.fog = new THREE.FogExp2(0x050505, 0.03)

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 15, 15)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)

// ライティング
const ambientLight = new THREE.AmbientLight(0x404040)
scene.add(ambientLight)

const spotLight = new THREE.SpotLight(0xffffff, 100)
spotLight.position.set(0, 20, 0)
spotLight.angle = Math.PI / 4
spotLight.castShadow = true
scene.add(spotLight)

// フロアマネージャー生成
const manager = new FloorManager(scene, {
  floorSize: { w: 30, h: 20 },
  tableRadius: 0.8,
  sofaColor: 0x222222,
})

// テーブル配置（VIPエリア）
manager.addTable('V-1', -8, -5, 'VIP')
manager.addTable('V-2', 0, -5, 'VIP')
manager.addTable('V-3', 8, -5, 'VIP')

// テーブル配置（一般エリア）
for (let i = 0; i < 5; i++) {
  manager.addTable(`A-${i + 1}`, (i - 2) * 5, 2, 'NORMAL')
}

// GUI設定
const { params, gui, updateStats } = setupFloorGUI(manager)

// カメラコントロール
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

// アニメーションループ
function animate() {
  requestAnimationFrame(animate)
  controls.update()
  manager.animate(Date.now() * 0.001)
  updateStats()
  renderer.render(scene, camera)
}
animate()
```

## ⚙️ パラメータ解説

### Table Status（テーブル状態）

| ステータス | 色 | 意味 | 用途 |
|----------|-----|------|------|
| `EMPTY` | Grey | 空席 | 新規客の案内可能 |
| `ACTIVE` | Green | 通常稼働中 | オーダー・接客中 |
| `HOT` | Red | 高額オーダー中 | シャンパン/ボトル出現、優先ケア |
| `VIP` | Gold | VIP客 | 特別対応、延長交渉 |
| `CHECK` | Orange | 会計要請 | レジ担当に通知 |
| `SOS` | Red (点滅) | 緊急対応 | トラブル発生、即座に対応 |

### Table Data（テーブルデータ）

| フィールド | 型 | 説明 |
|----------|-----|------|
| `id` | string | テーブルID（例: `V-1`, `A-5`） |
| `type` | `VIP` \| `NORMAL` \| `COUNTER` | テーブル種別 |
| `status` | TableStatus | 現在の状態 |
| `guests` | number | 来客人数 |
| `timeMin` | number | 滞在時間（分） |
| `sales` | number | 累計売上（円） |
| `bottle` | string | ボトル名（例: `Dom Perignon`） |
| `position` | `{ x, z }` | フロア上の座標 |

### Floor Config（フロア設定）

| パラメータ | 範囲 | デフォルト | 説明 |
|----------|------|----------|------|
| `floorSize.w` | 20〜50 | 30 | フロアの幅 |
| `floorSize.h` | 15〜40 | 20 | フロアの奥行き |
| `tableRadius` | 0.5〜1.5 | 0.8 | テーブルの半径 |

## 🎨 レイアウトプリセット

### Small (10席)
```typescript
- VIPエリア: 2席
- 一般エリア: 8席
- 総座席数: 10席
- 用途: 小規模バー、プライベートラウンジ
```

### Medium (20席)
```typescript
- VIPエリア: 3席
- 一般エリア: 17席
- 総座席数: 20席
- 用途: 中規模クラブ、キャバクラ
```

### Large (30+席)
```typescript
- VIPエリア: 5席
- 一般エリア: 25席
- 総座席数: 30席
- 用途: 大規模ナイトクラブ、イベント会場
```

## 🔧 カスタマイズ例

### POS連携（売上リアルタイム反映）

```typescript
// POSレジAPIから売上情報を取得
async function syncWithPOS() {
  const response = await fetch('/api/tables/sales')
  const salesData = await response.json()

  salesData.forEach((data) => {
    manager.updateTable(data.tableId, {
      sales: data.totalSales,
      bottle: data.bottle,
      timeMin: data.elapsedMinutes,
    })

    // 高額になったらHOTに変更
    if (data.totalSales > 50000) {
      manager.updateTable(data.tableId, { status: 'HOT' })
    }
  })
}

setInterval(syncWithPOS, 5000) // 5秒ごとに同期
```

### WebSocket経由のリアルタイム更新

```typescript
const ws = new WebSocket('wss://your-server.com/floor-updates')

ws.onmessage = (event) => {
  const update = JSON.parse(event.data)

  switch (update.type) {
    case 'table_status':
      manager.updateTable(update.tableId, { status: update.status })
      break
    case 'new_order':
      manager.updateTable(update.tableId, {
        sales: update.newSales,
        bottle: update.bottle,
      })
      break
    case 'check_request':
      manager.updateTable(update.tableId, { status: 'CHECK' })
      break
    case 'sos':
      manager.updateTable(update.tableId, { status: 'SOS' })
      break
  }
}
```

### iPadアプリ化（PWA）

```json
// manifest.json
{
  "name": "Floor Manager",
  "short_name": "FloorMgr",
  "description": "リアルタイム卓管理3Dマップ",
  "start_url": "/",
  "display": "standalone",
  "orientation": "landscape",
  "background_color": "#000000",
  "theme_color": "#ff00ff",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 指示送信機能

```typescript
// テーブル選択時に指示ボタンを表示
function onTableClick(tableId: string) {
  const table = manager.getTable(tableId)
  if (!table) return

  // UIに詳細パネルを表示
  showDetailPanel({
    tableId: table.id,
    guests: table.data.guests,
    sales: table.data.sales,
    actions: [
      {
        label: 'CHECK（会計）',
        onClick: () => {
          // スタッフに通知
          sendNotification('CHECK_REQUEST', tableId)
          manager.updateTable(tableId, { status: 'CHECK' })
        },
      },
      {
        label: 'アイス交換',
        onClick: () => {
          sendNotification('ICE_REPLACEMENT', tableId)
        },
      },
      {
        label: 'SOS発信',
        onClick: () => {
          sendNotification('SOS', tableId)
          manager.updateTable(tableId, { status: 'SOS' })
        },
      },
    ],
  })
}
```

## 📊 パフォーマンス

### レンダリング負荷

| テーブル数 | 三角形数 | FPS (60Hz) | 推奨デバイス |
|----------|---------|-----------|------------|
| 10       | 1,500   | ✅ 60     | iPhone, iPad |
| 20       | 3,000   | ✅ 60     | iPad, PC |
| 30       | 4,500   | ✅ 58     | iPad Pro, PC |
| 50       | 7,500   | ⚠️ 50     | PC |

**最適化のヒント**:
- テーブル数が50を超える場合は`InstancedMesh`への移行を検討
- `shadowMap`をオフにすると負荷軽減
- モバイルでは`antialias: false`を検討

## 🧩 拡張アイデア

### 1. カメラAI連携（上級編）

天井カメラの映像をAI解析し、以下を自動検知:
- グラスが空いている → 自動で「ドリンク補充」アイコン表示
- お客様がタバコを取り出した → ライター・灰皿を持って訪問
- 手を挙げている → 呼び出し検知

```typescript
// AI解析結果を受信
ws.onmessage = (event) => {
  const aiResult = JSON.parse(event.data)

  if (aiResult.event === 'empty_glass') {
    manager.updateTable(aiResult.tableId, { status: 'CHECK' })
  }

  if (aiResult.event === 'hand_raised') {
    manager.updateTable(aiResult.tableId, { status: 'SOS' })
  }
}
```

### 2. スタッフ位置トラッキング

BLE（Bluetooth Low Energy）でスタッフの位置を追跡し、3Dマップ上に表示:

```typescript
// スタッフアイコンを追加
const staffIcon = new THREE.Sprite(staffMaterial)
staffIcon.position.set(x, 0.5, z)
scene.add(staffIcon)

// リアルタイム更新
ws.onmessage = (event) => {
  const staffPos = JSON.parse(event.data)
  staffIcon.position.set(staffPos.x, 0.5, staffPos.z)
}
```

### 3. 売上予測AI

過去データから「このテーブルは延長しそう」「ボトルが出る確率80%」を予測し、事前にケア:

```typescript
async function predictExtension(tableId: string) {
  const response = await fetch(`/api/predict/${tableId}`)
  const prediction = await response.json()

  if (prediction.extensionProbability > 0.7) {
    // 延長交渉の準備を通知
    sendNotification('EXTENSION_LIKELY', tableId)
  }
}
```

### 4. 音声コマンド対応

「テーブルA-1にチェック送信」などの音声指示で操作:

```typescript
const recognition = new (window as any).webkitSpeechRecognition()
recognition.lang = 'ja-JP'

recognition.onresult = (event: any) => {
  const command = event.results[0][0].transcript

  if (command.includes('チェック')) {
    const tableId = extractTableId(command)
    manager.updateTable(tableId, { status: 'CHECK' })
  }
}

recognition.start()
```

## 🐛 トラブルシューティング

### テーブルが表示されない

**原因**: レイアウトプリセットが適用されていない

**解決策**: `Layout`フォルダから`Medium (20 tables)`をクリック

### 発光が見えない

**原因**: ライトの強度が低い、または`emissiveIntensity`が0

**解決策**: `Lighting`フォルダで`Spotlight Intensity`を100以上に設定

### シミュレーションが動かない

**原因**: `Auto Simulation`がOFF

**解決策**: `Simulation`フォルダで`Auto Simulation`をONに

### クリックしてもテーブルが選択されない

**原因**: Raycasterがうまく機能していない

**解決策**: カメラアングルを変えてみる。正面から見る角度で試す。

## 📚 参考リンク

- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [lil-gui Documentation](https://lil-gui.georgealways.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。
