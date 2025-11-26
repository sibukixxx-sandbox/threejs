import * as THREE from 'three'

/**
 * ラメの質感を調整するためのパラメータ
 */
export interface GlitterMaterialParams {
  baseColor: string | number     // ベースとなる色（例: 口紅の色）
  glitterColor?: string | number // ラメの色（省略時は白）
  glitterScale?: number          // ラメの細かさ（大きいほど細かい）
  glitterStrength?: number       // ラメの強さ（輝度）
}

/**
 * カスタムシェーダーマテリアル: きらめくラメ質感
 *
 * 化粧品・美容分野で需要の高い「きらめき（ラメ・パール感）」を表現するシェーダーマテリアル。
 * 画像では伝わらない「視点を動かしたときのキラキラ感」をGLSLで実現。
 *
 * 特徴:
 * - 視線角度に応じたスペキュラハイライト
 * - ノイズ関数による微細な凹凸のシミュレート
 * - 時間経過によるきらめきアニメーション
 * - パラメータ調整でリアルタイムに質感変更可能
 *
 * 用途:
 * - 口紅、アイシャドウ、ネイルのバーチャル試着
 * - 化粧品ECサイトの商品ビジュアライゼーション
 * - AR/VRメイクアップシミュレーター
 */
export class GlitterMaterial extends THREE.ShaderMaterial {
  constructor(params: GlitterMaterialParams) {
    // Uniform変数の定義と初期値設定
    const uniforms = {
      uBaseColor: { value: new THREE.Color(params.baseColor) },
      uGlitterColor: { value: new THREE.Color(params.glitterColor ?? 0xffffff) },
      uGlitterScale: { value: params.glitterScale ?? 50.0 },
      uGlitterStrength: { value: params.glitterStrength ?? 2.0 },
      uTime: { value: 0.0 }, // 時間経過によるきらめきアニメーション用
    }

    super({
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.common,
        uniforms
      ]),
      vertexShader: GlitterMaterial.VertexShader,
      fragmentShader: GlitterMaterial.FragmentShader,
      side: THREE.FrontSide,
    })
  }

  /**
   * 時間を更新するためのヘルパーメソッド（毎フレーム呼び出す）
   */
  public updateTime(delta: number): void {
    this.uniforms.uTime.value += delta
  }

  /**
   * ベースカラーを更新
   */
  public setBaseColor(color: THREE.Color | string | number): void {
    this.uniforms.uBaseColor.value = new THREE.Color(color)
  }

  /**
   * ラメカラーを更新
   */
  public setGlitterColor(color: THREE.Color | string | number): void {
    this.uniforms.uGlitterColor.value = new THREE.Color(color)
  }

  /**
   * ラメの細かさを更新
   */
  public setGlitterScale(scale: number): void {
    this.uniforms.uGlitterScale.value = scale
  }

  /**
   * ラメの強さを更新
   */
  public setGlitterStrength(strength: number): void {
    this.uniforms.uGlitterStrength.value = strength
  }

  // --------------- GLSL Shader Code ---------------

  /**
   * Vertex Shader: 頂点の位置計算と、ピクセルシェーダーへのデータ受け渡し
   */
  private static VertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      // 法線をワールド空間に変換（回転などを考慮）
      vNormal = normalize(normalMatrix * normal);

      // カメラから見た頂点の位置
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;

      // 最終的な頂点位置
      gl_Position = projectionMatrix * mvPosition;
    }
  `

  /**
   * Fragment Shader: ピクセルの色決定（ラメ計算の核心）
   */
  private static FragmentShader = `
    uniform vec3 uBaseColor;
    uniform vec3 uGlitterColor;
    uniform float uGlitterScale;
    uniform float uGlitterStrength;
    uniform float uTime;

    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;

    // 簡易的な乱数生成関数 (sin波を利用したハッシュ関数)
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      // 正規化された法線と視線ベクトル
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      // --- ラメ計算のロジック ---

      // 1. UV座標をスケールさせてグリッドを作り、各グリッドにランダムな値を割り当てる
      vec2 scaledUv = vUv * uGlitterScale;
      vec2 gridId = floor(scaledUv);
      float noiseVal = random(gridId); // 0.0〜1.0の乱数

      // 2. 時間経過でキラキラさせる
      // ノイズ値に時間を加えてsin波を通すことで、明滅するような動きを作る
      float timeFactor = sin(uTime * 2.0 + noiseVal * 6.28) * 0.5 + 0.5;

      // 3. 視線角度によるきらめきの強調 (簡易的なフレネル・スペキュラ効果)
      // 法線と視線が正対しているところほど強く光らせるベース
      float specBase = max(0.0, dot(normal, viewDir));

      // 反射強度を非常に鋭くする（pow関数で指数関数的に強調）
      // ここにノイズ値と時間要素を掛け合わせることで、「特定の角度で、ランダムな粒が光る」表現になる
      float glitterIntensity = pow(specBase * noiseVal * timeFactor, 15.0); // 15.0は光の鋭さ

      // --- 最終的な色の合成 ---

      // ベース色 + (ラメ色 * 強度 * パラメータ設定強度)
      vec3 finalColor = uBaseColor + uGlitterColor * glitterIntensity * uGlitterStrength;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
}

/**
 * プリセット: 口紅（深い赤 + ゴールドラメ）
 */
export function createLipstickMaterial(): GlitterMaterial {
  return new GlitterMaterial({
    baseColor: 0xaa0022,   // 深い赤
    glitterColor: 0xffd700, // ゴールドのラメ
    glitterScale: 80.0,     // 細かいラメ
    glitterStrength: 3.5    // 強めに光らせる
  })
}

/**
 * プリセット: アイシャドウ（紫 + シルバーラメ）
 */
export function createEyeshadowMaterial(): GlitterMaterial {
  return new GlitterMaterial({
    baseColor: 0x9b59b6,   // 紫
    glitterColor: 0xc0c0c0, // シルバー
    glitterScale: 100.0,    // より細かいラメ
    glitterStrength: 2.5
  })
}

/**
 * プリセット: ネイル（ピンク + ホログラムラメ）
 */
export function createNailMaterial(): GlitterMaterial {
  return new GlitterMaterial({
    baseColor: 0xff69b4,   // ピンク
    glitterColor: 0xffffff, // 白（虹色風）
    glitterScale: 60.0,
    glitterStrength: 4.0    // 非常に強く
  })
}
