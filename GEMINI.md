# AGENTS.md — SynthDeity: Loop Fabrication Guidelines & Learnings

This repository contains **SynthDeity: Loop Fabrication**, a high-performance 3D browser-based game and virtual universe built using **Three.js**, **Vite**, **Tailwind CSS**, and **Web Audio API**.

---

## 🏛️ Core Architectural Axioms

### 1. 100% Procedural Philosophy (Zero External Asset Dependency)
- **Textures**: All materials (Gold-veined marble, cracked runic slate, crystal rock, cyber grids) are synthesized procedurally in memory via HTML5 2D Canvas and converted into `THREE.CanvasTexture`. Never introduce hard dependencies on external image files (`.png`, `.jpg`) that can fail to load or cause CORS/network issues.
- **Audio**: All sound effects and cosmic atmospheres are synthesized in real-time using native **Web Audio API** (`AudioContext`, oscillators, noise buffers, biquad filters, gain envelopes in `src/audio/synth.js`). Never require external `.mp3` or `.wav` files.

---

## ⚠️ Critical Pitfalls & Solutions Learned

### 1. Vector3 Coordinate Tweening & Preventing `NaN` Blackouts
- **The Bug**: Passing string keys (e.g. `'matrix'`) instead of Vector3 objects `{x, y, z}` to GSAP or tween functions causes `pos.x` to evaluate to `undefined` and `y` to become `NaN`. In Three.js, `NaN` in a position or matrix corrupts the projection matrix and renders the canvas completely black without throwing an explicit WebGL error.
- **The Rule**: Always defensively resolve coordinate inputs before tweening or assigning positions:
  ```javascript
  let targetPos = destination;
  if (!targetPos || typeof targetPos.x !== 'number') {
    targetPos = this.subRealmOrigins[destination] || DEFAULT_COORDS;
  }
  ```

### 2. Multi-Realm Spatial Architecture & Camera Scaling
- **Sub-Realm Coordinates**: Sub-realms reside at high-altitude offsets (e.g., `(±1200, 300, ±1200)`).
- **Camera Frustum**: `camera.far` must be set to at least `4000` (not `1200`), and `FogExp2` must be kept low (`0.0006`) to avoid distant realm geometry getting clipped into fog or the far plane.
- **SkyDome Tracking**: The cosmic background sphere (`skyDome`) must follow the camera position every frame:
  ```javascript
  if (this.skyDome) {
    this.skyDome.position.copy(this.camera.position);
    this.skyDome.rotation.y += delta * 0.003;
  }
  ```
  Failing to do this causes the player to exit the inside of the sky sphere, rendering empty darkness.

### 3. Local Illumination for Distant Realms
- Directional sun lights centered at the Citadel with limited shadow frustums (e.g., 140m) will NOT light objects at `x: 1200, z: 1200`.
- **The Rule**: Every sub-realm or distant archipelago must instantiate dedicated local `PointLight` and directional ambient fill matching its thematic color palette.

### 4. Elevation Query Contract (`getFloorHeight`)
- `player.js` queries `this.citadel.getFloorHeight(x, z)` and `this.expanse.getFloorHeight(x, z)` every frame.
- **The Rule**: Any world module containing walkable surfaces must implement `getFloorHeight(x, z)`:
  - Return `number` (elevation) if player is within the bounding radius of any registered landmass/platform.
  - Return `null` if the player is in open air (allowing gravity/flight to take over).

### 5. Ley-Line Bridge Collision (Point-to-Segment Projection)
- To avoid platform overlap visual glitches when connecting separated floating landmasses, use luminous energy bridges and calculate elevation via orthogonal 2D point-to-segment projection math:
  ```javascript
  const vX = b.endX - b.startX;
  const vZ = b.endZ - b.startZ;
  const lenSq = vX * vX + vZ * vZ;
  let t = ((x - b.startX) * vX + (z - b.startZ) * vZ) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = b.startX + t * vX;
  const projZ = b.startZ + t * vZ;
  const distSq = (x - projX) * (x - projX) + (z - projZ) * (z - projZ);
  if (distSq <= (b.width / 2) * (b.width / 2)) {
    return b.startY + t * (b.endY - b.startY) + 0.3;
  }
  ```

### 6. Cinematic Warp Arrival & Camera Framing
- When warping a player to a landmark, never spawn them at the exact center coordinates if an entity (e.g. monolith, singularity, archon spire) occupies that position.
- Offset the spawn position back by `+14` to `+18` units on the Z axis, and orient the camera forward (`cameraYaw = 0`, `cameraPitch = 0.25`, `cameraDistance = 10`) so the player immediately enjoys a cinematic establishing shot.

### 7. Shader Mathematical Invariants & Preventing GPU Tile `NaN` Blackouts
- **The Bug**: Calling `pow(x, y)` when `x < 0.0` in GLSL evaluates to `NaN`. When an animated wave/procedural function (like Voronoi water or light shafts) produces an unclamped negative value, a single pixel turns to `NaN`. In multi-mip post-processing passes like `UnrealBloomPass`, Gaussian blur spreads that single `NaN` across entire blur kernels, manifesting as flickering black rectangular screen boxes that come and go with animation time.
- **The Rule**: Never call `pow()`, `sqrt()`, `acos()`, or divide without defensively clamping inputs:
  ```glsl
  float caustic = pow(clamp(1.0 - (c1 * 0.6 + c2 * 0.4), 0.0, 1.0), 2.2);
  color.r = pow(clamp(color.r, 0.0001, 1.0), 0.96);
  ```
  Ensure all transparent `PointsMaterial` instances set `depthWrite: false` to avoid depth-buffer occlusion square artifacts.

---

## 🎮 Narrative & Progression Loop (Three-Act Odyssey)
1. **Act I: Divine Ascension**
   - 4 Citadel Sanctuaries: Genesis Monolith, Vault of Creations, Spire of Omnipotence, Celestial Beacon.
   - Culmination: Apotheosis Awakening at the Central Crucible.
2. **Act II: The Archon Awakening**
   - 4 Precursor Archons & Endgame Trials:
     - Valdor (Titan Shelf) -> Smite Void Rifts -> Unlock ☄️ *Meteor Tremor*.
     - Lyra (Crystal Crags) -> Flight Slalom -> Unlock 🔮 *Graviton Pulse*.
     - Chronos (Cloud Spires) -> Temporal Alignment (`T`) -> Unlock ⚡ *Astral Dash*.
     - Moros (Abyssal Cascades) -> Gravitational Containment -> Unlock 🌌 *Singularity Vortex*.
3. **Act III: Galactic Sovereignty**
   - Luminous Ley-Line Bifrost bridges ignite, connecting the Citadel to all 4 corners.
   - 4 Dimensional Stargates unlock transit to the outer sub-realms (*The Cyber Matrix*, *The Asteroid Nebula*, *The Chronal Atrium*, *The Event Horizon*).
