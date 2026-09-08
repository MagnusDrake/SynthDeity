// Game Constants, World Lore, Projects, and Skills Data for AETHELGARD

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

export const ASTRAL_OBELISKS = {
  TITAN: {
    id: 'obelisk_titan',
    name: "The Titan's Inscription",
    region: 'Shattered Titan Shelf',
    position: { x: 195, y: 32, z: -210 },
    color: 0xf59e0b,
    icon: '⚔️',
    lore: {
      title: 'Remnant of the First Sovereign',
      description: 'Before digital space was partitioned into bytes and memory addresses, the Colossal Titans forged the foundational laws of compute. This monolithic slab bears the ancient assembly code of creation itself.',
      revelation: 'Divine Knowledge Unlocked: Architect of the Void'
    }
  },
  CRYSTAL: {
    id: 'obelisk_crystal',
    name: 'The Heart of Aether',
    region: 'Luminescent Crystal Crags',
    position: { x: -230, y: -12, z: 195 },
    color: 0xc084fc,
    icon: '💎',
    lore: {
      title: 'Crystalline Resonator',
      description: 'Formed from condensed quantum starlight, these singing amethyst formations resonate at harmonic frequencies that restore celestial energy to weary digital wanderers.',
      revelation: 'Divine Knowledge Unlocked: Harmonic Resonance'
    }
  },
  CHRONOS: {
    id: 'obelisk_chronos',
    name: 'The Spire of Timelessness',
    region: 'Celestial Cloud Spires',
    position: { x: 235, y: 52, z: 215 },
    color: 0x38bdf8,
    icon: '⏳',
    lore: {
      title: 'Anchor of Eternity',
      description: 'Piercing the upper astral troposphere, this spire bends time. Here, milliseconds expand into infinite cycles, granting instantaneous execution across all parallel realities.',
      revelation: 'Divine Knowledge Unlocked: Temporal Mastery'
    }
  },
  ABYSS: {
    id: 'obelisk_abyss',
    name: 'The Echo of Primordial Void',
    region: 'Abyssal Cascades',
    position: { x: -215, y: -38, z: -195 },
    color: 0x10b981,
    icon: '🌀',
    lore: {
      title: 'The Silent Singularity',
      description: 'A miniature stellar vortex slowly drawing stray starlight into quiet rest. It reminds all ascended beings that every creation begins and concludes in pure stillness.',
      revelation: 'Divine Knowledge Unlocked: Primordial Equanimity'
    }
  }
};

