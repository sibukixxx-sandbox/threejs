import { useControls, button, folder } from 'leva'
import { useChampagneStore } from '../store/champagneStore'
import { useEffect, useMemo } from 'react'

/**
 * ChampagneTowerControlPanel - Levaを使ったGUIコントロール
 *
 * セクション:
 * 1. Tower Structure - タワーの構造（段数、サイズ、間隔）
 * 2. Material - マテリアルパラメータ（色、metalness、transmission等）
 * 3. Animation - 自動回転の設定
 * 4. Lighting - ライトの色と強度
 * 5. Presets - 4つのプリセット（Classic, Rose, Champagne, Crystal）
 * 6. Statistics - タワーの統計情報（総グラス数）
 */
export function ChampagneTowerControlPanel() {
  const {
    levels,
    glassSize,
    spacing,
    liquidColor,
    metalness,
    roughness,
    transmission,
    thickness,
    clearcoat,
    autoRotate,
    rotationSpeed,
    lightIntensity1,
    lightIntensity2,
    lightColor1,
    lightColor2,
    setLevels,
    setGlassSize,
    setSpacing,
    setLiquidColor,
    setMetalness,
    setRoughness,
    setTransmission,
    setThickness,
    setClearcoat,
    setAutoRotate,
    setRotationSpeed,
    setLightIntensity1,
    setLightIntensity2,
    setLightColor1,
    setLightColor2,
    applyPreset,
  } = useChampagneStore()

  // 総グラス数を計算（ピラミッド数列の和）
  const totalGlasses = useMemo(() => {
    let total = 0
    for (let i = 1; i <= levels; i++) {
      total += i * i // 各レベルはi^2個のグラス
    }
    return total
  }, [levels])

  const [values, set] = useControls(() => ({
    'Tower Structure': folder({
      levels: {
        value: levels,
        min: 1,
        max: 10,
        step: 1,
        label: 'Levels',
      },
      glassSize: {
        value: glassSize,
        min: 0.3,
        max: 1.5,
        step: 0.1,
        label: 'Glass Size',
      },
      spacing: {
        value: spacing,
        min: 0.5,
        max: 2.0,
        step: 0.1,
        label: 'Spacing',
      },
    }),
    'Material': folder({
      liquidColor: {
        value: liquidColor,
        label: 'Liquid Color',
      },
      metalness: {
        value: metalness,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Metalness',
      },
      roughness: {
        value: roughness,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Roughness',
      },
      transmission: {
        value: transmission,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Transmission',
      },
      thickness: {
        value: thickness,
        min: 0,
        max: 5,
        step: 0.1,
        label: 'Thickness',
      },
      clearcoat: {
        value: clearcoat,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Clearcoat',
      },
    }),
    'Animation': folder({
      autoRotate: {
        value: autoRotate,
        label: 'Auto Rotate',
      },
      rotationSpeed: {
        value: rotationSpeed,
        min: 0,
        max: 0.05,
        step: 0.001,
        label: 'Rotation Speed',
      },
    }),
    'Lighting': folder({
      lightColor1: {
        value: lightColor1,
        label: 'Main Light Color',
      },
      lightIntensity1: {
        value: lightIntensity1,
        min: 0,
        max: 200,
        step: 5,
        label: 'Main Light Intensity',
      },
      lightColor2: {
        value: lightColor2,
        label: 'Accent Light Color',
      },
      lightIntensity2: {
        value: lightIntensity2,
        min: 0,
        max: 100,
        step: 5,
        label: 'Accent Light Intensity',
      },
    }),
    'Presets': folder({
      'Classic Gold': button(() => applyPreset('classic')),
      'Rose Pink': button(() => applyPreset('rose')),
      'Champagne Beige': button(() => applyPreset('champagne')),
      'Crystal Clear': button(() => applyPreset('crystal')),
    }),
    'Statistics': folder({
      totalGlasses: {
        value: totalGlasses,
        label: 'Total Glasses',
        disabled: true,
      },
    }),
  }))

  // Zustandストアと同期
  useEffect(() => {
    setLevels(values.levels)
  }, [values.levels, setLevels])

  useEffect(() => {
    setGlassSize(values.glassSize)
  }, [values.glassSize, setGlassSize])

  useEffect(() => {
    setSpacing(values.spacing)
  }, [values.spacing, setSpacing])

  useEffect(() => {
    setLiquidColor(values.liquidColor)
  }, [values.liquidColor, setLiquidColor])

  useEffect(() => {
    setMetalness(values.metalness)
  }, [values.metalness, setMetalness])

  useEffect(() => {
    setRoughness(values.roughness)
  }, [values.roughness, setRoughness])

  useEffect(() => {
    setTransmission(values.transmission)
  }, [values.transmission, setTransmission])

  useEffect(() => {
    setThickness(values.thickness)
  }, [values.thickness, setThickness])

  useEffect(() => {
    setClearcoat(values.clearcoat)
  }, [values.clearcoat, setClearcoat])

  useEffect(() => {
    setAutoRotate(values.autoRotate)
  }, [values.autoRotate, setAutoRotate])

  useEffect(() => {
    setRotationSpeed(values.rotationSpeed)
  }, [values.rotationSpeed, setRotationSpeed])

  useEffect(() => {
    setLightIntensity1(values.lightIntensity1)
  }, [values.lightIntensity1, setLightIntensity1])

  useEffect(() => {
    setLightIntensity2(values.lightIntensity2)
  }, [values.lightIntensity2, setLightIntensity2])

  useEffect(() => {
    setLightColor1(values.lightColor1)
  }, [values.lightColor1, setLightColor1])

  useEffect(() => {
    setLightColor2(values.lightColor2)
  }, [values.lightColor2, setLightColor2])

  // Zustandからの変更をLevaに反映
  useEffect(() => {
    set({ liquidColor, metalness, roughness, transmission, thickness, clearcoat })
  }, [liquidColor, metalness, roughness, transmission, thickness, clearcoat, set])

  return null
}
