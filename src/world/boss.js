import * as THREE from 'three';
import { audioSystem } from '../audio/synth.js';

export class VoidLeviathan {
  constructor(scene, vfx, hud) {
    this.scene = scene;
    this.vfx = vfx;
    this.hud = hud;

    this.isSpawned = false;
    this.isDead = false;
    this.maxHp = 1000;
    this.hp = 1000;
    this.phase = 1;

    this.segmentCount = 14;
    this.segments = [];
    this.headPos = new THREE.Vector3(0, 110, -250);
    this.targetHeadPos = new THREE.Vector3();
    this.speed = 28;
    this.angle = 0;

    this.group = new THREE.Group();
    this.scene.add(this.group);
  }

  spawn() {
    if (this.isSpawned) return;
    this.isSpawned = true;
    this.isDead = false;
    this.hp = this.maxHp;
    this.phase = 1;

    this.initBody();
    audioSystem.playBossRoar();

    if (this.hud) {
      this.hud.showBossHealthBar('Ouroboros, The Null-Serpent', this.hp, this.maxHp);
      this.hud.showNotification('⚠️ ASTRAL CRISIS: Ouroboros has breached the Event Horizon!', 'warning');
    }
  }

  initBody() {
    // Clear old meshes
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
    this.segments = [];

    // 1. Dragon Head
    const headGeo = new THREE.ConeGeometry(4.5, 14, 6);
    headGeo.rotateX(Math.PI / 2);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.8
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.copy(this.headPos);
    this.group.add(headMesh);

    // Glowing Eyes
    const eyeGeo = new THREE.SphereGeometry(0.8, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-2, 1.5, -3);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(2, 1.5, -3);
    headMesh.add(eyeL);
    headMesh.add(eyeR);

    this.headMesh = headMesh;

    // Head Core Light
    this.headLight = new THREE.PointLight(0xa855f7, 45, 120);
    headMesh.add(this.headLight);

    // 2. Trailing Vertebrae Segments
    for (let i = 0; i < this.segmentCount; i++) {
      const radius = Math.max(1.8, 4.0 - i * 0.18);
      const segGeo = new THREE.TorusGeometry(radius, 0.7, 6, 18);
      const segMat = new THREE.MeshStandardMaterial({
        color: 0x18181b,
        emissive: i % 2 === 0 ? 0x7c3aed : 0x10b981,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.7
      });
      const segMesh = new THREE.Mesh(segGeo, segMat);
      const segPos = new THREE.Vector3(0, 110, -250 + (i + 1) * 7);
      segMesh.position.copy(segPos);
      this.group.add(segMesh);

      this.segments.push({
        mesh: segMesh,
        pos: segPos,
        radius
      });
    }
  }

  takeDamage(amt, powerType = 'smite') {
    if (!this.isSpawned || this.isDead) return;

    // Vulnerability multipliers based on combat phase
    let mult = 1.0;
    if (this.phase === 2 && (powerType === 'meteor' || powerType === 'graviton')) {
      mult = 2.0;
    } else if (this.phase === 3 && powerType === 'singularity') {
      mult = 2.5;
    }

    this.hp = Math.max(0, this.hp - amt * mult);
    audioSystem.playHoverStep();

    // Flash head light
    if (this.headLight) {
      this.headLight.intensity = 90;
      setTimeout(() => { if (this.headLight) this.headLight.intensity = 45; }, 100);
    }

    if (this.hud) {
      this.hud.updateBossHealth(this.hp, this.maxHp);
    }

    // Phase transitions
    if (this.hp <= 600 && this.phase === 1) {
      this.phase = 2;
      this.speed = 36;
      audioSystem.playBossRoar();
      if (this.hud) this.hud.showNotification('⚡ Phase 2: Ouroboros sheds outer armor! Smash with Meteor [1] / Graviton [2]!', 'warning');
    } else if (this.hp <= 250 && this.phase === 2) {
      this.phase = 3;
      this.speed = 44;
      audioSystem.playBossRoar();
      if (this.hud) this.hud.showNotification('🌌 Phase 3: Core exposed! Trap in Singularity Vortex [4]!', 'warning');
    } else if (this.hp <= 0) {
      this.defeat();
    }
  }

  defeat() {
    this.isDead = true;
    this.isSpawned = false;
    audioSystem.playTrialSuccess();

    if (this.vfx) {
      this.vfx.triggerApotheosisCelebration();
      this.vfx.triggerDivineSmite(this.headMesh.position);
    }

    if (this.hud) {
      this.hud.hideBossHealthBar();
      this.hud.showNotification('🏆 VICTORY: Ouroboros has been purged back into the cosmic void!', 'success');
    }

    // Explode meshes
    setTimeout(() => {
      while (this.group.children.length > 0) {
        this.group.remove(this.group.children[0]);
      }
    }, 2500);
  }

  update(delta, elapsed, playerPos) {
    if (!this.isSpawned || this.isDead || !this.headMesh) return;

    // Autonomous Flight AI: Serpentine orbit in high altitude around Citadel
    this.angle += delta * 0.18;
    const orbitRadius = 180 + Math.sin(elapsed * 0.5) * 45;
    const alt = 85 + Math.sin(elapsed * 0.8) * 35;

    this.targetHeadPos.set(
      Math.cos(this.angle) * orbitRadius,
      alt,
      Math.sin(this.angle) * orbitRadius
    );

    // Steer head toward target
    this.headPos.lerp(this.targetHeadPos, delta * 2.5);
    this.headMesh.position.copy(this.headPos);
    this.headMesh.lookAt(this.targetHeadPos);

    // Inverse Kinematics Body Trailing
    let prevPos = this.headPos;
    for (let i = 0; i < this.segments.length; i++) {
      const seg = this.segments[i];
      const dir = new THREE.Vector3().subVectors(seg.pos, prevPos);
      const dist = dir.length();
      const targetDist = 5.5;

      if (dist > targetDist) {
        dir.normalize().multiplyScalar(targetDist);
        seg.pos.copy(prevPos).add(dir);
      }

      // Add gentle sinusoidal undulating spine motion
      const wave = Math.sin(elapsed * 3.5 - i * 0.4) * 0.4;
      seg.mesh.position.set(seg.pos.x, seg.pos.y + wave, seg.pos.z);
      seg.mesh.lookAt(prevPos);
      prevPos = seg.pos;
    }
  }
}
