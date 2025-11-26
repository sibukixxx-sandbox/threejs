import * as THREE from 'three'
import { ContainerSpec, CargoSpec, LoadingResult, LoadingStrategy } from './VanningSimulator'

/**
 * 単純積みアルゴリズム (Simple Stacking)
 * XYZの3軸に沿って単純にグリッド配置
 */
export class SimpleStackingStrategy implements LoadingStrategy {
  name = 'Simple Stacking'

  calculate(container: ContainerSpec, cargo: CargoSpec): LoadingResult {
    // 積載可能数の計算
    const cols = Math.floor(container.width / (cargo.width + cargo.gap))
    const rows = Math.floor(container.height / (cargo.height + cargo.gap))
    const layers = Math.floor(container.depth / (cargo.depth + cargo.gap))

    const totalCount = cols * rows * layers

    if (totalCount === 0) {
      return {
        count: 0,
        positions: [],
        volumeUtilization: 0,
        centerOfGravity: new THREE.Vector3(0, 0, 0)
      }
    }

    // コンテナの左下奥を原点とするためのオフセット計算
    const startX = -container.width / 2 + cargo.width / 2
    const startY = cargo.height / 2 // 床面からスタート
    const startZ = -container.depth / 2 + cargo.depth / 2

    const positions: THREE.Vector3[] = []
    let sumX = 0, sumY = 0, sumZ = 0

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        for (let k = 0; k < layers; k++) {
          const x = startX + i * (cargo.width + cargo.gap)
          const y = startY + j * (cargo.height + cargo.gap)
          const z = startZ + k * (cargo.depth + cargo.gap)

          positions.push(new THREE.Vector3(x, y, z))

          // 重心計算用の累積
          sumX += x
          sumY += y
          sumZ += z
        }
      }
    }

    // 容積利用率の計算
    const cargoVolume = cargo.width * cargo.height * cargo.depth
    const containerVolume = container.width * container.height * container.depth
    const volumeUtilization = (cargoVolume * totalCount) / containerVolume

    // 重心の計算
    const centerOfGravity = new THREE.Vector3(
      sumX / totalCount,
      sumY / totalCount,
      sumZ / totalCount
    )

    return {
      count: totalCount,
      positions,
      volumeUtilization,
      centerOfGravity
    }
  }
}

/**
 * パレット積みアルゴリズム (Pallet Loading)
 * 標準パレット（1.2m x 1.0m）上に積載してからコンテナに配置
 */
export class PalletLoadingStrategy implements LoadingStrategy {
  name = 'Pallet Loading'

  // 標準パレットサイズ（ISO規格: 1200mm x 1000mm）
  private readonly PALLET_WIDTH = 1.2
  private readonly PALLET_DEPTH = 1.0
  private readonly PALLET_HEIGHT = 0.15 // パレット自体の高さ

  calculate(container: ContainerSpec, cargo: CargoSpec): LoadingResult {
    // パレット1枚あたりの積載可能数
    const boxesPerPalletX = Math.floor(this.PALLET_WIDTH / (cargo.width + cargo.gap))
    const boxesPerPalletZ = Math.floor(this.PALLET_DEPTH / (cargo.depth + cargo.gap))
    const boxesPerPalletY = Math.floor((container.height - this.PALLET_HEIGHT) / (cargo.height + cargo.gap))
    const boxesPerPallet = boxesPerPalletX * boxesPerPalletZ * boxesPerPalletY

    // コンテナに入るパレット数
    const palletCols = Math.floor(container.width / (this.PALLET_WIDTH + cargo.gap))
    const palletLayers = Math.floor(container.depth / (this.PALLET_DEPTH + cargo.gap))

    const totalPallets = palletCols * palletLayers
    const totalCount = totalPallets * boxesPerPallet

    if (totalCount === 0) {
      return {
        count: 0,
        positions: [],
        volumeUtilization: 0,
        centerOfGravity: new THREE.Vector3(0, 0, 0)
      }
    }

    const positions: THREE.Vector3[] = []
    let sumX = 0, sumY = 0, sumZ = 0

    // パレット配置のループ
    for (let palletCol = 0; palletCol < palletCols; palletCol++) {
      for (let palletLayer = 0; palletLayer < palletLayers; palletLayer++) {
        // パレットの基準位置
        const palletX = -container.width / 2 + this.PALLET_WIDTH / 2 + palletCol * (this.PALLET_WIDTH + cargo.gap)
        const palletZ = -container.depth / 2 + this.PALLET_DEPTH / 2 + palletLayer * (this.PALLET_DEPTH + cargo.gap)

        // パレット上の箱を配置
        for (let i = 0; i < boxesPerPalletX; i++) {
          for (let j = 0; j < boxesPerPalletY; j++) {
            for (let k = 0; k < boxesPerPalletZ; k++) {
              const x = palletX - this.PALLET_WIDTH / 2 + cargo.width / 2 + i * (cargo.width + cargo.gap)
              const y = this.PALLET_HEIGHT + cargo.height / 2 + j * (cargo.height + cargo.gap)
              const z = palletZ - this.PALLET_DEPTH / 2 + cargo.depth / 2 + k * (cargo.depth + cargo.gap)

              positions.push(new THREE.Vector3(x, y, z))

              sumX += x
              sumY += y
              sumZ += z
            }
          }
        }
      }
    }

    // 容積利用率の計算
    const cargoVolume = cargo.width * cargo.height * cargo.depth
    const containerVolume = container.width * container.height * container.depth
    const volumeUtilization = (cargoVolume * totalCount) / containerVolume

    // 重心の計算
    const centerOfGravity = new THREE.Vector3(
      sumX / totalCount,
      sumY / totalCount,
      sumZ / totalCount
    )

    return {
      count: totalCount,
      positions,
      volumeUtilization,
      centerOfGravity
    }
  }
}

