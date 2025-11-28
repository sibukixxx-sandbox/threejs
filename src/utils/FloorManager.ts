import * as THREE from 'three'

export type TableStatus = 'EMPTY' | 'ACTIVE' | 'HOT' | 'VIP' | 'CHECK' | 'SOS'
export type TableType = 'VIP' | 'NORMAL' | 'COUNTER'

export interface TableData {
  id: string
  type: TableType
  status: TableStatus
  guests: number
  timeMin: number
  sales: number
  bottle: string
  position: { x: number; z: number }
}

export interface FloorConfig {
  floorSize: { w: number; h: number }
  tableRadius: number
  sofaColor: number
}

/**
 * Table3D - 個別テーブルの3Dオブジェクトとステータス管理
 *
 * 機能:
 * - テーブル本体（発光マテリアル）
 * - ソファ配置
 * - VIP席の台座
 * - ステータス表示スプライト（Canvasテクスチャ）
 * - リアルタイム更新
 */
export class Table3D {
  public id: string
  public type: TableType
  public data: Omit<TableData, 'id' | 'type' | 'position'>
  public group: THREE.Group
  private mesh: THREE.Mesh
  private tableMat: THREE.MeshStandardMaterial
  private sprite: THREE.Sprite
  private spriteCanvas: HTMLCanvasElement
  private spriteTexture: THREE.CanvasTexture

  constructor(id: string, x: number, z: number, type: TableType = 'NORMAL', tableRadius: number) {
    this.id = id
    this.type = type
    this.data = {
      status: 'EMPTY',
      guests: 0,
      timeMin: 0,
      sales: 0,
      bottle: 'None',
    }

    this.group = new THREE.Group()
    this.group.position.set(x, 0, z)

    // テーブル本体
    const tableGeo = new THREE.CylinderGeometry(tableRadius, tableRadius * 0.8, 0.8, 32)
    this.tableMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      emissive: 0x000000,
      emissiveIntensity: 0,
      roughness: 0.3,
      metalness: 0.7,
    })
    this.mesh = new THREE.Mesh(tableGeo, this.tableMat)
    this.mesh.position.y = 0.4
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    this.mesh.userData = { isTable: true, tableId: this.id }
    this.group.add(this.mesh)

    // ソファ（コの字型を簡易表現）
    const sofaGeo = new THREE.BoxGeometry(2.5, 0.6, 0.5)
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x222222 })
    const sofaBack = new THREE.Mesh(sofaGeo, sofaMat)
    sofaBack.position.set(0, 0.3, -1.2)
    sofaBack.castShadow = true
    this.group.add(sofaBack)

    if (type === 'VIP') {
      // VIP席は床上げ（プラットフォーム）
      const platformGeo = new THREE.BoxGeometry(4, 0.2, 4)
      const platformMat = new THREE.MeshStandardMaterial({ color: 0x220000 })
      const platform = new THREE.Mesh(platformGeo, platformMat)
      platform.position.y = 0.1
      platform.receiveShadow = true
      this.group.add(platform)
    }

    // ステータススプライト（Canvasテクスチャ）
    this.spriteCanvas = document.createElement('canvas')
    this.spriteCanvas.width = 256
    this.spriteCanvas.height = 128
    this.updateSpriteCanvas()

    this.spriteTexture = new THREE.CanvasTexture(this.spriteCanvas)
    const spriteMat = new THREE.SpriteMaterial({
      map: this.spriteTexture,
      transparent: true,
      depthTest: false,
    })
    this.sprite = new THREE.Sprite(spriteMat)
    this.sprite.scale.set(2, 1, 1)
    this.sprite.position.set(0, 2.5, 0)
    this.group.add(this.sprite)
  }

  /**
   * Canvasに文字情報を描画
   */
  private updateSpriteCanvas(): void {
    const ctx = this.spriteCanvas.getContext('2d')!
    ctx.clearRect(0, 0, this.spriteCanvas.width, this.spriteCanvas.height)

    // 背景（吹き出し風）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.beginPath()
    ctx.roundRect(10, 10, 236, 108, 20)
    ctx.fill()
    ctx.strokeStyle = this.getStatusColorString()
    ctx.lineWidth = 4
    ctx.stroke()

    // 文字情報
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 32px Arial'
    ctx.textAlign = 'center'

    if (this.data.status === 'EMPTY') {
      ctx.fillStyle = '#888888'
      ctx.fillText('EMPTY', 128, 75)
    } else {
      ctx.fillText(`${this.data.timeMin} min`, 128, 50)
      ctx.font = '24px Arial'
      ctx.fillStyle = '#cccccc'
      ctx.fillText(`¥${this.data.sales.toLocaleString()}`, 128, 90)
    }

    // SOS/CHECKアイコン
    if (this.data.status === 'SOS' || this.data.status === 'CHECK') {
      ctx.fillStyle = '#ff0000'
      ctx.font = 'bold 40px Arial'
      ctx.fillText('!', 220, 70)
    }
  }

  /**
   * ステータスに応じた色
   */
  private getStatusColor(): number {
    switch (this.data.status) {
      case 'VIP':
        return 0xffd700 // Gold
      case 'HOT':
        return 0xff0055 // Pink/Red
      case 'ACTIVE':
        return 0x00ff88 // Green
      case 'CHECK':
        return 0xff9900 // Orange
      case 'SOS':
        return 0xff0000 // Red
      default:
        return 0x333333 // Dark Grey
    }
  }

  private getStatusColorString(): string {
    switch (this.data.status) {
      case 'VIP':
        return '#ffd700'
      case 'HOT':
        return '#ff0055'
      case 'ACTIVE':
        return '#00ff88'
      case 'CHECK':
        return '#ff9900'
      case 'SOS':
        return '#ff0000'
      default:
        return '#555555'
    }
  }

  /**
   * テーブルデータを更新し、見た目に反映
   */
  public update(newData: Partial<Omit<TableData, 'id' | 'type' | 'position'>>): void {
    this.data = { ...this.data, ...newData }

    // テーブルの発光色を変更
    const colorHex = this.getStatusColor()
    this.tableMat.emissive.setHex(colorHex)
    this.tableMat.emissiveIntensity = this.data.status === 'EMPTY' ? 0 : 0.5

    // スプライトを更新
    this.updateSpriteCanvas()
    this.spriteTexture.needsUpdate = true
  }

  /**
   * アニメーション（点滅効果など）
   */
  public animate(time: number): void {
    // HOT/VIP/SOS/CHECKは呼吸するように点滅
    if (['HOT', 'VIP', 'SOS', 'CHECK'].includes(this.data.status)) {
      this.tableMat.emissiveIntensity = 0.5 + Math.sin(time * 2) * 0.3
    }
  }

  /**
   * グループを取得
   */
  public getGroup(): THREE.Group {
    return this.group
  }

  /**
   * クリーンアップ
   */
  public dispose(): void {
    this.mesh.geometry.dispose()
    this.tableMat.dispose()
    this.spriteTexture.dispose()
  }
}

