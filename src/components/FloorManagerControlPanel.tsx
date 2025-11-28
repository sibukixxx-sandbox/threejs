import { useControls, button, folder } from 'leva'
import { useFloorStore } from '../store/floorStore'
import { useEffect, useMemo } from 'react'

/**
 * FloorManagerControlPanel - Levaを使ったGUIコントロール
 *
 * セクション:
 * 1. Layout - レイアウトプリセット選択
 * 2. Simulation - リアルタイムシミュレーション制御
 * 3. Floor Config - フロアサイズとテーブル設定
 * 4. Lighting - ライティング調整
 * 5. Statistics - リアルタイム統計情報
 * 6. Selected Table - 選択中のテーブル詳細
 */
export function FloorManagerControlPanel() {
  const {
    floorSize,
    tableRadius,
    simulationEnabled,
    simulationSpeed,
    tables,
    selectedTableId,
    stats,
    ambientIntensity,
    spotlightIntensity,
    spotlightColor,
    setFloorSize,
    setTableRadius,
    setSimulationEnabled,
    setSimulationSpeed,
    applyLayoutPreset,
    randomUpdateTable,
    clearAllTables,
    setAmbientIntensity,
    setSpotlightIntensity,
    setSpotlightColor,
    updateTableData,
  } = useFloorStore()

  // 選択中のテーブルデータ
  const selectedTable = useMemo(() => {
    if (!selectedTableId) return null
    return tables.get(selectedTableId) || null
  }, [selectedTableId, tables])

  const [values, set] = useControls(() => ({
    'Layout': folder({
      'Small (10 tables)': button(() => applyLayoutPreset('small')),
      'Medium (20 tables)': button(() => applyLayoutPreset('medium')),
      'Large (30+ tables)': button(() => applyLayoutPreset('large')),
    }),
    'Simulation': folder({
      enabled: {
        value: simulationEnabled,
        label: 'Auto Simulation',
      },
      speed: {
        value: simulationSpeed,
        min: 500,
        max: 5000,
        step: 100,
        label: 'Update Interval (ms)',
      },
      'Clear All Tables': button(() => clearAllTables()),
    }),
    'Floor Config': folder({
      floorWidth: {
        value: floorSize.w,
        min: 20,
        max: 50,
        step: 1,
        label: 'Floor Width',
      },
      floorHeight: {
        value: floorSize.h,
        min: 15,
        max: 40,
        step: 1,
        label: 'Floor Height',
      },
      tableRadius: {
        value: tableRadius,
        min: 0.5,
        max: 1.5,
        step: 0.1,
        label: 'Table Radius',
      },
    }),
    'Lighting': folder({
      ambientIntensity: {
        value: ambientIntensity,
        min: 0,
        max: 1,
        step: 0.1,
        label: 'Ambient Light',
      },
      spotlightIntensity: {
        value: spotlightIntensity,
        min: 0,
        max: 200,
        step: 10,
        label: 'Spotlight Intensity',
      },
      spotlightColor: {
        value: spotlightColor,
        label: 'Spotlight Color',
      },
    }),
    'Statistics': folder({
      totalTables: {
        value: stats.totalTables,
        label: 'Total Tables',
        disabled: true,
      },
      activeTables: {
        value: stats.activeTables,
        label: 'Active Tables',
        disabled: true,
      },
      totalGuests: {
        value: stats.totalGuests,
        label: 'Total Guests',
        disabled: true,
      },
      totalSales: {
        value: `¥${stats.totalSales.toLocaleString()}`,
        label: 'Total Sales',
        disabled: true,
      },
      vipTables: {
        value: stats.vipTables,
        label: 'VIP Tables',
        disabled: true,
      },
      hotTables: {
        value: stats.hotTables,
        label: 'HOT Tables',
        disabled: true,
      },
    }),
    'Selected Table': folder(
      selectedTable
        ? {
            tableId: {
              value: selectedTable.id,
              label: 'Table ID',
              disabled: true,
            },
            tableType: {
              value: selectedTable.type,
              label: 'Type',
              disabled: true,
            },
            tableStatus: {
              value: selectedTable.status,
              label: 'Status',
              disabled: true,
            },
            tableGuests: {
              value: selectedTable.guests,
              label: 'Guests',
              disabled: true,
            },
            tableTime: {
              value: `${selectedTable.timeMin} min`,
              label: 'Time',
              disabled: true,
            },
            tableSales: {
              value: `¥${selectedTable.sales.toLocaleString()}`,
              label: 'Sales',
              disabled: true,
            },
            tableBottle: {
              value: selectedTable.bottle,
              label: 'Bottle',
              disabled: true,
            },
            'Send CHECK': button(() => {
              if (selectedTableId) {
                updateTableData(selectedTableId, { status: 'CHECK' })
              }
            }),
            'Send SOS': button(() => {
              if (selectedTableId) {
                updateTableData(selectedTableId, { status: 'SOS' })
              }
            }),
            'Clear Table': button(() => {
              if (selectedTableId) {
                updateTableData(selectedTableId, {
                  status: 'EMPTY',
                  guests: 0,
                  sales: 0,
                  timeMin: 0,
                  bottle: 'None',
                })
              }
            }),
          }
        : {
            noSelection: {
              value: 'No table selected',
              label: 'Info',
              disabled: true,
            },
          }
    ),
  }))

  // Zustandストアと同期
  useEffect(() => {
    setSimulationEnabled(values.enabled)
  }, [values.enabled, setSimulationEnabled])

  useEffect(() => {
    setSimulationSpeed(values.speed)
  }, [values.speed, setSimulationSpeed])

  useEffect(() => {
    setFloorSize({ w: values.floorWidth, h: values.floorHeight })
  }, [values.floorWidth, values.floorHeight, setFloorSize])

  useEffect(() => {
    setTableRadius(values.tableRadius)
  }, [values.tableRadius, setTableRadius])

  useEffect(() => {
    setAmbientIntensity(values.ambientIntensity)
  }, [values.ambientIntensity, setAmbientIntensity])

  useEffect(() => {
    setSpotlightIntensity(values.spotlightIntensity)
  }, [values.spotlightIntensity, setSpotlightIntensity])

  useEffect(() => {
    setSpotlightColor(values.spotlightColor)
  }, [values.spotlightColor, setSpotlightColor])

  // Zustandからの変更をLevaに反映
  useEffect(() => {
    set({
      totalTables: stats.totalTables,
      activeTables: stats.activeTables,
      totalGuests: stats.totalGuests,
      totalSales: `¥${stats.totalSales.toLocaleString()}`,
      vipTables: stats.vipTables,
      hotTables: stats.hotTables,
    })
  }, [stats, set])

  // 初期レイアウト設定
  useEffect(() => {
    if (tables.size === 0) {
      applyLayoutPreset('medium')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // シミュレーションループ
  useEffect(() => {
    if (!simulationEnabled) return

    const interval = setInterval(() => {
      randomUpdateTable()
    }, simulationSpeed)

    return () => clearInterval(interval)
  }, [simulationEnabled, simulationSpeed, randomUpdateTable])

  return null
}
