// The Astral Expanse: Open-World Celestial Archipelagos & Ancient Titan Ruins
import * as THREE from 'three';
import { ASTRAL_OBELISKS } from '../game/constants.js';

export class AstralExpanse {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.interactiveObjects = [];
    this.animatedObjects = [];
    this.landmasses = []; // For collision detection: { x, z, radius, topY }

    this.initTextures();
    this.initArchipelagos();
    this.initCelestialMantas();
    this.initAmbientStardustFalls();

    this.scene.add(this.group);
  }

  initTextures() {
    const loader = new THREE.TextureLoader();

    this.crystalRockTex = loader.load('/textures/aether_crystal_rock.jpg');
    this.crystalRockTex.wrapS = THREE.RepeatWrapping;
    this.crystalRockTex.wrapT = THREE.RepeatWrapping;
    this.crystalRockTex.repeat.set(3, 3);

    this.runeSlateTex = loader.load('/textures/astral_rune_slate.jpg');
    this.runeSlateTex.wrapS = THREE.RepeatWrapping;
    this.runeSlateTex.wrapT = THREE.RepeatWrapping;
    this.runeSlateTex.repeat.set(2, 2);

    this.goldMarbleTex = loader.load('/textures/celestial_gold_marble.jpg');
    this.goldMarbleTex.wrapS = THREE.RepeatWrapping;
    this.goldMarbleTex.wrapT = THREE.RepeatWrapping;
    this.goldMarbleTex.repeat.set(2, 2);
  }

  createCragIsland(x, y, z, radius, depth = 16, materialType = 'rock') {
    const islandGroup = new THREE.Group();
    islandGroup.position.set(x, y, z);

    // Top dais
    const topGeo = new THREE.CylinderGeometry(radius, radius * 0.94, 2.5, 24);
    let topMat;
    if (materialType === 'marble') {
      topMat = new THREE.MeshStandardMaterial({
        map: this.goldMarbleTex,
        roughness: 0.3,
        metalness: 0.15
      });
    } else if (materialType === 'rune') {
      topMat = new THREE.MeshStandardMaterial({
        map: this.runeSlateTex,
        roughness: 0.4,
        metalness: 0.3
      });
    } else {
      topMat = new THREE.MeshStandardMaterial({
        map: this.crystalRockTex,
        roughness: 0.6,
        metalness: 0.2
      });
    }

    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = -1.25;
    topMesh.receiveShadow = true;
    islandGroup.add(topMesh);

    // Golden / Crystal Rim Torus
    const rimGeo = new THREE.TorusGeometry(radius, 0.4, 6, 24);
    rimGeo.rotateX(Math.PI / 2);
    const rimMat = new THREE.MeshStandardMaterial({
      color: materialType === 'rock' ? 0xc084fc : 0xffd700,
      roughness: 0.2,
      metalness: 0.8
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.y = 0.05;
    islandGroup.add(rimMesh);

    // Underside crag cone
    const underGeo = new THREE.ConeGeometry(radius * 0.92, depth, 14);
    underGeo.rotateX(Math.PI);
    const underMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.85,
      metalness: 0.1
    });
    const underMesh = new THREE.Mesh(underGeo, underMat);
    underMesh.position.y = -depth / 2 - 2.5;
    underMesh.castShadow = true;
    islandGroup.add(underMesh);

    this.group.add(islandGroup);

    // Register landmass for landing / floor queries
    this.landmasses.push({
      x,
      y,
      z,
      radius,
      topY: y
    });

    return islandGroup;
  }

  initArchipelagos() {
    // =========================================================================
    // 1. NORTHEAST: The Shattered Titan Shelf (Colossal Ruin Arch & Titan Blade)
    // =========================================================================
    const titanShelf = ASTRAL_OBELISKS.TITAN;
    this.createCragIsland(titanShelf.position.x, titanShelf.position.y, titanShelf.position.z, 32, 28, 'rune');

    // Shattered Colossal Titan Arch
    const archGroup = new THREE.Group();
    archGroup.position.set(titanShelf.position.x, titanShelf.position.y, titanShelf.position.z - 15);

    const archMat = new THREE.MeshStandardMaterial({
      map: this.runeSlateTex,
      roughness: 0.35,
      metalness: 0.3
    });

    // Arch pillars
    const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(4, 28, 4), archMat);
    leftPillar.position.set(-14, 14, 0);
    leftPillar.castShadow = true;
    archGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(4, 24, 4), archMat);
    rightPillar.position.set(14, 12, 0);
    rightPillar.rotation.z = -0.08;
    rightPillar.castShadow = true;
    archGroup.add(rightPillar);

    // Broken top arch lintel drifting in anti-gravity
    const lintelLeft = new THREE.Mesh(new THREE.BoxGeometry(16, 4, 5), archMat);
    lintelLeft.position.set(-8, 30, 0);
    lintelLeft.rotation.z = 0.12;
    archGroup.add(lintelLeft);

    const lintelRight = new THREE.Mesh(new THREE.BoxGeometry(14, 4, 5), archMat);
    lintelRight.position.set(9, 32, 2);
    lintelRight.rotation.z = -0.22;
    lintelRight.rotation.y = 0.15;
    archGroup.add(lintelRight);

    // Floating Titan Astrolabe Rings behind the arch
    const titanRingMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2
    });
    const titanRing = new THREE.Mesh(
      new THREE.TorusGeometry(18, 0.6, 8, 48),
      titanRingMat
    );
    titanRing.position.set(0, 18, -4);
    archGroup.add(titanRing);

    this.group.add(archGroup);

    this.animatedObjects.push({
      tick: (delta) => {
        titanRing.rotation.z += delta * 0.15;
        titanRing.rotation.x += delta * 0.08;
      }
    });

    // Plunged Celestial Titan Greatsword
    const swordGroup = new THREE.Group();
    swordGroup.position.set(titanShelf.position.x + 12, titanShelf.position.y, titanShelf.position.z + 10);
    swordGroup.rotation.z = 0.18;
    swordGroup.rotation.x = -0.12;

    const bladeGeo = new THREE.ConeGeometry(2.2, 38, 4);
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      roughness: 0.1,
      metalness: 0.95
    });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.y = 16;
    swordGroup.add(blade);

    const hiltGeo = new THREE.BoxGeometry(9, 1.2, 2.5);
    const hiltMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2 });
    const hilt = new THREE.Mesh(hiltGeo, hiltMat);
    hilt.position.y = 35.5;
    swordGroup.add(hilt);

    this.group.add(swordGroup);

    // Register Titan Obelisk
    this.createObeliskEntity(titanShelf);

    // Satellite rocks orbiting Titan Shelf
    this.createSatelliteCluster(titanShelf.position.x, titanShelf.position.y + 10, titanShelf.position.z, 55, 6);

    // =========================================================================
    // 2. SOUTHWEST: The Luminescent Crystal Crags (Crystalline Caverns)
    // =========================================================================
    const crystalCrags = ASTRAL_OBELISKS.CRYSTAL;
    this.createCragIsland(crystalCrags.position.x, crystalCrags.position.y, crystalCrags.position.z, 28, 22, 'rock');

    // Nearby secondary crag islands
    this.createCragIsland(crystalCrags.position.x + 35, crystalCrags.position.y - 12, crystalCrags.position.z + 20, 16, 18, 'rock');
    this.createCragIsland(crystalCrags.position.x - 28, crystalCrags.position.y + 15, crystalCrags.position.z - 30, 20, 24, 'rock');

    // Towering Glowing Crystals on the Crags
    const crystalColors = [0xc084fc, 0xa855f7, 0x38bdf8, 0xe879f9];
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 2;
      const r = 8 + (i % 3) * 6;
      const cx = crystalCrags.position.x + Math.cos(angle) * r;
      const cz = crystalCrags.position.z + Math.sin(angle) * r;
      const cy = crystalCrags.position.y;

      const cHeight = 8 + (i % 4) * 4;
      const cGeo = new THREE.ConeGeometry(1.2 + (i % 2) * 0.4, cHeight, 6);
      const col = crystalColors[i % crystalColors.length];
      const cMat = new THREE.MeshStandardMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 0.6,
        roughness: 0.15,
        metalness: 0.85
      });
      const cMesh = new THREE.Mesh(cGeo, cMat);
      cMesh.position.set(cx, cy + cHeight / 2, cz);
      cMesh.rotation.z = (Math.random() - 0.5) * 0.4;
      cMesh.rotation.x = (Math.random() - 0.5) * 0.4;
      cMesh.castShadow = true;
      this.group.add(cMesh);

      // Point lights on major crystals
      if (i % 2 === 0) {
        const cLight = new THREE.PointLight(col, 2.5, 20);
        cLight.position.set(cx, cy + cHeight, cz);
        this.group.add(cLight);
      }
    }

    // Register Crystal Obelisk
    this.createObeliskEntity(crystalCrags);

    // =========================================================================
    // 3. SOUTHEAST: The Celestial Cloud Spires (High Altitude Peaks)
    // =========================================================================
    const cloudSpires = ASTRAL_OBELISKS.CHRONOS;
    this.createCragIsland(cloudSpires.position.x, cloudSpires.position.y, cloudSpires.position.z, 26, 32, 'marble');

    // Floating Twin Spires
    [-8, 8].forEach((sx, idx) => {
      const spireGeo = new THREE.ConeGeometry(2.0, 36, 8);
      const spireMat = new THREE.MeshStandardMaterial({
        map: this.goldMarbleTex,
        roughness: 0.25,
        metalness: 0.3
      });
      const spire = new THREE.Mesh(spireGeo, spireMat);
      spire.position.set(cloudSpires.position.x + sx, cloudSpires.position.y + 18, cloudSpires.position.z - 8);
      spire.castShadow = true;
      this.group.add(spire);

      // Levitating Crown Ring
      const cRing = new THREE.Mesh(
        new THREE.TorusGeometry(3.5, 0.18, 8, 32),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.15 })
      );
      cRing.position.set(cloudSpires.position.x + sx, cloudSpires.position.y + 32, cloudSpires.position.z - 8);
      cRing.rotation.x = Math.PI / 2;
      this.group.add(cRing);

      this.animatedObjects.push({
        tick: (delta, elapsed) => {
          cRing.rotation.z += delta * (0.8 + idx * 0.3);
          cRing.position.y = cloudSpires.position.y + 32 + Math.sin(elapsed * 2 + idx) * 0.4;
        }
      });
    });

    // Register Chronos Obelisk
    this.createObeliskEntity(cloudSpires);

    // =========================================================================
    // 4. NORTHWEST: The Abyssal Cascades (Singularity Vortex Island)
    // =========================================================================
    const abyss = ASTRAL_OBELISKS.ABYSS;
    this.createCragIsland(abyss.position.x, abyss.position.y, abyss.position.z, 28, 25, 'rune');

    // Central Miniature Singularity (Dark Void Orb with glowing emerald accretion disk)
    const singGroup = new THREE.Group();
    singGroup.position.set(abyss.position.x, abyss.position.y + 8, abyss.position.z);

    const darkCore = new THREE.Mesh(
      new THREE.SphereGeometry(2.5, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    singGroup.add(darkCore);

    // Emerald Accretion Ring
    const accGeo = new THREE.RingGeometry(3.5, 8.5, 48);
    const accMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const accretion = new THREE.Mesh(accGeo, accMat);
    accretion.rotation.x = Math.PI / 2.5;
    singGroup.add(accretion);

    const accLight = new THREE.PointLight(0x10b981, 4.0, 25);
    singGroup.add(accLight);

    this.group.add(singGroup);

    this.animatedObjects.push({
      tick: (delta, elapsed) => {
        accretion.rotation.z -= delta * 1.5;
        singGroup.position.y = abyss.position.y + 8 + Math.sin(elapsed * 1.8) * 0.3;
      }
    });

    // Register Abyss Obelisk
    this.createObeliskEntity(abyss);
  }

  createObeliskEntity(data) {
    const obGroup = new THREE.Group();
    obGroup.position.set(data.position.x, data.position.y, data.position.z);

    // Stepped Pedestal
    const ped = new THREE.Mesh(
      new THREE.CylinderGeometry(2.8, 3.5, 1.2, 8),
      new THREE.MeshStandardMaterial({
        map: this.runeSlateTex,
        roughness: 0.4,
        metalness: 0.3
      })
    );
    ped.position.y = 0.6;
    ped.receiveShadow = true;
    obGroup.add(ped);

    // Levitating Arcane Obelisk Monolith
    const monoGeo = new THREE.ConeGeometry(1.4, 11, 4);
    const monoMat = new THREE.MeshStandardMaterial({
      color: data.color,
      emissive: data.color,
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.8
    });
    const monolith = new THREE.Mesh(monoGeo, monoMat);
    monolith.position.y = 7.5;
    monolith.castShadow = true;
    obGroup.add(monolith);

    // Floating Concentric Arcane Rings
    const ringGeo = new THREE.TorusGeometry(2.4, 0.08, 8, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: data.color,
      roughness: 0.15,
      metalness: 0.95
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 7.5;
    obGroup.add(ring);

    // Vertical Celestial Waypoint Beam into the Heavens
    const beamGeo = new THREE.CylinderGeometry(0.3, 0.8, 160, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: data.color,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 80;
    obGroup.add(beam);

    this.group.add(obGroup);

    // Register interactive obelisk
    this.interactiveObjects.push({
      id: data.id,
      name: data.name,
      subtitle: data.region,
      position: new THREE.Vector3(data.position.x, data.position.y + 2, data.position.z),
      interactRadius: 12,
      data: {
        ...data,
        isAstralObelisk: true
      },
      mesh: monolith
    });

    this.animatedObjects.push({
      tick: (delta, elapsed) => {
        monolith.rotation.y += delta * 0.7;
        monolith.position.y = 7.5 + Math.sin(elapsed * 2.2) * 0.35;
        ring.rotation.z += delta * 1.1;
        ring.rotation.x = Math.PI / 2 + Math.sin(elapsed * 1.5) * 0.25;
      }
    });
  }

  createSatelliteCluster(cx, cy, cz, radius, count) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const rockGeo = new THREE.DodecahedronGeometry(2.2 + Math.random() * 2.0);
      const rockMat = new THREE.MeshStandardMaterial({
        color: 0x27272a,
        roughness: 0.9,
        metalness: 0.1
      });
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(
        cx + Math.cos(angle) * radius,
        cy + (Math.random() - 0.5) * 20,
        cz + Math.sin(angle) * radius
      );
      this.group.add(rock);

      this.animatedObjects.push({
        tick: (delta) => {
          rock.rotation.x += delta * 0.2;
          rock.rotation.y += delta * 0.15;
        }
      });
    }
  }

  // =========================================================================
  // Roaming Celestial Star-Mantas (Majestic Flying Astral Leviathans)
  // =========================================================================
  initCelestialMantas() {
    this.mantas = [];

    const mantaConfigs = [
      { radius: 180, altitude: 45, speed: 0.12, color: 0x60a5fa },
      { radius: 260, altitude: 80, speed: -0.09, color: 0xc084fc }
    ];

    mantaConfigs.forEach((cfg) => {
      const manta = new THREE.Group();

      // Main aerodynamic body
      const bodyGeo = new THREE.ConeGeometry(2.2, 12, 5);
      bodyGeo.rotateX(Math.PI / 2);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        emissive: cfg.color,
        emissiveIntensity: 0.4,
        roughness: 0.2,
        metalness: 0.8
      });
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      manta.add(bodyMesh);

      // Wings (Left & Right)
      const leftWingGroup = new THREE.Group();
      const rightWingGroup = new THREE.Group();

      const wingGeo = new THREE.BoxGeometry(10, 0.2, 6);
      const wingMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });

      const leftWing = new THREE.Mesh(wingGeo, wingMat);
      leftWing.position.x = -5;
      leftWingGroup.add(leftWing);

      const rightWing = new THREE.Mesh(wingGeo, wingMat);
      rightWing.position.x = 5;
      rightWingGroup.add(rightWing);

      manta.add(leftWingGroup, rightWingGroup);

      // Trailing stardust tail
      const tailGeo = new THREE.CylinderGeometry(0.1, 0.8, 14, 4);
      tailGeo.rotateX(Math.PI / 2);
      const tail = new THREE.Mesh(tailGeo, wingMat);
      tail.position.z = 10;
      manta.add(tail);

      this.group.add(manta);

      this.mantas.push({
        mesh: manta,
        leftWing: leftWingGroup,
        rightWing: rightWingGroup,
        config: cfg,
        angle: Math.random() * Math.PI * 2
      });
    });
  }

  // Cascading starlight particle falls streaming into the void
  initAmbientStardustFalls() {
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pColor = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount; i++) {
      // Cluster around the Crystal Crags edge
      const r = 20 + Math.random() * 80;
      const ang = Math.random() * Math.PI * 2;
      pPos[i * 3] = -230 + Math.cos(ang) * r;
      pPos[i * 3 + 1] = -10 - Math.random() * 80;
      pPos[i * 3 + 2] = 195 + Math.sin(ang) * r;

      const c = new THREE.Color(Math.random() > 0.5 ? 0xc084fc : 0x38bdf8);
      pColor[i * 3] = c.r;
      pColor[i * 3 + 1] = c.g;
      pColor[i * 3 + 2] = c.b;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColor, 3));

    const pMat = new THREE.PointsMaterial({
      size: 3.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.stardustFalls = new THREE.Points(pGeo, pMat);
    this.group.add(this.stardustFalls);
  }

  // Query floor height across any open world island
  getFloorHeight(x, z) {
    for (let i = 0; i < this.landmasses.length; i++) {
      const land = this.landmasses[i];
      const dx = x - land.x;
      const dz = z - land.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < land.radius) {
        return land.topY;
      }
    }
    return null; // Not over any open world landmass
  }

  update(delta, elapsed) {
    // Tick animated world entities (monoliths, rings, etc.)
    for (let i = 0; i < this.animatedObjects.length; i++) {
      this.animatedObjects[i].tick(delta, elapsed);
    }

    // Tick Celestial Mantas
    if (this.mantas) {
      this.mantas.forEach((m) => {
        m.angle += delta * m.config.speed;
        const x = Math.cos(m.angle) * m.config.radius;
        const z = Math.sin(m.angle) * m.config.radius;
        const y = m.config.altitude + Math.sin(elapsed * 1.5 + m.angle) * 6;

        m.mesh.position.set(x, y, z);
        // Face forward along orbital tangent
        m.mesh.rotation.y = -m.angle + (m.config.speed > 0 ? Math.PI / 2 : -Math.PI / 2);

        // Sinusoidal wing flap
        const flap = Math.sin(elapsed * 2.8 + m.angle * 2) * 0.35;
        m.leftWing.rotation.z = flap;
        m.rightWing.rotation.z = -flap;
      });
    }

    // Tick falling stardust cascade
    if (this.stardustFalls) {
      const pos = this.stardustFalls.geometry.attributes.position.array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] -= delta * 18;
        if (pos[i] < -120) {
          pos[i] = -10;
        }
      }
      this.stardustFalls.geometry.attributes.position.needsUpdate = true;
    }
  }
}
