import { useControls, button, folder } from 'leva'
import { useGlitterStore, COSMETIC_PRESETS, CosmeticPresetKey } from '@/store/glitterStore'

/**
 * Glitter Control Panel Component
 * Levaを使ったGlitter Material用のUIコントロールパネル
 */
export function GlitterControlPanel() {
  const {
    preset,
    setPreset,
    params,
    setParam,
    objectType,
    setObjectType,
    rotationSpeed,
    setRotationSpeed,
    backgroundColor,
    setBackgroundColor
  } = useGlitterStore()

  useControls({
    // プリセット
    'プリセット': folder({
      '化粧品タイプ': {
        value: preset,
        options: {
          '口紅（深い赤 + ゴールド）': 'lipstick',
          'アイシャドウ（紫 + シルバー）': 'eyeshadow',
          'ネイル（ピンク + ホログラム）': 'nail',
          'カスタム': 'custom'
        } as Record<string, CosmeticPresetKey>,
        onChange: (v: CosmeticPresetKey) => setPreset(v)
      }
    }),

    // マテリアルパラメータ
    'マテリアル': folder({
      'ベースカラー': {
        value: params.baseColor,
        onChange: (v) => setParam('baseColor', v)
      },
      'ラメカラー': {
        value: params.glitterColor,
        onChange: (v) => setParam('glitterColor', v)
      },
      'ラメの細かさ': {
        value: params.glitterScale,
        min: 10,
        max: 200,
        step: 5,
        onChange: (v) => setParam('glitterScale', v)
      },
      'ラメの強さ': {
        value: params.glitterStrength,
        min: 0,
        max: 10,
        step: 0.1,
        onChange: (v) => setParam('glitterStrength', v)
      }
    }),

    // オブジェクト設定
    'オブジェクト': folder({
      '形状': {
        value: objectType,
        options: {
          '球体': 'sphere',
          '円柱': 'cylinder',
          'トーラス': 'torus'
        },
        onChange: (v) => setObjectType(v as 'sphere' | 'cylinder' | 'torus')
      },
      '回転速度': {
        value: rotationSpeed,
        min: 0,
        max: 2,
        step: 0.1,
        onChange: (v) => setRotationSpeed(v)
      }
    }),

    // シーン設定
    'シーン': folder({
      '背景色': {
        value: backgroundColor,
        onChange: (v) => setBackgroundColor(v)
      }
    }),

    // 使い方ガイド
    'ℹ️ 使い方': folder({
      'ヒント1': {
        value: 'マウスドラッグで視点を動かすとラメがキラキラ光ります',
        disabled: true
      },
      'ヒント2': {
        value: 'ラメの細かさと強さを調整して好みの質感を作成',
        disabled: true
      },
      'ヒント3': {
        value: 'プリセットから化粧品タイプを選んで試してみましょう',
        disabled: true
      }
    })
  })

  return null
}
