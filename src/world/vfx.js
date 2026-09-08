// Celestial Visual Effects (VFX) System for AETHELGARD
import * as THREE from 'three';

export class CelestialVFX {
  constructor(scene) {
    this.scene = scene;
    this.activeEffects = [];
    this.initAmbientMotes();
  }

  // Floating ambient stardust motes around the pantheon
  initAmbientMotes() {
    const count = 300;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    this.moteVelocities = [];

    const col1 = new THREE.Color(0xffd700);
    const col2 = new THREE.Color(0x38bdf8);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 140;
      positions[i * 3 + 1] = Math.random() * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 140;

      const c = col1.clone().lerp(col2, Math.random());
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      this.moteVelocities.push({
        vx: (Math.random() - 0.5) * 0.4,
        vy: Math.random() * 0.5 + 0.2,
        vz: (Math.random() - 0.5) * 0.4
      });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.motes = new THREE.Points(geo, mat);
    this.scene.add(this.motes);
  }

  // Cast Divine Smite: Vertical lightning bolt from heaven + shockwave ring + spark burst
  triggerDivineSmite(targetPos) {
    const originY = 70;
    const endPos = targetPos.clone();
    endPos.y = 0.1;

    // 1. Procedural Zigzag Lightning Bolt
    const segments = 16;
    const points = [];
    points.push(new THREE.Vector3(endPos.x, originY, endPos.z));

    for (let i = 1; i < segments; i++) {
      const progress = i / segments;
      const y = originY - progress * (originY - endPos.y);
      const jitter = (1 - progress) * 3.5;
      const x = endPos.x + (Math.random() - 0.5) * jitter;
      const z = endPos.z + (Math.random() - 0.5) * jitter;
      points.push(new THREE.Vector3(x, y, z));
    }
    points.push(endPos);

    const boltGeo = new THREE.BufferGeometry().setFromPoints(points);
    const boltMat = new THREE.LineBasicMaterial({
      color: 0xffea75,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });
    const boltLine = new THREE.Line(boltGeo, boltMat);
    this.scene.add(boltLine);

    // Flashing point light
    const flashLight = new THREE.PointLight(0xfff0b3, 15, 35);
    flashLight.position.set(endPos.x, endPos.y + 2, endPos.z);
    this.scene.add(flashLight);

    // 2. Expanding Celestial Shockwave Ring
    const ringGeo = new THREE.RingGeometry(0.5, 1.2, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const shockwave = new THREE.Mesh(ringGeo, ringMat);
    shockwave.position.copy(endPos);
    this.scene.add(shockwave);

    // 3. Spark explosion particles
    const sparkCount = 60;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(sparkCount * 3);
    const sparkVels = [];

    for (let i = 0; i < sparkCount; i++) {
      sparkPos[i * 3] = endPos.x;
      sparkPos[i * 3 + 1] = endPos.y + 0.5;
      sparkPos[i * 3 + 2] = endPos.z;

      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 14 + 5;
      const up = Math.random() * 12 + 3;
      sparkVels.push(new THREE.Vector3(Math.cos(angle) * speed, up, Math.sin(angle) * speed));
    }

    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0xffea75,
      size: 0.5,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending
    });
    const sparks = new THREE.Points(sparkGeo, sparkMat);
    this.scene.add(sparks);

    // Track active effect lifetime
    const fxObj = {
      age: 0,
      maxAge: 1.2,
      update: (delta) => {
        // Fade out lightning rapidly
        if (boltLine) {
          boltMat.opacity = Math.max(0, 1 - fxObj.age * 5);
          if (fxObj.age > 0.25 && boltLine.parent) {
            this.scene.remove(boltLine);
            boltGeo.dispose();
            boltMat.dispose();
          }
        }

        // Fade flash light
        flashLight.intensity = Math.max(0, 15 * (1 - fxObj.age * 3));
        if (fxObj.age > 0.4 && flashLight.parent) {
          this.scene.remove(flashLight);
        }

        // Expand shockwave
        const ringScale = 1 + fxObj.age * 22;
        shockwave.scale.set(ringScale, ringScale, ringScale);
        ringMat.opacity = Math.max(0, 1 - fxObj.age / 0.8);

        // Update sparks
        const posArr = sparkGeo.attributes.position.array;
        for (let i = 0; i < sparkCount; i++) {
          const v = sparkVels[i];
          v.y -= 25 * delta; // Gravity
          posArr[i * 3] += v.x * delta;
          posArr[i * 3 + 1] += v.y * delta;
          posArr[i * 3 + 2] += v.z * delta;
        }
        sparkGeo.attributes.position.needsUpdate = true;
        sparkMat.opacity = Math.max(0, 1 - fxObj.age / 1.0);
      },
      cleanup: () => {
        if (boltLine && boltLine.parent) {
          this.scene.remove(boltLine);
          boltGeo.dispose();
          boltMat.dispose();
        }
        if (flashLight && flashLight.parent) {
          this.scene.remove(flashLight);
        }
        this.scene.remove(shockwave);
        ringGeo.dispose();
        ringMat.dispose();

        this.scene.remove(sparks);
        sparkGeo.dispose();
        sparkMat.dispose();
      }
    };
    this.activeEffects.push(fxObj);
  }

  // Trigger cosmic fireworks burst on apotheosis / full attunement
  triggerApotheosisCelebration() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const offsetAngle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 30 + 10;
        const target = new THREE.Vector3(
          Math.cos(offsetAngle) * radius,
          0,
          Math.sin(offsetAngle) * radius
        );
        this.triggerDivineSmite(target);
      }, i * 280);
    }
  }

  update(delta) {
    // 1. Animate ambient stardust motes
    if (this.motes) {
      const pos = this.motes.geometry.attributes.position.array;
      const count = pos.length / 3;

      for (let i = 0; i < count; i++) {
        const vel = this.moteVelocities[i];
        pos[i * 3] += vel.vx * delta;
        pos[i * 3 + 1] += vel.vy * delta;
        pos[i * 3 + 2] += vel.vz * delta;

        // Wrap around boundary
        if (pos[i * 3 + 1] > 25) {
          pos[i * 3 + 1] = 0;
        }
      }
      this.motes.geometry.attributes.position.needsUpdate = true;
    }

    // 2. Update active dynamic effects
    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const fx = this.activeEffects[i];
      fx.age += delta;
      fx.update(delta);

      if (fx.age >= fx.maxAge) {
        if (fx.cleanup) fx.cleanup();
        this.activeEffects.splice(i, 1);
      }
    }
  }
}
