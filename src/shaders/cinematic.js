// Cinematic Post-Processing Shader: Vignette, Film Grain & Radial Chromatic Aberration
import * as THREE from 'three';

export const CinematicShader = {
  name: 'CinematicShader',
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0.0 },
    uVignetteStrength: { value: 0.38 },
    uGrainStrength: { value: 0.045 },
    uAberrationStrength: { value: 0.0035 },
    uAspect: { value: 1.0 }
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uVignetteStrength;
    uniform float uGrainStrength;
    uniform float uAberrationStrength;
    uniform float uAspect;

    varying vec2 vUv;

    // Pseudo-random noise for 35mm organic film grain
    float random(vec2 p) {
      vec2 k1 = vec2(
        23.14069263277926, // e^pi (Gelfond's constant)
        2.665144142690225  // 2^sqrt(2) (Gelfond-Schneider constant)
      );
      return fract(cos(dot(p, k1)) * 12345.6789);
    }

    void main() {
      vec2 center = vec2(0.5, 0.5);
      vec2 uvOffset = vUv - center;
      float dist = length(uvOffset);

      // 1. Radial Chromatic Aberration (color fringing at lens periphery)
      vec2 redUv = center + uvOffset * (1.0 + uAberrationStrength * dist * 2.0);
      vec2 blueUv = center + uvOffset * (1.0 - uAberrationStrength * dist * 2.0);

      float r = texture2D(tDiffuse, redUv).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, blueUv).b;
      vec3 color = vec3(r, g, b);

      // 2. Optical Lens Vignette
      float vignette = 1.0 - smoothstep(0.4, 0.95, dist) * uVignetteStrength;
      color *= vignette;

      // 3. Organic Film Grain
      float grain = (random(vUv * 500.0 + fract(uTime * 17.0)) - 0.5) * uGrainStrength;
      color += vec3(grain);

      gl_FragColor = vec4(color, 1.0);
    }
  `
};
