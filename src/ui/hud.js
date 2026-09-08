// RPG God-Game HUD, Compass, Quest Tracker, Modals & Mobile Controls
import { audioSystem } from '../audio/synth.js';
import { SHRINES, CELESTIAL_REALMS } from '../game/constants.js';

export class CelestialHUD {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.isModalOpen = false;
    this.currentRealmIndex = 0;
    this.realmKeys = Object.keys(CELESTIAL_REALMS);

    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div id="hud-root" class="hud-overlay select-none">
        <!-- Cinematic Letterbox Bars (Anamorphic 2.39:1) -->
        <div id="cinematic-bar-top" class="cinematic-bar bar-top"></div>
        <div id="cinematic-bar-bottom" class="cinematic-bar bar-bottom"></div>

        <!-- Cinematic Drone Tour Title Card -->
        <div id="drone-title-card" class="drone-title-card hidden">
          <div class="drone-badge">CINEMATIC EXPEDITION</div>
          <h2 id="drone-title" class="drone-title font-cinzel"></h2>
          <p id="drone-subtitle" class="drone-subtitle"></p>
          <div class="drone-prompt">Press [C] or [WASD] to resume deity control</div>
        </div>

        <!-- Top Navigation Bar -->
        <header class="hud-header flex justify-between items-center px-6 py-4">
          <div class="flex items-center space-x-4">
            <div class="deity-emblem">
              <span class="deity-glyph">✦</span>
            </div>
            <div>
              <h1 class="font-cinzel text-xl text-amber-200 tracking-wider font-bold drop-shadow-md">
                AETHELGARD
              </h1>
              <div class="text-xs text-amber-400/80 tracking-widest uppercase">
                Sanctuary of the Digital Deity
              </div>
            </div>
          </div>

          <!-- Divine Favor (Energy/Mana) Bar -->
          <div class="divine-gauge-container hidden sm:flex flex-col items-center">
            <div class="flex justify-between w-48 text-[11px] font-mono text-amber-300/90 mb-1">
              <span>DIVINE FAVOR</span>
              <span id="favor-val">100%</span>
            </div>
            <div class="gauge-track">
              <div id="favor-fill" class="gauge-fill" style="width: 100%;"></div>
            </div>
          </div>

          <!-- Top-Right Controls -->
          <div class="flex items-center space-x-2">
            <button id="btn-realm" class="hud-btn" title="Shift Realm Skybox [T]">
              <span class="hud-icon">🌌</span>
              <span id="realm-label" class="hidden md:inline text-xs">Solar Dawn</span>
            </button>

            <button id="btn-audio" class="hud-btn" title="Toggle Celestial Synth [M]">
              <span id="audio-icon" class="hud-icon">🔇</span>
              <span id="audio-label" class="hidden md:inline text-xs">Muted</span>
            </button>

            <button id="btn-help" class="hud-btn" title="Controls [H]">
              <span class="hud-icon">⌨️</span>
              <span class="hidden md:inline text-xs">Controls</span>
            </button>
          </div>
        </header>

        <!-- Compass & Quest Tracker (Top Right) -->
        <div class="hud-sidebar-right">
          <!-- Celestial Compass -->
          <div class="compass-widget">
            <div class="compass-dial" id="compass-dial">
              <span class="compass-cardinal north" title="Genesis (North)">⚡</span>
              <span class="compass-cardinal east" title="Vault (East)">🔮</span>
              <span class="compass-cardinal south" title="Spire (South)">🌌</span>
              <span class="compass-cardinal west" title="Beacon (West)">🕊️</span>
              <div class="compass-needle"></div>
            </div>
          </div>

