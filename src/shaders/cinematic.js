// Deluxe Cinematic Post-Processing Shader: Volumetric God Rays, ACES Color Grading,
// Micro-Contrast Detail Enhancer, Anamorphic Lens Streaks, Optical Vignette & Organic 35mm Film Grain
import * as THREE from 'three';

export const CinematicShader = {
  name: 'CinematicShader',
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0.0 },
    uVignetteStrength: { value: 0.32 },
    uGrainStrength: { value: 0.008 },      // Subtle, clean film grain without noisy blur
    uAberrationStrength: { value: 0.0004 },// Micro-shift lens realism without purple fringing
    uStreakStrength: { value: 0.12 },
    uContrast: { value: 1.15 },            // Punchy, crisp dynamic range
    uAspect: { value: 1.0 },

    // Volumetric Crepuscular Rays (God Rays)
    uLightScreenPos: { value: new THREE.Vector2(0.5, 0.5) },
    uLightInView: { value: 0.0 }, // 1.0 if in front of camera, 0.0 if behind
    uLightColor: { value: new THREE.Color(0xffeedd) },
    uGodRaysExposure: { value: 0.16 },
    uGodRaysDecay: { value: 0.94 },
    uGodRaysDensity: { value: 0.80 },
    uGodRaysWeight: { value: 0.30 }
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

    // Fast, stable GLSL hash for organic 35mm grain without numerical overflow
    float random(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    // Narkowicz ACES Filmic Tone Mapping approximation (guaranteed non-negative input)
    vec3 ACESFilm(vec3 x) {
      x = max(vec3(0.0), x);
      float a = 2.51;
      float b = 0.03;
      float c = 2.43;
      float d = 0.59;
      float e = 0.14;
      return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
    }

    // Optimized sample count for 60-120 FPS high-performance raymarching
    const int NUM_RAY_SAMPLES = 12;

    void main() {
      vec2 center = vec2(0.5, 0.5);
      vec2 uvOffset = vUv - center;
      float dist = length(uvOffset);

      // 1. Subtle, Clean Lens Optics (Sub-pixel chromatic dispersion without purple edge fringing)
      vec2 redUv  = clamp(center + uvOffset * (1.0 + uAberrationStrength * dist * 1.5), 0.0, 1.0);
      vec2 blueUv = clamp(center + uvOffset * (1.0 - uAberrationStrength * dist * 1.5), 0.0, 1.0);

      float r = texture2D(tDiffuse, redUv).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, blueUv).b;
      vec3 color = clamp(vec3(r, g, b), 0.0, 16.0);

      // 2. Micro-Contrast & Detail Enhancer (Unsharp Mask for Razor-Sharp Textures & Edges)
      vec2 px = vec2(0.65 / (uAspect * 1080.0), 0.65 / 1080.0);
      vec3 blur = (
        texture2D(tDiffuse, clamp(vUv + vec2(px.x, 0.0), 0.0, 1.0)).rgb +
        texture2D(tDiffuse, clamp(vUv - vec2(px.x, 0.0), 0.0, 1.0)).rgb +
        texture2D(tDiffuse, clamp(vUv + vec2(0.0, px.y), 0.0, 1.0)).rgb +
        texture2D(tDiffuse, clamp(vUv - vec2(0.0, px.y), 0.0, 1.0)).rgb
      ) * 0.25;
      color = clamp(color + (color - blur) * 0.40, 0.0, 16.0);

      // 3. Volumetric Crepuscular God Rays (Optimized High-Performance Radial Raymarch)
      if (uLightInView > 0.01) {
        vec2 deltaCoord = (vUv - uLightScreenPos) * (1.0 / float(NUM_RAY_SAMPLES)) * uGodRaysDensity;
        vec2 marchUv = vUv;
        float decay = 1.0;
        vec3 rayAccum = vec3(0.0);

        for (int i = 0; i < NUM_RAY_SAMPLES; i++) {
          marchUv -= deltaCoord;
          vec2 clampedUv = clamp(marchUv, 0.0, 1.0);
          vec3 s = clamp(texture2D(tDiffuse, clampedUv).rgb, 0.0, 8.0);
          float lum = dot(s, vec3(0.299, 0.587, 0.114));
          vec3 bright = s * smoothstep(0.52, 1.0, lum);

          float inBounds = step(0.0, marchUv.x) * step(marchUv.x, 1.0) * step(0.0, marchUv.y) * step(marchUv.y, 1.0);
          rayAccum += bright * decay * uGodRaysWeight * inBounds;
          decay *= uGodRaysDecay;
        }

        vec3 rays = rayAccum * uGodRaysExposure * uLightColor * uLightInView;
        color += clamp(rays, 0.0, 3.0);
      }

      // 4. Warm Anamorphic Lens Flare Streaks on Specular Highlights
      vec3 streak = vec3(0.0);
      float streakWidth = 0.032;
      for (int i = -2; i <= 2; i++) {
        if (i == 0) continue;
        float offset = float(i) * (streakWidth / 2.0);
        vec3 sSample = clamp(texture2D(tDiffuse, clamp(vUv + vec2(offset, 0.0), 0.0, 1.0)).rgb, 0.0, 8.0);
        float lum = dot(sSample, vec3(0.299, 0.587, 0.114));
        if (lum > 0.88) {
          streak += sSample * (1.0 - abs(float(i)) / 3.0);
        }
      }
      color += clamp(streak * uStreakStrength * vec3(1.08, 1.0, 0.82), 0.0, 1.5); // Warm celestial starlight tint

      // 5. Cinematic Color Grading (Rich Cosmic Contrast, Neutral Pure Shadows)
      vec3 shadowTint = vec3(0.004, 0.006, 0.009); // Neutral deep obsidian, zero purple cast
      color = mix(color, color + shadowTint, (1.0 - smoothstep(0.0, 0.40, clamp(color, 0.0, 1.0))));

      // Mid-highlights: safe clamp strictly above 0 to prevent any negative pow NaN
      vec3 safeColor = clamp(color, 0.0001, 1.0);
      color.r = mix(color.r, pow(safeColor.r, 0.96), step(color.r, 1.0));
      color.g = mix(color.g, pow(safeColor.g, 0.98), step(color.g, 1.0));

      // Contrast S-Curve for crisp, non-washed-out visuals
      color = (color - 0.5) * uContrast + 0.5;
      color = clamp(color, 0.0, 1.0);

      // Single definitive ACES Filmic Tone Mapping curve
      color = ACESFilm(color);

      // 6. Optical Lens Vignette
      float vignette = 1.0 - smoothstep(0.48, 0.98, dist) * uVignetteStrength;
      color *= clamp(vignette, 0.0, 1.0);

      // 7. Subtle 35mm Organic Film Texture
      float grain = (random(vUv * 600.0 + fract(uTime * 19.0)) - 0.5) * uGrainStrength;
      color += vec3(grain);

      gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
    }
  `
};
