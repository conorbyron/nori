precision highp float;
precision highp int;
varying vec4 vertexColor;
uniform vec2 resolution;
uniform float p;

void main() {
  vec2 circCoord = 2.0 * gl_PointCoord - 1.0;
  if (dot(circCoord, circCoord) > 1.0 || vertexColor.a < 0.0001) {
    discard;
  }
  gl_FragColor = vec4(vertexColor);
}