/**
 * FloorManager - フロア全体の3D管理システム
 *
 * 機能:
 * - テーブル配置とレイアウト管理
 * - リアルタイムステータス更新
 * - インタラクション（テーブル選択）
 * - 統計情報の集計
 */
export class FloorManager {
  private scene: THREE.Scene
  private tables: Map<string, Table3D>
  private config: FloorConfig
  private floorMesh: THREE.Mesh | null = null

  constructor(scene: THREE.Scene, config: FloorConfig) {
    this.scene = scene
    this.config = config
    this.tables = new Map()
    this.createFloor()
  }

  /**
   * フロア（床）を作成
   */
  private createFloor(): void {
    const floorGeo = new THREE.PlaneGeometry(this.config.floorSize.w, this.config.floorSize.h)
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.1,
      metalness: 0.5,
    })
    this.floorMesh = new THREE.Mesh(floorGeo, floorMat)
    this.floorMesh.rotation.x = -Math.PI / 2
    this.floorMesh.receiveShadow = true
    this.scene.add(this.floorMesh)

    // グリッド
    const grid = new THREE.GridHelper(this.config.floorSize.w, 20, 0x333333, 0x111111)
    this.scene.add(grid)
  }

  /**
   * テーブルを追加
   */
  public addTable(id: string, x: number, z: number, type: TableType = 'NORMAL'): Table3D {
    const table = new Table3D(id, x, z, type, this.config.tableRadius)
    this.tables.set(id, table)
    this.scene.add(table.getGroup())
    return table
  }

  /**
   * テーブルを取得
   */
  public getTable(id: string): Table3D | undefined {
    return this.tables.get(id)
  }

  /**
   * 全テーブルを取得
   */
  public getAllTables(): Table3D[] {
    return Array.from(this.tables.values())
  }

  /**
   * テーブルデータを更新
   */
  public updateTable(id: string, data: Partial<Omit<TableData, 'id' | 'type' | 'position'>>): void {
    const table = this.tables.get(id)
    if (table) {
      table.update(data)
    }
  }

  /**
   * アニメーション更新
   */
  public animate(time: number): void {
    this.tables.forEach((table) => {
      table.animate(time)
    })
  }

  /**
   * 統計情報を取得
   */
  public getStats(): {
    totalTables: number
    activeTables: number
    totalGuests: number
    totalSales: number
    vipTables: number
    hotTables: number
  } {
    let activeTables = 0
    let totalGuests = 0
    let totalSales = 0
    let vipTables = 0
    let hotTables = 0

    this.tables.forEach((table) => {
      if (table.data.status !== 'EMPTY') {
        activeTables++
        totalGuests += table.data.guests
        totalSales += table.data.sales
      }
      if (table.data.status === 'VIP') vipTables++
      if (table.data.status === 'HOT') hotTables++
    })

    return {
      totalTables: this.tables.size,
      activeTables,
      totalGuests,
      totalSales,
      vipTables,
      hotTables,
    }
  }

  /**
   * クリーンアップ
   */
  public dispose(): void {
    this.tables.forEach((table) => {
      table.dispose()
      this.scene.remove(table.getGroup())
    })
    this.tables.clear()

    if (this.floorMesh) {
      this.floorMesh.geometry.dispose()
      ;(this.floorMesh.material as THREE.Material).dispose()
      this.scene.remove(this.floorMesh)
    }
  }
}
