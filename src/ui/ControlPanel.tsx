import { useControls, button, folder } from 'leva'
import { useSceneStore } from '../store/sceneStore'

/**
 * Control Panel Component
 * Levaを使ったUIコントロールパネル
 */
export function ControlPanel() {
  const {
    material,
    setMaterialProperty,
    loadPreset,
    lighting,
    setLightingProperty,
    backgroundColor,
    setBackgroundColor,
    rotationSpeed,
    setRotationSpeed
  } = useSceneStore()

  useControls({
    // プリセット
    'プリセット': folder({
      '肌': button(() => loadPreset('skin')),
      'ワックス': button(() => loadPreset('wax')),
      'クリーム': button(() => loadPreset('cream'))
    }),

    // マテリアル
    'マテリアル': folder({
      'ベースカラー': {
        value: material.baseColor,
        onChange: (v) => setMaterialProperty('baseColor', v)
      },
      'サブサーフェスカラー': {
        value: material.subsurfaceColor,
        onChange: (v) => setMaterialProperty('subsurfaceColor', v)
      },
      'サブサーフェス強度': {
        value: material.subsurfaceIntensity,
        min: 0,
        max: 2,
        step: 0.1,
        onChange: (v) => setMaterialProperty('subsurfaceIntensity', v)
      },
      'サブサーフェスパワー': {
        value: material.subsurfacePower,
        min: 0.5,
        max: 5,
        step: 0.1,
        onChange: (v) => setMaterialProperty('subsurfacePower', v)
      },
      '光沢度': {
        value: material.shininess,
        min: 1,
        max: 128,
        step: 1,
        onChange: (v) => setMaterialProperty('shininess', v)
      },
      'スペキュラー強度': {
        value: material.specularStrength,
        min: 0,
        max: 1,
        step: 0.05,
        onChange: (v) => setMaterialProperty('specularStrength', v)
      }
    }),

    // 照明
    '照明': folder({
      'キーライト強度': {
        value: lighting.keyIntensity,
        min: 0,
        max: 3,
        step: 0.1,
        onChange: (v) => setLightingProperty('keyIntensity', v)
      },
      'フィルライト強度': {
        value: lighting.fillIntensity,
        min: 0,
        max: 3,
        step: 0.1,
        onChange: (v) => setLightingProperty('fillIntensity', v)
      },
      'バックライト強度': {
        value: lighting.backIntensity,
        min: 0,
        max: 3,
        step: 0.1,
        onChange: (v) => setLightingProperty('backIntensity', v)
      },
      'アンビエント強度': {
        value: lighting.ambientIntensity,
        min: 0,
        max: 1,
        step: 0.05,
        onChange: (v) => setLightingProperty('ambientIntensity', v)
      }
    }),

    // シーン
    'シーン': folder({
      '背景色': {
        value: backgroundColor,
        onChange: (v) => setBackgroundColor(v)
      },
      '回転速度': {
        value: rotationSpeed,
        min: 0,
        max: 2,
        step: 0.1,
        onChange: (v) => setRotationSpeed(v)
      }
    })
  })

  return null
}
