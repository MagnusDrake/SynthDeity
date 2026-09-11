import * as THREE from 'three';

export class EchoEidolon {
  constructor(scene, player, hud) {
    this.scene = scene;
    this.player = player;
    this.hud = hud;
    this.group = new THREE.Group();

    this.lastChatterTime = 0;
    this.targetPos = new THREE.Vector3();

    this.initMesh();
    this.scene.add(this.group);
  }

  initMesh() {
    // 1. Core Glowing Polyhedron
    const coreGeo = new THREE.IcosahedronGeometry(0.45, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.9,
      roughness: 0.1,
      metalness: 0.9
    });
    this.core = new THREE.Mesh(coreGeo, coreMat);
    this.group.add(this.core);

    // 2. Gyroscopic Concentric Orbit Rings
    this.rings = [];
    const ringRadii = [0.75, 0.95, 1.15];
    const ringColors = [0xfacc15, 0x38bdf8, 0x93c5fd];

    ringRadii.forEach((r, idx) => {
      const rGeo = new THREE.TorusGeometry(r, 0.03, 6, 24);
      const rMat = new THREE.MeshBasicMaterial({ color: ringColors[idx], wireframe: true });
      const ring = new THREE.Mesh(rGeo, rMat);
      this.group.add(ring);
      this.rings.push({
        mesh: ring,
        rotSpeedX: 0.8 + idx * 0.4,
        rotSpeedY: 0.5 - idx * 0.3
      });
    });

    // 3. Local Divine Point Light
    this.light = new THREE.PointLight(0xfbbf24, 2.5, 12);
    this.group.add(this.light);

    // Initial position above player
    if (this.player && this.player.position) {
      this.group.position.copy(this.player.position).add(new THREE.Vector3(2, 3, 2));
    }
  }

  update(delta, elapsed) {
    if (!this.player || !this.player.position) return;

    // Hover smoothly around player's right shoulder with gentle bobbing
    const bob = Math.sin(elapsed * 2.5) * 0.3;
    this.targetPos.set(
      this.player.position.x + 2.2,
      this.player.position.y + 2.6 + bob,
      this.player.position.z + 1.8
    );

    this.group.position.lerp(this.targetPos, 0.08);

    // Rotate core and gyroscopic rings
    if (this.core) {
      this.core.rotation.x += delta * 1.2;
      this.core.rotation.y += delta * 1.5;
    }
    this.rings.forEach(r => {
      r.mesh.rotation.x += delta * r.rotSpeedX;
      r.mesh.rotation.y += delta * r.rotSpeedY;
    });

    // Periodic Contextual Reactive Chatter
    if (elapsed - this.lastChatterTime > 25) {
      this.checkContextualTriggers(elapsed);
    }
  }

  checkContextualTriggers(elapsed) {
    if (!this.hud || !this.player) return;

    const pY = this.player.position.y;
    const favor = this.player.divineFavor || 100;

    if (pY > 80) {
      this.hud.showNotification('✦ Eidolon: "The stratosphere! The whole simulation stretches beneath us!"', 'info');
      this.lastChatterTime = elapsed;
    } else if (pY < -40 && !this.player.isFlying) {
      this.hud.showNotification('✦ Eidolon: "Careful, Deity! Engage flight [F] before the void claims your signal!"', 'warning');
      this.lastChatterTime = elapsed;
    } else if (favor < 25) {
      this.hud.showNotification('✦ Eidolon: "Your Divine Favor is depleted. Tap an obelisk or rest at a sanctuary."', 'info');
      this.lastChatterTime = elapsed;
    }
  }
}
