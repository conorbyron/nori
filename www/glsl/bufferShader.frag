precision highp float;
precision highp int;
uniform sampler2D current;
uniform sampler2D delay;
uniform vec2 resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  gl_FragColor = max(0.9 * texture2D(delay, uv), texture2D(current, uv));
}