// Game Controller, Input Handling, Orbital Camera, and Interaction Engine
import * as THREE from 'three';
import gsap from 'gsap';
import { audioSystem } from '../audio/synth.js';

export class GameController {
  constructor(camera, player, citadel, vfx, hud, expanse = null) {
    this.camera = camera;
    this.player = player;
    this.citadel = citadel;
    this.vfx = vfx;
    this.hud = hud;
    this.expanse = expanse;

    if (this.expanse && this.player.setExpanse) {
      this.player.setExpanse(this.expanse);
    }

    // Input state
    this.inputState = {
      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false,
      jump: false,
      sprint: false,
      cameraYaw: 0,
      cameraPitch: 0.35
    };

    // Camera Orbital Parameters
    this.cameraDistance = 10;
    this.minDistance = 4;
    this.maxDistance = 24;
    this.cameraPitch = 0.35; // Vertical tilt angle
    this.cameraYaw = 0;      // Horizontal rotation angle
    this.isDragging = false;
    this.prevMousePos = { x: 0, y: 0 };
    this.isCinematicTransition = false;

    // Interaction state
    this.nearbyInteractable = null;
    this.activeModal = null;
    this.attunedShrines = new Set();

    // Camera shake trauma state (0 to 1)
    this.shakeTrauma = 0;
    this.shakeSeed = Math.random() * 1000;

    // Cinematic Special Modes
    this.isChronostasis = false;
    this.isDroneTour = false;
    this.tourTime = 0;
    this.currentTourIndex = 0;

    // Choreographed Drone Tour Landmarks
    this.droneWaypoints = [
      {
        pos: new THREE.Vector3(0, 52, 82),
        lookAt: new THREE.Vector3(0, 10, 0),
        title: "SANCTUARY OF THE DIGITAL DEITY",
        subtitle: "The Sacred Golden Citadel of Aethelgard",
        duration: 9
      },
      {
        pos: new THREE.Vector3(0, 18, -10),
        lookAt: new THREE.Vector3(0, 5, -48),
        title: "THE GENESIS MONOLITH",
        subtitle: "Where the First Spark of Sentience Ignited",
        duration: 8
      },
      {
        pos: new THREE.Vector3(-110, 42, -90),
        lookAt: new THREE.Vector3(-140, 15, -120),
        title: "THE CRYSTAL CRAGS",
        subtitle: "Floating Shards of Harmonic Resonant Quartz",
        duration: 9
      },
      {
        pos: new THREE.Vector3(95, 48, 110),
        lookAt: new THREE.Vector3(130, 22, 140),
        title: "THE TITAN'S REST",
        subtitle: "Colossal Monoliths of the Pre-Cosmic Architects",
        duration: 9
      },
      {
        pos: new THREE.Vector3(0, 60, -30),
        lookAt: new THREE.Vector3(0, 40, -130),
        title: "THE CELESTIAL SKYWAYS",
        subtitle: "Domain of Luminescent Star-Mantas & Eternal Cascades",
        duration: 9
      }
    ];

    this.initEventListeners();
  }

