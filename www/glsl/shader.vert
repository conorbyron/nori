precision highp float;
precision highp int;
attribute float index;
attribute vec4 color;
varying vec4 vertexColor;
uniform float p;

void main() {
  vertexColor = color;
  float max = 11.0;
  float b = .5 * sin(2. * 3.14159 * mod((index + p), max) / max) + .5;
  gl_PointSize = (color.a + .2) * b * 5.;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  // gl_Position = projectionMatrix * modelViewMatrix * vec4(position + 1000.0 *
  // cameraPosition, 1.0);
}