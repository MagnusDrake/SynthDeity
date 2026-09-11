// 3D Procedural World & Architecture for AETHELGARD
import * as THREE from 'three';
import { SHRINES } from '../game/constants.js';
import { proceduralMaterials } from './materials.js';
import { AstralEtherPool } from './water.js';

export class CelestialCitadel {
  constructor(scene) {
    this.scene = scene;
    this.interactiveObjects = []; // Items player can attune with
    this.animatedObjects = [];    // Items to tick in render loop
    this.projectRelics = [];      // 3D relics for Vault of Creations
    this.etherPool = null;

    this.initTextures();
    this.initEnvironment();
    this.initCentralIsland();
    this.initBridges();
    this.initGenesisShrine();
    this.initVaultShrine();
    this.initSpireShrine();
    this.initBeaconShrine();
  }

  initTextures() {
    this.goldMarbleSuite = proceduralMaterials.createGoldMarbleSuite(1024);
    this.runeSlateSuite = proceduralMaterials.createRuneSlateSuite(1024);
    this.marbleTex = this.goldMarbleSuite.map;
    this.runeTex = this.runeSlateSuite.map;
  }

  initEnvironment() {
    // 1. Cosmic Starfield Sphere
    const starCount = 2500;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 350 + Math.random() * 80;

      const sinPhi = Math.sin(phi);
      starPositions[i * 3] = r * sinPhi * Math.cos(theta);
      starPositions[i * 3 + 1] = r * sinPhi * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      // Star colors: celestial blue, gold, soft violet, white
      const palette = [0xffffff, 0xffeedd, 0x93c5fd, 0xc084fc, 0xfde047];
      const color = new THREE.Color(palette[Math.floor(Math.random() * palette.length)]);
      starColors[i * 3] = color.r;
      starColors[i * 3 + 1] = color.g;
      starColors[i * 3 + 2] = color.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });

    this.starfield = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starfield);

    // 2. Giant Distant Kinetic Celestial Rings (Godly Astrolabe in the sky)
    const giantRingMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });

    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(160 + i * 40, 1.2, 4, 64),
        giantRingMat
      );
      ring.position.set(0, 40 + i * 20, -60);
      ring.rotation.x = Math.PI / (3 + i);
      ring.rotation.y = (i * Math.PI) / 4;
      this.scene.add(ring);
      this.animatedObjects.push({
        tick: (delta) => {
          ring.rotation.z += delta * (0.04 / (i + 1));
          ring.rotation.y += delta * (0.02 / (i + 1));
        }
      });
    }

    // 3. Sub-island Cosmic Ethereal Nebula Cloud
    const nebulaCount = 600;
    const nebulaGeo = new THREE.BufferGeometry();
    const nebulaPositions = new Float32Array(nebulaCount * 3);
    const nebulaColors = new Float32Array(nebulaCount * 3);

    for (let i = 0; i < nebulaCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 180;
      nebulaPositions[i * 3] = Math.cos(angle) * dist;
      nebulaPositions[i * 3 + 1] = -25 - Math.random() * 40;
      nebulaPositions[i * 3 + 2] = Math.sin(angle) * dist;

      const pal = [0x38bdf8, 0x818cf8, 0xc084fc, 0xfde047];
      const c = new THREE.Color(pal[Math.floor(Math.random() * pal.length)]);
      nebulaColors[i * 3] = c.r;
      nebulaColors[i * 3 + 1] = c.g;
      nebulaColors[i * 3 + 2] = c.b;
    }

    nebulaGeo.setAttribute('position', new THREE.BufferAttribute(nebulaPositions, 3));
    nebulaGeo.setAttribute('color', new THREE.BufferAttribute(nebulaColors, 3));

    const nebulaMat = new THREE.PointsMaterial({
      size: 4.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });

    const nebula = new THREE.Points(nebulaGeo, nebulaMat);
    this.scene.add(nebula);
    this.animatedObjects.push({
      tick: (delta) => {
        nebula.rotation.y += delta * 0.015;
      }
    });
  }

  createSacredFloorTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Rich celestial obsidian marble background
    const bgGrad = ctx.createRadialGradient(size/2, size/2, 20, size/2, size/2, size/2);
    bgGrad.addColorStop(0, '#1e293b');
    bgGrad.addColorStop(0.65, '#0f172a');
    bgGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    ctx.translate(size / 2, size / 2);

    // Golden concentric geometric rings
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 5;
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 12;

    [45, 95, 155, 215, 245].forEach(r => {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 16-point sacred compass rose
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * 242, Math.sin(angle) * 242);
      ctx.stroke();
    }

    // Sacred geometric triangles
    for (let rot = 0; rot < 2; rot++) {
      ctx.save();
      ctx.rotate((rot * Math.PI) / 3);
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const ang = (i * Math.PI * 2) / 3 - Math.PI / 2;
        const x = Math.cos(ang) * 155;
        const y = Math.sin(ang) * 155;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  // Common floating island generator with layered marble, golden rims, and underside rock stalactites
  createFloatingIsland(radius, height = 5) {
    const island = new THREE.Group();

    // Upper dais with sacred celestial white & gold marble (PBR Normal & Roughness)
    const topGeo = new THREE.CylinderGeometry(radius, radius * 0.96, 1.2, 36);
    const topMat = new THREE.MeshStandardMaterial({
      map: this.goldMarbleSuite ? this.goldMarbleSuite.map : this.createSacredFloorTexture(),
      normalMap: this.goldMarbleSuite ? this.goldMarbleSuite.normalMap : null,
      roughnessMap: this.goldMarbleSuite ? this.goldMarbleSuite.roughnessMap : null,
      metalnessMap: this.goldMarbleSuite ? this.goldMarbleSuite.metalnessMap : null,
      normalScale: this.goldMarbleSuite ? this.goldMarbleSuite.normalScale : new THREE.Vector2(1.2, 1.2),
      roughness: 0.28,
      metalness: 0.22
    });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = -0.6;
    topMesh.receiveShadow = true;
    island.add(topMesh);

    // Glowing Golden Edge Trim Ring
    const trimGeo = new THREE.TorusGeometry(radius, 0.3, 8, 36);
    trimGeo.rotateX(Math.PI / 2);
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.18,
      metalness: 0.92
    });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.y = 0.05;
    island.add(trimMesh);

    // Underside inverted stone cone
    const bottomGeo = new THREE.ConeGeometry(radius * 0.95, height * 2.5, 16);
    bottomGeo.rotateX(Math.PI);
    const bottomMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.1
    });
    const bottomMesh = new THREE.Mesh(bottomGeo, bottomMat);
    bottomMesh.position.y = -height * 1.25 - 1.2;
    bottomMesh.castShadow = true;
    island.add(bottomMesh);

    return island;
  }

  initCentralIsland() {
    const central = this.createFloatingIsland(22, 6);
    this.scene.add(central);

    // Liquid Astral Ether Reflecting Pool with Procedural Voronoi Caustics
    this.etherPool = new AstralEtherPool(13.8, 8.8);
    this.etherPool.mesh.position.y = 0.02;
    central.add(this.etherPool.mesh);

    // Decorative Golden Pool Lip Rims
    const poolLipMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.15,
      metalness: 0.92
    });
    const innerRim = new THREE.Mesh(new THREE.TorusGeometry(5.0, 0.12, 8, 36), poolLipMat);
    innerRim.rotateX(Math.PI / 2);
    innerRim.position.y = 0.04;
    central.add(innerRim);

    const outerRim = new THREE.Mesh(new THREE.TorusGeometry(13.8, 0.15, 8, 36), poolLipMat);
    outerRim.rotateX(Math.PI / 2);
    outerRim.position.y = 0.04;
    central.add(outerRim);

    // Central Divine Nexus: Levitating Crystal Spire
    const nexusGroup = new THREE.Group();
    nexusGroup.position.set(0, 0, 0);

    // Center Pedestal
    const pedGeo = new THREE.CylinderGeometry(3.5, 4.5, 1.8, 8);
    const pedMat = new THREE.MeshStandardMaterial({
      map: this.runeSlateSuite ? this.runeSlateSuite.map : null,
      normalMap: this.runeSlateSuite ? this.runeSlateSuite.normalMap : null,
      roughness: 0.35,
      metalness: 0.4
    });
    const pedestal = new THREE.Mesh(pedGeo, pedMat);
    pedestal.position.y = 0.9;
    nexusGroup.add(pedestal);

    // Levitating Master Crystal (Octahedron)
    const crystalGeo = new THREE.OctahedronGeometry(1.8, 0);
    const crystalMat = new THREE.MeshBasicMaterial({
      color: 0xffe066
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.y = 4.8;
    nexusGroup.add(crystal);

    // Orbiting Golden Rings around Master Crystal
    const ringGeo = new THREE.TorusGeometry(2.8, 0.08, 8, 36);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffd700
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.position.y = 4.8;
    ring1.rotation.x = Math.PI / 4;
    nexusGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.position.y = 4.8;
    ring2.rotation.y = Math.PI / 3;
    nexusGroup.add(ring2);

    // Vertical Light Pillar reaching into the heavens
    const beamGeo = new THREE.CylinderGeometry(0.5, 1.2, 120, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffeaa7,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 60;
    nexusGroup.add(beam);

    this.scene.add(nexusGroup);

    this.animatedObjects.push({
      tick: (delta, elapsed) => {
        crystal.rotation.y += delta * 0.8;
        crystal.position.y = 4.8 + Math.sin(elapsed * 2) * 0.3;
        ring1.rotation.x += delta * 1.2;
        ring1.rotation.z += delta * 0.9;
        ring2.rotation.y += delta * 1.4;
      }
    });

    // Outer Decorative Pillars around central dais
    const pillarCount = 8;
    for (let i = 0; i < pillarCount; i++) {
      // Offset by PI/8 (22.5 deg) so pillars symmetrically flank the 4 cardinal causeways
      const angle = (i / pillarCount) * Math.PI * 2 + Math.PI / 8;
      const x = Math.cos(angle) * 19;
      const z = Math.sin(angle) * 19;

      const pGroup = new THREE.Group();
      pGroup.position.set(x, 0, z);

      const colGeo = new THREE.CylinderGeometry(0.4, 0.5, 4.5, 8);
      const colMat = new THREE.MeshBasicMaterial({ color: 0x475569 });
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.y = 2.25;
      pGroup.add(col);

      // Glowing floating flame cap
      const flameGeo = new THREE.DodecahedronGeometry(0.35);
      const flameMat = new THREE.MeshBasicMaterial({
        color: 0xffaa00
      });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.y = 5.2;
      pGroup.add(flame);

      this.scene.add(pGroup);

      this.animatedObjects.push({
        tick: (delta, elapsed) => {
          flame.rotation.y += delta * 2;
          flame.position.y = 5.2 + Math.sin(elapsed * 3 + i) * 0.15;
        }
      });
    }
  }

  initBridges() {
    // 4 Cardinal Ceremonial Causeways connecting Central Island (R=22) to the 4 Shrines (Center D=48, R=18)
    // The gap between islands along each axis is exactly from D=22.0 to D=30.0 (span = 8.0 units).
    // The causeways span from D=21.75 to D=30.25, perfectly bridging the open space with zero intrusion or Z-fighting.

    const deckMat = new THREE.MeshStandardMaterial({
      map: this.runeSlateSuite ? this.runeSlateSuite.map : this.runeTex,
      normalMap: this.runeSlateSuite ? this.runeSlateSuite.normalMap : null,
      roughnessMap: this.runeSlateSuite ? this.runeSlateSuite.roughnessMap : null,
      metalnessMap: this.runeSlateSuite ? this.runeSlateSuite.metalnessMap : null,
      normalScale: this.runeSlateSuite ? this.runeSlateSuite.normalScale : new THREE.Vector2(1.2, 1.2),
      roughness: 0.32,
      metalness: 0.35
    });

    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.18,
      metalness: 0.95
    });

    const darkPillarMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.45,
      metalness: 0.3
    });

    const glowGemMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfacc15,
      emissiveIntensity: 0.85,
      roughness: 0.1,
      metalness: 0.9
    });

    const underKeelMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.7,
      metalness: 0.2
    });

    const walkwayWidth = 4.8;
    const spanLength = 8.5; // Spans exactly from Z=21.75 to Z=30.25
    const centerZ = 26.0;   // Midpoint of span

    // 4 Cardinal Orientations: South (0), East (PI/2), North (PI), West (-PI/2)
    const causewayRotations = [
      { name: 'South (Spire)', rotY: 0 },
      { name: 'East (Vault)', rotY: Math.PI / 2 },
      { name: 'North (Genesis)', rotY: Math.PI },
      { name: 'West (Beacon)', rotY: -Math.PI / 2 }
    ];

    causewayRotations.forEach((cfg) => {
      const causeway = new THREE.Group();

      // 1. Walkway Deck Slab (spans Z from 21.75 to 30.25)
      const deckGeo = new THREE.BoxGeometry(walkwayWidth, 0.4, spanLength);
      const deckMesh = new THREE.Mesh(deckGeo, deckMat);
      deckMesh.position.set(0, -0.2, centerZ);
      deckMesh.receiveShadow = true;
      causeway.add(deckMesh);

      // 2. Central Golden Rune Ribbon
      const ribbonGeo = new THREE.BoxGeometry(0.35, 0.02, spanLength - 0.4);
      const ribbonMesh = new THREE.Mesh(ribbonGeo, goldTrimMat);
      ribbonMesh.position.set(0, 0.01, centerZ);
      causeway.add(ribbonMesh);

      // Transverse gold accent bands
      [-2.2, 0, 2.2].forEach(offsetZ => {
        const bandGeo = new THREE.BoxGeometry(walkwayWidth - 0.4, 0.02, 0.14);
        const bandMesh = new THREE.Mesh(bandGeo, goldTrimMat);
        bandMesh.position.set(0, 0.012, centerZ + offsetZ);
        causeway.add(bandMesh);
      });

      // 3. Golden Threshold Transition Plates (at both island rims)
      // Inner Threshold (Central Island rim at Z=21.9)
      const innerPlateGeo = new THREE.BoxGeometry(walkwayWidth + 0.5, 0.06, 0.85);
      const innerPlate = new THREE.Mesh(innerPlateGeo, goldTrimMat);
      innerPlate.position.set(0, 0.03, 21.9);
      causeway.add(innerPlate);

      // Outer Threshold (Shrine Island rim at Z=30.1)
      const outerPlateGeo = new THREE.BoxGeometry(walkwayWidth + 0.5, 0.06, 0.85);
      const outerPlate = new THREE.Mesh(outerPlateGeo, goldTrimMat);
      outerPlate.position.set(0, 0.03, 30.1);
      causeway.add(outerPlate);

      // 4. Balustrades & Golden Energy Handrails along left & right sides
      [-1, 1].forEach(side => {
        const sideX = side * (walkwayWidth / 2 - 0.12);

        // Stone curb parapet
        const curbGeo = new THREE.BoxGeometry(0.24, 0.38, spanLength - 0.4);
        const curb = new THREE.Mesh(curbGeo, darkPillarMat);
        curb.position.set(sideX, 0.19, centerZ);
        causeway.add(curb);

        // Golden handrail cylinder
        const railGeo = new THREE.CylinderGeometry(0.06, 0.06, spanLength - 0.4, 8);
        railGeo.rotateX(Math.PI / 2);
        const rail = new THREE.Mesh(railGeo, goldTrimMat);
        rail.position.set(sideX, 0.42, centerZ);
        causeway.add(rail);
      });

      // 5. Ceremonial Gateway Pylons (4 per causeway: 2 at inner rim, 2 at outer rim)
      const pylonPositions = [
        { x: -walkwayWidth / 2 - 0.15, z: 21.9 },
        { x: walkwayWidth / 2 + 0.15, z: 21.9 },
        { x: -walkwayWidth / 2 - 0.15, z: 30.1 },
        { x: walkwayWidth / 2 + 0.15, z: 30.1 }
      ];

      pylonPositions.forEach((pos, pIdx) => {
        const pylonGroup = new THREE.Group();
        pylonGroup.position.set(pos.x, 0, pos.z);

        // Pedestal base
        const baseGeo = new THREE.CylinderGeometry(0.26, 0.32, 0.6, 8);
        const base = new THREE.Mesh(baseGeo, darkPillarMat);
        base.position.y = 0.3;
        pylonGroup.add(base);

        // Pylon shaft
        const shaftGeo = new THREE.CylinderGeometry(0.18, 0.22, 1.6, 8);
        const shaft = new THREE.Mesh(shaftGeo, darkPillarMat);
        shaft.position.y = 1.4;
        pylonGroup.add(shaft);

        // Gold decorative ring
        const ringGeo = new THREE.TorusGeometry(0.22, 0.035, 6, 16);
        ringGeo.rotateX(Math.PI / 2);
        const ring = new THREE.Mesh(ringGeo, goldTrimMat);
        ring.position.y = 2.22;
        pylonGroup.add(ring);

        // Floating glowing crystal beacon
        const gemGeo = new THREE.OctahedronGeometry(0.22, 0);
        const gem = new THREE.Mesh(gemGeo, glowGemMat);
        gem.position.y = 2.6;
        pylonGroup.add(gem);

        causeway.add(pylonGroup);

        this.animatedObjects.push({
          tick: (delta, elapsed) => {
            gem.rotation.y += delta * 1.5;
            gem.position.y = 2.6 + Math.sin(elapsed * 2.5 + pIdx) * 0.08;
          }
        });
      });

      // 6. Structural Support Keel Underneath
      const keelGeo = new THREE.BoxGeometry(3.6, 1.2, spanLength - 0.8);
      const keel = new THREE.Mesh(keelGeo, underKeelMat);
      keel.position.set(0, -0.9, centerZ);
      causeway.add(keel);

      // Gold keel rib braces
      [-2, 2].forEach(kz => {
        const ribGeo = new THREE.BoxGeometry(3.8, 0.1, 0.25);
        const rib = new THREE.Mesh(ribGeo, goldTrimMat);
        rib.position.set(0, -1.2, centerZ + kz);
        causeway.add(rib);
      });

      // Apply Cardinal Rotation
      causeway.rotation.y = cfg.rotY;
      this.scene.add(causeway);
    });
  }

  // 1. NORTH: The Monolith of Genesis (Creator Dossier / Lore)
  initGenesisShrine() {
    const data = SHRINES.GENESIS;
    const island = this.createFloatingIsland(18, 5);
    island.position.set(data.position.x, data.position.y, data.position.z);
    this.scene.add(island);

    const shrineGroup = new THREE.Group();
    shrineGroup.position.set(data.position.x, 0, data.position.z);

    // The Colossal Levitating Pure Alabaster & Gold Monolith
    const monoGeo = new THREE.BoxGeometry(4.0, 15, 2.2);
    const monoMat = new THREE.MeshStandardMaterial({
      map: this.marbleTex,
      roughness: 0.2,
      metalness: 0.2
    });
    const monolith = new THREE.Mesh(monoGeo, monoMat);
    monolith.position.y = 9.0;
    monolith.castShadow = true;
    shrineGroup.add(monolith);

    // Vertical Golden Energy Seam down the center
    const seamGeo = new THREE.BoxGeometry(0.5, 15.2, 2.35);
    const seamMat = new THREE.MeshStandardMaterial({
      color: 0xffcc00,
      emissive: 0xffcc00,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.95
    });
    const seam = new THREE.Mesh(seamGeo, seamMat);
    seam.position.y = 9.0;
    shrineGroup.add(seam);

    // Golden Rune Bands across monolith surface
    const runeCount = 5;
    for (let i = 0; i < runeCount; i++) {
      const runeBandGeo = new THREE.BoxGeometry(4.25, 0.45, 2.45);
      const runeBandMat = new THREE.MeshBasicMaterial({
        color: 0xffaa00
      });
      const runeBand = new THREE.Mesh(runeBandGeo, runeBandMat);
      runeBand.position.y = 4.5 + i * 2.2;
      shrineGroup.add(runeBand);
    }

    // Floating Crown Crystal atop the Monolith
    const crownGeo = new THREE.OctahedronGeometry(1.4, 0);
    const crownMat = new THREE.MeshBasicMaterial({
      color: 0xffd700
    });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.y = 18.0;
    shrineGroup.add(crown);

    // Vertical Golden Beam into the Heavens
    const beamGeo = new THREE.CylinderGeometry(0.3, 0.8, 100, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffe066,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 60;
    shrineGroup.add(beam);

    // Concentric Levitating Runic Disc at the base
    const discGeo = new THREE.RingGeometry(2.5, 7.5, 32);
    discGeo.rotateX(-Math.PI / 2);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.y = 0.08;
    shrineGroup.add(disc);

    // Luminous Shrine Point Light
    const beaconLight = new THREE.PointLight(0xffd700, 8.0, 40);
    beaconLight.position.set(0, 8, 0);
    shrineGroup.add(beaconLight);

    // 4 Perimeter Braziers on Genesis Island (placed along diagonals to frame the island and causeway)
    [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4].forEach((ang, i) => {
      const bx = Math.cos(ang) * 14;
      const bz = Math.sin(ang) * 14;
      const brPillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.5, 3.5, 8),
        new THREE.MeshBasicMaterial({ color: 0x64748b })
      );
      brPillar.position.set(bx, 1.75, bz);
      shrineGroup.add(brPillar);

      const brFlame = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.4),
        new THREE.MeshBasicMaterial({
          color: 0xffaa00
        })
      );
      brFlame.position.set(bx, 4.0, bz);
      shrineGroup.add(brFlame);

      this.animatedObjects.push({
        tick: (delta, elapsed) => {
          brFlame.rotation.y += delta * 2;
          brFlame.position.y = 4.0 + Math.sin(elapsed * 3 + i) * 0.15;
        }
      });
    });

    this.scene.add(shrineGroup);

    // Register as interactive shrine
    this.interactiveObjects.push({
      id: data.id,
      name: data.name,
      subtitle: data.subtitle,
      position: new THREE.Vector3(data.position.x, 2, data.position.z),
      interactRadius: 14,
      data: data,
      mesh: monolith
    });

    this.animatedObjects.push({
      tick: (delta, elapsed) => {
        monolith.rotation.y += delta * 0.3;
        monolith.position.y = 8.5 + Math.sin(elapsed * 1.5) * 0.4;
        disc.rotation.z -= delta * 0.5;
      }
    });
  }

  // 2. EAST: The Vault of Creations (4 3D Animated Project Relics)
  initVaultShrine() {
    const data = SHRINES.VAULT;
    const island = this.createFloatingIsland(19, 5);
    island.position.set(data.position.x, data.position.y, data.position.z);
    this.scene.add(island);

    const vaultGroup = new THREE.Group();
    vaultGroup.position.set(data.position.x, 0, data.position.z);

    // Central Vault Core Monolith
    const centralPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2.5, 3.5, 6),
      new THREE.MeshBasicMaterial({ color: 0x334155 })
    );
    centralPillar.position.y = 1.75;
    vaultGroup.add(centralPillar);

    const vaultCrystal = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.4, 1),
      new THREE.MeshBasicMaterial({
        color: 0x00e5ff
      })
    );
    vaultCrystal.position.y = 4.8;
    vaultGroup.add(vaultCrystal);

    this.scene.add(vaultGroup);

    // Build the 4 Project Relic Pedestals
    data.projects.forEach((proj, idx) => {
      const relicPos = new THREE.Vector3(
        data.position.x + proj.offset.x,
        0,
        data.position.z + proj.offset.z
      );

      const pedGroup = new THREE.Group();
      pedGroup.position.copy(relicPos);

      // Pedestal Base
      const baseGeo = new THREE.CylinderGeometry(1.6, 2.0, 1.8, 8);
      const baseMat = new THREE.MeshBasicMaterial({
        color: 0x475569
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.9;
      pedGroup.add(base);

      // Glowing Pedestal Ring
      const pRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.7, 0.08, 8, 24),
        new THREE.MeshBasicMaterial({
          color: proj.color
        })
      );
      pRing.rotation.x = Math.PI / 2;
      pRing.position.y = 1.82;
      pedGroup.add(pRing);

      // Build Unique 3D Relic Shape
      let relicMesh;
      if (proj.relicType === 'polyhedron') {
        // ChronoCore: Morphing Neural Dodecahedron with inner core
        const rGroup = new THREE.Group();
        const outer = new THREE.Mesh(
          new THREE.DodecahedronGeometry(1.1, 0),
          new THREE.MeshBasicMaterial({
            color: proj.color,
            wireframe: true
          })
        );
        const inner = new THREE.Mesh(
          new THREE.SphereGeometry(0.65, 16, 16),
          new THREE.MeshBasicMaterial({
            color: 0xffffff
          })
        );
        rGroup.add(outer, inner);
        relicMesh = rGroup;
      } else if (proj.relicType === 'planet') {
        // Hyperion: Procedural Orbiting Planet with golden rings
        const rGroup = new THREE.Group();
        const planet = new THREE.Mesh(
          new THREE.SphereGeometry(0.9, 24, 24),
          new THREE.MeshBasicMaterial({
            color: 0x00ffcc
          })
        );
        const rings = new THREE.Mesh(
          new THREE.RingGeometry(1.3, 1.8, 32),
          new THREE.MeshBasicMaterial({
            color: 0xffd700,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
          })
        );
        rings.rotation.x = Math.PI / 3;
        rGroup.add(planet, rings);
        relicMesh = rGroup;
      } else if (proj.relicType === 'tesseract') {
        // Nexus: Shimmering 4D Tesseract
        const rGroup = new THREE.Group();
        const outerBox = new THREE.Mesh(
          new THREE.BoxGeometry(1.4, 1.4, 1.4),
          new THREE.MeshBasicMaterial({
            color: proj.color,
            wireframe: true
          })
        );
        const innerBox = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.8, 0.8),
          new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true
          })
        );
        rGroup.add(outerBox, innerBox);
        relicMesh = rGroup;
      } else {
        // CyberSanctum: Floating cyber crystal
        const rGroup = new THREE.Group();
        const crys = new THREE.Mesh(
          new THREE.ConeGeometry(0.9, 2.0, 5),
          new THREE.MeshBasicMaterial({
            color: proj.color
          })
        );
        rGroup.add(crys);
        relicMesh = rGroup;
      }

      relicMesh.position.y = 3.6;
      pedGroup.add(relicMesh);

      // Light beam for each relic
      const rLight = new THREE.PointLight(proj.color, 2.5, 8);
      rLight.position.y = 3.6;
      pedGroup.add(rLight);

      this.scene.add(pedGroup);

      // Register interactive relic
      this.interactiveObjects.push({
        id: proj.id,
        name: proj.name,
        subtitle: proj.category,
        position: relicPos.clone().setY(2),
        interactRadius: 6,
        data: {
          ...proj,
          isProjectRelic: true,
          shrineParent: data
        },
        mesh: relicMesh
      });

      this.animatedObjects.push({
        tick: (delta, elapsed) => {
          relicMesh.rotation.y += delta * 1.1;
          relicMesh.rotation.x += delta * 0.4;
          relicMesh.position.y = 3.6 + Math.sin(elapsed * 2.5 + idx) * 0.25;
        }
      });
    });

    // Register Vault main shrine
    this.interactiveObjects.push({
      id: data.id,
      name: data.name,
      subtitle: data.subtitle,
      position: new THREE.Vector3(data.position.x, 2, data.position.z),
      interactRadius: 14,
      data: data,
      mesh: vaultCrystal
    });

    this.animatedObjects.push({
      tick: (delta, elapsed) => {
        vaultCrystal.rotation.y += delta * 0.9;
        vaultCrystal.rotation.z += delta * 0.5;
        vaultCrystal.position.y = 4.8 + Math.sin(elapsed * 2) * 0.3;
      }
    });
  }

  // 3. SOUTH: The Spire of Omnipotence (4 Elemental Skill Columns)
  initSpireShrine() {
    const data = SHRINES.SPIRE;
    const island = this.createFloatingIsland(18, 5);
    island.position.set(data.position.x, data.position.y, data.position.z);
    this.scene.add(island);

    const spireGroup = new THREE.Group();
    spireGroup.position.set(data.position.x, 0, data.position.z);

    // Central Astral Dais
    const centralStone = new THREE.Mesh(
      new THREE.CylinderGeometry(3.0, 3.8, 1.4, 8),
      new THREE.MeshBasicMaterial({ color: 0x581c87 })
    );
    centralStone.position.y = 0.7;
    spireGroup.add(centralStone);

    // 4 Elemental Skill Pillars
    const pillarPositions = [
      { x: -5, z: -5, color: 0x38bdf8 }, // Frontend Cyan
      { x: 5, z: -5, color: 0xf59e0b },  // Backend Amber
      { x: -5, z: 5, color: 0xec4899 },  // AI Magenta
      { x: 5, z: 5, color: 0x10b981 }   // DevOps Emerald
    ];

    pillarPositions.forEach((pos, idx) => {
      const colGeo = new THREE.BoxGeometry(1.2, 10, 1.2);
      const colMat = new THREE.MeshBasicMaterial({
        color: 0x334155
      });
      const pillar = new THREE.Mesh(colGeo, colMat);
      pillar.position.set(pos.x, 5.0, pos.z);
      spireGroup.add(pillar);

      // Glowing vertical energy core strip
      const stripGeo = new THREE.BoxGeometry(0.3, 9.8, 1.25);
      const stripMat = new THREE.MeshBasicMaterial({
        color: pos.color
      });
      const strip = new THREE.Mesh(stripGeo, stripMat);
      strip.position.set(pos.x, 5.0, pos.z);
      spireGroup.add(strip);

      // Floating Elemental Sigil / Gem on top of pillar
      const gemGeo = new THREE.OctahedronGeometry(0.9, 0);
      const gemMat = new THREE.MeshBasicMaterial({
        color: pos.color
      });
      const gem = new THREE.Mesh(gemGeo, gemMat);
      gem.position.set(pos.x, 11.2, pos.z);
      spireGroup.add(gem);

      // Sky Beam
      const beamGeo = new THREE.CylinderGeometry(0.25, 0.5, 100, 8);
      const beamMat = new THREE.MeshBasicMaterial({
        color: pos.color,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(pos.x, 50, pos.z);
      spireGroup.add(beam);

      this.animatedObjects.push({
        tick: (delta, elapsed) => {
          gem.rotation.y += delta * 1.5;
          gem.position.y = 11.2 + Math.sin(elapsed * 2 + idx) * 0.3;
        }
      });
    });

    this.scene.add(spireGroup);

    // Register interactive spire
    this.interactiveObjects.push({
      id: data.id,
      name: data.name,
      subtitle: data.subtitle,
      position: new THREE.Vector3(data.position.x, 2, data.position.z),
      interactRadius: 14,
      data: data,
      mesh: centralStone
    });
  }

  // 4. WEST: The Celestial Beacon (Contact / Transmission Altar)
  initBeaconShrine() {
    const data = SHRINES.BEACON;
    const island = this.createFloatingIsland(18, 5);
    island.position.set(data.position.x, data.position.y, data.position.z);
    this.scene.add(island);

    const beaconGroup = new THREE.Group();
    beaconGroup.position.set(data.position.x, 0, data.position.z);

    // Tiered Golden Altar Steps
    for (let step = 0; step < 3; step++) {
      const stepR = 5.0 - step * 1.2;
      const stepGeo = new THREE.CylinderGeometry(stepR, stepR + 0.3, 0.5, 16);
      const stepMat = new THREE.MeshBasicMaterial({
        color: 0x065f46
      });
      const stepMesh = new THREE.Mesh(stepGeo, stepMat);
      stepMesh.position.y = step * 0.5 + 0.25;
      beaconGroup.add(stepMesh);
    }

    // Swirling Translucent Communion Sphere
    const orbGeo = new THREE.SphereGeometry(1.6, 32, 32);
    const orbMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.85
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.y = 4.2;
    beaconGroup.add(orb);

    // Vertical Emerald Beacon Beam into the heavens
    const beamGeo = new THREE.CylinderGeometry(0.3, 0.8, 100, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const bBeam = new THREE.Mesh(beamGeo, beamMat);
    bBeam.position.y = 50;
    beaconGroup.add(bBeam);

    // Orbiting Emerald Rings
    const ringGeo = new THREE.TorusGeometry(2.4, 0.08, 8, 36);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x34d399
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.position.y = 4.2;
    ring1.rotation.x = Math.PI / 4;
    beaconGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.position.y = 4.2;
    ring2.rotation.y = Math.PI / 4;
    beaconGroup.add(ring2);

    // Celestial Braziers around the altar
    const brazierAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    brazierAngles.forEach((ang, i) => {
      const bx = Math.cos(ang) * 9;
      const bz = Math.sin(ang) * 9;

      const brPillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.6, 3.2, 8),
        new THREE.MeshBasicMaterial({ color: 0x374151 })
      );
      brPillar.position.set(bx, 1.6, bz);
      beaconGroup.add(brPillar);

      const brBowl = new THREE.Mesh(
        new THREE.ConeGeometry(0.9, 0.7, 8),
        new THREE.MeshBasicMaterial({ color: 0xffd700 })
      );
      brBowl.rotation.x = Math.PI;
      brBowl.position.set(bx, 3.3, bz);
      beaconGroup.add(brBowl);

      // Flame
      const brFlame = new THREE.Mesh(
        new THREE.TetrahedronGeometry(0.35, 1),
        new THREE.MeshBasicMaterial({
          color: 0x34d399
        })
      );
      brFlame.position.set(bx, 3.8, bz);
      beaconGroup.add(brFlame);

      this.animatedObjects.push({
        tick: (delta, elapsed) => {
          brFlame.rotation.y += delta * 2.5;
          brFlame.position.y = 3.8 + Math.sin(elapsed * 4 + i) * 0.12;
        }
      });
    });

    this.scene.add(beaconGroup);

    // Register interactive beacon
    this.interactiveObjects.push({
      id: data.id,
      name: data.name,
      subtitle: data.subtitle,
      position: new THREE.Vector3(data.position.x, 2, data.position.z),
      interactRadius: 14,
      data: data,
      mesh: orb
    });

    this.animatedObjects.push({
      tick: (delta, elapsed) => {
        orb.rotation.y += delta * 0.6;
        orb.position.y = 4.2 + Math.sin(elapsed * 2) * 0.25;
        ring1.rotation.x += delta * 1.3;
        ring2.rotation.y += delta * 1.1;
      }
    });
  }

  update(delta, elapsed) {
    // Tick liquid ether reflecting pool caustics
    if (this.etherPool) {
      this.etherPool.update(delta, elapsed);
    }

    // Tick starfield slight rotation
    if (this.starfield) {
      this.starfield.rotation.y += delta * 0.008;
    }

    // Tick all animated world entities
    for (let i = 0; i < this.animatedObjects.length; i++) {
      this.animatedObjects[i].tick(delta, elapsed);
    }
  }
}