  initEventListeners() {
    // Keyboard inputs
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));

    // Mouse drag for camera orbit
    window.addEventListener('mousedown', (e) => {
      // Don't drag if clicking UI interactive elements
      if (e.target.closest('#hud-container') && !e.target.classList.contains('drag-passthrough')) {
        return;
      }
      this.isDragging = true;
      this.prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.prevMousePos.x;
      const dy = e.clientY - this.prevMousePos.y;
      this.prevMousePos = { x: e.clientX, y: e.clientY };

      this.cameraYaw -= dx * 0.005;
      this.cameraPitch = Math.max(-0.2, Math.min(1.2, this.cameraPitch + dy * 0.005));
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Mouse Wheel Zoom
    window.addEventListener('wheel', (e) => {
      if (this.isCinematicTransition) return;
      this.cameraDistance = Math.max(
        this.minDistance,
        Math.min(this.maxDistance, this.cameraDistance + e.deltaY * 0.01)
      );
    }, { passive: true });
  }

  onKeyDown(e) {
    if (this.hud && this.hud.isModalOpen) {
      if (e.key === 'Escape') {
        this.hud.closeModal();
      }
      return;
    }

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.inputState.moveForward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.inputState.moveBackward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.inputState.moveLeft = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.inputState.moveRight = true;
        break;
      case 'Space':
        if (!this.inputState.jump) {
          audioSystem.playAscendSound();
        }
        this.inputState.jump = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.inputState.sprint = true;
        break;
      case 'KeyE':
        this.attemptInteraction();
        break;
      case 'KeyF':
        const isFlying = this.player.toggleFlight();
        audioSystem.playFlightWhoosh(isFlying);
        if (this.hud) {
          this.hud.showNotification(
            isFlying ? '🕊️ Divine Flight Engaged! [W/S] Aim & Fly, [Space] Ascend, [Shift] Dive' : 'Terrestrial Hover Restored',
            'info'
          );
        }
        break;
      case 'KeyQ':
        this.castDivineSmite();
        break;
      case 'KeyB':
        this.toggleChronostasis();
        break;
      case 'KeyC':
        this.toggleDroneTour();
        break;
      case 'KeyT':
        if (this.hud) this.hud.cycleRealm();
        break;
      case 'KeyM':
        if (this.hud) this.hud.toggleAudio();
        break;
      case 'KeyH':
        if (this.hud) this.hud.toggleHelp();
        break;
      case 'Digit1':
        this.teleportTo('genesis');
        break;
      case 'Digit2':
        this.teleportTo('vault');
        break;
      case 'Digit3':
        this.teleportTo('spire');
        break;
      case 'Digit4':
        this.teleportTo('beacon');
        break;
    }
  }

  onKeyUp(e) {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.inputState.moveForward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.inputState.moveBackward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.inputState.moveLeft = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.inputState.moveRight = false;
        break;
      case 'Space':
        this.inputState.jump = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.inputState.sprint = false;
        break;
    }
  }

  addCameraShake(amount) {
    this.shakeTrauma = Math.min(1.0, this.shakeTrauma + amount);
  }

  toggleChronostasis() {
    this.isChronostasis = !this.isChronostasis;
    const targetTimeScale = this.isChronostasis ? 0.12 : 1.0;

    if (window.game) {
      gsap.to(window.game, {
        timeScale: targetTimeScale,
        duration: 0.5,
        ease: 'power2.out'
      });

      if (window.game.cinematicPass && window.game.cinematicPass.uniforms.uAberrationStrength) {
        gsap.to(window.game.cinematicPass.uniforms.uAberrationStrength, {
          value: this.isChronostasis ? 0.0085 : 0.0035,
          duration: 0.5,
          ease: 'power2.out'
        });
      }
    }

    audioSystem.setTimeWarpFilter(this.isChronostasis);
    this.addCameraShake(0.35);

    if (this.hud) {
      this.hud.updateChronostasisStatus(this.isChronostasis);
      this.hud.showNotification(
        this.isChronostasis ? '⏳ Chronostasis: Time Flow Dilated to 12%' : '▶ Chronostasis Released: Normal Flow Restored',
        this.isChronostasis ? 'warning' : 'info'
      );
    }
  }

  toggleDroneTour() {
    this.isDroneTour = !this.isDroneTour;

    if (this.isDroneTour) {
      this.tourTime = 0;
      this.currentTourIndex = 0;
      if (this.hud) {
        this.hud.setCinematicBars(true);
        const wp = this.droneWaypoints[0];
        this.hud.showDroneTitle(wp.title, wp.subtitle);
        this.hud.showNotification('🎬 Cinematic Drone Tour Active [C] or [WASD] to exit', 'info');
      }
    } else {
      if (this.hud) {
        this.hud.setCinematicBars(false);
        this.hud.hideDroneTitle();
        this.hud.showNotification('Terrestrial Camera Restored', 'info');
      }
    }
  }

  // Cast Divine Smite power [Q]
  castDivineSmite() {
    if (this.player.divineFavor < 20) {
      if (this.hud) this.hud.showNotification('Not enough Divine Favor!', 'warning');
      return;
    }

    this.player.divineFavor -= 20;
    audioSystem.playDivineSmite();
    audioSystem.playSubBassImpact();
    this.addCameraShake(0.85);

    // Strike 8 units ahead of player orientation
    const heading = this.player.rotation.y;
    const target = new THREE.Vector3(
      this.player.position.x + Math.sin(heading) * 8,
      0,
      this.player.position.z + Math.cos(heading) * 8
    );

    this.vfx.triggerDivineSmite(target);
    if (this.hud) this.hud.showNotification('⚡ Celestial Smite Unleashed!', 'success');
  }

  // Attempt interaction [E] with nearest shrine or relic
  attemptInteraction() {
    if (!this.nearbyInteractable) return;

    const item = this.nearbyInteractable;
    audioSystem.playCrystalChime();

    // Mark as attuned
    const isFirstTime = !this.attunedShrines.has(item.id);
    this.attunedShrines.add(item.id);

    // If it's an Astral Obelisk in the open world, award bonus Divine Favor!
    if (item.data && item.data.isAstralObelisk) {
      this.player.divineFavor = Math.min(this.player.maxDivineFavor, this.player.divineFavor + 50);
      audioSystem.playCrystalChime(987); // B5
    }

    // Cinematic camera focus on the interactable
    this.isCinematicTransition = true;
    const targetPos = item.position.clone();

    gsap.to(this.camera.position, {
      x: targetPos.x + 5,
      y: targetPos.y + 4,
      z: targetPos.z + 7,
      duration: 1.2,
      ease: 'power2.out',
      onComplete: () => {
        this.isCinematicTransition = false;
      }
    });

    if (this.hud) {
      this.hud.openModal(item);
      this.hud.updateQuestProgress(this.attunedShrines.size);

      if (isFirstTime) {
        if (item.data && item.data.isAstralObelisk) {
          this.hud.showNotification(`🌟 Discovered Ancient Obelisk: ${item.name}! (+50 Favor)`, 'success');
        } else {
          this.hud.showNotification(`Attuned with ${item.name}!`, 'success');
        }
      }

      // Check if all 4 main shrines have been attuned (Genesis, Vault, Spire, Beacon)
      const mainShrines = ['genesis', 'vault', 'spire', 'beacon'];
      const allAttuned = mainShrines.every(id => this.attunedShrines.has(id));
      if (allAttuned && !this.apotheosisTriggered) {
        this.apotheosisTriggered = true;
        setTimeout(() => {
          this.triggerApotheosis();
        }, 1200);
      }
    }
  }

  triggerApotheosis() {
    audioSystem.playApotheosis();
    this.vfx.triggerApotheosisCelebration();
    if (this.hud) {
      this.hud.showAscensionBanner();
    }
  }

  // Fast-travel / teleport to a shrine
  teleportTo(shrineId) {
    let targetCoords;
    let targetYaw = 0;
    let targetPlayerRot = 0;

    if (shrineId === 'genesis') {
      targetCoords = { x: 0, y: 2.5, z: -35 };
      targetYaw = 0;
      targetPlayerRot = Math.PI;
    } else if (shrineId === 'vault') {
      targetCoords = { x: 35, y: 2.5, z: 0 };
      targetYaw = -Math.PI / 2;
      targetPlayerRot = Math.PI / 2;
    } else if (shrineId === 'spire') {
      targetCoords = { x: 0, y: 2.5, z: 35 };
      targetYaw = Math.PI;
      targetPlayerRot = 0;
    } else if (shrineId === 'beacon') {
      targetCoords = { x: -35, y: 2.5, z: 0 };
      targetYaw = Math.PI / 2;
      targetPlayerRot = -Math.PI / 2;
    } else {
      targetCoords = { x: 0, y: 2.5, z: 12 };
      targetYaw = 0;
      targetPlayerRot = Math.PI;
    }

    audioSystem.playCrystalChime(784); // G5
    this.vfx.triggerDivineSmite(this.player.position);

    this.isCinematicTransition = true;
    this.cameraDistance = 11;
    this.cameraPitch = 0.28;
    this.cameraYaw = targetYaw;
    this.player.rotation.y = targetPlayerRot;
    this.player.targetRotationY = targetPlayerRot;

    gsap.to(this.player.position, {
      x: targetCoords.x,
      y: targetCoords.y,
      z: targetCoords.z,
      duration: 1.0,
      ease: 'power2.inOut',
      onComplete: () => {
        this.player.velocity.set(0, 0, 0);
        this.isCinematicTransition = false;
        this.vfx.triggerDivineSmite(this.player.position);
        audioSystem.playSubBassImpact();
        this.addCameraShake(0.65);
      }
    });

    const targetCamX = targetCoords.x + Math.sin(targetYaw) * Math.cos(this.cameraPitch) * this.cameraDistance;
    const targetCamY = targetCoords.y + Math.sin(this.cameraPitch) * this.cameraDistance + 2.0;
    const targetCamZ = targetCoords.z + Math.cos(targetYaw) * Math.cos(this.cameraPitch) * this.cameraDistance;

    gsap.to(this.camera.position, {
      x: targetCamX,
      y: targetCamY,
      z: targetCamZ,
      duration: 1.0,
      ease: 'power2.inOut'
    });

    if (this.hud) {
      this.hud.showNotification(`Teleported to ${shrineId.toUpperCase()}`, 'info');
    }
  }

  update(delta) {
    // 1. Pass camera orientation to player controller
    this.inputState.cameraYaw = this.cameraYaw;
    this.inputState.cameraPitch = this.cameraPitch;

    // 2. Update player physics, flight, and animations
    this.player.update(delta, this.inputState);

    // Subtle micro-shake on supersonic flight dive
    if (this.player.isFlying && this.inputState.sprint) {
      this.addCameraShake(0.04 * delta);
    }

    // 3. Dynamic Camera FOV (warp speed effect during flight)
    const isFlightBoosting = this.player.isFlying && (this.inputState.moveForward || this.inputState.jump);
    const targetFOV = isFlightBoosting ? (this.inputState.sprint ? 76 : 68) : 60;
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, Math.min(1, delta * 4));
    this.camera.updateProjectionMatrix();

    // 4. Update Camera Position (Drone Tour vs Third-Person Orbit)
    if (this.isDroneTour) {
      // Exit drone tour immediately if player triggers movement
      if (this.inputState.moveForward || this.inputState.moveBackward || this.inputState.moveLeft || this.inputState.moveRight || this.inputState.jump) {
        this.toggleDroneTour();
      } else {
        this.tourTime += delta;
        const curWP = this.droneWaypoints[this.currentTourIndex];
        const nextIndex = (this.currentTourIndex + 1) % this.droneWaypoints.length;
        const nextWP = this.droneWaypoints[nextIndex];
        const progress = Math.min(1.0, this.tourTime / curWP.duration);
        const t = 0.5 - 0.5 * Math.cos(progress * Math.PI); // smooth cosine easing

        const camPos = new THREE.Vector3().lerpVectors(curWP.pos, nextWP.pos, t);
        // Subtle cinematic drone float drift
        camPos.x += Math.sin(this.tourTime * 0.35) * 3.0;
        camPos.y += Math.cos(this.tourTime * 0.45) * 1.5;

        const lookPos = new THREE.Vector3().lerpVectors(curWP.lookAt, nextWP.lookAt, t);
        this.camera.position.lerp(camPos, 0.08);
        this.camera.lookAt(lookPos);

        if (this.tourTime >= curWP.duration) {
          this.tourTime = 0;
          this.currentTourIndex = nextIndex;
          if (this.hud) {
            this.hud.showDroneTitle(nextWP.title, nextWP.subtitle);
          }
        }
      }
    } else if (!this.isCinematicTransition) {
      const targetLookAt = this.player.position.clone().add(new THREE.Vector3(0, 1.5, 0));
      const effectiveDist = this.player.isFlying ? this.cameraDistance + 3.5 : this.cameraDistance;

      const cx = this.player.position.x + Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch) * effectiveDist;
      const cy = this.player.position.y + Math.sin(this.cameraPitch) * effectiveDist + 2.0;
      const cz = this.player.position.z + Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch) * effectiveDist;

      // Smooth camera damping
      this.camera.position.lerp(new THREE.Vector3(cx, cy, cz), 0.15);
      this.camera.lookAt(targetLookAt);
    }

    // 5. Apply trauma-based rotational camera shake
    if (this.shakeTrauma > 0.001) {
      const shake = this.shakeTrauma * this.shakeTrauma;
      const time = Date.now() * 0.04;
      const shakePitch = (Math.sin(time) * 0.022 + Math.sin(time * 2.3) * 0.012) * shake;
      const shakeYaw = (Math.cos(time * 1.1) * 0.022 + Math.cos(time * 2.7) * 0.012) * shake;
      const shakeRoll = (Math.sin(time * 1.7) * 0.018) * shake;

      this.camera.rotation.x += shakePitch;
      this.camera.rotation.y += shakeYaw;
      this.camera.rotation.z += shakeRoll;

      this.shakeTrauma = Math.max(0, this.shakeTrauma - delta * 1.8);
    }

    // 6. Proximity check for interactive shrines (Citadel + Expanse)
    this.checkProximity();
  }

  checkProximity() {
    if (this.hud && this.hud.isModalOpen) return;

    let nearest = null;
    let minDist = Infinity;

    // Combine sanctuary items and open world obelisks
    const allInteractables = [
      ...this.citadel.interactiveObjects,
      ...(this.expanse ? this.expanse.interactiveObjects : [])
    ];

    for (const obj of allInteractables) {
      const dist = this.player.position.distanceTo(obj.position);
      if (dist < obj.interactRadius && dist < minDist) {
        minDist = dist;
        nearest = obj;
      }
    }

    this.nearbyInteractable = nearest;

    if (this.hud) {
      if (nearest) {
        this.hud.showInteractPrompt(`[E] Attune with ${nearest.name}`);
      } else {
        this.hud.hideInteractPrompt();
      }
    }
  }
}
