import { HUD, StatCard, InfoPanel, ActionButton } from '../ui/UIComponents'
import { useChampagneStore } from '../store/champagneStore'
import { useMemo } from 'react'

/**
 * ChampagneTowerHUD - シャンパンタワー用のHUD表示
 *
 * 表示内容:
 * - タワーの段数、総グラス数
 * - マテリアルプリセット選択
 * - 自動回転の状態
 */
export function ChampagneTowerHUD() {
  const {
    levels,
    autoRotate,
    rotationSpeed,
    setAutoRotate,
    applyPreset,
  } = useChampagneStore()

  // 総グラス数を計算（ピラミッド数列の和）
  const totalGlasses = useMemo(() => {
    let total = 0
    for (let i = 1; i <= levels; i++) {
      total += i * i
    }
    return total
  }, [levels])

  return (
    <>
      <HUD
        title="Champagne Tower"
        subtitle="シャンパンタワーシミュレーター"
        icon="🍾"
      >
        <StatCard
          label="段数"
          value={levels}
          icon="📏"
          color="gold"
        />
        <StatCard
          label="総グラス数"
          value={totalGlasses}
          icon="🥂"
          color="blue"
        />
        <StatCard
          label="回転速度"
          value={autoRotate ? `${(rotationSpeed * 100).toFixed(1)}°/s` : '停止'}
          icon={autoRotate ? '🔄' : '⏸️'}
          color={autoRotate ? 'green' : 'red'}
        />
      </HUD>

      <InfoPanel
        title="クイックプリセット"
        position="bottom-right"
        collapsible={true}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <ActionButton
            label="Classic Gold"
            icon="🟡"
            variant="primary"
            onClick={() => applyPreset('classic')}
          />
          <ActionButton
            label="Rose Pink"
            icon="🌸"
            variant="danger"
            onClick={() => applyPreset('rose')}
          />
          <ActionButton
            label="Champagne Beige"
            icon="🟠"
            variant="secondary"
            onClick={() => applyPreset('champagne')}
          />
          <ActionButton
            label="Crystal Clear"
            icon="💎"
            variant="success"
            onClick={() => applyPreset('crystal')}
          />
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', marginTop: '4px' }}>
            <ActionButton
              label={autoRotate ? '回転を停止' : '回転を開始'}
              icon={autoRotate ? '⏸️' : '▶️'}
              variant="secondary"
              onClick={() => setAutoRotate(!autoRotate)}
            />
          </div>
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
        💡 マウスドラッグで視点を変更 | ホイールでズーム
      </div>
    </>
  )
}
