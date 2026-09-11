// Procedural PBR Material & Texture Synthesizer for SynthDeity: Loop Fabrication
// 100% Asset-Free In-Memory Generation of Diffuse, Normal, Roughness, and Emissive Maps
import * as THREE from 'three';

class ProceduralTextureEngine {
  constructor() {
    this.cache = new Map();
  }

  // Convert height/luminance canvas into Tangent-Space Normal Map via 3x3 Sobel Operator
  generateNormalMap(heightCanvas, strength = 2.5) {
    const width = heightCanvas.width;
    const height = heightCanvas.height;
    const ctx = heightCanvas.getContext('2d');
    const srcData = ctx.getImageData(0, 0, width, height).data;

    const normalCanvas = document.createElement('canvas');
    normalCanvas.width = width;
    normalCanvas.height = height;
    const nCtx = normalCanvas.getContext('2d');
    const nImgData = nCtx.createImageData(width, height);
    const dst = nImgData.data;

    const getLum = (x, y) => {
      const px = ((x + width) % width);
      const py = ((y + height) % height);
      const idx = (py * width + px) * 4;
      return (srcData[idx] * 0.299 + srcData[idx + 1] * 0.587 + srcData[idx + 2] * 0.114) / 255.0;
    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Sobel Kernels
        // [-1 0 1]
        // [-2 0 2]
        // [-1 0 1]
        const tl = getLum(x - 1, y - 1);
        const l  = getLum(x - 1, y);
        const bl = getLum(x - 1, y + 1);
        const tr = getLum(x + 1, y - 1);
        const r  = getLum(x + 1, y);
        const br = getLum(x + 1, y + 1);
        const t  = getLum(x, y - 1);
        const b  = getLum(x, y + 1);

        const dx = (tr + 2.0 * r + br) - (tl + 2.0 * l + bl);
        const dy = (bl + 2.0 * b + br) - (tl + 2.0 * t + tr);

        // Compute normal vector: (-dx * strength, -dy * strength, 1.0)
        let nx = -dx * strength;
        let ny = -dy * strength;
        let nz = 1.0;
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1.0;
        nx /= len;
        ny /= len;
        nz /= len;

        const pIdx = (y * width + x) * 4;
        dst[pIdx]     = Math.round((nx * 0.5 + 0.5) * 255); // Red (X)
        dst[pIdx + 1] = Math.round((ny * 0.5 + 0.5) * 255); // Green (Y)
        dst[pIdx + 2] = Math.round((nz * 0.5 + 0.5) * 255); // Blue (Z)
        dst[pIdx + 3] = 255;
      }
    }

