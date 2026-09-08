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
    this.initArchonTrialsAndStargates();

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

  // Query floor height across any open world island or sub-realm
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

  // =========================================================================
  // ARCHON TRIALS & STARGATES
  // =========================================================================
  initArchonTrialsAndStargates() {
    this.stargates = {};
    this.trialEntities = {
      titanRifts: [],
      crystalRings: [],
      chronosGear: null,
      abyssGlyphs: []
    };

    this.initStargates();
    this.initSubRealms();
    this.initTrialEntities();
  }

  // Build the 4 Dimensional Stargates on each Archon island
  initStargates() {
    const realms = [
      { key: 'TITAN', x: 195, y: 34, z: -185, color: 0xf59e0b, dest: 'matrix', name: 'The Cyber Matrix' },
      { key: 'CRYSTAL', x: -230, y: -10, z: 225, color: 0xc084fc, dest: 'asteroids', name: 'The Asteroid Nebula' },
      { key: 'CHRONOS', x: 235, y: 54, z: 245, color: 0x38bdf8, dest: 'chronos', name: 'The Chronal Atrium' },
      { key: 'ABYSS', x: -215, y: -36, z: -165, color: 0x10b981, dest: 'singularity', name: 'The Event Horizon' }
    ];

    realms.forEach((r) => {
      const gateGroup = new THREE.Group();
      gateGroup.position.set(r.x, r.y, r.z);

      // Stone & Gold Archon Ring Frame
      const ringGeo = new THREE.TorusGeometry(3.6, 0.45, 12, 36);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.35,
        metalness: 0.7
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 3.6;
      gateGroup.add(ring);

      // Gold rune trim
      const trimGeo = new THREE.TorusGeometry(3.6, 0.1, 6, 36);
      const trimMat = new THREE.MeshBasicMaterial({ color: r.color });
      const trim = new THREE.Mesh(trimGeo, trimMat);
      trim.position.y = 3.6;
      gateGroup.add(trim);

      // Swirling Wormhole Event Horizon
      const wormholeGeo = new THREE.CircleGeometry(3.2, 32);
      const wormholeMat = new THREE.MeshBasicMaterial({
        color: r.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
      });
      const wormhole = new THREE.Mesh(wormholeGeo, wormholeMat);
      wormhole.position.y = 3.6;
      gateGroup.add(wormhole);

      // Pedestal Base
      const baseGeo = new THREE.CylinderGeometry(4.5, 5.0, 0.8, 12);
      const baseMat = new THREE.MeshStandardMaterial({
        map: this.runeSlateTex,
        roughness: 0.4,
        metalness: 0.3
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.4;
      gateGroup.add(base);

      this.group.add(gateGroup);

      this.stargates[r.key] = {
        group: gateGroup,
        wormhole,
        wormholeMat,
        config: r,
        isActive: false
      };

      // Register interactive stargate
      this.interactiveObjects.push({
        id: `stargate_${r.dest}`,
        name: `Stargate: ${r.name}`,
        subtitle: 'Dimensional Gateway',
        position: new THREE.Vector3(r.x, r.y + 2, r.z),
        interactRadius: 8,
        data: {
          isStargate: true,
          destination: r.dest,
          realmKey: r.key,
          gateName: r.name
        },
        mesh: ring
      });

      this.animatedObjects.push({
        tick: (delta) => {
          wormhole.rotation.z += delta * 1.5;
        }
      });
    });
  }

  // Activate Stargate visuals upon trial completion
  activateStargate(realmKey) {
    const gate = this.stargates[realmKey];
    if (gate) {
      gate.isActive = true;
      gate.wormholeMat.opacity = 0.85;
      const flare = new THREE.PointLight(gate.config.color, 15, 30);
      flare.position.y = 3.6;
      gate.group.add(flare);
    }
  }

  // =========================================================================
  // SUB-REALMS (THE 4 PARALLEL DIMENSIONS)
  // =========================================================================
  initSubRealms() {
    this.subRealmOrigins = {
      matrix: { x: 1200, y: 300, z: 1200, name: 'The Cyber Matrix' },
      asteroids: { x: -1200, y: 300, z: 1200, name: 'The Asteroid Nebula' },
      chronos: { x: 1200, y: 300, z: -1200, name: 'The Chronal Atrium' },
      singularity: { x: -1200, y: 300, z: -1200, name: 'The Event Horizon' }
    };

    // 1. THE CYBER MATRIX (Neon Grid & Floating Logic Monoliths)
    const m = this.subRealmOrigins.matrix;
    const matrixFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(160, 160, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x064e3b, wireframe: true })
    );
    matrixFloor.rotation.x = -Math.PI / 2;
    matrixFloor.position.set(m.x, m.y, m.z);
    this.group.add(matrixFloor);

    // Floating Wireframe Pyramids
    for (let i = 0; i < 8; i++) {
      const pAngle = (i / 8) * Math.PI * 2;
      const px = m.x + Math.cos(pAngle) * 45;
      const pz = m.z + Math.sin(pAngle) * 45;
      const pyr = new THREE.Mesh(
        new THREE.TetrahedronGeometry(6, 0),
        new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true })
      );
      pyr.position.set(px, m.y + 12, pz);
      this.group.add(pyr);
      this.animatedObjects.push({
        tick: (delta) => {
          pyr.rotation.y += delta * 0.8;
          pyr.rotation.x += delta * 0.4;
        }
      });
    }
    this.createReturnStargate(m.x, m.y, m.z - 25, 0x10b981, 'TITAN');
    this.landmasses.push({ x: m.x, y: m.y, z: m.z, radius: 75, topY: m.y });

    // 2. THE ASTEROID NEBULA (Zero-G Asteroid Field)
    const ast = this.subRealmOrigins.asteroids;
    const astPlatform = this.createCragIsland(ast.x, ast.y, ast.z, 30, 20, 'rock');
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const r = 40 + (i % 3) * 15;
      const asteroid = new THREE.Mesh(
        new THREE.DodecahedronGeometry(3 + Math.random() * 3),
        new THREE.MeshStandardMaterial({ color: 0x7e22ce, roughness: 0.6, metalness: 0.3 })
      );
      asteroid.position.set(ast.x + Math.cos(a) * r, ast.y + (Math.random() - 0.5) * 35, ast.z + Math.sin(a) * r);
      this.group.add(asteroid);
      this.animatedObjects.push({
        tick: (delta) => {
          asteroid.rotation.y += delta * 0.5;
          asteroid.rotation.z += delta * 0.3;
        }
      });
    }
    this.createReturnStargate(ast.x, ast.y, ast.z - 18, 0xc084fc, 'CRYSTAL');

    // 3. THE CHRONAL ATRIUM (Clockwork Dials & Rings)
    const ch = this.subRealmOrigins.chronos;
    const chronPlatform = this.createCragIsland(ch.x, ch.y, ch.z, 32, 24, 'marble');
    // Giant rotating dial
    const dial = new THREE.Mesh(
      new THREE.RingGeometry(8, 22, 24),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, side: THREE.DoubleSide })
    );
    dial.rotation.x = -Math.PI / 2;
    dial.position.set(ch.x, ch.y + 0.1, ch.z);
    this.group.add(dial);
    this.animatedObjects.push({
      tick: (delta) => { dial.rotation.z += delta * 0.2; }
    });
    this.createReturnStargate(ch.x, ch.y, ch.z - 20, 0x38bdf8, 'CHRONOS');

    // 4. THE EVENT HORIZON (Gravitational Lens Chamber)
    const s = this.subRealmOrigins.singularity;
    const singPlatform = this.createCragIsland(s.x, s.y, s.z, 34, 25, 'rune');
    const colossalBlackHole = new THREE.Mesh(
      new THREE.SphereGeometry(18, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    colossalBlackHole.position.set(s.x, s.y + 25, s.z + 55);
    this.group.add(colossalBlackHole);

    const colossalRing = new THREE.Mesh(
      new THREE.TorusGeometry(32, 1.2, 8, 48),
      new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending })
    );
    colossalRing.position.copy(colossalBlackHole.position);
    colossalRing.rotation.x = Math.PI / 3;
    this.group.add(colossalRing);
    this.animatedObjects.push({
      tick: (delta) => { colossalRing.rotation.z += delta * 0.4; }
    });
    this.createReturnStargate(s.x, s.y, s.z - 20, 0x10b981, 'ABYSS');
  }

  createReturnStargate(x, y, z, colorHex, returnRealmKey) {
    const gateGroup = new THREE.Group();
    gateGroup.position.set(x, y, z);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(3.2, 0.35, 8, 24),
      new THREE.MeshBasicMaterial({ color: colorHex })
    );
    ring.position.y = 3.2;
    gateGroup.add(ring);

    const wormhole = new THREE.Mesh(
      new THREE.CircleGeometry(2.8, 24),
      new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending })
    );
    wormhole.position.y = 3.2;
    gateGroup.add(wormhole);

    this.group.add(gateGroup);

    this.interactiveObjects.push({
      id: `return_stargate_${returnRealmKey}`,
      name: 'Cosmic Return Gate',
      subtitle: 'Return to Main Galaxy',
      position: new THREE.Vector3(x, y + 2, z),
      interactRadius: 8,
      data: {
        isReturnGate: true,
        returnRealmKey
      },
      mesh: ring
    });

    this.animatedObjects.push({
      tick: (delta) => { wormhole.rotation.z += delta * 2.0; }
    });
  }

  // =========================================================================
  // ARCHON TRIAL ENTITIES
  // =========================================================================
  initTrialEntities() {
    // 1. Titan Void Rifts (4 floating anomalies near Titan Arch)
    const titanPos = ASTRAL_OBELISKS.TITAN.position;
    const riftOffsets = [
      { x: -14, y: 16, z: -10 },
      { x: 14, y: 18, z: -10 },
      { x: 0, y: 32, z: -15 },
      { x: 12, y: 8, z: 12 }
    ];

    riftOffsets.forEach((off, idx) => {
      const riftMesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(2.2, 1),
        new THREE.MeshBasicMaterial({
          color: 0x7c3aed,
          wireframe: true
        })
      );
      riftMesh.position.set(titanPos.x + off.x, titanPos.y + off.y, titanPos.z + off.z);
      this.group.add(riftMesh);

      const rObj = {
        id: `rift_${idx}`,
        mesh: riftMesh,
        isDestroyed: false,
        isVoidRift: true,
        position: riftMesh.position
      };
      this.trialEntities.titanRifts.push(rObj);

      this.animatedObjects.push({
        tick: (delta) => {
          if (!rObj.isDestroyed) {
            riftMesh.rotation.y += delta * 2;
            riftMesh.rotation.x += delta * 1.5;
          }
        }
      });
    });

    // 2. Crystal Harmonic Flight Rings (5 rings forming a flight slalom)
    const cragsPos = ASTRAL_OBELISKS.CRYSTAL.position;
    const ringWaypoints = [
      { x: 0, y: 12, z: 25 },
      { x: 25, y: 18, z: 35 },
      { x: 45, y: 8, z: 10 },
      { x: 20, y: 24, z: -25 },
      { x: -15, y: 16, z: -20 }
    ];

    ringWaypoints.forEach((wp, idx) => {
      const ringGroup = new THREE.Group();
      ringGroup.position.set(cragsPos.x + wp.x, cragsPos.y + wp.y, cragsPos.z + wp.z);

      const ringGeo = new THREE.TorusGeometry(4.5, 0.35, 8, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xc084fc,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
      });
      const rMesh = new THREE.Mesh(ringGeo, ringMat);
      ringGroup.add(rMesh);

      this.group.add(ringGroup);

      this.trialEntities.crystalRings.push({
        index: idx,
        group: ringGroup,
        mesh: rMesh,
        mat: ringMat,
        position: ringGroup.position,
        isCleared: false,
        radius: 6.0
      });

      this.animatedObjects.push({
        tick: (delta) => {
          ringGroup.rotation.z += delta * 0.8;
        }
      });
    });

    // 3. Chronos Astrolabe Alignment Gear (Cloud Spires)
    const chPos = ASTRAL_OBELISKS.CHRONOS.position;
    const gearGroup = new THREE.Group();
    gearGroup.position.set(chPos.x, chPos.y + 1.2, chPos.z + 12);

    const gearMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(2.5, 2.8, 1.2, 12),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25, metalness: 0.85 })
    );
    gearGroup.add(gearMesh);
    this.group.add(gearGroup);

    this.trialEntities.chronosGear = {
      group: gearGroup,
      mesh: gearMesh,
      position: gearGroup.position,
      isAligned: false
    };

    // Register interactive gear
    this.interactiveObjects.push({
      id: 'chronos_gear',
      name: 'Chronos Astrolabe Gear',
      subtitle: 'Align with Eclipse Epoch [T]',
      position: gearGroup.position,
      interactRadius: 8,
      data: { isChronosGear: true },
      mesh: gearMesh
    });

    // 4. Abyss Antimatter Glyphs (3 floating green glyphs)
    const abyssPos = ASTRAL_OBELISKS.ABYSS.position;
    const glyphAngles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
    glyphAngles.forEach((ang, idx) => {
      const gMesh = new THREE.Mesh(
        new THREE.OctahedronGeometry(1.4, 0),
        new THREE.MeshBasicMaterial({
          color: 0x10b981,
          wireframe: true
        })
      );
      gMesh.position.set(
        abyssPos.x + Math.cos(ang) * 18,
        abyssPos.y + 4,
        abyssPos.z + Math.sin(ang) * 18
      );
      this.group.add(gMesh);

      const gObj = {
        id: `glyph_${idx}`,
        mesh: gMesh,
        position: gMesh.position,
        isCollected: false,
        radius: 4.5
      };
      this.trialEntities.abyssGlyphs.push(gObj);

      this.animatedObjects.push({
        tick: (delta, elapsed) => {
          if (!gObj.isCollected) {
            gMesh.rotation.y += delta * 2;
            gMesh.position.y = abyssPos.y + 4 + Math.sin(elapsed * 3 + idx) * 0.8;
          }
        }
      });
    });
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
        m.mesh.rotation.y = -m.angle + (m.config.speed > 0 ? Math.PI / 2 : -Math.PI / 2);

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