/**
 * 最適化積みアルゴリズム (Optimized Packing)
 * 貨物を90度回転させても試し、最も多く積載できる方向を選択
 */
export class OptimizedPackingStrategy implements LoadingStrategy {
  name = 'Optimized Packing'

  calculate(container: ContainerSpec, cargo: CargoSpec): LoadingResult {
    // 6つの回転パターンを試す
    const rotations = [
      { w: cargo.width, h: cargo.height, d: cargo.depth, rotation: 0 },
      { w: cargo.width, h: cargo.depth, d: cargo.height, rotation: 1 },
      { w: cargo.height, h: cargo.width, d: cargo.depth, rotation: 2 },
      { w: cargo.height, h: cargo.depth, d: cargo.width, rotation: 3 },
      { w: cargo.depth, h: cargo.width, d: cargo.height, rotation: 4 },
      { w: cargo.depth, h: cargo.height, d: cargo.width, rotation: 5 },
    ]

    let bestResult: LoadingResult = {
      count: 0,
      positions: [],
      volumeUtilization: 0,
      centerOfGravity: new THREE.Vector3(0, 0, 0)
    }

    // 各回転パターンで計算し、最良のものを選択
    rotations.forEach(rot => {
      const tempCargo = { ...cargo, width: rot.w, height: rot.h, depth: rot.d }
      const result = this.calculateSimpleStacking(container, tempCargo)

      if (result.count > bestResult.count) {
        bestResult = result
      }
    })

    return bestResult
  }

  private calculateSimpleStacking(container: ContainerSpec, cargo: CargoSpec): LoadingResult {
    const cols = Math.floor(container.width / (cargo.width + cargo.gap))
    const rows = Math.floor(container.height / (cargo.height + cargo.gap))
    const layers = Math.floor(container.depth / (cargo.depth + cargo.gap))

    const totalCount = cols * rows * layers

    if (totalCount === 0) {
      return {
        count: 0,
        positions: [],
        volumeUtilization: 0,
        centerOfGravity: new THREE.Vector3(0, 0, 0)
      }
    }

    const startX = -container.width / 2 + cargo.width / 2
    const startY = cargo.height / 2
    const startZ = -container.depth / 2 + cargo.depth / 2

    const positions: THREE.Vector3[] = []
    let sumX = 0, sumY = 0, sumZ = 0

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        for (let k = 0; k < layers; k++) {
          const x = startX + i * (cargo.width + cargo.gap)
          const y = startY + j * (cargo.height + cargo.gap)
          const z = startZ + k * (cargo.depth + cargo.gap)

          positions.push(new THREE.Vector3(x, y, z))

          sumX += x
          sumY += y
          sumZ += z
        }
      }
    }

    const cargoVolume = cargo.width * cargo.height * cargo.depth
    const containerVolume = container.width * container.height * container.depth
    const volumeUtilization = (cargoVolume * totalCount) / containerVolume

    const centerOfGravity = new THREE.Vector3(
      sumX / totalCount,
      sumY / totalCount,
      sumZ / totalCount
    )

    return {
      count: totalCount,
      positions,
      volumeUtilization,
      centerOfGravity
    }
  }
}

/**
 * 利用可能な全てのストラテジー
 */
export const LOADING_STRATEGIES = {
  simpleStacking: new SimpleStackingStrategy(),
  palletLoading: new PalletLoadingStrategy(),
  optimizedPacking: new OptimizedPackingStrategy()
}