          <!-- Quest Log -->
          <div class="quest-tracker">
            <div class="quest-header">
              <span class="quest-title">DIVINE ASCENSION</span>
              <span id="quest-count" class="quest-progress">0 / 4</span>
            </div>
            <div class="quest-list">
              <div class="quest-item" id="q-genesis">
                <span class="q-check">○</span>
                <span>The Genesis Monolith</span>
              </div>
              <div class="quest-item" id="q-vault">
                <span class="q-check">○</span>
                <span>The Vault of Creations</span>
              </div>
              <div class="quest-item" id="q-spire">
                <span class="q-check">○</span>
                <span>The Spire of Omnipotence</span>
              </div>
              <div class="quest-item" id="q-beacon">
                <span class="q-check">○</span>
                <span>The Celestial Beacon</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Center Proximity Interaction Prompt -->
        <div id="interact-prompt" class="interact-prompt hidden">
          <div class="prompt-key">E</div>
          <div id="prompt-text" class="prompt-label">Attune with Shrine</div>
        </div>

        <!-- Notification Toast -->
        <div id="notification-toast" class="notification-toast hidden"></div>

        <!-- Quick Travel / Action Dock (Bottom Center) -->
        <div class="hud-dock">
          <div class="dock-buttons">
            <button class="dock-btn" data-teleport="genesis" title="Teleport to Genesis [1]">
              <span class="dock-key">1</span>
              <span class="dock-icon">⚡</span>
              <span class="dock-title">Genesis</span>
            </button>
            <button class="dock-btn" data-teleport="vault" title="Teleport to Vault of Creations [2]">
              <span class="dock-key">2</span>
              <span class="dock-icon">🔮</span>
              <span class="dock-title">Creations</span>
            </button>
            <button class="dock-btn" data-teleport="spire" title="Teleport to Spire of Omnipotence [3]">
              <span class="dock-key">3</span>
              <span class="dock-icon">🌌</span>
              <span class="dock-title">Skills</span>
            </button>
            <button class="dock-btn" data-teleport="beacon" title="Teleport to Celestial Beacon [4]">
              <span class="dock-key">4</span>
              <span class="dock-icon">🕊️</span>
              <span class="dock-title">Contact</span>
            </button>
            <button class="dock-btn action-flight" id="btn-flight" title="Toggle Divine Flight [F]">
              <span class="dock-key">F</span>
              <span class="dock-icon">🕊️</span>
              <span class="dock-title">Fly</span>
            </button>
            <div class="dock-divider"></div>
            <button class="dock-btn action-tour" id="btn-drone" title="Cinematic Drone Tour [C]">
              <span class="dock-key">C</span>
              <span class="dock-icon">🎬</span>
              <span class="dock-title">Cinema</span>
            </button>
            <button class="dock-btn action-time" id="btn-time" title="Chronostasis Slow-Motion [B]">
              <span class="dock-key">B</span>
              <span class="dock-icon">⏳</span>
              <span class="dock-title">Time</span>
            </button>
            <div class="dock-divider"></div>
            <button class="dock-btn action-smite" id="btn-smite" title="Cast Divine Smite [Q]">
              <span class="dock-key">Q</span>
              <span class="dock-icon">⚡</span>
              <span class="dock-title">Smite</span>
            </button>
          </div>
        </div>

        <!-- Flight Telemetry HUD (Active when flying) -->
        <div id="flight-hud" class="flight-hud hidden">
          <div class="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-950/80 border border-amber-400/40 backdrop-blur-md shadow-lg shadow-amber-500/20">
            <span class="text-sm animate-pulse">🕊️</span>
            <div class="text-[10px] font-mono text-amber-200 tracking-wider">
              <span class="text-amber-400 font-bold">SOAR</span> | ALT: <span id="flight-alt" class="font-bold text-white">0</span>m | SPD: <span id="flight-spd" class="font-bold text-white">0</span> kt
            </div>
          </div>
        </div>

        <!-- Touch Controls for Mobile -->
        <div id="touch-controls" class="touch-controls md:hidden">
          <div id="touch-joystick-zone" class="joystick-zone">
            <div id="joystick-thumb" class="joystick-thumb"></div>
          </div>
          <div class="touch-action-buttons">
            <button id="touch-flight" class="touch-btn" title="Toggle Flight">🕊️</button>
            <button id="touch-smite" class="touch-btn">⚡</button>
            <button id="touch-jump" class="touch-btn">🪽</button>
            <button id="touch-interact" class="touch-btn touch-action-attune">E</button>
          </div>
        </div>

