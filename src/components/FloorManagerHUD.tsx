import { HUD, StatCard, StatusBadge, InfoPanel, ActionButton } from '../ui/UIComponents'
import { useFloorStore } from '../store/floorStore'
import { useMemo } from 'react'

/**
 * FloorManagerHUD - フロアマネージャー用のHUD表示
 *
 * 表示内容:
 * - 総売上、稼働席数、総来客数
 * - VIP/HOT席の状況
 * - 選択されたテーブルの詳細情報
 */
export function FloorManagerHUD() {
  const { stats, selectedTableId, tables, updateTableData } = useFloorStore()

  const selectedTable = useMemo(() => {
    if (!selectedTableId) return null
    return tables.get(selectedTableId) || null
  }, [selectedTableId, tables])

  // 稼働率の計算
  const occupancyRate = stats.totalTables > 0
    ? Math.round((stats.activeTables / stats.totalTables) * 100)
    : 0

  return (
    <>
      <HUD
        title="Floor Manager"
        subtitle="リアルタイム卓管理システム"
        icon="🏢"
      >
        <StatCard
          label="総売上"
          value={`¥${stats.totalSales.toLocaleString()}`}
          icon="💰"
          color="gold"
          trend="up"
        />
        <StatCard
          label="稼働席"
          value={`${stats.activeTables}/${stats.totalTables}`}
          icon="🪑"
          color="blue"
        />
        <StatCard
          label="来客数"
          value={`${stats.totalGuests}名`}
          icon="👥"
          color="green"
        />
        <StatCard
          label="稼働率"
          value={`${occupancyRate}%`}
          icon="📊"
          color="purple"
        />
        <StatCard
          label="VIP席"
          value={stats.vipTables}
          icon="⭐"
          color="gold"
        />
        <StatCard
          label="HOT席"
          value={stats.hotTables}
          icon="🔥"
          color="red"
        />
      </HUD>

      {selectedTable && (
        <InfoPanel
          title={`テーブル ${selectedTable.id}`}
          position="bottom-right"
          collapsible={true}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* ステータス */}
            <div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                STATUS
              </div>
              <StatusBadge
                status={
                  selectedTable.status === 'EMPTY' ? 'inactive' :
                  selectedTable.status === 'HOT' || selectedTable.status === 'SOS' ? 'error' :
                  selectedTable.status === 'CHECK' ? 'warning' :
                  selectedTable.status === 'VIP' ? 'success' : 'active'
                }
                label={selectedTable.status}
                pulse={selectedTable.status === 'SOS' || selectedTable.status === 'CHECK'}
              />
              {selectedTable.type === 'VIP' && (
                <span style={{ marginLeft: '8px' }}>
                  <StatusBadge status="success" label="VIP" />
                </span>
              )}
            </div>

            {/* 詳細情報 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                  滞在時間
                </div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#fff' }}>
                  {selectedTable.timeMin} min
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                  来客数
                </div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#fff' }}>
                  {selectedTable.guests}名
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                  売上
                </div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#FFD700' }}>
                  ¥{selectedTable.sales.toLocaleString()}
                </div>
              </div>
              {selectedTable.bottle !== 'None' && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                    ボトル
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>
                    🍾 {selectedTable.bottle}
                  </div>
                </div>
              )}
            </div>

            {/* アクションボタン */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <ActionButton
                  label="CHECK"
                  icon="💳"
                  variant="primary"
                  onClick={() => updateTableData(selectedTable.id, { status: 'CHECK' })}
                />
                <ActionButton
                  label="SOS"
                  icon="🚨"
                  variant="danger"
                  onClick={() => updateTableData(selectedTable.id, { status: 'SOS' })}
                />
              </div>
              <ActionButton
                label="空席にする"
                icon="🧹"
                variant="secondary"
                onClick={() =>
                  updateTableData(selectedTable.id, {
                    status: 'EMPTY',
                    guests: 0,
                    sales: 0,
                    timeMin: 0,
                    bottle: 'None',
                  })
                }
              />
            </div>
          </div>
        </InfoPanel>
      )}

      {/* ヘルプテキスト */}
      {!selectedTable && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(10px)',
            padding: '12px 24px',
            borderRadius: '20px',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '13px',
            pointerEvents: 'none',
            textAlign: 'center',
          }}
        >
          💡 テーブルをクリックして詳細を表示
        </div>
      )}
    </>
  )
}
