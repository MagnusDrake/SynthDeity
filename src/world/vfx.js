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
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const offsetAngle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 35 + 10;
        const target = new THREE.Vector3(
          Math.cos(offsetAngle) * radius,
          0,
          Math.sin(offsetAngle) * radius
        );
        this.triggerDivineSmite(target);
      }, i * 220);
    }
  }

  // Vertical attunement beam and harmonic expanding rings
  triggerAttunementBeam(pos) {
    const beamGeo = new THREE.CylinderGeometry(0.8, 2.5, 80, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(pos.x, pos.y + 40, pos.z);
    this.scene.add(beam);

    const ringGeo = new THREE.RingGeometry(1, 2, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(pos).setY(pos.y + 0.5);
    this.scene.add(ring);

    const fxObj = {
      age: 0,
      maxAge: 1.8,
      update: (delta) => {
        fxObj.age += delta;
        const progress = fxObj.age / fxObj.maxAge;
        beamMat.opacity = Math.max(0, 0.8 * (1 - progress));
        const rScale = 1 + progress * 14;
        ring.scale.set(rScale, rScale, rScale);
        ringMat.opacity = Math.max(0, 0.9 * (1 - progress));
      },
      cleanup: () => {
        this.scene.remove(beam);
        beamGeo.dispose();
        beamMat.dispose();
        this.scene.remove(ring);
        ringGeo.dispose();
        ringMat.dispose();
      }
    };
    this.activeEffects.push(fxObj);
  }

  // 1. Meteor Tremor VFX: Raining blazing meteors + radial seismic shockwaves
  triggerMeteorTremor(targetPos) {
    const meteorCount = 4;
    for (let m = 0; m < meteorCount; m++) {
      setTimeout(() => {
        const dropOffset = new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          0,
          (Math.random() - 0.5) * 8
        );
        const impactPos = targetPos.clone().add(dropOffset);
        const startPos = impactPos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 15, 65, (Math.random() - 0.5) * 15));

        // Blazing meteor core
        const coreGeo = new THREE.DodecahedronGeometry(1.2, 1);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xff4500 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.copy(startPos);
        this.scene.add(core);

        // Meteor trail
        const trailGeo = new THREE.CylinderGeometry(0.2, 1.4, 16, 8);
        trailGeo.rotateX(Math.PI / 2);
        const trailMat = new THREE.MeshBasicMaterial({
          color: 0xffaa00,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending
        });
        const trail = new THREE.Mesh(trailGeo, trailMat);
        core.add(trail);
        trail.position.z = 8;

        const duration = 0.45;
        let elapsed = 0;

        const animObj = {
          age: 0,
          maxAge: 2.2,
          update: (delta) => {
            elapsed += delta;
            const progress = Math.min(1, elapsed / duration);
            core.position.lerpVectors(startPos, impactPos, progress);

            if (progress >= 1 && core.visible) {
              core.visible = false;
              // Detonate on ground
              this.createGroundExplosion(impactPos, 0xff4500, 18);
            }
          },
          cleanup: () => {
            this.scene.remove(core);
            coreGeo.dispose();
            coreMat.dispose();
            trailGeo.dispose();
            trailMat.dispose();
          }
        };
        this.activeEffects.push(animObj);
      }, m * 100);
    }
  }

  createGroundExplosion(pos, colorHex, radius) {
    // Expanding ring shockwave
    const ringGeo = new THREE.RingGeometry(0.5, 2.0, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const shock = new THREE.Mesh(ringGeo, ringMat);
    shock.position.copy(pos).setY(0.15);
    this.scene.add(shock);

    // Blast light
    const light = new THREE.PointLight(colorHex, 18, 35);
    light.position.copy(pos).setY(2);
    this.scene.add(light);

    // Particle debris
    const count = 40;
    const geo = new THREE.BufferGeometry();
    const pArr = new Float32Array(count * 3);
    const vels = [];
    for (let i = 0; i < count; i++) {
      pArr[i * 3] = pos.x;
      pArr[i * 3 + 1] = pos.y + 0.3;
      pArr[i * 3 + 2] = pos.z;
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 12 + 4;
      vels.push(new THREE.Vector3(Math.cos(angle) * spd, Math.random() * 14 + 4, Math.sin(angle) * spd));
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffe066,
      size: 0.6,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending
    });
    const pts = new THREE.Points(geo, mat);
    this.scene.add(pts);

    const fx = {
      age: 0,
      maxAge: 1.2,
      update: (delta) => {
        const s = 1 + fx.age * radius;
        shock.scale.set(s, s, s);
        ringMat.opacity = Math.max(0, 1 - fx.age / 0.8);
        light.intensity = Math.max(0, 18 * (1 - fx.age / 0.4));

        const p = geo.attributes.position.array;
        for (let i = 0; i < count; i++) {
          const v = vels[i];
          v.y -= 28 * delta;
          p[i * 3] += v.x * delta;
          p[i * 3 + 1] += v.y * delta;
          p[i * 3 + 2] += v.z * delta;
        }
        geo.attributes.position.needsUpdate = true;
        mat.opacity = Math.max(0, 1 - fx.age / 1.1);
      },
      cleanup: () => {
        this.scene.remove(shock);
        this.scene.remove(light);
        this.scene.remove(pts);
        ringGeo.dispose();
        ringMat.dispose();
        geo.dispose();
        mat.dispose();
      }
    };
    this.activeEffects.push(fx);
  }

  // 2. Graviton Pulse: Ultrasonic suction wave + radial crystalline pulse
  triggerGravitonPulse(originPos) {
    const sphereGeo = new THREE.SphereGeometry(1.5, 24, 24);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const wave = new THREE.Mesh(sphereGeo, sphereMat);
    wave.position.copy(originPos);
    this.scene.add(wave);

    const light = new THREE.PointLight(0xc084fc, 12, 40);
    light.position.copy(originPos);
    this.scene.add(light);

    // Inward particle implosion motes
    const pCount = 50;
    const pGeo = new THREE.BufferGeometry();
    const pArr = new Float32Array(pCount * 3);
    const startRadius = 35;
    const angles = [];
    for (let i = 0; i < pCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const elev = (Math.random() - 0.5) * Math.PI;
      angles.push({ a, elev });
      pArr[i * 3] = originPos.x + Math.cos(a) * Math.cos(elev) * startRadius;
      pArr[i * 3 + 1] = originPos.y + Math.sin(elev) * startRadius;
      pArr[i * 3 + 2] = originPos.z + Math.sin(a) * Math.cos(elev) * startRadius;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xf3e8ff,
      size: 0.8,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const implosionPoints = new THREE.Points(pGeo, pMat);
    this.scene.add(implosionPoints);

    const fx = {
      age: 0,
      maxAge: 1.5,
      update: (delta) => {
        const s = 1 + fx.age * 28;
        wave.scale.set(s, s, s);
        sphereMat.opacity = Math.max(0, 0.85 * (1 - fx.age / 1.4));
        light.intensity = Math.max(0, 12 * (1 - fx.age / 0.8));

        // Pull implosion points toward origin
        const arr = pGeo.attributes.position.array;
        for (let i = 0; i < pCount; i++) {
          const curR = Math.max(0, startRadius * (1 - (fx.age / 0.7)));
          const { a, elev } = angles[i];
          arr[i * 3] = originPos.x + Math.cos(a) * Math.cos(elev) * curR;
          arr[i * 3 + 1] = originPos.y + Math.sin(elev) * curR;
          arr[i * 3 + 2] = originPos.z + Math.sin(a) * Math.cos(elev) * curR;
        }
        pGeo.attributes.position.needsUpdate = true;
      },
      cleanup: () => {
        this.scene.remove(wave);
        this.scene.remove(light);
        this.scene.remove(implosionPoints);
        sphereGeo.dispose();
        sphereMat.dispose();
        pGeo.dispose();
        pMat.dispose();
      }
    };
    this.activeEffects.push(fx);
  }

  // 3. Astral Dash / Sub-light Blink: Prismatic after-image streak
  triggerAstralDash(startPos, endPos) {
    const points = [startPos.clone().setY(startPos.y + 1.2), endPos.clone().setY(endPos.y + 1.2)];
    const curve = new THREE.LineCurve3(points[0], points[1]);
    const tubeGeo = new THREE.TubeGeometry(curve, 12, 0.6, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    const streak = new THREE.Mesh(tubeGeo, tubeMat);
    this.scene.add(streak);

    const flash = new THREE.PointLight(0x7dd3fc, 16, 25);
    flash.position.copy(endPos).setY(endPos.y + 1.5);
    this.scene.add(flash);

    const fx = {
      age: 0,
      maxAge: 0.45,
      update: (delta) => {
        tubeMat.opacity = Math.max(0, 0.95 * (1 - fx.age / 0.45));
        flash.intensity = Math.max(0, 16 * (1 - fx.age / 0.3));
      },
      cleanup: () => {
        this.scene.remove(streak);
        this.scene.remove(flash);
        tubeGeo.dispose();
        tubeMat.dispose();
      }
    };
    this.activeEffects.push(fx);
  }

  // 4. Singularity Vortex: Miniature rotating black hole with accretion ring
  triggerSingularityVortex(targetPos) {
    const pos = targetPos.clone().setY(Math.max(1.5, targetPos.y));
    const vortexGroup = new THREE.Group();
    vortexGroup.position.copy(pos);

    // Black Hole Event Horizon Core
    const coreGeo = new THREE.SphereGeometry(1.6, 24, 24);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    vortexGroup.add(core);

    // Glowing Accretion Disk Ring
    const diskGeo = new THREE.RingGeometry(1.8, 5.0, 36);
    diskGeo.rotateX(Math.PI / 2);
    const diskMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const disk = new THREE.Mesh(diskGeo, diskMat);
    vortexGroup.add(disk);

    // Outer Photon Sphere Ring
    const outerRingGeo = new THREE.TorusGeometry(5.2, 0.1, 8, 36);
    outerRingGeo.rotateX(Math.PI / 2);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.9
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    vortexGroup.add(outerRing);

    this.scene.add(vortexGroup);

    const fx = {
      age: 0,
      maxAge: 3.2,
      update: (delta) => {
        disk.rotation.z += delta * 4;
        outerRing.rotation.z -= delta * 2.5;

        // Pulse scale
        const pulse = 1 + Math.sin(fx.age * 8) * 0.1;
        vortexGroup.scale.set(pulse, pulse, pulse);

        // Fade near end
        if (fx.age > 2.6) {
          const fade = Math.max(0, (3.2 - fx.age) / 0.6);
          diskMat.opacity = fade * 0.85;
          outerRingMat.opacity = fade * 0.9;
        }
      },
      cleanup: () => {
        this.scene.remove(vortexGroup);
        coreGeo.dispose();
        coreMat.dispose();
        diskGeo.dispose();
        diskMat.dispose();
        outerRingGeo.dispose();
        outerRingMat.dispose();

        // Terminal Nova Burst on collapse
        this.createGroundExplosion(pos, 0x10b981, 14);
      }
    };
    this.activeEffects.push(fx);
  }

  // =========================================================================
  // LUMINOUS LEY-LINE LIGHT BRIDGES (CITADEL GALAXY EXPANSION)
  // =========================================================================
  initLeyLineSystem() {
    this.activeLeyLines = [];
    this.leyLineWalkways = []; // For player collision: { start, end, width, startY, endY }
  }

  createLeyLineBridge(startPos, endPos, colorHex, label) {
    if (!this.activeLeyLines) this.initLeyLineSystem();

    const bridgeGroup = new THREE.Group();
    const distance = startPos.distanceTo(endPos);
    const dir = new THREE.Vector3().subVectors(endPos, startPos).normalize();
    const midPoint = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);

    const bridgeWidth = 5.5;

    // 1. Radiant Energy Deck (Semi-transparent pulsing runway)
    const deckGeo = new THREE.PlaneGeometry(bridgeWidth, distance, 1, 32);
    deckGeo.rotateX(-Math.PI / 2);
    deckGeo.rotateY(Math.atan2(dir.x, dir.z));

    const deckMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const deckMesh = new THREE.Mesh(deckGeo, deckMat);
    deckMesh.position.copy(midPoint);
    bridgeGroup.add(deckMesh);

    // 2. Central Super-Luminous Laser Spine
    const spineGeo = new THREE.CylinderGeometry(0.35, 0.35, distance, 8);
    spineGeo.rotateX(Math.PI / 2);
    const spineMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const spine = new THREE.Mesh(spineGeo, spineMat);
    spine.position.copy(midPoint);
    spine.lookAt(endPos);
    bridgeGroup.add(spine);

    // 3. Floating Light Guard-Prisms along the bridge
    const prismCount = Math.floor(distance / 25);
    for (let i = 1; i < prismCount; i++) {
      const frac = i / prismCount;
      const pPos = new THREE.Vector3().lerpVectors(startPos, endPos, frac);

      [-1, 1].forEach((side) => {
        const perp = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(side * (bridgeWidth / 2 + 0.4));
        const prism = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.55, 0),
          new THREE.MeshBasicMaterial({ color: colorHex })
        );
        prism.position.copy(pPos).add(perp).setY(pPos.y + 0.8);
        bridgeGroup.add(prism);
      });
    }

    this.scene.add(bridgeGroup);

    // Register Ley-Line for walking collision
    const walkwayDef = {
      label,
      start: startPos.clone(),
      end: endPos.clone(),
      width: bridgeWidth,
      startY: startPos.y,
      endY: endPos.y,
      length: distance,
      dir: dir.clone()
    };
    this.leyLineWalkways.push(walkwayDef);
    this.activeLeyLines.push({ group: bridgeGroup, deckMat, colorHex });

    return walkwayDef;
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

    // 2. Animate active Ley-Lines (pulsating energy waves)
    if (this.activeLeyLines) {
      const time = performance.now() * 0.003;
      this.activeLeyLines.forEach((ll) => {
        if (ll.deckMat) {
          ll.deckMat.opacity = 0.55 + Math.sin(time) * 0.15;
        }
      });
    }

    // 3. Update active dynamic effects
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