    nCtx.putImageData(nImgData, 0, 0);
    const texture = new THREE.CanvasTexture(normalCanvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // 1. CELESTIAL GOLD-VEINED MARBLE (PBR Suite)
  createGoldMarbleSuite(resolution = 1024) {
    if (this.cache.has('gold_marble')) return this.cache.get('gold_marble');

    // Diffuse Canvas
    const dCanvas = document.createElement('canvas');
    dCanvas.width = resolution;
    dCanvas.height = resolution;
    const dCtx = dCanvas.getContext('2d');

    // Roughness Canvas
    const rCanvas = document.createElement('canvas');
    rCanvas.width = resolution;
    rCanvas.height = resolution;
    const rCtx = rCanvas.getContext('2d');

    // Metallic Canvas
    const mCanvas = document.createElement('canvas');
    mCanvas.width = resolution;
    mCanvas.height = resolution;
    const mCtx = mCanvas.getContext('2d');

    // Height Canvas for Normal Map
    const hCanvas = document.createElement('canvas');
    hCanvas.width = resolution;
    hCanvas.height = resolution;
    const hCtx = hCanvas.getContext('2d');

    // Base Alabaster Stone: soft celestial gradient with pink/cream tone
    const baseGrad = dCtx.createRadialGradient(
      resolution * 0.5, resolution * 0.5, resolution * 0.1,
      resolution * 0.5, resolution * 0.5, resolution * 0.7
    );
    baseGrad.addColorStop(0, '#fdfaf5');
    baseGrad.addColorStop(0.5, '#f7f1ea');
    baseGrad.addColorStop(1, '#eee2d5');
    dCtx.fillStyle = baseGrad;
    dCtx.fillRect(0, 0, resolution, resolution);

    // Roughness base: semi-polished stone (~0.35)
    rCtx.fillStyle = '#595959';
    rCtx.fillRect(0, 0, resolution, resolution);

    // Metallic base: non-metal (0.0)
    mCtx.fillStyle = '#000000';
    mCtx.fillRect(0, 0, resolution, resolution);

    // Height base
    hCtx.fillStyle = '#808080';
    hCtx.fillRect(0, 0, resolution, resolution);

    // Organic veining via multi-scale random walk
    const drawVein = (startX, startY, len, startWidth, col, isGold = true) => {
      let curX = startX;
      let curY = startY;
      let width = startWidth;

      for (let step = 0; step < len; step++) {
        const nextX = curX + (Math.random() - 0.48) * 8;
        const nextY = curY + (Math.random() - 0.45) * 8;

        // Diffuse
        dCtx.strokeStyle = col;
        dCtx.lineWidth = width;
        dCtx.lineCap = 'round';
        dCtx.beginPath();
        dCtx.moveTo(curX, curY);
        dCtx.lineTo(nextX, nextY);
        dCtx.stroke();

        // Roughness: gold veins are hyper-smooth (0.1)
        rCtx.strokeStyle = isGold ? '#1a1a1a' : '#707070';
        rCtx.lineWidth = width;
        rCtx.lineCap = 'round';
        rCtx.beginPath();
        rCtx.moveTo(curX, curY);
        rCtx.lineTo(nextX, nextY);
        rCtx.stroke();

        // Metallic: gold veins are pure metal (0.95)
        mCtx.strokeStyle = isGold ? '#f0f0f0' : '#000000';
        mCtx.lineWidth = width;
        mCtx.lineCap = 'round';
        mCtx.beginPath();
        mCtx.moveTo(curX, curY);
        mCtx.lineTo(nextX, nextY);
        mCtx.stroke();

        // Height: gold veins slightly protrude
        hCtx.strokeStyle = isGold ? '#d0d0d0' : '#505050';
        hCtx.lineWidth = width;
        hCtx.lineCap = 'round';
        hCtx.beginPath();
        hCtx.moveTo(curX, curY);
        hCtx.lineTo(nextX, nextY);
        hCtx.stroke();

        // Occasional vein branch
        if (Math.random() < 0.06 && width > 1.2) {
          drawVein(curX, curY, Math.floor(len * 0.4), width * 0.65, col, isGold);
        }

        width = Math.max(0.6, width * 0.995);
        curX = nextX;
        curY = nextY;
      }
    };

    // Sub-surface soft gray/lilac mineral fissures
    for (let i = 0; i < 14; i++) {
      const sx = Math.random() * resolution;
      const sy = Math.random() * resolution;
      drawVein(sx, sy, 70, 3.5, 'rgba(180, 165, 175, 0.35)', false);
    }

    // Radiant Golden Veins
    for (let i = 0; i < 22; i++) {
      const sx = Math.random() * resolution;
      const sy = Math.random() * resolution;
      const goldColors = ['#f59e0b', '#d97706', '#fbbf24', '#ffd700'];
      const col = goldColors[i % goldColors.length];
      drawVein(sx, sy, 90, 4.0, col, true);
    }

    // Convert to Three.js textures
    const diffuseMap = new THREE.CanvasTexture(dCanvas);
    diffuseMap.wrapS = THREE.RepeatWrapping;
    diffuseMap.wrapT = THREE.RepeatWrapping;

    const roughnessMap = new THREE.CanvasTexture(rCanvas);
    roughnessMap.wrapS = THREE.RepeatWrapping;
    roughnessMap.wrapT = THREE.RepeatWrapping;

    const metalnessMap = new THREE.CanvasTexture(mCanvas);
    metalnessMap.wrapS = THREE.RepeatWrapping;
    metalnessMap.wrapT = THREE.RepeatWrapping;

    const normalMap = this.generateNormalMap(hCanvas, 3.2);

    const suite = {
      map: diffuseMap,
      normalMap: normalMap,
      roughnessMap: roughnessMap,
      metalnessMap: metalnessMap,
      roughness: 0.35,
      metalness: 0.25,
      normalScale: new THREE.Vector2(1.2, 1.2)
    };

    this.cache.set('gold_marble', suite);
    return suite;
  }

  // 2. CRACKED ASTRAL RUNIC SLATE (PBR Suite)
  createRuneSlateSuite(resolution = 1024) {
    if (this.cache.has('rune_slate')) return this.cache.get('rune_slate');

    const dCanvas = document.createElement('canvas');
    dCanvas.width = resolution;
    dCanvas.height = resolution;
    const dCtx = dCanvas.getContext('2d');

    const hCanvas = document.createElement('canvas');
    hCanvas.width = resolution;
    hCanvas.height = resolution;
    const hCtx = hCanvas.getContext('2d');

    const eCanvas = document.createElement('canvas');
    eCanvas.width = resolution;
    eCanvas.height = resolution;
    const eCtx = eCanvas.getContext('2d');

    // Dark obsidian / volcanic slate base
    dCtx.fillStyle = '#0f172a';
    dCtx.fillRect(0, 0, resolution, resolution);

    hCtx.fillStyle = '#808080';
    hCtx.fillRect(0, 0, resolution, resolution);

    eCtx.fillStyle = '#000000';
    eCtx.fillRect(0, 0, resolution, resolution);

    // Procedural basalt slab noise
    const imgData = dCtx.getImageData(0, 0, resolution, resolution);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const noise = (Math.random() - 0.5) * 18;
      d[i] = Math.max(10, Math.min(40, d[i] + noise));
      d[i + 1] = Math.max(15, Math.min(45, d[i + 1] + noise));
      d[i + 2] = Math.max(25, Math.min(65, d[i + 2] + noise));
    }
    dCtx.putImageData(imgData, 0, 0);

    // Chiseled Voronoi crack network with glowing cyan/amber runes
    const drawRunicCrack = (x1, y1, x2, y2, color, isEmissive = true) => {
      // Diffuse chasm
      dCtx.strokeStyle = '#050811';
      dCtx.lineWidth = 3.5;
      dCtx.beginPath();
      dCtx.moveTo(x1, y1);
      dCtx.lineTo(x2, y2);
      dCtx.stroke();

      // Normal map height indentation
      hCtx.strokeStyle = '#101010';
      hCtx.lineWidth = 4.0;
      hCtx.beginPath();
      hCtx.moveTo(x1, y1);
      hCtx.lineTo(x2, y2);
      hCtx.stroke();

      if (isEmissive) {
        // Emissive runic channel
        eCtx.strokeStyle = color;
        eCtx.lineWidth = 2.0;
        eCtx.shadowColor = color;
        eCtx.shadowBlur = 8;
        eCtx.beginPath();
        eCtx.moveTo(x1, y1);
        eCtx.lineTo(x2, y2);
        eCtx.stroke();
      }
    };

    // Draw fractured tectonic polygons
    const numCells = 24;
    const points = [];
    for (let i = 0; i < numCells; i++) {
      points.push({
        x: Math.random() * resolution,
        y: Math.random() * resolution
      });
    }

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < resolution * 0.28) {
          const runicCol = Math.random() > 0.4 ? '#38bdf8' : '#f59e0b';
          drawRunicCrack(points[i].x, points[i].y, points[j].x, points[j].y, runicCol, true);
        }
      }
    }

    const rCanvas = document.createElement('canvas');
    rCanvas.width = resolution;
    rCanvas.height = resolution;
    const rCtx = rCanvas.getContext('2d');
    rCtx.fillStyle = '#8c8c8c';
    rCtx.fillRect(0, 0, resolution, resolution);

    const mCanvas = document.createElement('canvas');
    mCanvas.width = resolution;
    mCanvas.height = resolution;
    const mCtx = mCanvas.getContext('2d');
    mCtx.fillStyle = '#262626';
    mCtx.fillRect(0, 0, resolution, resolution);

    const diffuseMap = new THREE.CanvasTexture(dCanvas);
    diffuseMap.wrapS = THREE.RepeatWrapping;
    diffuseMap.wrapT = THREE.RepeatWrapping;

    const roughnessMap = new THREE.CanvasTexture(rCanvas);
    roughnessMap.wrapS = THREE.RepeatWrapping;
    roughnessMap.wrapT = THREE.RepeatWrapping;

    const metalnessMap = new THREE.CanvasTexture(mCanvas);
    metalnessMap.wrapS = THREE.RepeatWrapping;
    metalnessMap.wrapT = THREE.RepeatWrapping;

    const emissiveMap = new THREE.CanvasTexture(eCanvas);
    emissiveMap.wrapS = THREE.RepeatWrapping;
    emissiveMap.wrapT = THREE.RepeatWrapping;

    const normalMap = this.generateNormalMap(hCanvas, 3.8);

    const suite = {
      map: diffuseMap,
      normalMap: normalMap,
      roughnessMap: roughnessMap,
      metalnessMap: metalnessMap,
      emissiveMap: emissiveMap,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.75,
      roughness: 0.55,
      metalness: 0.35,
      normalScale: new THREE.Vector2(1.5, 1.5)
    };

    this.cache.set('rune_slate', suite);
    return suite;
  }

  // 3. PRISMATIC AETHER CRYSTAL ROCK (PBR Suite)
  createCrystalRockSuite(resolution = 1024) {
    if (this.cache.has('crystal_rock')) return this.cache.get('crystal_rock');

    const dCanvas = document.createElement('canvas');
    dCanvas.width = resolution;
    dCanvas.height = resolution;
    const dCtx = dCanvas.getContext('2d');

    const hCanvas = document.createElement('canvas');
    hCanvas.width = resolution;
    hCanvas.height = resolution;
    const hCtx = hCanvas.getContext('2d');

    // Deep amethyst violet base
    dCtx.fillStyle = '#1e1b4b';
    dCtx.fillRect(0, 0, resolution, resolution);

    hCtx.fillStyle = '#808080';
    hCtx.fillRect(0, 0, resolution, resolution);

    // Faceted crystalline cell highlights
    for (let i = 0; i < 40; i++) {
      const cx = Math.random() * resolution;
      const cy = Math.random() * resolution;
      const rad = 25 + Math.random() * 80;

      const grad = dCtx.createRadialGradient(cx, cy, 2, cx, cy, rad);
      grad.addColorStop(0, '#c084fc');
      grad.addColorStop(0.5, '#7c3aed');
      grad.addColorStop(1, 'transparent');
      dCtx.fillStyle = grad;
      dCtx.beginPath();
      dCtx.arc(cx, cy, rad, 0, Math.PI * 2);
      dCtx.fill();

      // Height facet
      const hGrad = hCtx.createRadialGradient(cx, cy, 2, cx, cy, rad);
      hGrad.addColorStop(0, '#ffffff');
      hGrad.addColorStop(1, '#404040');
      hCtx.fillStyle = hGrad;
      hCtx.beginPath();
      hCtx.arc(cx, cy, rad, 0, Math.PI * 2);
      hCtx.fill();
    }

    const rCanvas = document.createElement('canvas');
    rCanvas.width = resolution;
    rCanvas.height = resolution;
    const rCtx = rCanvas.getContext('2d');
    rCtx.fillStyle = '#383838'; // glassy crystal roughness (~0.22)
    rCtx.fillRect(0, 0, resolution, resolution);

    const mCanvas = document.createElement('canvas');
    mCanvas.width = resolution;
    mCanvas.height = resolution;
    const mCtx = mCanvas.getContext('2d');
    mCtx.fillStyle = '#bfbfbf'; // crystalline metallic specularity (~0.75)
    mCtx.fillRect(0, 0, resolution, resolution);

    const diffuseMap = new THREE.CanvasTexture(dCanvas);
    diffuseMap.wrapS = THREE.RepeatWrapping;
    diffuseMap.wrapT = THREE.RepeatWrapping;

    const roughnessMap = new THREE.CanvasTexture(rCanvas);
    roughnessMap.wrapS = THREE.RepeatWrapping;
    roughnessMap.wrapT = THREE.RepeatWrapping;

    const metalnessMap = new THREE.CanvasTexture(mCanvas);
    metalnessMap.wrapS = THREE.RepeatWrapping;
    metalnessMap.wrapT = THREE.RepeatWrapping;

    const normalMap = this.generateNormalMap(hCanvas, 2.8);

    const suite = {
      map: diffuseMap,
      normalMap: normalMap,
      roughnessMap: roughnessMap,
      metalnessMap: metalnessMap,
      roughness: 0.22,
      metalness: 0.75,
      normalScale: new THREE.Vector2(1.3, 1.3)
    };

    this.cache.set('crystal_rock', suite);
    return suite;
  }
}

export const proceduralMaterials = new ProceduralTextureEngine();
