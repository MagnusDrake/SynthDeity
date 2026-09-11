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
                SYNTHDEITY
              </h1>
              <div class="text-xs text-amber-400/80 tracking-widest uppercase">
                Loop Fabrication
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
            <button id="btn-genesis" class="hud-btn" title="Genesis World-Fabrication Mode [G]">
              <span class="hud-icon">🔨</span>
              <span class="hidden md:inline text-xs">Genesis</span>
            </button>

            <button id="btn-eidolon" class="hud-btn" title="Speak with Echo Eidolon [Y]">
              <span class="hud-icon">✦</span>
              <span class="hidden md:inline text-xs">Companion</span>
            </button>

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
              <span id="quest-title" class="quest-title">DIVINE ASCENSION</span>
              <span id="quest-count" class="quest-progress">0 / 4</span>
            </div>
            <div id="quest-list" class="quest-list">
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

        <!-- Divine Powers & Action Hotbar (Bottom Center) -->
        <div class="hud-dock">
          <div class="dock-buttons">
            <button class="dock-btn action-smite" id="btn-smite" title="Cast Divine Smite [Q / LMB]">
              <span class="dock-key">Q</span>
              <span class="dock-icon">⚡</span>
              <span class="dock-title">Smite</span>
            </button>
            <button class="dock-btn power-btn locked" id="power-meteor" data-power="meteor" title="Meteor Tremor [1] (Conquer Titan Shelf)">
              <span class="dock-key">1</span>
              <span class="dock-icon">☄️</span>
              <span class="dock-title">Meteor</span>
              <span class="lock-indicator">🔒</span>
            </button>
            <button class="dock-btn power-btn locked" id="power-graviton" data-power="graviton" title="Graviton Pulse [2] (Conquer Crystal Crags)">
              <span class="dock-key">2</span>
              <span class="dock-icon">🔮</span>
              <span class="dock-title">Graviton</span>
              <span class="lock-indicator">🔒</span>
            </button>
            <button class="dock-btn power-btn locked" id="power-blink" data-power="blink" title="Astral Dash [3] (Conquer Cloud Spires)">
              <span class="dock-key">3</span>
              <span class="dock-icon">⚡</span>
              <span class="dock-title">Dash</span>
              <span class="lock-indicator">🔒</span>
            </button>
            <button class="dock-btn power-btn locked" id="power-singularity" data-power="singularity" title="Singularity Vortex [4] (Conquer Abyssal Cascades)">
              <span class="dock-key">4</span>
              <span class="dock-icon">🌌</span>
              <span class="dock-title">Vortex</span>
              <span class="lock-indicator">🔒</span>
            </button>
            <div class="dock-divider"></div>
            <button class="dock-btn action-flight" id="btn-flight" title="Toggle Divine Flight [F]">
              <span class="dock-key">F</span>
              <span class="dock-icon">🕊️</span>
              <span class="dock-title">Fly</span>
            </button>
            <button class="dock-btn action-time" id="btn-time" title="Chronostasis Slow-Motion [B]">
              <span class="dock-key">B</span>
              <span class="dock-icon">⏳</span>
              <span class="dock-title">Time</span>
            </button>
            <button class="dock-btn action-tour" id="btn-drone" title="Cinematic Drone Tour [C]">
              <span class="dock-key">C</span>
              <span class="dock-icon">🎬</span>
              <span class="dock-title">Cinema</span>
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

        <!-- Astral Void Leviathan Boss Health Bar -->
        <div id="boss-hud-container" class="fixed top-20 left-1/2 -translate-x-1/2 z-40 hidden flex flex-col items-center w-full max-w-xl px-4 pointer-events-none">
          <div class="flex justify-between items-center w-full text-xs font-mono text-amber-300 font-bold mb-1">
            <span id="boss-name" class="font-cinzel text-sm tracking-wider text-rose-400 drop-shadow-md">Ouroboros, The Null-Serpent</span>
            <span id="boss-hp-val" class="text-rose-300">1000 / 1000</span>
          </div>
          <div class="w-full h-3.5 bg-slate-950/90 rounded-full border border-rose-500/50 overflow-hidden shadow-2xl backdrop-blur-md">
            <div id="boss-hp-bar" class="h-full bg-gradient-to-r from-rose-600 via-purple-600 to-amber-500 transition-all duration-200" style="width: 100%;"></div>
          </div>
        </div>

        <!-- Genesis World-Fabrication Dock (Active when [G] is toggled) -->
        <div id="genesis-dock" class="fixed bottom-28 left-1/2 -translate-x-1/2 z-40 hidden bg-slate-900/95 border border-amber-500/40 rounded-xl px-5 py-3 shadow-2xl backdrop-blur-lg flex items-center space-x-3">
          <div class="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider pr-2 border-r border-slate-700">
            🔨 GENESIS
          </div>
          <button id="genesis-tool-island" class="genesis-btn px-3 py-1.5 rounded text-xs font-mono bg-amber-500/30 text-amber-200 border border-amber-400/50 hover:bg-amber-500/40 transition">
            🏝️ Island
          </button>
          <button id="genesis-tool-bridge" class="genesis-btn px-3 py-1.5 rounded text-xs font-mono bg-slate-800/60 text-slate-300 border border-slate-700 hover:bg-slate-700 transition">
            🌈 Bridge
          </button>
          <button id="genesis-tool-crystal" class="genesis-btn px-3 py-1.5 rounded text-xs font-mono bg-slate-800/60 text-slate-300 border border-slate-700 hover:bg-slate-700 transition">
            💎 Crystal
          </button>
          <div class="h-5 w-[1px] bg-slate-700"></div>
          <select id="genesis-mat-select" class="bg-slate-950 border border-slate-700 text-xs font-mono text-amber-300 rounded px-2 py-1 focus:outline-none">
            <option value="marble">⚪ Gold Marble</option>
            <option value="rune">🔮 Rune Slate</option>
            <option value="rock">🪨 Crystal Rock</option>
          </select>
          <div class="h-5 w-[1px] bg-slate-700"></div>
          <button id="genesis-undo" class="px-2.5 py-1.5 rounded text-xs font-mono bg-rose-950/40 text-rose-300 border border-rose-800/50 hover:bg-rose-900/40 transition" title="Dematerialize last created structure">
            ✕ Undo
          </button>
        </div>

        <!-- Conversational Archon & AI Dialogue Modal -->
        <div id="ai-dialogue-modal" class="fixed inset-0 z-50 hidden bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div class="bg-slate-900/95 border border-amber-500/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <!-- Header -->
            <div class="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
              <div class="flex items-center space-x-3">
                <div id="dialogue-avatar" class="text-3xl">⚔️</div>
                <div>
                  <h3 id="dialogue-title" class="font-cinzel text-lg font-bold text-amber-200">Valdor</h3>
                  <p id="dialogue-subtitle" class="text-xs font-mono text-amber-400/80">Archon of Foundational Ruin</p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <button id="dialogue-voice-btn" class="p-2 rounded bg-slate-800/60 hover:bg-slate-700 text-xs font-mono text-amber-300" title="Toggle AI Voice Output">
                  🔊 Voice
                </button>
                <button id="dialogue-key-btn" class="p-2 rounded bg-slate-800/60 hover:bg-slate-700 text-xs font-mono text-amber-300" title="Set Google Gemini API Key">
                  🔑 API Key
                </button>
                <button id="dialogue-close-btn" class="p-2 rounded bg-slate-800/60 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 text-sm font-bold">
                  ✕
                </button>
              </div>
            </div>

            <!-- Archon Lore Drawer (Sacred Mythos & Trial Details) -->
            <div id="dialogue-lore-drawer" class="border-b border-slate-800 bg-slate-950/80 px-4 py-2">
              <button id="dialogue-lore-toggle" class="flex justify-between items-center w-full text-xs font-mono text-amber-300 hover:text-amber-200 cursor-pointer">
                <span class="flex items-center space-x-2">
                  <span>📜</span>
                  <span id="dialogue-lore-label" class="font-bold tracking-wider uppercase">Archon Mythos & Lore</span>
                </span>
                <span id="dialogue-lore-status" class="text-[10px] text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">▼ View Sacred Lore</span>
              </button>
              <div id="dialogue-lore-content" class="hidden mt-2 pt-2 border-t border-slate-800/80 text-xs text-slate-300 space-y-2 max-h-48 overflow-y-auto font-sans">
                <!-- Injected dynamically -->
              </div>
            </div>

            <!-- Chat History -->
            <div id="dialogue-messages" class="p-4 overflow-y-auto space-y-3 flex-1 text-sm font-sans min-h-[220px]">
              <!-- Messages injected dynamically -->
            </div>

            <!-- Quick Reply Chips -->
            <div id="dialogue-quick-replies" class="px-4 py-2 bg-slate-950/40 border-t border-slate-800/60 flex flex-wrap gap-1.5">
              <!-- Quick prompts injected dynamically -->
            </div>

            <!-- Input Bar -->
            <div class="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center space-x-2">
              <input type="text" id="dialogue-input" placeholder="Speak with the Archon... (Enter to send)"
                class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400"/>
              <button id="dialogue-send-btn" class="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold rounded-lg text-sm transition">
                Send ✦
              </button>
            </div>
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
              DIVINE ASCENSION ACHIEVED
            </h2>
            <p class="text-amber-100 text-sm mt-1 max-w-md text-center">
              The 4 Sacred Sanctuaries have harmonized with your essence. The Celestial Citadel bows to your mastery!
            </p>
            <button id="ascension-dismiss" class="ascension-btn mt-4">Awaken the Archons</button>
          </div>
        </div>

        <!-- Galactic Sovereignty Banner (Triggered upon 4/4 Archons Awakened) -->
        <div id="galactic-banner" class="ascension-banner hidden">
          <div class="ascension-content">
            <div class="ascension-glyph">🌌</div>
            <h2 class="font-cinzel text-2xl md:text-3xl text-cyan-200 font-bold tracking-widest">
              GALACTIC SOVEREIGNTY ACHIEVED
            </h2>
            <p class="text-cyan-100 text-sm mt-1 max-w-md text-center">
              The Four Precursor Archons have re-aligned. All Ley-Line Bridges illuminate the cosmos. The Galaxy of SynthDeity is fully fabricated!
            </p>
            <button id="galactic-dismiss" class="ascension-btn mt-4">Command the Cosmos</button>
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
                <div class="p-2 bg-slate-900/60 rounded border border-cyan-500/40 col-span-2">
                  <span class="text-cyan-300 font-bold block">🕊️ Celestial Star-Manta Controls</span>
                  [E] Mount / Dismount • [WASD] Steer • [Space] Ascend • [S] Descend • [Shift] Turbo Boost
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
    // Genesis Toggle [G]
    const btnGenesis = this.container.querySelector('#btn-genesis');
    if (btnGenesis) {
      btnGenesis.addEventListener('click', () => {
        if (this.callbacks.onToggleGenesis) this.callbacks.onToggleGenesis();
      });
    }

    // Eidolon Dialogue [Y]
    const btnEidolon = this.container.querySelector('#btn-eidolon');
    if (btnEidolon) {
      btnEidolon.addEventListener('click', () => {
        if (this.callbacks.onOpenEidolon) this.callbacks.onOpenEidolon();
      });
    }

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
        this.switchToArchonTracker();
      });
    }

    // Galactic dismiss
    const galDismiss = this.container.querySelector('#galactic-dismiss');
    if (galDismiss) {
      galDismiss.addEventListener('click', () => {
        this.container.querySelector('#galactic-banner').classList.add('hidden');
        this.showNotification('🌌 Galactic Sovereign: Command the Cosmos at will!', 'success');
      });
    }

    // Divine Powers dock buttons
    const powerButtons = this.container.querySelectorAll('.power-btn');
    powerButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const power = btn.getAttribute('data-power');
        if (this.callbacks.onCastPower) {
          this.callbacks.onCastPower(power);
        }
      });
    });

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

  showInteractPrompt(text, key = 'E') {
    const prompt = this.container.querySelector('#interact-prompt');
    const label = this.container.querySelector('#prompt-text');
    const keyEl = this.container.querySelector('.prompt-key');
    if (prompt && label) {
      label.textContent = text;
      if (keyEl) {
        if (!key) {
          keyEl.classList.add('hidden');
        } else {
          keyEl.textContent = key;
          keyEl.classList.remove('hidden');
        }
      }
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

  showGalacticSovereigntyBanner() {
    const banner = this.container.querySelector('#galactic-banner');
    if (banner) banner.classList.remove('hidden');
  }

  switchToArchonTracker() {
    const title = this.container.querySelector('#quest-title');
    const count = this.container.querySelector('#quest-count');
    const list = this.container.querySelector('#quest-list');
    if (title) title.textContent = 'ARCHON AWAKENING';
    if (count) count.textContent = '0 / 4';
    if (list) {
      list.innerHTML = `
        <div class="quest-item" id="qa-titan">
          <span class="q-check">○</span>
          <span>Titan Shelf: Purge Void Rifts</span>
        </div>
        <div class="quest-item" id="qa-crystal">
          <span class="q-check">○</span>
          <span>Crystal Crags: Harmonic Slalom</span>
        </div>
        <div class="quest-item" id="qa-chronos">
          <span class="q-check">○</span>
          <span>Cloud Spires: Eclipse Sync</span>
        </div>
        <div class="quest-item" id="qa-abyss">
          <span class="q-check">○</span>
          <span>Abyssal Cascades: Contain Glyphs</span>
        </div>
      `;
    }
    this.showNotification('Act II Unlocked: Conquer the Archon Trials across the 4 Outer Realms!', 'info');
  }

  updateArchonProgress(count, realmKey) {
    const countEl = this.container.querySelector('#quest-count');
    if (countEl) countEl.textContent = `${count} / 4`;

    const map = {
      TITAN: 'qa-titan',
      CRYSTAL: 'qa-crystal',
      CHRONOS: 'qa-chronos',
      ABYSS: 'qa-abyss'
    };

    if (realmKey && map[realmKey]) {
      const el = this.container.querySelector(`#${map[realmKey]}`);
      if (el) {
        el.classList.add('quest-done');
        const check = el.querySelector('.q-check');
        if (check) check.textContent = '✓';
      }
    }
  }

  unlockPowerButton(powerKey) {
    const btnMap = {
      meteor: '#power-meteor',
      graviton: '#power-graviton',
      blink: '#power-blink',
      singularity: '#power-singularity'
    };
    const selector = btnMap[powerKey];
    if (selector) {
      const btn = this.container.querySelector(selector);
      if (btn) {
        btn.classList.remove('locked');
        btn.classList.add('unlocked');
        const lock = btn.querySelector('.lock-indicator');
        if (lock) lock.remove();
        btn.classList.add('animate-pulse');
        setTimeout(() => btn.classList.remove('animate-pulse'), 3000);
      }
    }
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
    const realmKey = (data.realmId || 'titan').toUpperCase();
    const archonShort = data.archonName ? data.archonName.split(',')[0] : 'Archon';
    return `
      <div class="space-y-4">
        <!-- Region & Type Badge -->
        <div class="p-4 bg-purple-950/40 border border-purple-500/30 rounded-xl">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest">${data.region}</span>
            <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/40 font-mono">Precursor Obelisk</span>
          </div>
          <div class="flex items-center space-x-2 mb-1">
            <span class="text-xl">${data.icon || '⚔️'}</span>
            <h3 class="text-base font-cinzel font-bold text-amber-200">${data.lore.title}</h3>
          </div>
          <p class="text-xs font-mono text-purple-300/90 mb-2">Sovereign: ${data.lore.archon || data.archonName}</p>
          <p class="text-sm text-slate-200 leading-relaxed font-sans">${data.lore.description}</p>
        </div>

        <!-- Revelation & Divine Favor -->
        <div class="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center space-x-3.5">
          <span class="text-2xl animate-pulse">✨</span>
          <div>
            <div class="text-xs text-amber-300 font-bold tracking-wide">${data.lore.revelation}</div>
            <div class="text-[11px] text-amber-100/75 mt-0.5">+50 Divine Favor attuned to your Seraph core</div>
          </div>
        </div>

        <!-- Endgame Archon Trial & Power Reward -->
        ${data.trial ? `
        <div class="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">⚔️ ${data.trial.name}: ${data.trial.title}</span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">Trial</span>
          </div>
          <p class="text-xs text-slate-300 mb-2">${data.trial.objective}</p>
          <div class="flex items-center space-x-2 text-xs font-mono text-amber-300/90 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-700/50">
            <span>🎁 Reward:</span>
            <span class="font-bold text-amber-200">${data.power.icon} ${data.power.name} [Key ${data.power.key}]</span>
          </div>
        </div>
        ` : ''}

        <!-- Dual Actions: Converse with AI Archon OR Complete Communion -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-cinzel font-bold tracking-wider shadow-lg shadow-amber-900/30 transition-all cursor-pointer flex items-center justify-center space-x-2"
            onclick="window.game.hud.openDialogueForObelisk('${realmKey}')">
            <span>💬</span>
            <span>Converse with ${archonShort} [AI]</span>
          </button>
          <button class="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-cinzel font-bold tracking-wider border border-slate-700 hover:border-slate-600 shadow-md transition-all cursor-pointer"
            onclick="window.game.hud.closeModal()">
            <span>✦ Attunement Complete</span>
          </button>
        </div>
      </div>
    `;
  }

  openDialogueForObelisk(realmKey) {
    this.closeModal();
    if (!window.game || !window.game.aiEngine) return;
    const persona = window.game.aiEngine.personas[realmKey] || window.game.aiEngine.personas.VALDOR;
    this.openDialogue(persona, window.game.aiEngine);
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

  // =========================================================================
  // GENESIS WORLD-BUILDING DOCK
  // =========================================================================
  toggleGenesisToolbar(visible) {
    const dock = this.container.querySelector('#genesis-dock');
    if (dock) {
      if (visible) dock.classList.remove('hidden');
      else dock.classList.add('hidden');
    }
  }

  bindGenesisEvents(sandbox) {
    if (!sandbox) return;

    const btnIsland = this.container.querySelector('#genesis-tool-island');
    const btnBridge = this.container.querySelector('#genesis-tool-bridge');
    const btnCrystal = this.container.querySelector('#genesis-tool-crystal');
    const matSelect = this.container.querySelector('#genesis-mat-select');
    const btnUndo = this.container.querySelector('#genesis-undo');

    const setActive = (activeBtn) => {
      [btnIsland, btnBridge, btnCrystal].forEach(b => {
        if (!b) return;
        b.classList.remove('bg-amber-500/30', 'text-amber-200', 'border-amber-400/50');
        b.classList.add('bg-slate-800/60', 'text-slate-300', 'border-slate-700');
      });
      activeBtn.classList.add('bg-amber-500/30', 'text-amber-200', 'border-amber-400/50');
      activeBtn.classList.remove('bg-slate-800/60', 'text-slate-300', 'border-slate-700');
    };

    if (btnIsland) {
      btnIsland.addEventListener('click', () => {
        sandbox.setTool('island');
        setActive(btnIsland);
      });
    }
    if (btnBridge) {
      btnBridge.addEventListener('click', () => {
        sandbox.setTool('bridge');
        setActive(btnBridge);
      });
    }
    if (btnCrystal) {
      btnCrystal.addEventListener('click', () => {
        sandbox.setTool('crystal');
        setActive(btnCrystal);
      });
    }
    if (matSelect) {
      matSelect.addEventListener('change', (e) => {
        sandbox.setMaterial(e.target.value);
      });
    }
    if (btnUndo) {
      btnUndo.addEventListener('click', () => {
        sandbox.dematerializeLast();
      });
    }
  }

  // =========================================================================
  // CONVERSATIONAL AI & ARCHON DIALOGUE MODAL
  // =========================================================================
  openDialogue(persona, aiEngine) {
    const modal = this.container.querySelector('#ai-dialogue-modal');
    if (!modal) return;

    this.isDialogueOpen = true;
    modal.classList.remove('hidden');

    const avatar = modal.querySelector('#dialogue-avatar');
    const title = modal.querySelector('#dialogue-title');
    const subtitle = modal.querySelector('#dialogue-subtitle');
    const msgBox = modal.querySelector('#dialogue-messages');
    const quickRepliesBox = modal.querySelector('#dialogue-quick-replies');
    const input = modal.querySelector('#dialogue-input');
    const sendBtn = modal.querySelector('#dialogue-send-btn');
    const closeBtn = modal.querySelector('#dialogue-close-btn');
    const voiceBtn = modal.querySelector('#dialogue-voice-btn');
    const keyBtn = modal.querySelector('#dialogue-key-btn');

    avatar.innerText = persona.avatar || '✦';
    title.innerText = persona.name;
    title.style.color = persona.color || '#f59e0b';
    subtitle.innerText = `${persona.title} • ${persona.region}`;

    // Reset messages with introductory greeting
    msgBox.innerHTML = `
      <div class="p-3 bg-slate-950/70 border border-slate-800 rounded-xl max-w-[85%] text-slate-200">
        <div class="text-[11px] font-mono text-amber-400/90 font-bold mb-1">${persona.name}</div>
        <p>I am ${persona.name}, ${persona.title}. What knowledge or challenge do you seek from the loop?</p>
      </div>
    `;

    // Render quick reply action chips
    quickRepliesBox.innerHTML = '';
    (persona.quickReplies || []).forEach(q => {
      const chip = document.createElement('button');
      chip.className = 'px-2.5 py-1 text-xs font-sans rounded-full bg-slate-800/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-200 border border-slate-700 transition';
      chip.innerText = q;
      chip.addEventListener('click', () => {
        this.sendDialogueMessage(q, persona, aiEngine);
      });
      quickRepliesBox.appendChild(chip);
    });

    // Wire send
    const handleSend = () => {
      const val = (input.value || '').trim();
      if (!val) return;
      input.value = '';
      this.sendDialogueMessage(val, persona, aiEngine);
    };

    sendBtn.onclick = handleSend;
    input.onkeydown = (e) => {
      if (e.key === 'Enter') handleSend();
    };

    closeBtn.onclick = () => this.closeDialogue();
    voiceBtn.onclick = () => {
      const enabled = aiEngine.toggleVoice();
      voiceBtn.innerText = enabled ? '🔊 Voice' : '🔇 Muted';
      voiceBtn.classList.toggle('text-amber-300', enabled);
      voiceBtn.classList.toggle('text-slate-400', !enabled);
    };
    keyBtn.onclick = () => {
      const current = aiEngine.getApiKey();
      const entered = window.prompt('Enter Google Gemini API Key (or leave blank for Procedural Semantic AI):', current);
      if (entered !== null) {
        aiEngine.setApiKey(entered);
        this.showNotification(entered ? 'Gemini API Key Saved!' : 'Switched to Procedural Semantic AI', 'info');
      }
    };

    // Render Archon Lore Drawer
    const loreDrawer = modal.querySelector('#dialogue-lore-drawer');
    const loreToggle = modal.querySelector('#dialogue-lore-toggle');
    const loreStatus = modal.querySelector('#dialogue-lore-status');
    const loreContent = modal.querySelector('#dialogue-lore-content');
    const loreLabel = modal.querySelector('#dialogue-lore-label');

    if (loreDrawer && persona.lore) {
      loreDrawer.classList.remove('hidden');
      if (loreLabel) loreLabel.innerText = `${persona.name}'s Sacred Mythos & Lore`;
      if (loreContent) {
        loreContent.innerHTML = `
          <div class="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-cinzel font-bold text-amber-200">${persona.lore.title || ''}</span>
              <span class="text-[10px] font-mono text-purple-300 uppercase">${persona.region || ''}</span>
            </div>
            <p class="text-xs text-slate-200 leading-relaxed font-sans">${persona.lore.description || ''}</p>
          </div>
          ${persona.lore.revelation ? `
          <div class="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center space-x-2 text-xs text-amber-200">
            <span>✨</span>
            <span class="font-bold">${persona.lore.revelation}</span>
          </div>` : ''}
          ${persona.trial ? `
          <div class="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs space-y-1">
            <div class="font-mono font-bold text-cyan-300 flex justify-between">
              <span>⚔️ ${persona.trial.name}: ${persona.trial.title}</span>
              <span class="text-[10px] text-cyan-400/80 font-mono">Trial</span>
            </div>
            <p class="text-[11px] text-slate-300">${persona.trial.objective}</p>
            ${persona.power ? `<div class="text-[11px] font-mono text-amber-300 mt-1">🎁 Unlocks: ${persona.power.icon} ${persona.power.name} [Key ${persona.power.key}]</div>` : ''}
          </div>` : ''}
        `;
        loreContent.classList.add('hidden');
      }
      if (loreStatus) loreStatus.innerText = '▼ View Sacred Lore';
      if (loreToggle) {
        loreToggle.onclick = () => {
          if (!loreContent) return;
          const isHidden = loreContent.classList.toggle('hidden');
          if (loreStatus) loreStatus.innerText = isHidden ? '▼ View Sacred Lore' : '▲ Collapse Lore';
        };
      }
    } else if (loreDrawer) {
      loreDrawer.classList.add('hidden');
    }

    input.focus();
  }

  async sendDialogueMessage(text, persona, aiEngine) {
    const modal = this.container.querySelector('#ai-dialogue-modal');
    if (!modal) return;
    const msgBox = modal.querySelector('#dialogue-messages');

    // Append Player Message
    msgBox.innerHTML += `
      <div class="flex justify-end">
        <div class="p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl max-w-[85%] text-amber-100">
          <div class="text-[11px] font-mono text-amber-300 font-bold mb-1">Deity</div>
          <p>${text}</p>
        </div>
      </div>
    `;
    msgBox.scrollTop = msgBox.scrollHeight;

    // Loading indicator
    const loadId = 'ai-loading-' + Date.now();
    msgBox.innerHTML += `
      <div id="${loadId}" class="p-3 bg-slate-950/70 border border-slate-800 rounded-xl max-w-[85%] text-slate-400 italic text-xs">
        ${persona.name} is formulating response...
      </div>
    `;
    msgBox.scrollTop = msgBox.scrollHeight;

    try {
      const res = await aiEngine.generateResponse(persona.id, text);
      const loadingEl = document.getElementById(loadId);
      if (loadingEl) loadingEl.remove();

      msgBox.innerHTML += `
        <div class="p-3 bg-slate-950/70 border border-slate-800 rounded-xl max-w-[85%] text-slate-200">
          <div class="text-[11px] font-mono text-amber-400/90 font-bold mb-1">${persona.name}</div>
          <p>${res.text}</p>
        </div>
      `;
      msgBox.scrollTop = msgBox.scrollHeight;
    } catch (err) {
      console.error(err);
      const loadingEl = document.getElementById(loadId);
      if (loadingEl) loadingEl.remove();
    }
  }

  closeDialogue() {
    const modal = this.container.querySelector('#ai-dialogue-modal');
    if (modal) modal.classList.add('hidden');
    this.isDialogueOpen = false;
  }

  // =========================================================================
  // ASTRAL VOID LEVIATHAN BOSS HEALTH BAR
  // =========================================================================
  showBossHealthBar(name, hp, maxHp) {
    const container = this.container.querySelector('#boss-hud-container');
    if (!container) return;
    container.classList.remove('hidden');
    this.updateBossHealth(hp, maxHp);
    const nameEl = container.querySelector('#boss-name');
    if (nameEl) nameEl.innerText = name;
  }

  updateBossHealth(hp, maxHp) {
    const container = this.container.querySelector('#boss-hud-container');
    if (!container) return;
    const bar = container.querySelector('#boss-hp-bar');
    const val = container.querySelector('#boss-hp-val');
    const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));

    if (bar) bar.style.width = `${pct}%`;
    if (val) val.innerText = `${Math.round(hp)} / ${maxHp}`;
  }

  hideBossHealthBar() {
    const container = this.container.querySelector('#boss-hud-container');
    if (container) container.classList.add('hidden');
  }
}

