
attribute float size;
attribute vec3 customColor;
attribute vec2 aPoints;

uniform sampler2D position_texture;
uniform sampler2D color_texture; // photo's texture
uniform sampler2D next_color_texture;

varying vec3 vColor;

attribute float opacity;
varying float vOpacity;

uniform vec2 photoDimensions;
uniform float fboWidth;
uniform float transition;
uniform int afterEffects;
uniform float particleSize;

const float fa = (4.0 / 9.0);
const float fb = (17.0 / 9.0);
const float fc = (22.0 / 9.0);

/*
 ** Desaturation
 */
vec4 Desaturate(vec3 color, float Desaturation) {
    vec3 grayXfer = vec3(0.3, 0.59, 0.11);
    vec3 gray = vec3(dot(grayXfer, color));
    return vec4(mix(color, gray, Desaturation), 1.0);
}

float s_curve(float x) {
    // blinnWyvillCosineApproximation
    float x2 = x*x;
    float x4 = x2*x2;
    float x6 = x4*x2;
    return fa * x6 - fb * x4 + fc*x2;
}

float inverse_s_curve(float x) {
    return s_curve(2.0 * x - s_curve(x));
}

vec3 cross_process(vec3 color) {
    return vec3(s_curve(color.r), s_curve(color.g), inverse_s_curve(color.b));

    // color.r = s_curve(color.r);
    // color.g = s_curve(color.g);
    // color.b = inverse_s_curve(color.b);
}

void main() {
    vec4 pos = vec4(texture2D(position_texture, aPoints).xyz, 1.0);

    vOpacity = opacity;
    vec2 color_lookup = vec2(1.0 - aPoints.x, aPoints.y);

    vec3 particle_color = texture2D(color_texture, color_lookup).xyz;
    vec3 next_particle_color = texture2D(next_color_texture, color_lookup).xyz;

    if (afterEffects == 1) {
          particle_color = cross_process(particle_color);
          next_particle_color = cross_process(next_particle_color);
    } else if (afterEffects == 2) {
         particle_color = Desaturate(particle_color, 0.8).xyz;
           next_particle_color = Desaturate(next_particle_color, 0.2).xyz;
    } else if (afterEffects == 3) {

    }

    particle_color = (1.0 - transition) * particle_color + transition * next_particle_color;

    vColor = particle_color;
    vec4 mvPosition = modelViewMatrix * pos;

    gl_PointSize = particleSize * 512.0 / fboWidth * 200.0 / length(mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
}