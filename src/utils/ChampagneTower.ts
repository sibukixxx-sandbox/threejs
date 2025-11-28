import * as THREE from 'three'

export interface ChampagneTowerParams {
  levels: number
  glassSize: number
  spacing: number
  liquidColor: string
  metalness: number
  roughness: number
  transmission: number
  thickness: number
  clearcoat: number
}

export interface GlassInfo {
  position: THREE.Vector3
  level: number
  indexInLevel: number
}

/**
 * ChampagneTower - シャンパンタワーを生成するユーティリティクラス
 *
 * 特徴:
 * - 正四角錐状のグラス配置
 * - MeshPhysicalMaterialによるリアルなガラス表現
 * - 段数、サイズ、マテリアルパラメータをカスタマイズ可能
 * - 各グラスの位置情報を保持
 */
export class ChampagneTower {
  private group: THREE.Group
  private glasses: THREE.Mesh[] = []
  private glassInfos: GlassInfo[] = []
  private params: ChampagneTowerParams
  private material: THREE.MeshPhysicalMaterial

  constructor(params: ChampagneTowerParams) {
    this.params = params
    this.group = new THREE.Group()
    this.material = this.createMaterial()
    this.buildTower()
  }

  /**
   * ガラスマテリアルの作成
   */
  private createMaterial(): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(this.params.liquidColor),
      metalness: this.params.metalness,
      roughness: this.params.roughness,
      transmission: this.params.transmission,
      thickness: this.params.thickness,
      clearcoat: this.params.clearcoat,
      side: THREE.DoubleSide,
    })
  }

  /**
   * タワーの構築（正四角錐）
   */
  private buildTower(): void {
    this.clearTower()

    const { levels, glassSize, spacing } = this.params

    for (let y = 0; y < levels; y++) {
      const layerSize = y + 1 // レベル1は1個、レベル2は4個（2x2）...
      const offset = (layerSize - 1) * spacing / 2

      for (let x = 0; x < layerSize; x++) {
        for (let z = 0; z < layerSize; z++) {
          // グラスの形状（ボックスジオメトリで表現）
          const geometry = new THREE.BoxGeometry(glassSize, glassSize, glassSize)
          const glass = new THREE.Mesh(geometry, this.material)

          // 位置設定
          const posX = (x * spacing) - offset
          const posY = (levels - 1 - y) * spacing
          const posZ = (z * spacing) - offset

          glass.position.set(posX, posY, posZ)
          glass.castShadow = true
          glass.receiveShadow = true

          // グラス情報を記録
          this.glassInfos.push({
            position: new THREE.Vector3(posX, posY, posZ),
            level: y,
            indexInLevel: x * layerSize + z,
          })

          this.glasses.push(glass)
          this.group.add(glass)
        }
      }
    }
  }

  /**
   * 既存のタワーをクリア
   */
  private clearTower(): void {
    this.glasses.forEach(glass => {
      glass.geometry.dispose()
      this.group.remove(glass)
    })
    this.glasses = []
    this.glassInfos = []
  }

  /**
   * パラメータを更新してタワーを再構築
   */
  public updateParams(newParams: Partial<ChampagneTowerParams>): void {
    this.params = { ...this.params, ...newParams }

    // マテリアルパラメータの更新
    if (newParams.liquidColor) {
      this.material.color.set(newParams.liquidColor)
    }
    if (newParams.metalness !== undefined) {
      this.material.metalness = newParams.metalness
    }
    if (newParams.roughness !== undefined) {
      this.material.roughness = newParams.roughness
    }
    if (newParams.transmission !== undefined) {
      this.material.transmission = newParams.transmission
    }
    if (newParams.thickness !== undefined) {
      this.material.thickness = newParams.thickness
    }
    if (newParams.clearcoat !== undefined) {
      this.material.clearcoat = newParams.clearcoat
    }

    // 構造的なパラメータが変更された場合は再構築
    if (
      newParams.levels !== undefined ||
      newParams.glassSize !== undefined ||
      newParams.spacing !== undefined
    ) {
      this.buildTower()
    }
  }

  /**
   * タワーのグループを取得
   */
  public getGroup(): THREE.Group {
    return this.group
  }

  /**
   * 総グラス数を計算
   */
  public getTotalGlasses(): number {
    return this.glasses.length
  }

  /**
   * グラス情報の配列を取得
   */
  public getGlassInfos(): GlassInfo[] {
    return this.glassInfos
  }

  /**
   * クリーンアップ
   */
  public dispose(): void {
    this.clearTower()
    this.material.dispose()
  }

  /**
   * タワーを回転させる
   */
  public rotate(deltaY: number): void {
    this.group.rotation.y += deltaY
  }
}
