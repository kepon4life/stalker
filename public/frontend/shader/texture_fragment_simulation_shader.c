// simulation
varying vec2 vUv;

uniform sampler2D tPositions;
uniform sampler2D tPositions2;
uniform float time;
uniform float delta;
uniform int implode;
uniform int home;
uniform float transition;

uniform sampler2D photoTexture;
uniform vec2 photoDimensions;
uniform float fboWidth;
uniform int explosionType;


//==NOISE==

float noiseMul = 0.1;
float offset = 0.5;
const float PI = 3.141592653589793;
const float PI_2 = 6.283185307179586;
float slowness = 4.0; // 1.0/delta;
float width = 1024.0 / 4.0; // <== noise width
// if multiply by factor big, will be bigger

float damping = 0.977;

/// Converts FBO dimensions -> Texture size

vec3 getInitialTexturePos(vec2 uvcoords, float fboWidth, vec2 textureDimension) {

    // Do a simple bilinear interpolation
    vec2 stretch = (0.5 - uvcoords) * 1000.0;
    stretch.x *= textureDimension.x / textureDimension.y;

    return vec3(stretch, -300.0); // -200 -510.0
}

float exp_ease_out(float k) {

    // Clamp the edge,
    // Do a quadratic ease in
    // Do a exponential ease out

    if (k > 1.0) return 1.0;
    if ((k *= 2.0) < 1.0) return 0.5 * k * k;
    return 0.5 * (-pow(2.0, -10.0 * (k - 1.0)) + 2.0);
}

vec3 attractor(vec3 particle_pos, vec3 attractor_pos, float strength) {


    const float attractor_mass = 800.0;
    const float particle_mass = 50.05;

    // vec from particle to target
    vec3 delta = attractor_pos - particle_pos;
    float dist_sq = delta.x * delta.x + delta.y * delta.y + delta.z * delta.z;

    vec3 force = vec3(0);
    float radius_sq = attractor_mass * attractor_mass * 1.0;

    // applying limits
    const float inner_radius_sq = 1000.000001;
    if (strength < 0.0 || dist_sq > inner_radius_sq && dist_sq < radius_sq) {
        force = attractor_mass * particle_mass * normalize(delta) / dist_sq;
    }

    force *= strength;
    return force;

}

vec3 sphere(vec2 uv) {
    float u = uv.x * PI;
    float v = uv.y * PI_2;

    float x = sin(u) * cos(v);
    float y = sin(u) * sin(v);
    float z = cos(u);

    return vec3(x, y, z) * 300.0;
}

vec3 cone(vec2 uv) {
    float u = uv.x * PI;
    float v = uv.y * PI_2;

    float x = u;
    float y = u * cos(v);
    float z = u * sin(v);

    return vec3(x, y, z) * 300.0;
}

vec3 supershape(vec2 uv) { //supershape1
    float u = uv.x * PI;
    float v = uv.y * PI_2;

    float a = 1.0;
    float b = 1.0;
    float m = 12.0;
    float n1 = 5.5;
    float n2 = 6.7;
    float n3 = 48.7;

    float r = pow((pow(abs(cos(m * u / 4.0) / a), n2) + pow(abs(sin(m * u / 4.0) / b), n3)), -(1.0 / n1));

    float a2 = 1.0;
    float b2 = 1.0;
    float m2 = 12.0;
    float n12 = 5.0;
    float n22 = 6.0;
    float n32 = 48.0;

    float r2 = pow((pow(abs(cos(m2 * u / 4.0) / a2), n22) + pow(abs(sin(m2 * u / 4.0) / b2), n32)), -(1.0 / n12));

    float x = r * cos(u) * r2 * cos(v);
    float y = r * sin(u) * r2 * cos(v);
    float z = r2 * sin(v);

    return vec3(x, y, z) * 150.0;
}

void main() {
    vec4 pos = texture2D(tPositions, vUv);
    vec4 pos_prev = texture2D(tPositions2, vUv);

    // derive velocity
    vec3 velocity = pos_prev.xyz - pos.xyz;
    vec3 pos_new;

    if (home > 0 || explosionType > 2) {

        // HOME MODE
        if (explosionType == 3) {
            pos_new = velocity * damping + pos_prev.xyz;
        } else if (explosionType == 5) {
            pos_new = sphere(vUv);
        } else if (explosionType == 6) {
            pos_new = cone(vUv);
        } else if (explosionType == 7) {
            pos_new = supershape(vUv);
        } else {
            pos_new = getInitialTexturePos(vUv, fboWidth, photoDimensions);
        }

        if (implode == 1) {
            pos_new = pos_prev.xyz + (pos_new - pos_prev.xyz) * clamp(exp_ease_out(transition / 0.8), 0.0, 1.0);
        }
    } else {

        // EXPLOSION MODE
        if (explosionType == 0) {
            velocity.x += SimplexPerlin3D(vec3(pos_prev.x / width, pos_prev.y / width, time)) / slowness; //
            velocity.y += SimplexPerlin3D(vec3(pos_prev.x / width + offset, pos_prev.y / width + offset, time)) / slowness;
            velocity.z += SimplexPerlin3D(vec3(pos_prev.x / width * 4.0 + 2.0 * offset, pos_prev.y / width * 4.0 + 2.0 * offset, time)) / slowness / 4.0;

            // DAMPING
            velocity.xyz *= damping;

        } else {

            vec4 pixel_color = texture2D(photoTexture, vUv);

            vec3 r_attractor_pos = vec3(-600.0, -200.0, -340.0);

            vec3 g_attractor_pos = vec3(-100.0, 400, -350.0);
            vec3 b_attractor_pos = vec3(400.0, -100.0, -300.0);

            float d = (explosionType == 2) ? -delta : delta;
            velocity += attractor(pos_prev.xyz, r_attractor_pos, pixel_color.r * d);
            velocity += attractor(pos_prev.xyz, g_attractor_pos, pixel_color.g * d);
            velocity += attractor(pos_prev.xyz, b_attractor_pos, pixel_color.b * d);

            // speed limit
            float speed_limit = 9.0;
            if (length(velocity) > speed_limit) {
                velocity = normalize(velocity) * speed_limit;
            }
        }
        pos_new = pos_prev.xyz + velocity;
    }

    // Write new position out
    gl_FragColor = vec4(pos_new, 1.0);
}