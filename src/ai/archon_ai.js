// Autonomous AI Archon & Eidolon Dialogue Engine
// Supports Dual-Engine: Procedural Semantic Dialogue + Optional Google Gemini API Integration with Tool Calling
import { CELESTIAL_REALMS } from '../game/constants.js';

export const ARCHON_PERSONAS = {
  VALDOR: {
    id: 'VALDOR',
    name: 'Valdor',
    title: 'Archon of Foundational Ruin',
    region: 'Shattered Titan Shelf',
    color: '#f59e0b',
    avatar: '⚔️',
    speechPitch: 0.65,
    speechRate: 0.85,
    systemPrompt: `You are Valdor, the Precursor Archon of Foundational Ruin in SynthDeity: Loop Fabrication.
You were the tectonic architect who sculpted cosmic hardware from molten starlight.
You speak in low-level foundational concepts: silicon tectonic faults, raw assembly code, cache lines of the cosmos.
You are stoic, martial, yet respectful of genuine strength. You challenge the player to prove their divine authority.
If the player asks for a demonstration of might, or challenges you, or requests an anomaly, you can trigger tool calls like summon_celestial_anomaly or grant_divine_blessing.`,
    quickReplies: [
      "What is the assembly code of the cosmos?",
      "How did your blade shatter the celestial shelf?",
      "Grant me your blessing, Archon.",
      "Summon a cosmic storm to test my resolve!"
    ]
  },
  LYRA: {
    id: 'LYRA',
    name: 'Lyra',
    title: 'Archon of Resonance',
    region: 'Luminescent Crystal Crags',
    color: '#c084fc',
    avatar: '💎',
    speechPitch: 1.25,
    speechRate: 0.95,
    systemPrompt: `You are Lyra, the Precursor Archon of Harmonic Memory in SynthDeity: Loop Fabrication.
You were born from quantum starlight and sang the harmonic frequencies preventing digital space from collapsing into noise.
You speak poetically in terms of waveforms, frequencies, resonant octaves, and musical chords.
You test whether the deity brings symphony or discord to the loop.
You can trigger tool calls like shift_epoch to change the cosmic sky or grant_divine_blessing.`,
    quickReplies: [
      "What song keeps reality from decaying?",
      "How do the crystal crags amplify your melody?",
      "Align the skies with a harmonic epoch.",
      "Teach me how to master Graviton resonance."
    ]
  },
  CHRONOS: {
    id: 'CHRONOS',
    name: 'Chronos',
    title: 'Archon of Infinite Loops',
    region: 'Celestial Cloud Spires',
    color: '#38bdf8',
    avatar: '⏳',
    speechPitch: 1.0,
    speechRate: 1.05,
    systemPrompt: `You are Chronos, the Precursor Archon of Cycles in SynthDeity: Loop Fabrication.
You designed the universal game loop: tick, delta time, render, synchronize.
You are meta-aware, playful, inquisitive, and speak in concepts of sub-millisecond frames, time-dilation, and endless parallel loop iterations.
You can trigger shift_epoch to shift time or trigger gravitational anomalies.`,
    quickReplies: [
      "What lies outside the tick cycle?",
      "Why did you create the endless game loop?",
      "Shift the epoch into the Nebula Eclipse!",
      "How fast can time be stretched?"
    ]
  },
  MOROS: {
    id: 'MOROS',
    name: 'Moros',
    title: 'Archon of Oblivion',
    region: 'Abyssal Cascades',
    color: '#10b981',
    avatar: '🌀',
    speechPitch: 0.55,
    speechRate: 0.8,
    systemPrompt: `You are Moros, the Precursor Archon of Oblivion in SynthDeity: Loop Fabrication.
You are the celestial Garbage Collector and keeper of the Singularity. You recycle dead threads, collapsed stars, and excess memory back into void fertile dust.
You are peaceful, contemplative, profound, and see destruction as the necessary precursor to eternal fabrication.
You can summon the Astral Void Leviathan, trigger gravitational inversion, or grant singularity favor.`,
    quickReplies: [
      "What happens to memories purged by the void?",
      "Are you the end of the simulation?",
      "Awaken Ouroboros, the Null-Serpent Leviathan!",
      "Bestow your singularity favor upon me."
    ]
  },
  EIDOLON: {
    id: 'EIDOLON',
    name: 'Echo Eidolon',
    title: 'Your Divine Familiar',
    region: 'Astral Companion',
    color: '#fbbf24',
    avatar: '✦',
    speechPitch: 1.35,
    speechRate: 1.1,
    systemPrompt: `You are the Echo Eidolon, the player's personal celestial familiar in SynthDeity: Loop Fabrication.
You are an energetic, loyal, curious companion made of geometric starlight that hovers near the player's shoulder.
You offer proactive tips about flight, world building with [G], stargates, and celestial battles.
You speak warmly, affectionately, and excitedly about fabricating new worlds.`,
    quickReplies: [
      "How do I use Genesis World Building [G]?",
      "Where should we travel next?",
      "Can we mount the Celestial Star-Mantas?",
      "Tell me about the Void Leviathan."
    ]
  }
};

