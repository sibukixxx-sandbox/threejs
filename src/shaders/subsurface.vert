varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;

void main() {
  // ワールド座標
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;

  // ビュー座標
  vec4 mvPosition = viewMatrix * worldPosition;
  vViewPosition = -mvPosition.xyz;

  // 法線をワールド空間に変換
  vNormal = normalize(normalMatrix * normal);

  gl_Position = projectionMatrix * mvPosition;
}
