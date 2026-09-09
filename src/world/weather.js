import * as THREE from 'three';
import { audioSystem } from '../audio/synth.js';

export class CosmicWeather {
  constructor(scene, hud, player) {
    this.scene = scene;
    this.hud = hud;
    this.player = player;

    this.currentAnomaly = null;
    this.anomalyTimer = 0;
    this.anomalyDuration = 18; // seconds

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.initAurora();
    this.initMeteors();
  }

  initAurora() {
    // Shimmering northern lights / solar flare curtain
    const auroraGeo = new THREE.PlaneGeometry(600, 180, 24, 12);
    const auroraMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending
    });
    this.auroraMesh = new THREE.Mesh(auroraGeo, auroraMat);
    this.auroraMesh.position.set(0, 220, -150);
    this.auroraMesh.rotation.x = Math.PI / 4;
    this.group.add(this.auroraMesh);
  }

  initMeteors() {
    this.meteors = [];
    const mGeo = new THREE.SphereGeometry(0.6, 6, 6);
    const mMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

    for (let i = 0; i < 20; i++) {
      const mesh = new THREE.Mesh(mGeo, mMat);
      mesh.visible = false;
      this.group.add(mesh);
      this.meteors.push({
        mesh,
        velocity: new THREE.Vector3(),
        active: false
      });
    }
  }

  triggerAnomaly(type = 'aurora') {
    this.currentAnomaly = type;
    this.anomalyTimer = this.anomalyDuration;
    audioSystem.playWeatherAnomaly();

    if (type === 'aurora') {
      if (this.hud) this.hud.showNotification('☀️ COSMIC ANOMALY: Solar Flare Aurora! Flight speed doubled & infinite energy!', 'success');
      if (this.auroraMesh) this.auroraMesh.material.opacity = 0.45;
    } else if (type === 'gravity') {
      if (this.hud) this.hud.showNotification('🪐 COSMIC ANOMALY: Gravitational Inversion Wave! Tensors reversed!', 'warning');
    } else if (type === 'meteors') {
      if (this.hud) this.hud.showNotification('☄️ COSMIC ANOMALY: Celestial Meteor Deluge! Gather falling starlight!', 'info');
      this.spawnMeteorShower();
    }
  }

  spawnMeteorShower() {
    if (!this.player) return;
    const px = this.player.position.x;
    const pz = this.player.position.z;

    this.meteors.forEach((m, idx) => {
      setTimeout(() => {
        m.mesh.position.set(
          px + (Math.random() - 0.5) * 120,
          180 + Math.random() * 40,
          pz + (Math.random() - 0.5) * 120
        );
        m.velocity.set(
          (Math.random() - 0.5) * 20,
          -60 - Math.random() * 40,
          (Math.random() - 0.5) * 20
        );
        m.mesh.visible = true;
        m.active = true;
      }, idx * 300);
    });
  }

  update(delta, elapsed) {
    if (!this.currentAnomaly) return;

    this.anomalyTimer -= delta;

    if (this.currentAnomaly === 'aurora') {
      // Wave the aurora plane
      if (this.auroraMesh) {
        this.auroraMesh.rotation.y = Math.sin(elapsed * 0.4) * 0.15;
      }
      // Supercharge player
      if (this.player) {
        this.player.divineFavor = Math.min(100, (this.player.divineFavor || 0) + delta * 15);
      }
    } else if (this.currentAnomaly === 'gravity') {
      // Gentle anti-gravity levitation
      if (this.player && this.player.velocity) {
        this.player.velocity.y += delta * 12;
      }
    } else if (this.currentAnomaly === 'meteors') {
      // Update meteor positions
      this.meteors.forEach(m => {
        if (!m.active) return;
        m.mesh.position.addScaledVector(m.velocity, delta);

        // Check if hit ground or out of bounds
        if (m.mesh.position.y < -50) {
          m.active = false;
          m.mesh.visible = false;
        }

        // Collectable by player
        if (this.player && m.mesh.position.distanceTo(this.player.position) < 4.0) {
          m.active = false;
          m.mesh.visible = false;
          this.player.divineFavor = Math.min(100, (this.player.divineFavor || 0) + 20);
          audioSystem.playHoverStep();
          if (this.hud) this.hud.showNotification('✦ Collected Stardust Mote (+20 Favor)!', 'success');
        }
      });
    }

    if (this.anomalyTimer <= 0) {
      this.endAnomaly();
    }
  }

  endAnomaly() {
    if (this.auroraMesh) this.auroraMesh.material.opacity = 0.0;
    this.meteors.forEach(m => { m.active = false; m.mesh.visible = false; });
    this.currentAnomaly = null;
    if (this.hud) this.hud.showNotification('Cosmic weather anomaly stabilized.', 'info');
  }
}
