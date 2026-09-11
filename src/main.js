// AETHELGARD: Sanctuary of the Digital Deity
// Main 3D Engine, PBR Environment, Post-Processing Pipeline & Game Lifecycle

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import gsap from 'gsap';

import { CelestialPlayer } from './game/player.js';
import { CelestialCitadel } from './world/citadel.js';
import { AstralExpanse } from './world/expanse.js';
import { CelestialVFX } from './world/vfx.js';
import { GameController } from './game/controller.js';
import { CelestialHUD } from './ui/hud.js';
import { audioSystem } from './audio/synth.js';
import { CELESTIAL_REALMS } from './game/constants.js';
import { LivingNebulaSky } from './shaders/nebula.js';
import { CinematicShader } from './shaders/cinematic.js';
import { ArchonAIEngine, ARCHON_PERSONAS } from './ai/archon_ai.js';
import { EchoEidolon } from './world/eidolon.js';
import { GenesisSandbox } from './world/sandbox.js';
import { VoidLeviathan } from './world/boss.js';
import { CosmicWeather } from './world/weather.js';

class GameEngine {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.hudContainer = document.getElementById('hud-container');

    this.clock = new THREE.Clock();
    this.elapsedTime = 0;
    this.timeScale = 1.0;

    this.initScene();
    this.initLights();
    this.initEnvironmentMap();
    this.initPostProcessing();
    this.initGameSystems();
    this.initEventListeners();

