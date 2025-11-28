import { HUD, StatCard, StatusBadge, InfoPanel } from '../ui/UIComponents'
import { useVanningStore } from '../store/vanningStore'

/**
 * VanningSimulatorHUD - バンニングシミュレーター用のHUD表示
 *
 * 表示内容:
 * - 積載数、容積利用率
 * - コンテナタイプ、貨物タイプ
 * - 重心位置
 */
export function VanningSimulatorHUD() {
  const {
    count,
    volumeUtilization,
    centerOfGravity,
    currentAlgorithm,
    containerType,
    cargoType,
  } = useVanningStore()

  // 容積利用率に基づいてステータスを決定
  const getUtilizationStatus = (util: number) => {
    if (util >= 80) return { status: 'success' as const, label: '最適' }
    if (util >= 60) return { status: 'active' as const, label: '良好' }
    if (util >= 40) return { status: 'warning' as const, label: '改善余地' }
    return { status: 'error' as const, label: '要改善' }
  }

  const utilizationStatus = getUtilizationStatus(volumeUtilization)

  return (
    <>
      <HUD
        title="Vanning Simulator"
        subtitle="コンテナ積載最適化シミュレーター"
        icon="🚢"
      >
        <StatCard
          label="積載数"
          value={count}
          icon="📦"
          color="blue"
        />
        <StatCard
          label="容積利用率"
          value={`${volumeUtilization.toFixed(1)}%`}
          icon="📊"
          color={volumeUtilization >= 70 ? 'green' : volumeUtilization >= 50 ? 'gold' : 'red'}
          trend={volumeUtilization >= 70 ? 'up' : volumeUtilization >= 50 ? 'neutral' : 'down'}
        />
        <StatCard
          label="アルゴリズム"
          value={currentAlgorithm}
          icon="⚙️"
          color="purple"
        />
      </HUD>

      <InfoPanel
        title="コンテナ情報"
        position="bottom-right"
        collapsible={true}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* コンテナタイプ */}
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
              CONTAINER TYPE
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>
              {containerType}
            </div>
          </div>

          {/* 貨物タイプ */}
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
              CARGO TYPE
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>
              {cargoType}
            </div>
          </div>

          {/* 効率ステータス */}
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
              EFFICIENCY
            </div>
            <StatusBadge status={utilizationStatus.status} label={utilizationStatus.label} />
          </div>

          {/* 重心位置 */}
          {centerOfGravity && (
            <div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                CENTER OF GRAVITY
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>X</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>
                    {centerOfGravity.x.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Y</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>
                    {centerOfGravity.y.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Z</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>
                    {centerOfGravity.z.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </InfoPanel>

      {/* ヘルプテキスト */}
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
        💡 コントロールパネルでコンテナと貨物を設定
      </div>
    </>
  )
}
