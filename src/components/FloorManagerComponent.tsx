import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { FloorManager } from '../utils/FloorManager'
import { useFloorStore } from '../store/floorStore'

/**
 * FloorManagerComponent - React Three Fiberでフロア管理システムを表示
 *
 * 機能:
 * - Zustandストアからテーブルデータを取得
 * - FloorManagerクラスでテーブルを3D表示
 * - クリックイベントでテーブル選択
 * - リアルタイムアニメーション
 */
export function FloorManagerComponent() {
  const managerRef = useRef<FloorManager | null>(null)
  const { scene } = useThree()

  const {
    floorSize,
    tableRadius,
    tables,
    setSelectedTableId,
    updateStats,
  } = useFloorStore()

  // 初期化: FloorManagerインスタンスを作成
  useEffect(() => {
    const manager = new FloorManager(scene, {
      floorSize,
      tableRadius,
      sofaColor: 0x222222,
    })

    managerRef.current = manager

    // 初期テーブル配置
    tables.forEach((tableData) => {
      manager.addTable(
        tableData.id,
        tableData.position.x,
        tableData.position.z,
        tableData.type
      )
    })

    return () => {
      manager.dispose()
      managerRef.current = null
    }
  }, [scene, floorSize, tableRadius])

  // テーブルデータが変更されたら反映
  useEffect(() => {
    if (!managerRef.current) return

    tables.forEach((tableData) => {
      let table = managerRef.current!.getTable(tableData.id)

      if (!table) {
        // テーブルが存在しない場合は新規追加
        table = managerRef.current!.addTable(
          tableData.id,
          tableData.position.x,
          tableData.position.z,
          tableData.type
        )
      }

      // データを更新
      table.update({
        status: tableData.status,
        guests: tableData.guests,
        timeMin: tableData.timeMin,
        sales: tableData.sales,
        bottle: tableData.bottle,
      })
    })

    // 統計情報を更新
    const stats = managerRef.current.getStats()
    updateStats(stats)
  }, [tables, updateStats])

  // クリックイベント
  useEffect(() => {
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const handleClick = (event: MouseEvent) => {
      const canvas = event.target as HTMLCanvasElement
      if (!canvas.tagName || canvas.tagName !== 'CANVAS') return

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      raycaster.setFromCamera(mouse, scene.children.find(c => c.type === 'PerspectiveCamera') as THREE.Camera || new THREE.Camera())

      const intersects = raycaster.intersectObjects(scene.children, true)
      const hit = intersects.find((obj) => obj.object.userData.isTable)

      if (hit) {
        const tableId = hit.object.userData.tableId as string
        setSelectedTableId(tableId)
      } else {
        setSelectedTableId(null)
      }
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [scene, setSelectedTableId])

  // アニメーションループ
  useFrame(({ clock }) => {
    if (managerRef.current) {
      managerRef.current.animate(clock.getElapsedTime())
    }
  })

  return null
}
