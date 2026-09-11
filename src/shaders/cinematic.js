// Deluxe Cinematic Post-Processing Shader: Volumetric God Rays, ACES Color Grading,
// Anamorphic Lens Streaks, Radial Chromatic Aberration, Optical Vignette & Organic 35mm Film Grain
import * as THREE from 'three';

export const CinematicShader = {
  name: 'CinematicShader',
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0.0 },
    uVignetteStrength: { value: 0.36 },
    uGrainStrength: { value: 0.038 },
    uAberrationStrength: { value: 0.0032 },
    uStreakStrength: { value: 0.22 },
    uContrast: { value: 1.08 },
    uAspect: { value: 1.0 },

    // Volumetric Crepuscular Rays (God Rays)
    uLightScreenPos: { value: new THREE.Vector2(0.5, 0.5) },
    uLightInView: { value: 0.0 }, // 1.0 if in front of camera, 0.0 if behind
    uLightColor: { value: new THREE.Color(0xffeedd) },
    uGodRaysExposure: { value: 0.20 },
    uGodRaysDecay: { value: 0.94 },
    uGodRaysDensity: { value: 0.82 },
    uGodRaysWeight: { value: 0.35 }
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
    uniform float uStreakStrength;
    uniform float uContrast;
    uniform float uAspect;

    uniform vec2 uLightScreenPos;
    uniform float uLightInView;
    uniform vec3 uLightColor;
    uniform float uGodRaysExposure;
    uniform float uGodRaysDecay;
    uniform float uGodRaysDensity;
    uniform float uGodRaysWeight;

    varying vec2 vUv;

    // Fast organic pseudo-random noise for 35mm film grain
    float random(vec2 p) {
      vec2 k1 = vec2(23.14069263277926, 2.665144142690225);
      return fract(cos(dot(p, k1)) * 12345.6789);
    }

    // Narkowicz ACES Filmic Tone Mapping approximation
    vec3 ACESFilm(vec3 x) {
      float a = 2.51;
      float b = 0.03;
      float c = 2.43;
      float d = 0.59;
      float e = 0.14;
      return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
    }

    const int NUM_RAY_SAMPLES = 28;

    void main() {
      vec2 center = vec2(0.5, 0.5);
      vec2 uvOffset = vUv - center;
      float dist = length(uvOffset);

      // 1. Radial Chromatic Aberration (color fringing at lens periphery)
      vec2 redUv  = center + uvOffset * (1.0 + uAberrationStrength * dist * 2.0);
      vec2 blueUv = center + uvOffset * (1.0 - uAberrationStrength * dist * 2.0);

      float r = texture2D(tDiffuse, redUv).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, blueUv).b;
      vec3 color = vec3(r, g, b);

      // 2. Volumetric Crepuscular God Rays (Screen-Space Radial Raymarch)
      if (uLightInView > 0.01) {
        vec2 deltaCoord = (vUv - uLightScreenPos) * (1.0 / float(NUM_RAY_SAMPLES)) * uGodRaysDensity;
        vec2 marchUv = vUv;
        float decay = 1.0;
        vec3 rayAccum = vec3(0.0);

        for (int i = 0; i < NUM_RAY_SAMPLES; i++) {
          marchUv -= deltaCoord;
          vec2 clampedUv = clamp(marchUv, 0.0, 1.0);
          vec3 s = texture2D(tDiffuse, clampedUv).rgb;
          float lum = dot(s, vec3(0.299, 0.587, 0.114));
          vec3 bright = s * smoothstep(0.48, 1.0, lum);

          // Boundary mask: strictly 0 if outside [0, 1]
          float inBounds = step(0.0, marchUv.x) * step(marchUv.x, 1.0) * step(0.0, marchUv.y) * step(marchUv.y, 1.0);
          rayAccum += bright * decay * uGodRaysWeight * inBounds;
          decay *= uGodRaysDecay;
        }

        vec3 rays = rayAccum * uGodRaysExposure * uLightColor * uLightInView;
        // Screen blend rays with base image
        color = 1.0 - (1.0 - color) * (1.0 - rays);
      }

      // 3. Horizontal Anamorphic Lens Flare Streaks on High-Luminance Highlights
      vec3 streak = vec3(0.0);
      float streakWidth = 0.035;
      for (int i = -3; i <= 3; i++) {
        if (i == 0) continue;
        float offset = float(i) * (streakWidth / 3.0);
        vec3 sSample = texture2D(tDiffuse, clamp(vUv + vec2(offset, 0.0), 0.0, 1.0)).rgb;
        float lum = dot(sSample, vec3(0.299, 0.587, 0.114));
        if (lum > 0.82) {
          streak += sSample * (1.0 - abs(float(i)) / 4.0);
        }
      }
      color += streak * uStreakStrength * vec3(0.4, 0.8, 1.2); // Celestial cyan/gold streak tint

      // 4. Cinematic Color Grading (Rich Cosmic Shadows & Warm Highlights)
      // Shadow split-toning: cool midnight indigo in the dark recesses
      vec3 shadowTint = vec3(0.02, 0.03, 0.06);
      color = mix(color, color + shadowTint, (1.0 - smoothstep(0.0, 0.45, color)));

      // Warm divine radiance in the mid-highlights
      color.r = pow(color.r, 0.96);
      color.g = pow(color.g, 0.98);

      // Contrast S-Curve
      color = (color - 0.5) * uContrast + 0.5;
      color = clamp(color, 0.0, 1.0);

      // ACES Filmic Curve
      color = ACESFilm(color);

      // 5. Optical Lens Vignette
      float vignette = 1.0 - smoothstep(0.42, 0.96, dist) * uVignetteStrength;
      color *= vignette;

      // 6. 35mm Organic Film Grain
      float grain = (random(vUv * 600.0 + fract(uTime * 19.0)) - 0.5) * uGrainStrength;
      color += vec3(grain);

      gl_FragColor = vec4(color, 1.0);
    }
  `
};