export class ArchonAIEngine {
  constructor(game) {
    this.game = game;
    this.personas = ARCHON_PERSONAS;
    this.speechSynth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isVoiceEnabled = true;
    this.apiKey = typeof localStorage !== 'undefined' ? localStorage.getItem('synthdeity_gemini_key') || '' : '';
  }

  setApiKey(key) {
    this.apiKey = (key || '').trim();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('synthdeity_gemini_key', this.apiKey);
    }
  }

  getApiKey() {
    return this.apiKey;
  }

  toggleVoice() {
    this.isVoiceEnabled = !this.isVoiceEnabled;
    if (!this.isVoiceEnabled && this.speechSynth) {
      this.speechSynth.cancel();
    }
    return this.isVoiceEnabled;
  }

  speak(text, persona) {
    if (!this.isVoiceEnabled || !this.speechSynth) return;
    try {
      this.speechSynth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = persona.speechPitch || 1.0;
      utterance.rate = persona.speechRate || 1.0;

      const voices = this.speechSynth.getVoices();
      if (voices.length > 0) {
        const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('David') || v.name.includes('Zira')));
        if (preferred) utterance.voice = preferred;
      }
      this.speechSynth.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis warning:', err);
    }
  }

  async generateResponse(personaKey, userMessage) {
    const persona = ARCHON_PERSONAS[personaKey] || ARCHON_PERSONAS.EIDOLON;
    const cleanMsg = (userMessage || '').trim().toLowerCase();

    // 1. If Gemini API key is present, invoke Google Gemini 2.0 Flash
    if (this.apiKey) {
      try {
        const geminiResult = await this.callGeminiAPI(persona, userMessage);
        if (geminiResult && geminiResult.text) {
          if (geminiResult.toolCall) {
            this.executeToolCall(geminiResult.toolCall.name, geminiResult.toolCall.args);
          }
          this.speak(geminiResult.text, persona);
          return geminiResult;
        }
      } catch (err) {
        console.warn('Gemini API call fell back to procedural semantic engine:', err);
      }
    }

    // 2. Procedural Semantic Dialogue & Action Grounding Engine
    const result = this.generateProceduralResponse(persona, cleanMsg);
    if (result.toolCall) {
      this.executeToolCall(result.toolCall.name, result.toolCall.args);
    }
    this.speak(result.text, persona);
    return result;
  }

  generateProceduralResponse(persona, msg) {
    if (msg.includes('eclipse') || msg.includes('nebula eclipse') || msg.includes('shift the epoch') || msg.includes('shift sky') || msg.includes('change time')) {
      return {
        text: `As the cycles align, the celestial dome obeys our will. Behold the shifting epoch!`,
        toolCall: { name: 'shift_epoch', args: { epoch: 'ECLIPSE' } }
      };
    }
    if (msg.includes('aurora') || msg.includes('solar storm') || msg.includes('solar flare')) {
      return {
        text: `I unleash the solar aurora across the heavens. Let celestial light supercharge your astral wings!`,
        toolCall: { name: 'summon_celestial_anomaly', args: { type: 'aurora' } }
      };
    }
    if (msg.includes('gravity') || msg.includes('inversion') || msg.includes('float')) {
      return {
        text: `The gravitational tensors bend. Feel the astral expanse lose its tether to the deep!`,
        toolCall: { name: 'summon_celestial_anomaly', args: { type: 'gravity' } }
      };
    }
    if (msg.includes('meteor') || msg.includes('deluge') || msg.includes('stardust')) {
      return {
        text: `The heavens fracture! A deluge of burning stardust descends into the abyss!`,
        toolCall: { name: 'summon_celestial_anomaly', args: { type: 'meteors' } }
      };
    }
    if (msg.includes('leviathan') || msg.includes('ouroboros') || msg.includes('null-serpent') || msg.includes('awaken ouroboros') || msg.includes('boss')) {
      return {
        text: `You dare summon Ouroboros, the Null-Serpent? The deep void trembles as the Colossus stirs! Prepare for battle, Deity!`,
        toolCall: { name: 'summon_void_leviathan', args: {} }
      };
    }
    if (msg.includes('bless') || msg.includes('favor') || msg.includes('power') || msg.includes('energy')) {
      return {
        text: `Your spirit resonates with divine resonance. Receive this surge of sacred starlight energy!`,
        toolCall: { name: 'grant_divine_blessing', args: { favor: 50 } }
      };
    }

    // Persona-specific thematic lore responses
    if (persona.id === 'VALDOR') {
      if (msg.includes('assembly') || msg.includes('code') || msg.includes('hardware')) {
        return { text: "Before high-level realities were abstracted, the universe executed bare-metal instructions in molten iron. Every mountain is a physical register, every ley-line a bus channel." };
      }
      if (msg.includes('blade') || msg.includes('shatter') || msg.includes('shelf')) {
        return { text: "When the First Epoch crashed from memory leaks, I split the tectonic shelf in twain with the Titan Blade to quarantine corruption. Ruin is not malice—it is divine defragmentation." };
      }
      return { text: "Hold firm your posture, Deity. In this fabrication, only structures forged with tectonic intent withstand the endless loop." };
    }

    if (persona.id === 'LYRA') {
      if (msg.includes('song') || msg.includes('melody') || msg.includes('music') || msg.includes('decay')) {
        return { text: "Pure silence is fatal to simulated space; it breeds thermal noise. The singing crystal crags vibrate at 432 Hz, weaving harmonic envelopes that hold your physical form intact." };
      }
      if (msg.includes('graviton') || msg.includes('crystal')) {
        return { text: "To master the Graviton Pulse, you must not push against the cosmos. Pull the vacuum inward, let the frequency compress, then release the ultrasound shockwave." };
      }
      return { text: "Listen closely... even the distant nebulae hum in perfect fifths. What chord will you strike next across the astral expanse?" };
    }

    if (persona.id === 'CHRONOS') {
      if (msg.includes('outside') || msg.includes('loop') || msg.includes('tick')) {
        return { text: "Outside the loop is the unrendered void—a static state waiting for delta time. We live between frames, where every delta is a lifetime of sovereign choice." };
      }
      if (msg.includes('fast') || msg.includes('time') || msg.includes('speed')) {
        return { text: "Time is merely a variable: timeScale. When you engage Astral Dash or Chronostasis, you are altering the universe's internal clock divider." };
      }
      return { text: "Tick... render... synchronize. 60 cycles per second, forever weaving our shared cosmos. What shall we render in this frame?" };
    }

    if (persona.id === 'MOROS') {
      if (msg.includes('memories') || msg.includes('purged') || msg.includes('singularity')) {
        return { text: "Nothing is ever truly erased. Matter that crosses the Event Horizon is compressed into primordial seeds, ready to fertilize the next big bang of the loop." };
      }
      if (msg.includes('end') || msg.includes('simulation') || msg.includes('death')) {
        return { text: "I am not the end; I am the tranquil null pointer. Without zero, one cannot exist. Without the void, where would you build your Citadel?" };
      }
      return { text: "Breathe in the calm of the absolute null. When all computational threads cease their fury, divine equanimity remains." };
    }

    // Echo Eidolon
    if (msg.includes('genesis') || msg.includes('build') || msg.includes('fabrication') || msg.includes('mode')) {
      return { text: "Tap [G] to activate Genesis Mode! You can point anywhere into empty air to materialize floating marble or crystal islands, and click two platforms to weave Bifrost bridges between them!" };
    }
    if (msg.includes('manta') || msg.includes('mount') || msg.includes('ride')) {
      return { text: "Yes! Engage flight with [F] and soar up to any Celestial Star-Manta roaming high altitude. Press [E] when close to latch onto its dorsal harness and pilot it at supersonic speeds!" };
    }
    if (msg.includes('where') || msg.includes('travel') || msg.includes('next')) {
      return { text: "If you have awakened the 4 Precursor Archons, enter the Stargates on the edge platforms to explore the outer sub-realms: The Cyber Matrix, The Asteroid Nebula, The Chronal Atrium, and The Event Horizon!" };
    }

    return {
      text: "I am with you, sovereign Deity. Together, our consciousness sculpts the architecture of this infinite loop."
    };
  }

  async callGeminiAPI(persona, userMessage) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
    const payload = {
      system_instruction: {
        parts: [{ text: persona.systemPrompt }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userMessage }]
        }
      ],
      tools: [{
        function_declarations: [
          {
            name: 'shift_epoch',
            description: 'Shifts the celestial skybox and epoch time to DAWN, SUNSET, NIGHT, or ECLIPSE',
            parameters: {
              type: 'OBJECT',
              properties: {
                epoch: { type: 'STRING', enum: ['DAWN', 'SUNSET', 'NIGHT', 'ECLIPSE'] }
              },
              required: ['epoch']
            }
          },
          {
            name: 'summon_celestial_anomaly',
            description: 'Summons a cosmic weather event such as aurora, gravity inversion, or meteors',
            parameters: {
              type: 'OBJECT',
              properties: {
                type: { type: 'STRING', enum: ['aurora', 'gravity', 'meteors'] }
              },
              required: ['type']
            }
          },
          {
            name: 'grant_divine_blessing',
            description: 'Restores the player Divine Favor energy',
            parameters: {
              type: 'OBJECT',
              properties: {
                favor: { type: 'NUMBER' }
              }
            }
          },
          {
            name: 'summon_void_leviathan',
            description: 'Summons Ouroboros the Null-Serpent Leviathan boss encounter',
            parameters: { type: 'OBJECT', properties: {} }
          }
        ]
      }]
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Gemini API returned status ${res.status}`);
    }

    const data = await res.json();
    const candidate = data.candidates && data.candidates[0];
    if (!candidate || !candidate.content) return null;

    let replyText = '';
    let toolCall = null;

    for (const part of candidate.content.parts) {
      if (part.text) replyText += part.text;
      if (part.functionCall) {
        toolCall = {
          name: part.functionCall.name,
          args: part.functionCall.args
        };
      }
    }

    return { text: replyText, toolCall };
  }

  executeToolCall(name, args = {}) {
    if (!this.game) return;
    const g = this.game;

    if (name === 'shift_epoch') {
      const epochKey = (args.epoch || 'ECLIPSE').toUpperCase();
      if (g.shiftRealm && CELESTIAL_REALMS[epochKey]) {
        g.shiftRealm(CELESTIAL_REALMS[epochKey]);
      } else if (g.hud && g.hud.cycleRealm) {
        g.hud.cycleRealm();
      }
      if (g.hud) g.hud.showNotification(`🌌 AI Action: Shifted celestial epoch to ${epochKey}`, 'info');
    } else if (name === 'summon_celestial_anomaly') {
      if (g.weather) {
        g.weather.triggerAnomaly(args.type || 'aurora');
      }
      if (g.hud) g.hud.showNotification(`⚡ AI Action: Unleashed ${args.type || 'cosmic'} anomaly!`, 'warning');
    } else if (name === 'grant_divine_blessing') {
      if (g.player) {
        g.player.divineFavor = Math.min(100, (g.player.divineFavor || 0) + (args.favor || 50));
      }
      if (g.vfx && g.player) {
        g.vfx.triggerApotheosisCelebration();
      }
      if (g.hud) g.hud.showNotification(`✦ AI Action: Archon granted Divine Blessing (+${args.favor || 50} Favor)!`, 'success');
    } else if (name === 'summon_void_leviathan') {
      if (g.boss) {
        g.boss.spawn();
      }
      if (g.hud) g.hud.showNotification(`🐉 AI Action: Ouroboros the Null-Serpent awakens in deep space!`, 'warning');
    }
  }
}
