varying vec2 vUv;
uniform sampler2D tPositions;

void main() {
    vec4 pos = texture2D(tPositions, vUv);
    gl_FragColor = pos;
};
