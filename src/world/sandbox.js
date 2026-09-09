import * as THREE from 'three';
import { audioSystem } from '../audio/synth.js';

export class GenesisSandbox {
  constructor(scene, camera, expanse, hud, vfx) {
    this.scene = scene;
    this.camera = camera;
    this.expanse = expanse;
    this.hud = hud;
    this.vfx = vfx;

    this.isActive = false;
    this.currentTool = 'island'; // 'island' | 'bridge' | 'crystal'
    this.materialType = 'marble'; // 'marble' | 'rune' | 'rock'
    this.islandRadius = 18;

    this.selectedBridgeStart = null;
    this.fabricatedObjects = [];

    this.initReticle();
  }

  initReticle() {
    this.reticleGroup = new THREE.Group();

    // 1. Glowing ground projection ring
    const ringGeo = new THREE.RingGeometry(this.islandRadius - 1, this.islandRadius, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75
    });
    this.ring = new THREE.Mesh(ringGeo, ringMat);
    this.reticleGroup.add(this.ring);

    // 2. Vertical beacon beam
    const beamGeo = new THREE.CylinderGeometry(0.2, 0.2, 25, 8);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 12.5;
    this.reticleGroup.add(beam);

    this.reticleGroup.visible = false;
    this.scene.add(this.reticleGroup);
  }

  toggle() {
    this.isActive = !this.isActive;
    this.reticleGroup.visible = this.isActive;
    this.selectedBridgeStart = null;

    if (this.hud) {
      this.hud.toggleGenesisToolbar(this.isActive);
      if (this.isActive) {
        this.hud.showNotification('🔨 Genesis World-Fabrication Mode Activated [G]', 'success');
        audioSystem.playGenesisSpawn();
      } else {
        this.hud.showNotification('Deity Genesis Mode Exited', 'info');
      }
    }
  }

  setTool(tool) {
    this.currentTool = tool;
    this.selectedBridgeStart = null;
    if (this.hud) {
      this.hud.showNotification(`Genesis Tool: ${tool.toUpperCase()}`, 'info');
    }
  }

  setMaterial(mat) {
    this.materialType = mat;
    if (this.hud) {
      this.hud.showNotification(`Material Selected: ${mat.toUpperCase()}`, 'info');
    }
  }

  update(delta, playerPos) {
    if (!this.isActive) return;

    // Project reticle ~32m in front of camera
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);

    // Place at player elevation or slightly below
    const targetX = playerPos.x + dir.x * 32;
    const targetY = Math.round((playerPos.y + dir.y * 20) / 2) * 2;
    const targetZ = playerPos.z + dir.z * 32;

    this.reticleGroup.position.set(targetX, targetY, targetZ);
    this.ring.rotation.z += delta * 0.8;
  }

  // Primary action: click to fabricate at reticle position
  fabricateAtReticle() {
    if (!this.isActive) return;
    const pos = this.reticleGroup.position.clone();

    if (this.currentTool === 'island') {
      this.fabricateIsland(pos.x, pos.y, pos.z);
    } else if (this.currentTool === 'bridge') {
      this.handleBridgeClick(pos);
    } else if (this.currentTool === 'crystal') {
      this.fabricateCrystal(pos.x, pos.y, pos.z);
    }
  }

  fabricateIsland(x, y, z) {
    if (!this.expanse) return;
    if (typeof x === 'object' && x !== null) {
      z = x.z;
      y = x.y;
      x = x.x;
    }

    // Use AstralExpanse's tested createCragIsland method
    const island = this.expanse.createCragIsland(x, y, z, this.islandRadius, 14, this.materialType);
    this.fabricatedObjects.push({ type: 'island', obj: island, x, y, z, radius: this.islandRadius });

    audioSystem.playGenesisSpawn();
    if (this.vfx) {
      this.vfx.triggerApotheosisCelebration();
    }
    if (this.hud) {
      this.hud.showNotification(`✦ Fabricated ${this.materialType.toUpperCase()} Island at (${Math.round(x)}, ${Math.round(y)}, ${Math.round(z)})`, 'success');
    }
  }

  handleBridgeClick(pos) {
    if (!this.selectedBridgeStart) {
      this.selectedBridgeStart = pos.clone();
      if (this.hud) {
        this.hud.showNotification('Bridge Origin Set. Click destination coordinate to weave Ley-Line!', 'info');
      }
      audioSystem.playHoverStep();
    } else {
      const start = this.selectedBridgeStart;
      const end = pos.clone();
      this.selectedBridgeStart = null;

      this.fabricateBridge(start, end);
    }
  }

  fabricateBridge(start, end) {
    if (!this.expanse) return;

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dz = end.z - start.z;
    const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (length < 8) {
      if (this.hud) this.hud.showNotification('Bridge span too short!', 'warning');
      return;
    }

    const bridgeGroup = new THREE.Group();
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const midZ = (start.z + end.z) / 2;
    bridgeGroup.position.set(midX, midY, midZ);

    const bridgeGeo = new THREE.BoxGeometry(6, 0.4, length);
    const bridgeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const bridgeMesh = new THREE.Mesh(bridgeGeo, bridgeMat);

    // Orient towards destination
    bridgeMesh.lookAt(end.x - midX, end.y - midY, end.z - midZ);
    bridgeGroup.add(bridgeMesh);

    this.scene.add(bridgeGroup);

    // Register into expanse.bridges and vfx.leyLineWalkways for collision
    if (this.expanse) {
      if (!this.expanse.bridges) this.expanse.bridges = [];
      this.expanse.bridges.push({
        startX: start.x,
        startY: start.y,
        startZ: start.z,
        endX: end.x,
        endY: end.y,
        endZ: end.z,
        width: 6,
        mesh: bridgeMesh
      });
    }

    if (this.vfx && this.vfx.leyLineWalkways) {
      this.vfx.leyLineWalkways.push({
        start: { x: start.x, z: start.z },
        end: { x: end.x, z: end.z },
        startY: start.y,
        endY: end.y,
        width: 6
      });
    }

    this.fabricatedObjects.push({ type: 'bridge', group: bridgeGroup });
    audioSystem.playLeyLineIgnition();

    if (this.hud) {
      this.hud.showNotification(`🌈 Wove Ley-Line Bridge (${Math.round(length)}m span)!`, 'success');
    }
  }

  fabricateCrystal(x, y, z) {
    if (typeof x === 'object' && x !== null) {
      z = x.z;
      y = x.y;
      x = x.x;
    }
    const cHeight = 14;
    const cGeo = new THREE.ConeGeometry(1.6, cHeight, 6);
    const cMat = new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      emissive: 0xa855f7,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.9
    });
    const crystal = new THREE.Mesh(cGeo, cMat);
    crystal.position.set(x, y + cHeight / 2, z);

    const cLight = new THREE.PointLight(0xc084fc, 3.5, 30);
    cLight.position.set(x, y + cHeight, z);

    const cGroup = new THREE.Group();
    cGroup.add(crystal);
    cGroup.add(cLight);
    this.scene.add(cGroup);

    this.fabricatedObjects.push({ type: 'crystal', group: cGroup });
    audioSystem.playGenesisSpawn();

    if (this.hud) {
      this.hud.showNotification(`💎 Materialized Aether Crystal Spire!`, 'success');
    }
  }

  dematerializeLast() {
    if (this.fabricatedObjects.length === 0) {
      if (this.hud) this.hud.showNotification('No fabricated objects to dematerialize.', 'warning');
      return;
    }
    const last = this.fabricatedObjects.pop();
    if (last.obj) {
      this.scene.remove(last.obj);
      // Remove from landmasses
      const idx = this.expanse.landmasses.findIndex(lm => lm.x === last.x && lm.z === last.z);
      if (idx !== -1) this.expanse.landmasses.splice(idx, 1);
    }
    if (last.group) {
      this.scene.remove(last.group);
    }
    audioSystem.playHoverStep();
    if (this.hud) {
      this.hud.showNotification('Dematerialized last fabricated structure.', 'info');
    }
  }
}