        <!-- Modal Dialog Container -->
        <div id="modal-backdrop" class="modal-backdrop hidden">
          <div id="modal-card" class="modal-card">
            <div class="modal-header">
              <div class="flex items-center space-x-3">
                <span id="modal-icon" class="text-2xl">✦</span>
                <div>
                  <h2 id="modal-title" class="font-cinzel text-xl text-amber-200 font-bold"></h2>
                  <p id="modal-subtitle" class="text-xs text-amber-400/80 font-mono"></p>
                </div>
              </div>
              <button id="modal-close" class="modal-close-btn" title="Close [ESC]">✕</button>
            </div>
            <div id="modal-body" class="modal-body"></div>
          </div>
        </div>

        <!-- Ascension Banner (Triggered upon 4/4 attuned) -->
        <div id="ascension-banner" class="ascension-banner hidden">
          <div class="ascension-content">
            <div class="ascension-glyph">👑</div>
            <h2 class="font-cinzel text-2xl md:text-3xl text-amber-200 font-bold tracking-widest">
              GODHOOD ASCENDED
            </h2>
            <p class="text-amber-100 text-sm mt-1 max-w-md text-center">
              All 4 Sacred Sanctuaries have harmonized with your essence. The Celestial Citadel bows to your divine mastery.
            </p>
            <button id="ascension-dismiss" class="ascension-btn mt-4">Transcend Further</button>
          </div>
        </div>

        <!-- Controls Guide Modal -->
        <div id="help-modal" class="modal-backdrop hidden">
          <div class="modal-card max-w-md">
            <div class="modal-header">
              <h2 class="font-cinzel text-lg text-amber-200 font-bold">Celestial Controls & Powers</h2>
              <button id="help-close" class="modal-close-btn">✕</button>
            </div>
            <div class="modal-body p-6 space-y-4 text-sm text-amber-100/90 font-sans">
              <div class="grid grid-cols-2 gap-3 font-mono text-xs">
                <div class="p-2 bg-slate-900/60 rounded border border-amber-500/20">
                  <span class="text-amber-300 font-bold block">WASD / Arrows</span>
                  Walk & Glide in 3D
                </div>
                <div class="p-2 bg-slate-900/60 rounded border border-amber-500/20">
                  <span class="text-amber-300 font-bold block">F</span>
                  Toggle Divine 3D Flight
                </div>
                <div class="p-2 bg-slate-900/60 rounded border border-amber-500/20">
                  <span class="text-amber-300 font-bold block">SPACE</span>
                  Ascend / Leap / Float
                </div>
                <div class="p-2 bg-slate-900/60 rounded border border-amber-500/20">
                  <span class="text-amber-300 font-bold block">SHIFT</span>
                  Sprint / Dive Boost
                </div>
                <div class="p-2 bg-slate-900/60 rounded border border-amber-500/20">
                  <span class="text-amber-300 font-bold block">MOUSE DRAG</span>
                  Aim Flight & Rotate View
                </div>
                <div class="p-2 bg-slate-900/60 rounded border border-amber-500/20">
                  <span class="text-amber-300 font-bold block">E</span>
                  Attune with Shrine / Obelisk
                </div>
                <div class="p-2 bg-slate-900/60 rounded border border-amber-500/20">
                  <span class="text-amber-300 font-bold block">Q</span>
                  Cast Divine Smite
                </div>
                <div class="p-2 bg-slate-900/60 rounded border border-amber-500/20">
                  <span class="text-amber-300 font-bold block">T</span>
                  Shift Celestial Realm
                </div>
                <div class="p-2 bg-slate-900/60 rounded border border-amber-500/20">
                  <span class="text-amber-300 font-bold block">1, 2, 3, 4</span>
                  Instant Teleport Waypoints
                </div>
                <div class="p-2 bg-slate-900/60 rounded border border-amber-500/20">
                  <span class="text-amber-300 font-bold block">C</span>
                  Cinematic Drone Tour
                </div>
                <div class="p-2 bg-slate-900/60 rounded border border-amber-500/20">
                  <span class="text-amber-300 font-bold block">B</span>
                  Chronostasis (Slow-Mo)
                </div>
              </div>
              <p class="text-xs text-amber-300/70 italic text-center">
                Touchscreens: Use the on-screen joystick and celestial action buttons.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Audio Toggle
    const btnAudio = this.container.querySelector('#btn-audio');
    if (btnAudio) {
      btnAudio.addEventListener('click', () => this.toggleAudio());
    }

