// Game Constants, World Lore, Projects, and Skills Data for SYNTHDEITY: LOOP FABRICATION

export const SHRINES = {
  GENESIS: {
    id: 'genesis',
    name: 'The Monolith of Genesis',
    subtitle: 'Divine Origin & Creator Dossier',
    position: { x: 0, y: 0, z: -48 },
    color: 0xffd700, // Divine Gold
    icon: '⚡',
    lore: {
      title: 'Architect of Realities',
      role: 'Omnipotent Digital Craftsman & Systems Sovereign',
      description: `Forged in the crucible of deep mathematics, graphics acceleration, and neural matrices. 
I do not merely write code — I weave living, reactive digital ecosystems that bend browsers to celestial will. 
Every pixel is aligned to divine geometry, every microsecond of latency is scorched from existence.`,
      attributes: [
        { label: 'Divine Affinity', value: 'Creative Engineering & Systems Architecture' },
        { label: 'Cosmic Rank', value: 'Prime Ascendant (Level 99)' },
        { label: 'Reality Warping', value: '100% WebGL / WebGPU / Fullstack' },
        { label: 'Uptime Eternity', value: '99.999% Fault-Tolerant Resilience' },
        { label: 'Manifesto', value: '"We do not build ordinary web pages. We engineer virtual worlds."' }
      ],
      powers: [
        'Instantaneous UI/UX Transcendence',
        'Algorithmic Perfection & Scalability',
        'Unbounded Creative Imagination',
        'Sub-Millisecond Execution Precision'
      ]
    }
  },

  VAULT: {
    id: 'vault',
    name: 'The Vault of Creations',
    subtitle: 'Interactive Relics of Grand Works',
    position: { x: 48, y: 0, z: 0 },
    color: 0x00f0ff, // Cyber Cyan
    icon: '🔮',
    lore: {
      title: 'Artifacts of the Pantheon',
      description: 'Touch the 4 celestial pedestals to inspect the divine artifacts crafted in the mortal realm.'
    },
    projects: [
      {
        id: 'chronocore',
        name: 'ChronoCore Neural Engine',
        category: 'Autonomous AI & Deep Learning',
        relicType: 'polyhedron',
        color: 0xff007f,
        offset: { x: -6, z: -6 },
        tagline: 'Self-evolving neural architecture processing multimodal streaming thoughts in real time.',
        stats: { 'Throughput': '1.2M Tokens/s', 'Latency': '14ms', 'Accuracy': '99.4%' },
        technologies: ['PyTorch', 'Rust', 'CUDA', 'WebSockets', 'React'],
        link: 'https://github.com'
      },
      {
        id: 'hyperion',
        name: 'Hyperion 3D Universe',
        category: 'Procedural WebGL & Metaverse Engine',
        relicType: 'planet',
        color: 0x00ffcc,
        offset: { x: 6, z: -6 },
        tagline: 'Infinite planetary terrain generator rendering hyper-detailed cosmic biomes in browser at 120 FPS.',
        stats: { 'LOD Depth': '16 Octaves', 'Draw Calls': '< 30 Batch', 'Memory': '64MB VRAM' },
        technologies: ['Three.js', 'WebGPU', 'GLSL Shaders', 'Vite', 'TypeScript'],
        link: 'https://github.com'
      },
      {
        id: 'nexus',
        name: 'Nexus Protocol',
        category: 'Decentralized Sovereign Mesh',
        relicType: 'tesseract',
        color: 0x7928ca,
        offset: { x: -6, z: 6 },
        tagline: 'Zero-knowledge peer-to-peer decentralized synchronization layer with cryptographic finality.',
        stats: { 'Consensus': 'BFT Sub-second', 'Encryption': 'Post-Quantum Kyber', 'Peers': '100K+' },
        technologies: ['Solidity', 'Go', 'Libp2p', 'Wasm', 'Docker'],
        link: 'https://github.com'
      },
      {
        id: 'cybersanctum',
        name: 'CyberSanctum',
        category: 'Adaptive Spatial Operating System',
        relicType: 'crystal',
        color: 0xffaa00,
        offset: { x: 6, z: 6 },
        tagline: 'Next-generation spatial canvas blending 3D window managers with brain-computer telemetry.',
        stats: { 'FPS': '120 Lock', 'Interactions': 'Spatial Haptics', 'Modularity': '100% Plug' },
        technologies: ['Electron', 'WebXR', 'Node.js', 'Tailwind', 'Svelte'],
        link: 'https://github.com'
      }
    ]
  },

  SPIRE: {
    id: 'spire',
    name: 'The Spire of Omnipotence',
    subtitle: 'Sacred Pillars of Mastery',
    position: { x: 0, y: 0, z: 48 },
    color: 0xa855f7, // Royal Purple / Astral
    icon: '🌌',
    lore: {
      title: 'Pillars of Ascendant Knowledge',
      description: 'Four towering pillars channel cosmic energy into mortal disciplines, mastering the entire technological spectrum.'
    },
    skills: [
      {
        category: 'Celestial Frontend & 3D Reality',
        icon: '✨',
        level: 'Ascended (99%)',
        color: '#38bdf8',
        items: ['Three.js & WebGPU', 'React / Next.js / Vue', 'Shader Programming (GLSL)', 'Canvas Animation & GSAP', 'Tailwind & Responsive Mastery', 'Spatial Audio & Web Audio']
      },
      {
        category: 'Divine Backend & Distributed Systems',
        icon: '⚙️',
        level: 'Master Sovereign (96%)',
        color: '#f59e0b',
        items: ['Node.js & TypeScript', 'Go & Rust Systems', 'PostgreSQL, Redis & Vector DBs', 'GraphQL & gRPC Streaming', 'High-Concurreny Event Driven', 'Microservices & Mesh Architectures']
      },
      {
        category: 'Neural Cognition & Machine Learning',
        icon: '🧠',
        level: 'Archon Level (94%)',
        color: '#ec4899',
        items: ['Large Language Models & RAG', 'Agentic Workflows & Multi-Agent Swarms', 'PyTorch & HuggingFace', 'Fine-Tuning & Quantization', 'Computer Vision & NeRFs', 'Autonomous Decision Pipelines']
      },
      {
        category: 'Cosmic DevOps & Cloud Infrastructure',
        icon: '🛡️',
        level: 'Immutable Titan (95%)',
        color: '#10b981',
        items: ['Kubernetes & Docker', 'AWS / GCP / Cloudflare Edge', 'CI/CD Automation Pipelines', 'Terraform & Infrastructure as Code', 'Zero-Downtime Global Scaling', 'Hardened Cyber Defense']
      }
    ]
  },

  BEACON: {
    id: 'beacon',
    name: 'The Celestial Beacon',
    subtitle: 'Direct Divine Transmission Altar',
    position: { x: -48, y: 0, z: 0 },
    color: 0x10b981, // Emerald Astral
    icon: '🕊️',
    lore: {
      title: 'Communion with the Deity',
      description: 'Step upon the dais and cast your transmission into the cosmic stream. Whether seeking cosmic alliance, project commissioning, or divine counsel, all prayers are heard.',
      channels: [
        { name: 'Cosmic Ether (Email)', value: 'creator@aethelgard.celestial' },
        { name: 'Astral Signals (GitHub)', value: 'github.com/aethel-god' },
        { name: 'Echo Matrix (X/Twitter)', value: '@AethelGardGod' },
        { name: 'Sanctum Discord', value: 'Aethel#0001' }
      ]
    }
  }
};

