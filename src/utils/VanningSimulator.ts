import * as THREE from 'three'

/**
 * コンテナのスペック定義
 */
export interface ContainerSpec {
  width: number  // メートル (例: 20ftなら約5.9m)
  height: number // メートル
  depth: number  // メートル
}

/**
 * 貨物（ダンボール）のスペック定義
 */
export interface CargoSpec {
  width: number
  height: number
  depth: number
  gap: number // 箱と箱の間の隙間（マージン）
}

/**
 * 積載結果
 */
export interface LoadingResult {
  count: number           // 積載数
  positions: THREE.Vector3[] // 各貨物の位置
  volumeUtilization: number  // 容積利用率 (0-1)
  centerOfGravity: THREE.Vector3 // 重心位置
}

/**
 * 積載アルゴリズムのインターフェース
 * Strategy Patternで複数のアルゴリズムを切り替え可能にする
 */
export interface LoadingStrategy {
  name: string
  calculate(container: ContainerSpec, cargo: CargoSpec): LoadingResult
}

/**
 * VanningSimulator クラス
 * コンテナへの貨物積載シミュレーション
 *
 * 特徴:
 * - InstancedMeshで高速描画
 * - Strategy Patternで複数のアルゴリズムに対応
 * - リアルタイム再計算
 */
export class VanningSimulator {
  private scene: THREE.Scene
  private containerGroup: THREE.Group
  private cargoMesh: THREE.InstancedMesh | null = null

  // マテリアルは使い回す（パフォーマンス最適化）
  private boxMaterial: THREE.MeshStandardMaterial
  private containerMaterial: THREE.LineBasicMaterial

  // 現在の積載戦略
  private strategy: LoadingStrategy

  constructor(scene: THREE.Scene, strategy: LoadingStrategy) {
    this.scene = scene
    this.containerGroup = new THREE.Group()
    this.scene.add(this.containerGroup)
    this.strategy = strategy

    // 見た目の設定
    this.boxMaterial = new THREE.MeshStandardMaterial({
      color: 0xcd853f, // ダンボール色
      roughness: 0.7,
    })
    this.containerMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff00, // コンテナ枠線の色
    })
  }

  /**
   * 積載戦略を変更
   */
  public setStrategy(strategy: LoadingStrategy): void {
    this.strategy = strategy
  }

  /**
   * コンテナの外枠を描画・更新する
   */
  public updateContainer(spec: ContainerSpec): void {
    // 既存のコンテナ表示があれば削除
    const linesToRemove: THREE.LineSegments[] = []
    this.containerGroup.children.forEach(child => {
      if (child instanceof THREE.LineSegments) {
        linesToRemove.push(child)
      }
    })

    linesToRemove.forEach(line => {
      line.geometry.dispose()
      this.containerGroup.remove(line)
    })

    // コンテナのワイヤーフレームを作成
    const geometry = new THREE.BoxGeometry(spec.width, spec.height, spec.depth)
    const edges = new THREE.EdgesGeometry(geometry)
    const line = new THREE.LineSegments(edges, this.containerMaterial)

    // Y軸の底面を0に合わせる（床に置くため）
    line.position.y = spec.height / 2

    this.containerGroup.add(line)
    geometry.dispose()
  }

  /**
   * 貨物の積載計算と描画
   * Strategy Patternで選択されたアルゴリズムを使用
   */
  public simulateLoading(container: ContainerSpec, cargo: CargoSpec): LoadingResult {
    // 既存の貨物をクリア
    if (this.cargoMesh) {
      this.cargoMesh.geometry.dispose()
      this.scene.remove(this.cargoMesh)
      this.cargoMesh = null
    }

    // 選択された戦略で積載計算
    const result = this.strategy.calculate(container, cargo)

    if (result.count === 0) return result

    // InstancedMeshの準備
    const geometry = new THREE.BoxGeometry(cargo.width, cargo.height, cargo.depth)
    this.cargoMesh = new THREE.InstancedMesh(geometry, this.boxMaterial, result.count)

    // 影を落とす・受ける設定
    this.cargoMesh.castShadow = true
    this.cargoMesh.receiveShadow = true

    // 配置ループ (Matrix計算)
    const dummy = new THREE.Object3D()

    result.positions.forEach((position, index) => {
      dummy.position.copy(position)
      dummy.updateMatrix()
      this.cargoMesh!.setMatrixAt(index, dummy.matrix)
    })

    this.cargoMesh.instanceMatrix.needsUpdate = true
    this.scene.add(this.cargoMesh)

    return result
  }

  /**
   * 貨物メッシュを取得（外部から色変更などに使用）
   */
  public getCargoMesh(): THREE.InstancedMesh | null {
    return this.cargoMesh
  }

  /**
   * クリーンアップ
   */
  public dispose(): void {
    if (this.cargoMesh) {
      this.cargoMesh.geometry.dispose()
      this.scene.remove(this.cargoMesh)
    }

    this.containerGroup.children.forEach(child => {
      if (child instanceof THREE.LineSegments) {
        child.geometry.dispose()
      }
    })

    this.scene.remove(this.containerGroup)
    this.boxMaterial.dispose()
    this.containerMaterial.dispose()
  }
}
