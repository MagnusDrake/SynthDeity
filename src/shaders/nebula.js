// Living Procedural Volumetric Nebula Sky Shader for SynthDeity: Loop Fabrication
// Real-Time 3D FBM Cosmic Dust, Twinkling Star Scintillation & Realm Color Morphing
import * as THREE from 'three';

export class LivingNebulaSky {
  constructor(radius = 3200) {
    this.radius = radius;
    this.geometry = new THREE.SphereGeometry(radius, 64, 48);

    this.uniforms = {
      uTime: { value: 0.0 },
      uColorCore: { value: new THREE.Color(0x38bdf8) }, // Vibrant Cyan/Amber
      uColorRim: { value: new THREE.Color(0x7c3aed) },  // Deep Purple
      uColorDust: { value: new THREE.Color(0x060814) }, // Cosmic Void Black
      uDensity: { value: 1.2 },
      uStarDensity: { value: 1.8 }
    };

    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
        varying vec3 vWorldPos;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vWorldPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColorCore;
        uniform vec3 uColorRim;
        uniform vec3 uColorDust;
        uniform float uDensity;
        uniform float uStarDensity;

        varying vec3 vWorldPos;
        varying vec2 vUv;

        // Hash & Noise
        float hash(vec3 p) {
          p = fract(p * 0.3183099 + 0.1);
          p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }

        // 3D Value Noise
        float noise(vec3 x) {
          vec3 i = floor(x);
          vec3 f = fract(x);
          f = f * f * (3.0 - 2.0 * f);

          return mix(mix(mix(hash(i + vec3(0.0, 0.0, 0.0)),
                             hash(i + vec3(1.0, 0.0, 0.0)), f.x),
                         mix(hash(i + vec3(0.0, 1.0, 0.0)),
                             hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
                     mix(mix(hash(i + vec3(0.0, 0.0, 1.0)),
                             hash(i + vec3(1.0, 0.0, 1.0)), f.x),
                         mix(hash(i + vec3(0.0, 1.0, 1.0)),
                             hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
        }

        // Multi-Octave Fractional Brownian Motion (FBM)
        float fbm(vec3 p) {
          float v = 0.0;
          float a = 0.52;
          vec3 shift = vec3(100.0);
          for (int i = 0; i < 4; ++i) {
            v += a * noise(p);
            p = p * 2.15 + shift;
            a *= 0.48;
          }
          return v;
        }

        void main() {
          vec3 dir = normalize(vWorldPos);

          // 1. Cosmic Turbulence coordinates evolving with time
          vec3 coord = dir * 3.8 + vec3(uTime * 0.008, uTime * 0.005, uTime * 0.006);
          float n1 = fbm(coord);
          float n2 = fbm(coord * 1.8 + vec3(n1 * 1.5));

          // 2. Multi-color nebula mixing
          float density = smoothstep(0.32, 0.85, n2) * uDensity;
          vec3 nebulaColor = mix(uColorDust, uColorRim, smoothstep(0.2, 0.6, n1));
          nebulaColor = mix(nebulaColor, uColorCore, smoothstep(0.48, 0.9, n2));

          // 3. Multi-layered twinkling stellar field
          vec3 starCoord = dir * 180.0;
          float sHash = hash(floor(starCoord));
          float star = 0.0;
          if (sHash > 0.985) {
            float twinkle = sin(uTime * (3.0 + fract(sHash * 10.0) * 8.0) + sHash * 6.28) * 0.5 + 0.5;
            float starDist = length(fract(starCoord) - 0.5);
            star = smoothstep(0.35, 0.02, starDist) * (0.6 + 0.7 * twinkle);
          }

          // Rare bright celestial supergiants
          vec3 superCoord = dir * 55.0;
          float superHash = hash(floor(superCoord));
          if (superHash > 0.996) {
            float twinkle2 = sin(uTime * 4.0 + superHash * 6.28) * 0.5 + 0.5;
            float superDist = length(fract(superCoord) - 0.5);
            star += smoothstep(0.4, 0.05, superDist) * (1.2 + 0.8 * twinkle2);
          }

          // Combine nebula gases with stellar field
          vec3 finalColor = nebulaColor + vec3(star * uStarDensity);

          // Horizon atmospheric falloff for grounding
          float horizonFade = smoothstep(-0.4, 0.3, dir.y);
          finalColor = mix(uColorDust * 0.8, finalColor, horizonFade);

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  update(delta, elapsed, cameraPos) {
    this.mesh.position.copy(cameraPos);
    this.mesh.rotation.y += delta * 0.004;
    this.uniforms.uTime.value = elapsed;
  }

  setRealmColors(coreHex, rimHex, dustHex) {
    this.uniforms.uColorCore.value.set(coreHex);
    this.uniforms.uColorRim.value.set(rimHex);
    this.uniforms.uColorDust.value.set(dustHex);
  }
}
