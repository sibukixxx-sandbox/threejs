uniform vec3 uLightPosition;
uniform vec3 uLightColor;
uniform vec3 uBaseColor;
uniform vec3 uSubsurfaceColor;
uniform float uSubsurfaceIntensity;
uniform float uSubsurfacePower;
uniform float uAmbientIntensity;
uniform float uShininess;
uniform float uSpecularStrength;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;

void main() {
  // 正規化
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  vec3 lightDir = normalize(uLightPosition - vWorldPosition);

  // Ambient (環境光)
  vec3 ambient = uBaseColor * uAmbientIntensity;

  // Diffuse (拡散反射)
  float diff = max(dot(normal, lightDir), 0.0);
  vec3 diffuse = diff * uBaseColor * uLightColor;

  // Specular (鏡面反射) - 美容系では控えめに
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfDir), 0.0), uShininess);
  vec3 specular = uSpecularStrength * spec * uLightColor;

  // Subsurface Scattering (表面下散乱)
  // 光が物体の裏側から透過してくる効果
  float subsurface = max(0.0, dot(-normal, lightDir));
  subsurface = pow(subsurface, uSubsurfacePower) * uSubsurfaceIntensity;
  vec3 subsurfaceLight = subsurface * uSubsurfaceColor * uLightColor;

  // Rim Light (リムライト) - 輪郭を強調
  float rim = 1.0 - max(0.0, dot(viewDir, normal));
  rim = pow(rim, 3.0) * 0.3;
  vec3 rimLight = rim * uLightColor;

  // 最終的な色を合成
  vec3 finalColor = ambient + diffuse + specular + subsurfaceLight + rimLight;

  // トーンマッピング（柔らかい印象に）
  finalColor = finalColor / (finalColor + vec3(1.0));

  // ガンマ補正
  finalColor = pow(finalColor, vec3(1.0 / 2.2));

  gl_FragColor = vec4(finalColor, 1.0);
}