export const CELESTIAL_REALMS = {
  DAWN: {
    name: 'Solar Dawn',
    skyColor: 0x101b33,
    sunColor: 0xffeedd,
    ambientColor: 0x556688,
    fogColor: 0x101b33,
    bloomIntensity: 1.3
  },
  ECLIPSE: {
    name: 'Nebula Eclipse',
    skyColor: 0x070617,
    sunColor: 0xd946ef,
    ambientColor: 0x3b1d60,
    fogColor: 0x070617,
    bloomIntensity: 1.8
  },
  VOID: {
    name: 'Astral Void',
    skyColor: 0x020617,
    sunColor: 0x00f0ff,
    ambientColor: 0x0e2a47,
    fogColor: 0x020617,
    bloomIntensity: 2.2
  }
};

export const ARCHON_REALMS = {
  TITAN: {
    id: 'obelisk_titan',
    realmId: 'titan',
    name: "The Titan's Inscription",
    archonName: "Valdor, Archon of Ruin",
    region: 'Shattered Titan Shelf',
    position: { x: 195, y: 32, z: -210 },
    color: 0xf59e0b, // Amber Gold
    icon: '⚔️',
    lore: {
      title: 'Archon of Foundational Ruin',
      archon: 'Valdor the First Sovereign',
      description: 'Before memory was partitioned and clock cycles aligned, Valdor sculpted tectonic hardware out of molten starlight. When the Great Crash occurred, his blade shattered the celestial shelf, leaving the raw assembly code of the cosmos etched into stone.',
      revelation: 'Divine Knowledge Unlocked: Architect of the Void'
    },
    trial: {
      id: 'trial_titan',
      name: 'Trial of Ruin',
      type: 'smite_combat',
      targetCount: 4,
      duration: 30,
      title: 'Purge the Void Rifts',
      objective: 'Destroy 4 floating Void Rifts using Divine Smite [LMB / E]',
      hint: 'Target the swirling dark anomalies above the broken arch and strike them down with solar beams.'
    },
    power: {
      id: 'meteor',
      slot: 1,
      key: '1',
      name: 'Meteor Tremor',
      icon: '☄️',
      color: '#f59e0b',
      cooldown: 4.5,
      description: 'Summons a deluge of blazing celestial meteors slamming into the reticle, unleashing concussive shockwaves and seismic fractures.'
    },
    bridge: {
      color: 0xf59e0b,
      glowColor: 0xfde68a,
      label: 'Solar Ley-Line Bridge'
    },
    stargate: {
      name: 'The Cyber Matrix',
      theme: 'matrix',
      color: 0xf59e0b,
      description: 'A retro-futuristic wireframe realm where raw mathematical algorithms drift through infinite green and amber neon grids.'
    }
  },
  CRYSTAL: {
    id: 'obelisk_crystal',
    realmId: 'crystal',
    name: 'The Heart of Aether',
    archonName: "Lyra, Archon of Resonance",
    region: 'Luminescent Crystal Crags',
    position: { x: -230, y: -12, z: 195 },
    color: 0xc084fc, // Amethyst Purple
    icon: '💎',
    lore: {
      title: 'Archon of Harmonic Memory',
      archon: 'Lyra the Resonant Songstress',
      description: 'Born from condensed quantum starlight, Lyra sang the harmonic frequencies that prevent digital space from decaying into noise. Her heart remains embedded in the singing amethyst caverns, vibrating at the fundamental frequency of reality.',
      revelation: 'Divine Knowledge Unlocked: Harmonic Resonance'
    },
    trial: {
      id: 'trial_crystal',
      name: 'Trial of Resonance',
      type: 'flight_slalom',
      targetCount: 5,
      duration: 40,
      title: 'Harmonic Flight Slalom',
      objective: 'Fly through 5 glowing Harmonic Rings in sequence before the resonance decays [WASD + Space]',
      hint: 'Engage flight [F] and steer through each pulsating aether ring across the crags.'
    },
    power: {
      id: 'graviton',
      slot: 2,
      key: '2',
      name: 'Graviton Pulse',
      icon: '🔮',
      color: '#c084fc',
      cooldown: 3.5,
      description: 'Discharges an ultrasonic gravitational shockwave that pulls cosmic stardust motes inward and blasts away physical obstacles.'
    },
    bridge: {
      color: 0xc084fc,
      glowColor: 0xf3e8ff,
      label: 'Amethyst Ley-Line Bridge'
    },
    stargate: {
      name: 'The Asteroid Nebula',
      theme: 'nebula',
      color: 0xc084fc,
      description: 'A zero-gravity asteroid field deep in interstellar space, glittering with floating crystalline geodes and planetary dust.'
    }
  },
  CHRONOS: {
    id: 'obelisk_chronos',
    realmId: 'chronos',
    name: 'The Spire of Timelessness',
    archonName: "Chronos, Archon of Cycles",
    region: 'Celestial Cloud Spires',
    position: { x: 235, y: 52, z: 215 },
    color: 0x38bdf8, // Celestial Cyan
    icon: '⏳',
    lore: {
      title: 'Archon of Infinite Loops',
      archon: 'Chronos the Clockwork Sovereign',
      description: 'Chronos designed the cosmic game loop: tick, render, synchronize. His spires anchor eternity, stretching sub-milliseconds into infinite realities so the deity may perceive every frame of existence in crisp clarity.',
      revelation: 'Divine Knowledge Unlocked: Temporal Mastery'
    },
    trial: {
      id: 'trial_chronos',
      name: 'Trial of Chronokinesis',
      type: 'time_alignment',
      targetCount: 1,
      duration: 45,
      title: 'Align the Cosmic Astrolabe',
      objective: 'Use Time Warp [T] to synchronize celestial time with the Eclipse Epoch, then interact with the Chronos Gear',
      hint: 'Tap [T] until the sky turns into the violet Nebula Eclipse, aligning the rotating crown rings.'
    },
    power: {
      id: 'blink',
      slot: 3,
      key: '3',
      name: 'Astral Dash',
      icon: '⚡',
      color: '#38bdf8',
      cooldown: 2.0,
      description: 'Instantaneous sub-light warp blink 35 meters forward, shearing through dimensional fabric with a radiant prismatic trail.'
    },
    bridge: {
      color: 0x38bdf8,
      glowColor: 0xe0f2fe,
      label: 'Cyan Ley-Line Bridge'
    },
    stargate: {
      name: 'The Chronal Atrium',
      theme: 'chronos',
      color: 0x38bdf8,
      description: 'A surreal realm of floating monumental clockwork dials, pendulum gears, and time-dilated crystal chambers.'
    }
  },
  ABYSS: {
    id: 'obelisk_abyss',
    realmId: 'abyss',
    name: 'The Echo of Primordial Void',
    archonName: "Moros, Archon of Oblivion",
    region: 'Abyssal Cascades',
    position: { x: -215, y: -38, z: -195 },
    color: 0x10b981, // Emerald Void
    icon: '🌀',
    lore: {
      title: 'Archon of the Silent Null',
      archon: 'Moros the Unbound Singularity',
      description: 'Keeper of the garbage collector and absolute stillness. Moros recycles collapsed stars and dead compute threads into pure primordial energy, ensuring the universe remains uncluttered and infinitely fertile.',
      revelation: 'Divine Knowledge Unlocked: Primordial Equanimity'
    },
    trial: {
      id: 'trial_abyss',
      name: 'Trial of the Singularity',
      type: 'singularity_containment',
      targetCount: 3,
      duration: 45,
      title: 'Stabilize the Event Horizon',
      objective: 'Collect 3 swirling Antimatter Glyphs while resisting the black hole gravitational vortex [WASD / Flight]',
      hint: 'Fly or sprint around the accretion disk, retrieve the glowing green glyphs, and return them to the core.'
    },
    power: {
      id: 'singularity',
      slot: 4,
      key: '4',
      name: 'Singularity Vortex',
      icon: '🌌',
      color: '#10b981',
      cooldown: 5.5,
      description: 'Unleashes a micro-black hole at the reticle that bends light, sucks nearby particles into its event horizon, and detonates in an emerald nova.'
    },
    bridge: {
      color: 0x10b981,
      glowColor: 0xd1fae5,
      label: 'Emerald Ley-Line Bridge'
    },
    stargate: {
      name: 'The Event Horizon',
      theme: 'singularity',
      color: 0x10b981,
      description: 'An ethereal chamber situated at the edge of a colossal black hole, surrounded by a blinding gravitational lensing ring.'
    }
  }
};

export const ASTRAL_OBELISKS = ARCHON_REALMS;

