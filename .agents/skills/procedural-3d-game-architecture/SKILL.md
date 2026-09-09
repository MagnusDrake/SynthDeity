---
name: procedural-3d-game-architecture
description: Comprehensive playbook for building, debugging, and optimizing asset-free procedural 3D virtual worlds with Three.js, Web Audio synthesis, and multi-realm space partitioning.
---

# Procedural 3D Game Architecture & Troubleshooting Playbook

This skill encapsulates the battle-tested engineering solutions, mathematical formulas, and debugging recipes developed for **SynthDeity: Loop Fabrication**.

---

## 1. Zero-Asset Procedural Material Pipeline

Avoid relying on static image assets that may cause CORS blocks, 404s, or high bandwidth usage. Generate high-resolution PBR textures in memory using HTML5 2D Canvas:

```javascript
export function generateProceduralTexture(width, height, drawFn) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  drawFn(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}
```

### Recipes:
- **Veined Marble**: Noise-jittered bezier curves layered across a subtle linear gradient with slight Gaussian glow.
- **Cracked Runic Slate**: Dark charcoal background (`#18181b`) overlaid with concentric rune circles, glyph markings, and fracture lines with glowing cyan or purple stroke shadows.
- **Crystal Rock**: Voronoi / Delaunay-like crystal facet noise tinted in deep purple (`#581c87`) with high specular highlight.

---

## 2. Real-Time Native Web Audio Synthesis

Synthesize all game sound effects using native Web Audio primitives (`OscillatorNode`, `BiquadFilterNode`, `GainNode`, and procedural noise buffers):

```javascript
// Example: Graviton / Inward Suction Shockwave
export function playGravitonPulse(ctx) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sawtooth';
  // Pitch sweep downwards
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.5);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, now);
  filter.frequency.exponentialRampToValueAtTime(120, now + 0.5);

  gain.gain.setValueAtTime(0.01, now);
  gain.gain.linearRampToValueAtTime(0.4, now + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.65);
}
```

---

## 3. Spatial Partitioning & Sub-Realm Warp

When creating multiple open-world dimensions or sub-realms in a single Three.js scene:
1. **Coordinate Offsets**:
   - Place sub-realms far enough apart (`distance >= 1500m`) so their geometry and local light sources do not overlap or bleed into one another.
2. **Camera Far Plane**:
   - Keep `camera.far` high (`4000+`) and `FogExp2` density low (`0.0006`).
3. **Dynamic SkyDome Tracking**:
   - The sky sphere must follow the camera: `skyDome.position.copy(camera.position)` every frame so the camera never traverses outside the sky geometry.
4. **Local Lighting Rig**:
   - Add local point lights (`PointLight(color, intensity, distance)`) inside each sub-realm. Main directional suns with limited shadow frustums will not illuminate distant areas.

---

## 4. Ground Elevation & Collision Contracts

Every landmass or bridge system must implement an elevation query function:

```javascript
getFloorHeight(x, z) {
  // 1. Check landmass platforms
  for (const lm of this.landmasses) {
    const dx = x - lm.x;
    const dz = z - lm.z;
    if (dx * dx + dz * dz <= lm.radius * lm.radius) {
      return lm.topY;
    }
  }
  // 2. Check linear bridges using orthogonal point-to-segment projection
  for (const b of this.bridges) {
    const vX = b.endX - b.startX;
    const vZ = b.endZ - b.startZ;
    const lenSq = vX * vX + vZ * vZ;
    let t = ((x - b.startX) * vX + (z - b.startZ) * vZ) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const projX = b.startX + t * vX;
    const projZ = b.startZ + t * vZ;
    const dSq = (x - projX) * (x - projX) + (z - projZ) * (z - projZ);
    if (dSq <= (b.width / 2) * (b.width / 2)) {
      return b.startY + t * (b.endY - b.startY) + 0.3;
    }
  }
  return null;
}
```

---

## 5. Debugging Checklist for WebGL / Three.js Black Screen

If the screen turns pitch black after an interaction:
1. **Check for `NaN` coordinates**:
   - Ensure destination variables are `{ x, y, z }` numbers, not string keys.
2. **Check for unhandled exceptions in the render loop**:
   - Missing methods like `getFloorHeight` halt requestAnimationFrame.
3. **Check camera position relative to `skyDome`**:
   - If camera is outside the sky dome, only black is rendered.
4. **Check lighting**:
   - Meshes using `MeshStandardMaterial` without nearby lights render black.