    // Realm Shift
    const btnRealm = this.container.querySelector('#btn-realm');
    if (btnRealm) {
      btnRealm.addEventListener('click', () => this.cycleRealm());
    }

    // Help Modal
    const btnHelp = this.container.querySelector('#btn-help');
    const helpModal = this.container.querySelector('#help-modal');
    const helpClose = this.container.querySelector('#help-close');
    if (btnHelp && helpModal) {
      btnHelp.addEventListener('click', () => helpModal.classList.remove('hidden'));
    }
    if (helpClose && helpModal) {
      helpClose.addEventListener('click', () => helpModal.classList.add('hidden'));
    }

    // Modal Close
    const modalClose = this.container.querySelector('#modal-close');
    const backdrop = this.container.querySelector('#modal-backdrop');
    if (modalClose) {
      modalClose.addEventListener('click', () => this.closeModal());
    }
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) this.closeModal();
      });
    }

    // Ascension dismiss
    const ascDismiss = this.container.querySelector('#ascension-dismiss');
    if (ascDismiss) {
      ascDismiss.addEventListener('click', () => {
        this.container.querySelector('#ascension-banner').classList.add('hidden');
      });
    }

    // Quick-Travel Teleports
    const dockButtons = this.container.querySelectorAll('[data-teleport]');
    dockButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-teleport');
        if (this.callbacks.onTeleport) this.callbacks.onTeleport(id);
      });
    });

    // Smite button
    const btnSmite = this.container.querySelector('#btn-smite');
    if (btnSmite) {
      btnSmite.addEventListener('click', () => {
        if (this.callbacks.onSmite) this.callbacks.onSmite();
      });
    }

    // Flight button
    const btnFlight = this.container.querySelector('#btn-flight');
    if (btnFlight) {
      btnFlight.addEventListener('click', () => {
        if (this.callbacks.onFlightToggle) this.callbacks.onFlightToggle();
      });
    }

    // Drone Tour button
    const btnDrone = this.container.querySelector('#btn-drone');
    if (btnDrone) {
      btnDrone.addEventListener('click', () => {
        if (this.callbacks.onDroneTourToggle) this.callbacks.onDroneTourToggle();
      });
    }

    // Chronostasis button
    const btnTime = this.container.querySelector('#btn-time');
    if (btnTime) {
      btnTime.addEventListener('click', () => {
        if (this.callbacks.onChronostasisToggle) this.callbacks.onChronostasisToggle();
      });
    }

    // Touch Controls
    this.initTouchControls();
  }

  initTouchControls() {
    const joyZone = this.container.querySelector('#touch-joystick-zone');
    const joyThumb = this.container.querySelector('#joystick-thumb');
    if (!joyZone || !joyThumb) return;

    let touchId = null;
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e) => {
      if (touchId !== null) return;
      const t = e.changedTouches[0];
      touchId = t.identifier;
      const rect = joyZone.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
      handleTouchMove(e);
    };

    const handleTouchMove = (e) => {
      if (touchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === touchId) {
          let dx = t.clientX - startX;
          let dy = t.clientY - startY;
          const maxDist = 38;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > maxDist) {
            dx = (dx / dist) * maxDist;
            dy = (dy / dist) * maxDist;
          }

          joyThumb.style.transform = `translate(${dx}px, ${dy}px)`;

          if (this.callbacks.onTouchMove) {
            this.callbacks.onTouchMove(dx / maxDist, dy / maxDist);
          }
          break;
        }
      }
    };

    const handleTouchEnd = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          touchId = null;
          joyThumb.style.transform = 'translate(0px, 0px)';
          if (this.callbacks.onTouchMove) this.callbacks.onTouchMove(0, 0);
          break;
        }
      }
    };

    joyZone.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Touch Action buttons
    const btnTouchFlight = this.container.querySelector('#touch-flight');
    const btnTouchSmite = this.container.querySelector('#touch-smite');
    const btnTouchJump = this.container.querySelector('#touch-jump');
    const btnTouchInteract = this.container.querySelector('#touch-interact');

    if (btnTouchFlight) {
      btnTouchFlight.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (this.callbacks.onFlightToggle) this.callbacks.onFlightToggle();
      });
    }

    if (btnTouchSmite) {
      btnTouchSmite.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (this.callbacks.onSmite) this.callbacks.onSmite();
      });
    }

    if (btnTouchJump) {
      btnTouchJump.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (this.callbacks.onTouchJump) this.callbacks.onTouchJump(true);
      });
      btnTouchJump.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (this.callbacks.onTouchJump) this.callbacks.onTouchJump(false);
      });
    }

    if (btnTouchInteract) {
      btnTouchInteract.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (this.callbacks.onInteract) this.callbacks.onInteract();
      });
    }
  }

  updateFlightStatus(isFlying, altitude = 0, speed = 0) {
    const flightBadge = this.container.querySelector('#flight-hud');
    const altEl = this.container.querySelector('#flight-alt');
    const spdEl = this.container.querySelector('#flight-spd');

    if (flightBadge) {
      if (isFlying) {
        flightBadge.classList.remove('hidden');
        if (altEl) altEl.textContent = Math.max(0, Math.round(altitude));
        if (spdEl) spdEl.textContent = Math.round(speed);
      } else {
        flightBadge.classList.add('hidden');
      }
    }
  }

  setCinematicBars(active) {
    const topBar = this.container.querySelector('#cinematic-bar-top');
    const bottomBar = this.container.querySelector('#cinematic-bar-bottom');
    const header = this.container.querySelector('.hud-header');
    const sidebar = this.container.querySelector('.hud-sidebar-right');
    const dock = this.container.querySelector('.hud-dock');

    if (topBar && bottomBar) {
      if (active) {
        topBar.classList.add('active');
        bottomBar.classList.add('active');
        if (header) header.classList.add('cinematic-hide');
        if (sidebar) sidebar.classList.add('cinematic-hide');
        if (dock) dock.classList.add('cinematic-hide');
      } else {
        topBar.classList.remove('active');
        bottomBar.classList.remove('active');
        if (header) header.classList.remove('cinematic-hide');
        if (sidebar) sidebar.classList.remove('cinematic-hide');
        if (dock) dock.classList.remove('cinematic-hide');
      }
    }
  }

  showDroneTitle(title, subtitle) {
    const card = this.container.querySelector('#drone-title-card');
    const titleEl = this.container.querySelector('#drone-title');
    const subtitleEl = this.container.querySelector('#drone-subtitle');
    if (card && titleEl && subtitleEl) {
      titleEl.textContent = title;
      subtitleEl.textContent = subtitle;
      card.classList.remove('hidden');
    }
  }

  hideDroneTitle() {
    const card = this.container.querySelector('#drone-title-card');
    if (card) {
      card.classList.add('hidden');
    }
  }

  updateChronostasisStatus(active) {
    const btnTime = this.container.querySelector('#btn-time');
    if (btnTime) {
      if (active) {
        btnTime.classList.add('active-chronostasis');
      } else {
        btnTime.classList.remove('active-chronostasis');
      }
    }
  }

  toggleAudio() {
    const isPlaying = audioSystem.toggleMute();
    const icon = this.container.querySelector('#audio-icon');
    const label = this.container.querySelector('#audio-label');
    if (icon && label) {
      icon.textContent = isPlaying ? '🔊' : '🔇';
      label.textContent = isPlaying ? 'Synth Active' : 'Muted';
    }
    this.showNotification(isPlaying ? 'Celestial Synth Awakened ♫' : 'Sound Muted', 'info');
  }

  cycleRealm() {
    this.currentRealmIndex = (this.currentRealmIndex + 1) % this.realmKeys.length;
    const realmKey = this.realmKeys[this.currentRealmIndex];
    const realm = CELESTIAL_REALMS[realmKey];

    const label = this.container.querySelector('#realm-label');
    if (label) label.textContent = realm.name;

    audioSystem.playCrystalChime(659.25); // E5
    this.showNotification(`Cosmic Shift: ${realm.name}`, 'info');

    if (this.callbacks.onRealmShift) {
      this.callbacks.onRealmShift(realm);
    }
  }

  toggleHelp() {
    const helpModal = this.container.querySelector('#help-modal');
    if (helpModal) {
      helpModal.classList.toggle('hidden');
    }
  }

  showInteractPrompt(text) {
    const prompt = this.container.querySelector('#interact-prompt');
    const label = this.container.querySelector('#prompt-text');
    if (prompt && label) {
      label.textContent = text;
      prompt.classList.remove('hidden');
    }
  }

  hideInteractPrompt() {
    const prompt = this.container.querySelector('#interact-prompt');
    if (prompt) prompt.classList.add('hidden');
  }

  showNotification(msg, type = 'info') {
    const toast = this.container.querySelector('#notification-toast');
    if (!toast) return;

    toast.textContent = msg;
    toast.className = `notification-toast toast-${type}`;
    toast.classList.remove('hidden');

    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  }

  updateDivineFavor(favor, max = 100) {
    const fill = this.container.querySelector('#favor-fill');
    const val = this.container.querySelector('#favor-val');
    const pct = Math.round((favor / max) * 100);

    if (fill) fill.style.width = `${pct}%`;
    if (val) val.textContent = `${pct}%`;
  }

  updateCompass(yaw) {
    const dial = this.container.querySelector('#compass-dial');
    if (dial) {
      dial.style.transform = `rotate(${-yaw}rad)`;
    }
  }

  updateQuestProgress(attunedCount) {
    const count = this.container.querySelector('#quest-count');
    if (count) count.textContent = `${Math.min(4, attunedCount)} / 4`;

    const checkMap = {
      genesis: 'q-genesis',
      vault: 'q-vault',
      spire: 'q-spire',
      beacon: 'q-beacon'
    };

    // If controller passes attuned set
    if (this.callbacks.getAttunedShrines) {
      const attuned = this.callbacks.getAttunedShrines();
      Object.keys(checkMap).forEach(key => {
        const el = this.container.querySelector(`#${checkMap[key]}`);
        if (el && attuned.has(key)) {
          el.classList.add('quest-done');
          el.querySelector('.q-check').textContent = '✓';
        }
      });
    }
  }

  showAscensionBanner() {
    const banner = this.container.querySelector('#ascension-banner');
    if (banner) banner.classList.remove('hidden');
  }

  // Open rich modal for shrines and relics
  openModal(item) {
    this.isModalOpen = true;
    const backdrop = this.container.querySelector('#modal-backdrop');
    const icon = this.container.querySelector('#modal-icon');
    const title = this.container.querySelector('#modal-title');
    const subtitle = this.container.querySelector('#modal-subtitle');
    const body = this.container.querySelector('#modal-body');

    title.textContent = item.name;
    subtitle.textContent = item.subtitle || '';

    if (item.data.isProjectRelic) {
      // Individual Project Modal
      icon.textContent = '🔮';
      body.innerHTML = this.renderProjectModal(item.data);
    } else if (item.id === 'genesis') {
      icon.textContent = '⚡';
      body.innerHTML = this.renderGenesisModal(item.data);
    } else if (item.id === 'vault') {
      icon.textContent = '🔮';
      body.innerHTML = this.renderVaultOverviewModal(item.data);
    } else if (item.id === 'spire') {
      icon.textContent = '🌌';
      body.innerHTML = this.renderSpireModal(item.data);
    } else if (item.id === 'beacon') {
      icon.textContent = '🕊️';
      body.innerHTML = this.renderBeaconModal(item.data);
      this.bindBeaconForm();
    } else if (item.data && item.data.isAstralObelisk) {
      icon.textContent = item.data.icon || '🌟';
      body.innerHTML = this.renderObeliskModal(item.data);
    }

    backdrop.classList.remove('hidden');
  }

  renderObeliskModal(data) {
    return `
      <div class="space-y-6">
        <div class="p-4 bg-purple-950/30 border border-purple-500/30 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-mono font-bold text-purple-300 uppercase tracking-widest">${data.region}</span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-500/40">Astral Obelisk</span>
          </div>
          <h3 class="text-base font-bold text-amber-200 mb-2">${data.lore.title}</h3>
          <p class="text-sm text-slate-200 leading-relaxed">${data.lore.description}</p>
        </div>

        <div class="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center space-x-3">
          <span class="text-2xl">✨</span>
          <div>
            <div class="text-xs text-amber-300 font-bold">${data.lore.revelation}</div>
            <div class="text-[11px] text-amber-100/70">+50 Divine Favor restored to your Seraph core</div>
          </div>
        </div>

        <div class="text-center pt-2">
          <button class="px-6 py-2 rounded bg-purple-600/80 hover:bg-purple-500 text-white text-xs font-cinzel font-bold tracking-widest shadow-lg shadow-purple-900/50 transition-all cursor-pointer" onclick="window.game.hud.closeModal()">
            Communion Complete
          </button>
        </div>
      </div>
    `;
  }

  closeModal() {
    this.isModalOpen = false;
    const backdrop = this.container.querySelector('#modal-backdrop');
    if (backdrop) backdrop.classList.add('hidden');
    audioSystem.playUIClick();
  }

  renderGenesisModal(data) {
    return `
      <div class="space-y-6">
        <div class="p-4 bg-amber-950/20 border border-amber-500/30 rounded-lg">
          <h3 class="text-sm font-bold text-amber-300 uppercase tracking-wider mb-1">${data.lore.title}</h3>
          <div class="text-xs text-amber-200/80 italic mb-3">${data.lore.role}</div>
          <p class="text-sm text-slate-200 leading-relaxed">${data.lore.description.replace(/\n/g, '<br/>')}</p>
        </div>

        <div>
          <h4 class="text-xs font-mono font-bold text-amber-400 tracking-wider uppercase mb-3">Divine Attributes</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${data.lore.attributes.map(attr => `
              <div class="p-3 bg-slate-900/60 rounded border border-slate-800 flex flex-col">
                <span class="text-[11px] font-mono text-amber-300/70">${attr.label}</span>
                <span class="text-sm font-bold text-slate-100 mt-0.5">${attr.value}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div>
          <h4 class="text-xs font-mono font-bold text-amber-400 tracking-wider uppercase mb-3">Inherent Powers</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            ${data.lore.powers.map(p => `
              <div class="flex items-center space-x-2 text-xs text-slate-300">
                <span class="text-amber-400">✦</span>
                <span>${p}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  renderProjectModal(proj) {
    return `
      <div class="space-y-5">
        <div class="p-4 bg-slate-900/80 border border-cyan-500/30 rounded-lg">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-mono px-2 py-0.5 bg-cyan-950/80 text-cyan-300 rounded border border-cyan-500/30">
              ${proj.category}
            </span>
            <span class="text-xs text-slate-400 font-mono">Status: Ascended</span>
          </div>
          <p class="text-sm text-slate-200 leading-relaxed font-sans">${proj.tagline}</p>
        </div>

        <div>
          <h4 class="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase mb-2">Dimensional Metrics</h4>
          <div class="grid grid-cols-3 gap-3">
            ${Object.entries(proj.stats).map(([k, v]) => `
              <div class="p-3 bg-slate-900/70 rounded border border-slate-800 text-center">
                <div class="text-[11px] text-slate-400 font-mono">${k}</div>
                <div class="text-base font-bold text-cyan-200 mt-1">${v}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div>
          <h4 class="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase mb-2">Constructed With</h4>
          <div class="flex flex-wrap gap-2">
            ${proj.technologies.map(t => `
              <span class="px-2.5 py-1 text-xs font-mono bg-slate-800/80 text-amber-200 rounded border border-amber-500/20">
                ${t}
              </span>
            `).join('')}
          </div>
        </div>

        <div class="pt-2 flex justify-end space-x-3">
          <a href="${proj.link}" target="_blank" rel="noopener noreferrer" class="modal-action-btn">
            <span>Inspect Source Relic</span>
            <span>↗</span>
          </a>
        </div>
      </div>
    `;
  }

  renderVaultOverviewModal(data) {
    return `
      <div class="space-y-5">
        <p class="text-sm text-slate-300">${data.lore.description}</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${data.projects.map(p => `
            <div class="p-4 bg-slate-900/70 rounded border border-slate-800 hover:border-cyan-500/40 transition">
              <div class="flex items-center space-x-2 mb-1">
                <span class="w-2.5 h-2.5 rounded-full" style="background: #${p.color.toString(16).padStart(6, '0')}"></span>
                <h4 class="text-sm font-bold text-slate-100">${p.name}</h4>
              </div>
              <p class="text-xs text-slate-400 mb-3">${p.tagline}</p>
              <div class="flex flex-wrap gap-1">
                ${p.technologies.slice(0, 3).map(t => `
                  <span class="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 text-cyan-300 rounded">${t}</span>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderSpireModal(data) {
    return `
      <div class="space-y-6">
        <p class="text-sm text-slate-300">${data.lore.description}</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${data.skills.map(s => `
            <div class="p-4 bg-slate-900/70 rounded-lg border border-purple-500/30">
              <div class="flex justify-between items-center mb-2">
                <div class="flex items-center space-x-2">
                  <span>${s.icon}</span>
                  <h4 class="text-sm font-bold text-purple-200">${s.category}</h4>
                </div>
                <span class="text-xs font-mono font-bold" style="color: ${s.color}">${s.level}</span>
              </div>
              <div class="grid grid-cols-2 gap-1.5 mt-3">
                ${s.items.map(item => `
                  <div class="text-xs text-slate-300 flex items-center space-x-1.5">
                    <span class="text-purple-400 text-[10px]">◆</span>
                    <span>${item}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderBeaconModal(data) {
    return `
      <div class="space-y-6">
        <p class="text-sm text-slate-300">${data.lore.description}</p>

        <!-- Interactive Prayer / Message Transmission Form -->
        <form id="beacon-form" class="space-y-4 p-5 bg-slate-900/80 rounded-lg border border-emerald-500/30">
          <div class="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
            Cast Prayer to the Ether
          </div>
          <div>
            <label class="block text-xs font-mono text-slate-400 mb-1">Mortal Identifier (Name)</label>
            <input type="text" required id="form-name" placeholder="e.g. Wanderer of Earth" 
              class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-400"/>
          </div>
          <div>
            <label class="block text-xs font-mono text-slate-400 mb-1">Astral Frequency (Email / Contact)</label>
            <input type="email" required id="form-contact" placeholder="wanderer@domain.com"
              class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-400"/>
          </div>
          <div>
            <label class="block text-xs font-mono text-slate-400 mb-1">Incantation / Message</label>
            <textarea required id="form-message" rows="3" placeholder="Speak your intentions to the Deity..."
              class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-400"></textarea>
          </div>
          <button type="submit" class="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold font-cinzel rounded shadow-lg transition">
            ✦ Transmit Prayer Into the Cosmos ✦
          </button>
        </form>

        <div>
          <h4 class="text-xs font-mono font-bold text-emerald-400 tracking-wider uppercase mb-2">Direct Sanctuary Frequencies</h4>
          <div class="grid grid-cols-2 gap-2">
            ${data.lore.channels.map(ch => `
              <div class="p-2.5 bg-slate-900/50 rounded border border-slate-800 text-xs">
                <span class="text-emerald-400 font-mono block text-[11px]">${ch.name}</span>
                <span class="text-slate-200">${ch.value}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  bindBeaconForm() {
    const form = this.container.querySelector('#beacon-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('#form-name').value;

      audioSystem.playCrystalChime(880); // A5
      form.innerHTML = `
        <div class="text-center py-6 space-y-2">
          <div class="text-3xl">🕊️✨</div>
          <h4 class="font-cinzel text-lg text-emerald-300 font-bold">Prayer Ascended</h4>
          <p class="text-xs text-slate-300">
            The deity has received your transmission, ${name}. Your words now ripple across the astral streams.
          </p>
        </div>
      `;
      this.showNotification('Transmission sent into the ether!', 'success');
    });
  }
}
