// Procedural Web Audio Synthesizer for AETHELGARD
// Zero external audio files required - 100% generated in real-time

class CelestialAudio {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.ambientGain = null;
    this.sfxGain = null;
    this.droneOscs = [];
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Master Gains
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.isInitialized = true;
      this.isMuted = false;
      this.startAmbientDrone();
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    if (!this.isInitialized) {
      this.init();
      return !this.isMuted;
    }
    this.resumeContext();
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      const target = this.isMuted ? 0 : 0.7;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.1);
    }
    return !this.isMuted;
  }

  // Generates a lush, ethereal celestial chord drone (F# minor 9 / cosmic pentatonic)
  startAmbientDrone() {
    if (!this.ctx) return;
    const freqs = [92.5, 138.59, 185.0, 220.0, 277.18, 329.63, 440.0]; // F#2, C#3, F#3, A3, C#4, E4, A4

    // Lowpass filter for warm heavenly space vibe
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.Q.setValueAtTime(2, this.ctx.currentTime);
    filter.connect(this.ambientGain);
    this.droneFilter = filter;

    // Subtle LFO filter sweep for celestial breathing effect
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(200, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      // Slight detune for rich choral spread
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.detune.setValueAtTime((idx - 3) * 6, this.ctx.currentTime);

      oscGain.gain.setValueAtTime(0.08 / freqs.length, this.ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();
      this.droneOscs.push(osc);
    });
  }

  // Cinematic Sub-Bass Impact Boom (smite, teleport, high-impact landings)
  playSubBassImpact() {
    if (!this.ctx || this.isMuted) return;
    this.resumeContext();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 0.8);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.95);
  }

  // Modulate audio frequency spectrum for Chronostasis (Bullet-Time)
  setTimeWarpFilter(isSlowMo) {
    if (!this.ctx || !this.droneFilter) return;
    const targetFreq = isSlowMo ? 140 : 450;
    this.droneFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.2);
  }

  // Crystal Bell chime for shrine attunement and holy interaction
  playCrystalChime(baseFreq = 587.33) { // D5
    if (!this.ctx || this.isMuted) return;
    this.resumeContext();

    const t = this.ctx.currentTime;
    const harmonicRatios = [1, 1.5, 2.01, 2.76, 3.42, 4.2];

    harmonicRatios.forEach((ratio, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * ratio, t);

      const amp = 0.2 / (i + 1);
      gain.gain.setValueAtTime(amp, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.5 + i * 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 3.0);
    });
  }

  // Divine Smite thunder sound
  playDivineSmite() {
    if (!this.ctx || this.isMuted) return;
    this.resumeContext();

    const t = this.ctx.currentTime;

    // 1. High frequency electrical crack
    const crackOsc = this.ctx.createOscillator();
    const crackGain = this.ctx.createGain();
    crackOsc.type = 'sawtooth';
    crackOsc.frequency.setValueAtTime(900, t);
    crackOsc.frequency.exponentialRampToValueAtTime(60, t + 0.3);

    crackGain.gain.setValueAtTime(0.4, t);
    crackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    crackOsc.connect(crackGain);
    crackGain.connect(this.sfxGain);
    crackOsc.start(t);
    crackOsc.stop(t + 0.4);

    // 2. Low boom / thunder roll
    const boomOsc = this.ctx.createOscillator();
    const boomGain = this.ctx.createGain();
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(140, t);
    boomOsc.frequency.exponentialRampToValueAtTime(30, t + 1.2);

    boomGain.gain.setValueAtTime(0.6, t);
    boomGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);

    boomOsc.connect(boomGain);
    boomGain.connect(this.sfxGain);
    boomOsc.start(t);
    boomOsc.stop(t + 1.7);
  }

  // Jump / Flight Ascend sound
  playAscendSound() {
    if (!this.ctx || this.isMuted) return;
    this.resumeContext();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(660, t + 0.4);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.55);
  }

  // Hover pulse / soft step
  playHoverStep() {
    if (!this.ctx || this.isMuted) return;
    this.resumeContext();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.12);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  // UI click / select sound
  playUIClick() {
    if (!this.ctx || this.isMuted) return;
    this.resumeContext();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.08);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  // Apotheosis victory fanfare
  playApotheosis() {
    if (!this.ctx || this.isMuted) return;
    this.resumeContext();

    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playCrystalChime(freq);
      }, idx * 160);
    });
  }

  // Flight whoosh / cosmic slipstream sound
  playFlightWhoosh(isEntering = true) {
    if (!this.ctx || this.isMuted) return;
    this.resumeContext();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isEntering ? 200 : 800, t);
    filter.frequency.exponentialRampToValueAtTime(isEntering ? 900 : 250, t + 0.55);
    filter.Q.setValueAtTime(3, t);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(isEntering ? 120 : 220, t);
    osc.frequency.exponentialRampToValueAtTime(isEntering ? 320 : 90, t + 0.55);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.65);
  }
}

export const audioSystem = new CelestialAudio();
