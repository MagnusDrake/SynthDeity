// Astral Liquid Ether Reflecting Pool & Caustics Shader for SynthDeity: Loop Fabrication
// 100% Procedural Water & Celestial Caustic Waves
import * as THREE from 'three';

export class AstralEtherPool {
  constructor(radius = 16, ringWidth = 0) {
    this.radius = radius;

    this.geometry = ringWidth > 0 
      ? new THREE.RingGeometry(radius - ringWidth, radius, 48)
      : new THREE.CircleGeometry(radius, 48);

    this.geometry.rotateX(-Math.PI / 2);

    this.uniforms = {
      uTime: { value: 0.0 },
      uDeepColor: { value: new THREE.Color(0x0c1e3d) },    // Deep Celestial Indigo
      uShallowColor: { value: new THREE.Color(0x38bdf8) }, // Radiant Cyan Ether
      uCausticColor: { value: new THREE.Color(0xfef08a) }, // Golden Starlight Caustics
      uOpacity: { value: 0.88 }
    };

    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPos;

        void main() {
          vUv = uv;
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uDeepColor;
        uniform vec3 uShallowColor;
        uniform vec3 uCausticColor;
        uniform float uOpacity;

        varying vec2 vUv;
        varying vec3 vWorldPos;

        // Hash & Voronoi Caustics
        vec2 hash2(vec2 p) {
          return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
        }

        float voronoi(vec2 x) {
          vec2 n = floor(x);
          vec2 f = fract(x);
          float m = 8.0;
          for (int j = -1; j <= 1; j++) {
            for (int i = -1; i <= 1; i++) {
              vec2 g = vec2(float(i), float(j));
              vec2 o = hash2(n + g);
              vec2 r = g - f + (0.5 + 0.5 * sin(uTime * 1.5 + 6.2831 * o));
              float d = dot(r, r);
              if (d < m) m = d;
            }
          }
          return sqrt(max(0.0, m));
        }

        void main() {
          vec2 uv = (vUv - 0.5) * 2.0;
          float dist = length(uv);

          // 1. Dual-scale scrolling caustics
          vec2 uv1 = vWorldPos.xz * 0.18 + vec2(uTime * 0.04, uTime * 0.03);
          vec2 uv2 = vWorldPos.xz * 0.26 - vec2(uTime * 0.03, uTime * 0.05);

          float c1 = voronoi(uv1 * 4.0);
          float c2 = voronoi(uv2 * 6.0);
          float causticRaw = clamp(1.0 - (c1 * 0.6 + c2 * 0.4), 0.0, 1.0);
          float caustic = pow(causticRaw, 2.2);

          // 2. Liquid gradient mixing
          vec3 water = mix(uDeepColor, uShallowColor, smoothstep(0.0, 0.9, dist));
          water += uCausticColor * caustic * 0.75;

          // 3. Shimmering star-flecks (safely clamped)
          float sparkle = pow(clamp((c1 - 0.45) * 1.6, 0.0, 1.0), 6.0) * 1.2;
          water += vec3(sparkle);

          // 4. Soft edge attenuation & rim foam
          float edgeAlpha = smoothstep(0.98, 0.78, dist);
          float foam = smoothstep(0.85, 0.95, dist) * caustic * 0.4;
          water += vec3(foam);

          gl_FragColor = vec4(clamp(water, 0.0, 4.0), clamp(edgeAlpha * uOpacity, 0.0, 1.0));
        }
      `
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  update(delta, elapsed) {
    this.uniforms.uTime.value = elapsed;
  }
}