    this.animate();
  }

  initScene() {
    // Scene with celestial fog
    this.scene = new THREE.Scene();
    this.currentRealm = CELESTIAL_REALMS.DAWN;

    this.scene.background = new THREE.Color(this.currentRealm.skyColor);
    this.scene.fog = new THREE.FogExp2(this.currentRealm.fogColor, 0.0006);

    // Camera setup with deep cosmic view distance (4000m)
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      4000
    );
    this.camera.position.set(0, 10, 18);

    // WebGL Renderer with Soft Shadow Mapping
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true
    });
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
  }

  initEnvironmentMap() {
    // Living Procedural 3D Volumetric Nebula Sky Dome (3200m radius)
    this.livingSky = new LivingNebulaSky(3200);
    this.scene.add(this.livingSky.mesh);
    this.skyDome = this.livingSky.mesh;
  }

  initLights() {
    // 1. Ambient Celestial Light
    this.ambientLight = new THREE.AmbientLight(0xffeedd, 0.52);
    this.scene.add(this.ambientLight);

    // 2. Hemisphere Sky/Ground Light (Neutral slate ground bounce to remove purple cast)
    this.hemiLight = new THREE.HemisphereLight(0xffeedd, 0x0f172a, 0.38);
    this.scene.add(this.hemiLight);

    // 3. Directional Celestial Sun with Soft Shadows
    this.sunLight = new THREE.DirectionalLight(0xffeedd, 1.6);
    this.sunLight.position.set(60, 130, 80);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 450;
    this.sunLight.shadow.camera.left = -140;
    this.sunLight.shadow.camera.right = 140;
    this.sunLight.shadow.camera.top = 140;
    this.sunLight.shadow.camera.bottom = -140;
    this.sunLight.shadow.bias = -0.0004;
    this.scene.add(this.sunLight);
  }

  initPostProcessing() {
    // Setup Unreal Bloom for divine glowing runes and aura
    this.composer = new EffectComposer(this.renderer);
    const composerPixelRatio = Math.min(window.devicePixelRatio, 1.25);
    this.composer.setPixelRatio(composerPixelRatio);
    this.composer.setSize(window.innerWidth, window.innerHeight);

    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.20,  // strength: clean, crisp bloom without blown-out specular highlights
      0.22,  // radius: focused highlight glow
      0.94   // threshold: blooms only true emissive runes, crystals, and sun
    );
    this.bloomPass = bloomPass;
    this.composer.addPass(bloomPass);

    // Consolidated Deluxe Filmic & Volumetric Pass: Crepuscular God Rays, ACES Tonemapping, anamorphic streaks, split toning & 35mm grain
    this.cinematicPass = new ShaderPass(CinematicShader);
    this.cinematicPass.uniforms.uAspect.value = window.innerWidth / window.innerHeight;
    this.composer.addPass(this.cinematicPass);
  }

  initGameSystems() {
    // 1. 3D Celestial Citadel World
    this.citadel = new CelestialCitadel(this.scene);

    // 2. The Astral Expanse (Open-World Archipelagos & Ancient Titan Ruins)
    this.expanse = new AstralExpanse(this.scene);

    // 3. Divine Avatar Player
    this.player = new CelestialPlayer(this.scene);

    // 4. Visual Effects Engine (Lightning, shockwaves, sparkles)
    this.vfx = new CelestialVFX(this.scene);
    this.player.expanse = this.expanse;
    this.player.vfx = this.vfx;

    // 5. Game HUD & UI
    this.hud = new CelestialHUD(this.hudContainer, {
      onTeleport: (shrineId) => {
        if (this.controller) this.controller.teleportTo(shrineId);
      },
      onSmite: () => {
        if (this.controller) this.controller.castDivineSmite();
      },
      onFlightToggle: () => {
        if (this.controller && this.player) {
          const flying = this.player.toggleFlight();
          audioSystem.playFlightWhoosh(flying);
          this.hud.showNotification(
            flying ? '🕊️ Divine Flight Engaged! [W/S] Aim & Fly, [Space] Ascend, [Shift] Dive' : 'Terrestrial Hover Restored',
            'info'
          );
        }
      },
      onInteract: () => {
        if (this.controller) this.controller.attemptInteraction();
      },
      onTouchMove: (x, y) => {
        if (this.controller) {
          this.controller.inputState.moveRight = x > 0.3;
          this.controller.inputState.moveLeft = x < -0.3;
          this.controller.inputState.moveBackward = y > 0.3;
          this.controller.inputState.moveForward = y < -0.3;
        }
      },
      onTouchJump: (isJumping) => {
        if (this.controller) {
          if (isJumping && !this.controller.inputState.jump) {
            audioSystem.playAscendSound();
          }
          this.controller.inputState.jump = isJumping;
        }
      },
      onRealmShift: (newRealm) => {
        this.shiftRealm(newRealm);
      },
      onDroneTourToggle: () => {
        if (this.controller) this.controller.toggleDroneTour();
      },
      onChronostasisToggle: () => {
        if (this.controller) this.controller.toggleChronostasis();
      },
      onCastPower: (powerKey) => {
        if (!this.controller) return;
        if (powerKey === 'meteor') this.controller.castMeteorTremor();
        else if (powerKey === 'graviton') this.controller.castGravitonPulse();
        else if (powerKey === 'blink') this.controller.castAstralDash();
        else if (powerKey === 'singularity') this.controller.castSingularityVortex();
      },
      getAttunedShrines: () => {
        return this.controller ? this.controller.attunedShrines : new Set();
      }
    });

    // 6. Game Controller & Camera Orchestration
    this.controller = new GameController(
      this.camera,
      this.player,
      this.citadel,
      this.vfx,
      this.hud,
      this.expanse
    );

    // 7. Advanced Grand Cosmic Expansion Subsystems
    this.aiEngine = new ArchonAIEngine(this);
    this.eidolon = new EchoEidolon(this.scene, this.player, this.hud);
    this.sandbox = new GenesisSandbox(this.scene, this.camera, this.expanse, this.hud, this.vfx);
    this.boss = new VoidLeviathan(this.scene, this.vfx, this.hud);
    this.weather = new CosmicWeather(this.scene, this.hud, this.player);

    this.controller.aiEngine = this.aiEngine;
    this.controller.sandbox = this.sandbox;
    this.controller.boss = this.boss;
    this.controller.weather = this.weather;
    this.controller.eidolon = this.eidolon;

    // Connect HUD callbacks
    this.hud.callbacks.onToggleGenesis = () => this.sandbox.toggle();
    this.hud.callbacks.onOpenEidolon = () => this.hud.openDialogue(ARCHON_PERSONAS.EIDOLON, this.aiEngine);
    this.hud.bindGenesisEvents(this.sandbox);
  }

  shiftRealm(newRealm) {
    this.currentRealm = newRealm;

    // Smooth color transitions with GSAP
    const skyTarget = new THREE.Color(newRealm.skyColor);
    const sunTarget = new THREE.Color(newRealm.sunColor);
    const ambTarget = new THREE.Color(newRealm.ambientColor);

    gsap.to(this.scene.background, {
      r: skyTarget.r,
      g: skyTarget.g,
      b: skyTarget.b,
      duration: 1.5
    });

    gsap.to(this.scene.fog.color, {
      r: skyTarget.r,
      g: skyTarget.g,
      b: skyTarget.b,
      duration: 1.5
    });

    gsap.to(this.sunLight.color, {
      r: sunTarget.r,
      g: sunTarget.g,
      b: sunTarget.b,
      duration: 1.5
    });

    gsap.to(this.ambientLight.color, {
      r: ambTarget.r,
      g: ambTarget.g,
      b: ambTarget.b,
      duration: 1.5
    });

    gsap.to(this.bloomPass, {
      strength: newRealm.bloomIntensity,
      duration: 1.5
    });

    if (this.livingSky) {
      gsap.to(this.livingSky.uniforms.uColorCore.value, {
        r: sunTarget.r,
        g: sunTarget.g,
        b: sunTarget.b,
        duration: 1.5
      });
      gsap.to(this.livingSky.uniforms.uColorRim.value, {
        r: skyTarget.r,
        g: skyTarget.g,
        b: skyTarget.b,
        duration: 1.5
      });
    }
  }

  initEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());

    // Enable audio on first user click anywhere
    window.addEventListener('click', () => {
      audioSystem.resumeContext();
    }, { once: true });
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio, 2);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(width, height);

    const composerPixelRatio = Math.min(window.devicePixelRatio, 1.25);
    this.composer.setPixelRatio(composerPixelRatio);
    this.composer.setSize(width, height);

    if (this.cinematicPass) {
      this.cinematicPass.uniforms.uAspect.value = width / height;
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const rawDelta = Math.min(this.clock.getDelta(), 0.1);
    const delta = rawDelta * this.timeScale;
    this.elapsedTime += delta;

    // Update cinematic shader dynamic noise time
    if (this.cinematicPass) {
      this.cinematicPass.uniforms.uTime.value = this.elapsedTime;
    }

    // 1. Update Game Controller & Player
    if (this.controller) {
      this.controller.update(delta);
    }

    // 2. Update 3D Citadel animations
    if (this.citadel) {
      this.citadel.update(delta, this.elapsedTime);
    }

    // 3. Update The Astral Expanse (Open-World entities, star-mantas, cascades)
    if (this.expanse) {
      this.expanse.update(delta, this.elapsedTime);
    }

    // 4. Update Living Nebula Sky Dome (follows camera & evolves gases)
    if (this.livingSky) {
      this.livingSky.update(delta, this.elapsedTime, this.camera.position);
    }

    // 5. Update Volumetric Crepuscular Ray (God Rays) Screen-Space Light Projection
    if (this.cinematicPass && this.sunLight) {
      const camDir = new THREE.Vector3();
      this.camera.getWorldDirection(camDir);
      const toLight = this.sunLight.position.clone().sub(this.camera.position).normalize();
      const isFacing = camDir.dot(toLight) > 0.05;

      if (isFacing) {
        const lightPos = this.sunLight.position.clone();
        const proj = lightPos.project(this.camera);
        const screenX = (proj.x + 1.0) * 0.5;
        const screenY = (proj.y + 1.0) * 0.5;
        this.cinematicPass.uniforms.uLightScreenPos.value.set(screenX, screenY);
        this.cinematicPass.uniforms.uLightInView.value = 1.0;
        this.cinematicPass.uniforms.uLightColor.value.copy(this.sunLight.color);
      } else {
        this.cinematicPass.uniforms.uLightInView.value = 0.0;
      }
    }

    // 5. Update VFX (Lightning, Shockwaves, Particles)
    if (this.vfx) {
      this.vfx.update(delta);
    }

    // 6. Update Eidolon Companion, Void Leviathan Boss, and Cosmic Weather
    if (this.eidolon) {
      this.eidolon.update(delta, this.elapsedTime);
    }
    if (this.boss) {
      this.boss.update(delta, this.elapsedTime, this.player ? this.player.position : null);
    }
    if (this.weather) {
      this.weather.update(delta, this.elapsedTime);
    }

    // 7. Update HUD states (Divine Favor, Compass, Flight Telemetry)
    if (this.hud && this.player && this.controller) {
      this.hud.updateDivineFavor(this.player.divineFavor, this.player.maxDivineFavor);
      this.hud.updateCompass(this.controller.cameraYaw);
      this.hud.updateFlightStatus(
        this.player.isFlying,
        this.player.position.y,
        this.player.velocity.length()
      );
    }

    // 7. Render Scene with Bloom Post-Processing
    this.composer.render();
  }
}

// Launch the divine experience
window.addEventListener('DOMContentLoaded', () => {
  window.THREE = THREE;
  window.game = new GameEngine();
});
