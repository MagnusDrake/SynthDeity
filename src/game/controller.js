// Game Controller, Input Handling, Orbital Camera, and Interaction Engine
import * as THREE from 'three';
import gsap from 'gsap';
import { audioSystem } from '../audio/synth.js';
import { ARCHON_REALMS, CELESTIAL_REALMS } from '../game/constants.js';
import { ARCHON_PERSONAS } from '../ai/archon_ai.js';

export class GameController {
  constructor(camera, player, citadel, vfx, hud, expanse = null) {
    this.camera = camera;
    this.player = player;
    this.citadel = citadel;
    this.vfx = vfx;
    this.hud = hud;
    this.expanse = expanse;

    // Advanced Subsystems
    this.mountedManta = null;
    this.aiEngine = null;
    this.sandbox = null;
    this.boss = null;
    this.weather = null;
    this.eidolon = null;
    this.elapsedTime = 0;

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

    // Act Progression & Galaxy State
    this.act = 1; // 1: Divine Ascension, 2: The Archon Trials, 3: Galactic Sovereign
    this.clearedTrials = new Set();
    this.unlockedPowers = new Set(['smite', 'terraform']);
    this.powerCooldowns = { meteor: 0, graviton: 0, blink: 0, singularity: 0 };
    this.activeTrial = null;

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
        title: "SANCTUARY OF THE SYNTHDEITY",
        subtitle: "The Sacred Nexus of Loop Fabrication",
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
        subtitle: "Domain of Lyra, Archon of Resonance",
        duration: 9
      },
      {
        pos: new THREE.Vector3(95, 48, 110),
        lookAt: new THREE.Vector3(130, 22, 140),
        title: "THE SHATTERED TITAN SHELF",
        subtitle: "Domain of Valdor, Archon of Ruin",
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

    // Mouse drag for camera orbit / Genesis fabrication
    window.addEventListener('mousedown', (e) => {
      if (e.target.closest('#hud-container') && !e.target.classList.contains('drag-passthrough')) {
        return;
      }
      if (this.sandbox && this.sandbox.isActive) {
        this.sandbox.fabricateAtReticle();
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
        if (this.mountedManta) {
          this.dismountManta();
          break;
        }
        if (!this.inputState.jump) {
          audioSystem.playAscendSound();
        }
        this.inputState.jump = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.inputState.sprint = true;
        if (this.mountedManta) {
          audioSystem.playMantaBoost();
          if (this.vfx && this.vfx.triggerMantaBoost) {
            this.vfx.triggerMantaBoost(this.mountedManta.mesh.position, this.mountedManta.mesh.rotation.y);
          }
          this.addCameraShake(0.2);
        }
        break;
      case 'KeyE':
        this.attemptInteraction();
        break;
      case 'KeyG':
        if (this.sandbox) this.sandbox.toggle();
        break;
      case 'KeyY':
        this.openEidolonDialogue();
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
      // Divine Powers (Unlocked through Archon Trials)
      case 'Digit1':
        this.castMeteorTremor();
        break;
      case 'Digit2':
        this.castGravitonPulse();
        break;
      case 'Digit3':
        this.castAstralDash();
        break;
      case 'Digit4':
        this.castSingularityVortex();
        break;
      // Alt + 1-4 for fast-travel
      case 'Numpad1':
        this.teleportTo('genesis');
        break;
      case 'Numpad2':
        this.teleportTo('vault');
        break;
      case 'Numpad3':
        this.teleportTo('spire');
        break;
      case 'Numpad4':
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

  // Resolve aim target ground position adhering to local platform / expanse elevation
  getTargetGroundPosition(forwardDistance = 10) {
    const heading = this.player.rotation.y;
    const tx = this.player.position.x + Math.sin(heading) * forwardDistance;
    const tz = this.player.position.z + Math.cos(heading) * forwardDistance;

    // 1. Query elevation at the exact target location
    let targetFloor = null;
    if (this.player && typeof this.player.getFloorHeight === 'function') {
      targetFloor = this.player.getFloorHeight(tx, tz);
    }

    let ty;
    // Real platform or ley-line walkway (not deep cosmic void <= -50)
    if (targetFloor !== null && targetFloor > -50) {
      ty = targetFloor;
    } else {
      // 2. Fallback to the platform floor under the player's current feet
      const playerFloor = (this.player && typeof this.player.getFloorHeight === 'function')
        ? this.player.getFloorHeight(this.player.position.x, this.player.position.z)
        : null;

      if (playerFloor !== null && playerFloor > -50) {
        ty = playerFloor;
      } else {
        // 3. True aerial flight or open abyss: project at player's base elevation
        ty = this.player.position.y - 2.0;
      }
    }

    return new THREE.Vector3(tx, ty, tz);
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

    // Dynamic ground target adhering to platform elevation
    const target = this.getTargetGroundPosition(10);

    this.vfx.triggerDivineSmite(target);
    if (this.hud) this.hud.showNotification('⚡ Celestial Smite Unleashed!', 'success');

    // Check if hitting Void Rifts / Boss
    this.checkTrialSmiteHit(target, 10, 'smite', 40);
  }

  // 1. Meteor Tremor [1] (Unlocked via Titan Realm)
  castMeteorTremor() {
    if (!this.unlockedPowers.has('meteor')) {
      if (this.hud) this.hud.showNotification('☄️ Meteor Tremor locked! Conquer the Trial of Ruin (Titan Shelf)', 'warning');
      return;
    }
    if (this.powerCooldowns.meteor > 0) return;
    if (this.player.divineFavor < 25) {
      if (this.hud) this.hud.showNotification('Not enough Divine Favor!', 'warning');
      return;
    }

    this.player.divineFavor -= 25;
    this.powerCooldowns.meteor = 4.5;
    audioSystem.playMeteorTremor();
    this.addCameraShake(0.75);

    const target = this.getTargetGroundPosition(16);

    this.vfx.triggerMeteorTremor(target);
    if (this.hud) this.hud.showNotification('☄️ Meteor Tremor Unleashed!', 'success');

    this.checkTrialSmiteHit(target, 14, 'meteor', 90);
  }

  // 2. Graviton Pulse [2] (Unlocked via Crystal Realm)
  castGravitonPulse() {
    if (!this.unlockedPowers.has('graviton')) {
      if (this.hud) this.hud.showNotification('🔮 Graviton Pulse locked! Conquer the Trial of Resonance (Crystal Crags)', 'warning');
      return;
    }
    if (this.powerCooldowns.graviton > 0) return;
    if (this.player.divineFavor < 15) {
      if (this.hud) this.hud.showNotification('Not enough Divine Favor!', 'warning');
      return;
    }

    this.player.divineFavor -= 15;
    this.powerCooldowns.graviton = 3.5;
    audioSystem.playGravitonPulse();
    this.addCameraShake(0.4);

    this.vfx.triggerGravitonPulse(this.player.position);
    if (this.hud) this.hud.showNotification('🔮 Graviton Pulse Discharged!', 'success');

    this.checkTrialSmiteHit(this.player.position, 20, 'graviton', 80);
  }

  // 3. Astral Dash [3] (Unlocked via Chronos Realm)
  castAstralDash() {
    if (!this.unlockedPowers.has('blink')) {
      if (this.hud) this.hud.showNotification('⚡ Astral Dash locked! Conquer the Trial of Chronokinesis (Cloud Spires)', 'warning');
      return;
    }
    if (this.powerCooldowns.blink > 0) return;
    if (this.player.divineFavor < 10) {
      if (this.hud) this.hud.showNotification('Not enough Divine Favor!', 'warning');
      return;
    }

    this.player.divineFavor -= 10;
    this.powerCooldowns.blink = 2.0;

    const oldPos = this.player.position.clone();
    const forward = new THREE.Vector3(
      -Math.sin(this.cameraYaw),
      this.player.isFlying ? Math.sin(this.cameraPitch) * -0.5 : 0,
      -Math.cos(this.cameraYaw)
    ).normalize();

    const dashDist = 32;
    const newPos = oldPos.clone().add(forward.multiplyScalar(dashDist));

    audioSystem.playAstralDash();
    this.vfx.triggerAstralDash(oldPos, newPos);
    this.player.position.copy(newPos);
    this.player.velocity.set(0, 0, 0);
    this.addCameraShake(0.35);

    if (this.hud) this.hud.showNotification('⚡ Astral Dash!', 'info');
  }

  // 4. Singularity Vortex [4] (Unlocked via Abyss Realm)
  castSingularityVortex() {
    if (!this.unlockedPowers.has('singularity')) {
      if (this.hud) this.hud.showNotification('🌌 Singularity Vortex locked! Conquer the Trial of Singularity (Abyssal Cascades)', 'warning');
      return;
    }
    if (this.powerCooldowns.singularity > 0) return;
    if (this.player.divineFavor < 30) {
      if (this.hud) this.hud.showNotification('Not enough Divine Favor!', 'warning');
      return;
    }

    this.player.divineFavor -= 30;
    this.powerCooldowns.singularity = 5.5;
    audioSystem.playSingularityVortex();
    this.addCameraShake(0.6);

    const target = this.getTargetGroundPosition(18);

    this.vfx.triggerSingularityVortex(target);
    if (this.hud) this.hud.showNotification('🌌 Singularity Vortex Spawned!', 'success');

    this.checkTrialSmiteHit(target, 16, 'singularity', 150);
  }

  checkTrialSmiteHit(targetPos, radius = 8, powerType = 'smite', damage = 50) {
    // Check hit on Void Leviathan Boss
    if (this.boss && this.boss.isSpawned && !this.boss.isDead && this.boss.headMesh) {
      const dist = this.boss.headMesh.position.distanceTo(targetPos);
      if (dist < radius + 18) {
        this.boss.takeDamage(damage, powerType);
        if (this.vfx && this.vfx.createGroundExplosion) {
          this.vfx.createGroundExplosion(this.boss.headMesh.position, 0xef4444, 15);
        }
      }
    }

    if (!this.expanse || !this.expanse.trialEntities) return;
    const rifts = this.expanse.trialEntities.titanRifts;
    if (!rifts) return;

    let destroyedAny = false;
    rifts.forEach((rift) => {
      if (!rift.isDestroyed && rift.position.distanceTo(targetPos) < radius) {
        rift.isDestroyed = true;
        rift.mesh.visible = false;
        this.vfx.createGroundExplosion(rift.position, 0x7c3aed, 10);
        destroyedAny = true;
      }
    });

    if (destroyedAny) {
      audioSystem.playCrystalChime(1108);
      const remaining = rifts.filter(r => !r.isDestroyed).length;
      if (this.hud) {
        this.hud.showNotification(`⚡ Void Rift Destroyed! (${4 - remaining} / 4 Purged)`, 'success');
      }
      if (remaining === 0 && !this.clearedTrials.has('TITAN')) {
        this.completeArchonTrial('TITAN');
      }
    }
  }

  // Attempt interaction [E] with nearest shrine, obelisk, stargate, or gear
  attemptInteraction() {
    // 0. Check for Manta mounting / dismounting
    if (this.mountedManta) {
      this.dismountManta();
      return;
    }

    if (this.expanse && this.expanse.getNearestManta) {
      const nearManta = this.expanse.getNearestManta(this.player.position, 18);
      if (nearManta) {
        this.mountManta(nearManta.manta);
        return;
      }
    }

    if (!this.nearbyInteractable) return;
    const item = this.nearbyInteractable;

    // 1. Stargate warp interaction
    if (item.data && item.data.isStargate) {
      const realmKey = item.data.realmKey;
      if (!this.clearedTrials.has(realmKey)) {
        const realm = ARCHON_REALMS[realmKey];
        const trialName = realm ? realm.trial.name : 'Archon Trial';
        const archonName = realm ? realm.archonName : 'Archon';
        if (this.hud) {
          this.hud.showNotification(
            `🔒 Dimensional Stargate Sealed! Conquer the ${trialName} (${archonName}) to awaken this gateway.`,
            'warning'
          );
        }
        audioSystem.playHoverStep();
        this.addCameraShake(0.15);
        return;
      }
      this.warpToSubRealm(item.data.destination, item.data.gateName);
      return;
    }
    if (item.data && item.data.isReturnGate) {
      this.returnFromSubRealm(item.data.returnRealmKey);
      return;
    }

    // 2. Chronos Astrolabe Gear interaction
    if (item.data && item.data.isChronosGear) {
      if (window.game && window.game.currentRealm && window.game.currentRealm === CELESTIAL_REALMS.ECLIPSE) {
        if (!this.clearedTrials.has('CHRONOS')) {
          this.completeArchonTrial('CHRONOS');
        } else {
          if (this.hud) this.hud.showNotification('Chronos Astrolabe is locked in harmonic sync.', 'info');
        }
      } else {
        if (this.hud) {
          this.hud.showNotification('⏳ Temporal misalignment! Tap [T] to shift epoch into Nebula Eclipse!', 'warning');
        }
        audioSystem.playHoverStep();
      }
      return;
    }

    // 3. Shrines and Astral Obelisks
    const isFirstTime = !this.attunedShrines.has(item.id);
    this.attunedShrines.add(item.id);
    this.player.divineFavor = Math.min(100, this.player.divineFavor + 25);

    audioSystem.playShrineAttune(item.id);
    this.vfx.triggerAttunementBeam(item.position);
    this.addCameraShake(0.3);

    // Smooth camera orbit look at shrine
    this.isCinematicTransition = true;
    gsap.to(this.camera.position, {
      x: item.position.x + Math.sin(this.cameraYaw) * 7,
      y: item.position.y + 4,
      z: item.position.z + Math.cos(this.cameraYaw) * 7,
      duration: 1.0,
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

  mountManta(manta) {
    if (this.mountedManta) return;
    this.mountedManta = manta;
    manta.isMounted = true;
    this.player.isFlying = true;
    this.cameraDistance = 24;
    audioSystem.playMantaMount();
    if (this.hud) {
      this.hud.showNotification('🕊️ Mounted Celestial Star-Manta! [WASD: Steer | Shift: Turbo | Space: Dismount]', 'success');
    }
  }

  dismountManta() {
    if (!this.mountedManta) return;
    this.mountedManta.isMounted = false;
    this.mountedManta = null;
    this.cameraDistance = 10;
    audioSystem.playHoverStep();
    if (this.hud) {
      this.hud.showNotification('Dismounted from Celestial Star-Manta into free flight!', 'info');
    }
  }

  openEidolonDialogue() {
    if (!this.hud || !this.aiEngine) return;
    if (this.nearbyInteractable && this.nearbyInteractable.data && this.nearbyInteractable.data.isAstralObelisk) {
      const realmKey = (this.nearbyInteractable.data.realmId || 'TITAN').toUpperCase();
      const persona = ARCHON_PERSONAS[realmKey] || ARCHON_PERSONAS.VALDOR;
      this.hud.openDialogue(persona, this.aiEngine);
    } else {
      this.hud.openDialogue(ARCHON_PERSONAS.EIDOLON, this.aiEngine);
    }
  }

  triggerApotheosis() {
    audioSystem.playApotheosis();
    this.vfx.triggerApotheosisCelebration();
    this.act = 2;
    if (this.hud) {
      this.hud.showAscensionBanner();
      if (this.hud.switchToArchonTracker) this.hud.switchToArchonTracker();
    }
  }

  warpToSubRealm(destination, gateName) {
    if (this.isCinematicTransition) return;

    // Resolve destination coordinates safely
    let targetPos = destination;
    if (!targetPos || typeof targetPos.x !== 'number') {
      const subRealmMap = {
        matrix: { x: 1200, y: 300, z: 1200 },
        asteroids: { x: -1200, y: 300, z: 1200 },
        chronos: { x: 1200, y: 300, z: -1200 },
        singularity: { x: -1200, y: 300, z: -1200 }
      };
      if (typeof destination === 'string' && subRealmMap[destination]) {
        targetPos = subRealmMap[destination];
      } else if (this.expanse && this.expanse.subRealmOrigins && this.expanse.subRealmOrigins[destination]) {
        targetPos = this.expanse.subRealmOrigins[destination];
      } else {
        targetPos = { x: 1200, y: 300, z: 1200 };
      }
    }

    const spawnX = targetPos.x;
    const spawnY = targetPos.y + 2.0;
    const spawnZ = targetPos.z + 16;

    audioSystem.playStargateWarp();
    this.vfx.triggerDivineSmite(this.player.position);
    this.addCameraShake(0.6);

    if (this.hud) {
      this.hud.showNotification(`🌀 Wormhole Traverse: Entering ${gateName || 'Sub-Realm'}...`, 'info');
    }

    this.cameraYaw = 0;
    this.cameraPitch = 0.25;

    this.isCinematicTransition = true;
    gsap.to(this.player.position, {
      x: spawnX,
      y: spawnY,
      z: spawnZ,
      duration: 1.2,
      ease: 'power2.inOut',
      onComplete: () => {
        this.player.velocity.set(0, 0, 0);
        this.isCinematicTransition = false;
        this.vfx.triggerDivineSmite(this.player.position);
        this.addCameraShake(0.4);
      }
    });

    const camTarget = new THREE.Vector3(
      spawnX + Math.sin(this.cameraYaw) * this.cameraDistance,
      spawnY + 4.5,
      spawnZ + Math.cos(this.cameraYaw) * this.cameraDistance
    );
    gsap.to(this.camera.position, {
      x: camTarget.x,
      y: camTarget.y,
      z: camTarget.z,
      duration: 1.2,
      ease: 'power2.inOut'
    });
  }

  returnFromSubRealm(returnRealmKey) {
    if (this.isCinematicTransition) return;
    audioSystem.playStargateWarp();
    this.vfx.triggerDivineSmite(this.player.position);
    this.addCameraShake(0.6);

    const islandCoords = {
      TITAN: { x: 195, y: 34, z: -210 },
      CRYSTAL: { x: -230, y: -10, z: 195 },
      CHRONOS: { x: 235, y: 54, z: 215 },
      ABYSS: { x: -215, y: -36, z: -195 }
    };
    const dest = islandCoords[returnRealmKey] || { x: 0, y: 5, z: 0 };
    const realmData = ARCHON_REALMS[returnRealmKey];

    if (this.hud) {
      this.hud.showNotification(`Returning to ${realmData ? realmData.region : 'Citadel'}...`, 'info');
    }

    this.isCinematicTransition = true;
    gsap.to(this.player.position, {
      x: dest.x,
      y: dest.y + 2.5,
      z: dest.z,
      duration: 1.2,
      ease: 'power2.inOut',
      onComplete: () => {
        this.player.velocity.set(0, 0, 0);
        this.isCinematicTransition = false;
        this.vfx.triggerDivineSmite(this.player.position);
        this.addCameraShake(0.4);
      }
    });

    const camTarget = new THREE.Vector3(
      dest.x + Math.sin(this.cameraYaw) * this.cameraDistance,
      dest.y + 4.5,
      dest.z + Math.cos(this.cameraYaw) * this.cameraDistance
    );
    gsap.to(this.camera.position, {
      x: camTarget.x,
      y: camTarget.y,
      z: camTarget.z,
      duration: 1.2,
      ease: 'power2.inOut'
    });
  }

  completeArchonTrial(realmKey) {
    if (this.clearedTrials.has(realmKey)) return;
    this.clearedTrials.add(realmKey);

    const realm = ARCHON_REALMS[realmKey];
    if (!realm) return;

    // 1. Unlock Divine God Power
    const powerId = realm.power.id || realm.power;
    this.unlockedPowers.add(powerId);
    if (this.hud && this.hud.unlockPowerButton) {
      this.hud.unlockPowerButton(powerId);
    }

    // 2. Ignite Luminous Ley-Line Bridge from Citadel to this Archipelago
    if (this.vfx && this.vfx.createLeyLineBridge) {
      const bridgeAnchors = {
        TITAN: {
          start: new THREE.Vector3(25, 2.5, -45),
          end: new THREE.Vector3(175, realm.position.y, -190)
        },
        CRYSTAL: {
          start: new THREE.Vector3(-45, 2.5, 25),
          end: new THREE.Vector3(-205, realm.position.y, 175)
        },
        CHRONOS: {
          start: new THREE.Vector3(45, 2.5, 25),
          end: new THREE.Vector3(210, realm.position.y, 190)
        },
        ABYSS: {
          start: new THREE.Vector3(-45, 2.5, -25),
          end: new THREE.Vector3(-190, realm.position.y, -175)
        }
      };

      const anchor = bridgeAnchors[realmKey];
      if (anchor) {
        this.vfx.createLeyLineBridge(anchor.start, anchor.end, realm.bridge.color, realm.bridge.label);
      }
    }
    audioSystem.playLeyLineIgnition();
    audioSystem.playTrialSuccess();
    this.addCameraShake(0.85);

    // 3. Awaken the Dimensional Stargate on this Archipelago
    if (this.expanse && this.expanse.activateStargate) {
      this.expanse.activateStargate(realmKey);
    }

    // 4. Notify Player
    if (this.hud) {
      this.hud.showNotification(
        `🏆 ${realm.trial.name} Conquered! Unlocked: ${realm.power.name}, Ley-Line Bridge & Dimensional Stargate!`,
        'success'
      );
      if (this.hud.updateArchonProgress) {
        this.hud.updateArchonProgress(this.clearedTrials.size, realmKey);
      }
    }

    // 5. Check for Act III: Galactic Sovereignty
    if (this.clearedTrials.size === 4 && this.act < 3) {
      this.act = 3;
      setTimeout(() => {
        this.triggerGalacticSovereignty();
      }, 2000);
    }
  }

  triggerGalacticSovereignty() {
    audioSystem.playApotheosis();
    this.vfx.triggerApotheosisCelebration();
    this.addCameraShake(1.0);

    // Awaken all 4 Dimensional Stargates
    if (this.expanse && this.expanse.activateStargate) {
      ['TITAN', 'CRYSTAL', 'CHRONOS', 'ABYSS'].forEach((key) => {
        this.expanse.activateStargate(key);
      });
    }

    if (this.hud && this.hud.showGalacticSovereigntyBanner) {
      this.hud.showGalacticSovereigntyBanner();
    }
  }

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
    this.elapsedTime += delta;

    // 0. Update Mounted Manta Flight Physics
    if (this.mountedManta) {
      const m = this.mountedManta;
      const speed = this.inputState.sprint ? 68 : 32;

      // Aerial Steering
      if (this.inputState.moveLeft) m.mesh.rotation.y += delta * 1.8;
      if (this.inputState.moveRight) m.mesh.rotation.y -= delta * 1.8;

      // Ascend / Descend
      if (this.inputState.jump) m.mesh.position.y += delta * 24;
      if (this.inputState.moveBackward && !this.inputState.jump) m.mesh.position.y -= delta * 14;

      // Move forward in current heading
      const heading = m.mesh.rotation.y;
      m.mesh.position.x -= Math.sin(heading) * speed * delta;
      m.mesh.position.z -= Math.cos(heading) * speed * delta;

      // Aerodynamic Wing Flap
      const flapSpeed = this.inputState.sprint ? 9 : 4.5;
      const flap = Math.sin(this.elapsedTime * flapSpeed) * 0.45;
      if (m.leftWing) m.leftWing.rotation.z = flap;
      if (m.rightWing) m.rightWing.rotation.z = -flap;

      // Snap player avatar to dorsal harness
      this.player.position.copy(m.mesh.position).add(new THREE.Vector3(0, 1.8, 0));
      this.player.velocity.set(0, 0, 0);
      this.cameraYaw = heading;
    }

    // Update Genesis Sandbox Reticle
    if (this.sandbox && this.sandbox.isActive) {
      this.sandbox.update(delta, this.player.position);
    }

    // 1. Pass camera orientation to player controller
    this.inputState.cameraYaw = this.cameraYaw;
    this.inputState.cameraPitch = this.cameraPitch;

    // 2. Update player physics, flight, and animations
    this.player.update(delta, this.inputState);

    // Subtle micro-shake on supersonic flight dive or manta turbo
    if ((this.player.isFlying || this.mountedManta) && this.inputState.sprint) {
      this.addCameraShake(0.04 * delta);
    }

    // 3. Dynamic Camera FOV (warp speed effect during flight / manta turbo)
    const isFlightBoosting = (this.player.isFlying || this.mountedManta) && (this.inputState.moveForward || this.inputState.jump || this.inputState.sprint || this.mountedManta);
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

    // 6. Countdown power cooldowns
    for (const p in this.powerCooldowns) {
      if (this.powerCooldowns[p] > 0) {
        this.powerCooldowns[p] = Math.max(0, this.powerCooldowns[p] - delta);
      }
    }

    // 7. Check Crystal Rings flight slalom
    if (this.expanse && this.expanse.trialEntities && this.expanse.trialEntities.crystalRings) {
      const rings = this.expanse.trialEntities.crystalRings;
      rings.forEach((ring) => {
        if (!ring.isCleared && this.player.position.distanceTo(ring.position) < ring.radius) {
          ring.isCleared = true;
          ring.mat.color.setHex(0xfef08a);
          ring.mesh.scale.set(1.4, 1.4, 1.4);
          audioSystem.playCrystalChime(784 + ring.index * 60);
          const clearedCount = rings.filter(r => r.isCleared).length;
          if (this.hud) {
            this.hud.showNotification(`💎 Harmonic Ring Cleared (${clearedCount} / 5)`, 'info');
          }
          if (clearedCount === 5 && !this.clearedTrials.has('CRYSTAL')) {
            this.completeArchonTrial('CRYSTAL');
          }
        }
      });
    }

    // 8. Check Abyss Antimatter Glyphs collection
    if (this.expanse && this.expanse.trialEntities && this.expanse.trialEntities.abyssGlyphs) {
      const glyphs = this.expanse.trialEntities.abyssGlyphs;
      let collectedAny = false;
      glyphs.forEach((g) => {
        if (!g.isCollected && this.player.position.distanceTo(g.position) < g.radius) {
          g.isCollected = true;
          g.mesh.visible = false;
          this.vfx.createGroundExplosion(g.position, 0x10b981, 6);
          collectedAny = true;
        }
      });
      if (collectedAny) {
        audioSystem.playCrystalChime(987);
        const count = glyphs.filter(g => g.isCollected).length;
        if (this.hud) {
          this.hud.showNotification(`🌀 Antimatter Glyph Contained (${count} / 3)`, 'info');
        }
        if (count === 3 && !this.clearedTrials.has('ABYSS')) {
          this.completeArchonTrial('ABYSS');
        }
      }
    }

    // 9. Proximity check for interactive shrines (Citadel + Expanse)
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
        if (nearest.data && nearest.data.isAstralObelisk) {
          this.hud.showInteractPrompt(`[E] Commune & Sacred Lore | [Y] Converse [AI]`);
        } else if (nearest.data && nearest.data.isStargate) {
          const isConquered = this.clearedTrials.has(nearest.data.realmKey);
          if (isConquered) {
            this.hud.showInteractPrompt(`[E] Enter Dimensional Stargate: ${nearest.data.gateName}`);
          } else {
            const realm = ARCHON_REALMS[nearest.data.realmKey];
            const trialName = realm ? realm.trial.name : 'Archon Trial';
            this.hud.showInteractPrompt(`🔒 Stargate Sealed — Requires ${trialName}`);
          }
        } else if (nearest.data && nearest.data.isReturnGate) {
          this.hud.showInteractPrompt(`[E] Traverse Return Gate to Main Galaxy`);
        } else {
          this.hud.showInteractPrompt(`[E] Attune with ${nearest.name}`);
        }
      } else {
        this.hud.hideInteractPrompt();
      }
    }
  }
}
