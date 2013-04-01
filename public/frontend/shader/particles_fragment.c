#ifdef GL_ES
precision highp float;
#endif

uniform vec3 color;
uniform sampler2D particle_texture;

varying vec3 vColor;
varying float vOpacity;

void main() {
    vec4 outColor = vec4(vColor, 1.0);
    gl_FragColor = outColor * texture2D(particle_texture, gl_PointCoord);
}
