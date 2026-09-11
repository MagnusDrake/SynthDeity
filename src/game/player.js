// 3D Celestial Seraph Avatar & Particle Systems for AETHELGARD
import * as THREE from 'three';

export class CelestialPlayer {
  constructor(scene) {
    this.scene = scene;
    this.mesh = new THREE.Group();
    this.position = this.mesh.position;
    this.rotation = this.mesh.rotation;

    // Movement & Flight state
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.isGrounded = true;
    this.isFlying = false;
    this.speed = 18;
    this.sprintMultiplier = 1.9;
    this.flightSpeed = 42;
    this.flightSprintMultiplier = 1.85;
    this.jumpForce = 15;
    this.gravity = 28;
    this.hoverBob = 0;
    this.targetRotationY = 0;
    this.flightRoll = 0;
    this.divineFavor = 100;
    this.maxDivineFavor = 100;
    this.isMounted = false;
    this.expanse = null;

    // Components to animate
    this.coreMesh = null;
    this.astrolabeRings = [];
    this.wingGroupLeft = null;
    this.wingGroupRight = null;
    this.haloMesh = null;
    this.trailParticles = null;
    this.trailPositions = [];
    this.trailHead = 0;
    this.windLines = null;
    this.lightPoint = null;
    this.auraMesh = null;
    this.auraUniforms = null;
    this.groundRipples = [];

    this.initMesh();
    this.initParticles();
    this.initWindParticles();
    this.initGroundRipples();
    this.scene.add(this.mesh);

    // Initial position on the central sanctuary platform
    this.position.set(0, 2.5, 12);
    this.rotation.y = Math.PI;
    this.targetRotationY = Math.PI;
  }

  setExpanse(expanse) {
    this.expanse = expanse;
  }

  toggleFlight() {
    this.isFlying = !this.isFlying;
    if (this.isFlying) {
      this.isGrounded = false;
      this.velocity.y = 8;
    }
    return this.isFlying;
  }

  initMesh() {
    // 1. Central Divine Core (Radiant glowing crystal with PBR reflections)
    const coreGeo = new THREE.IcosahedronGeometry(0.7, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffe066,
      emissiveIntensity: 0.65,
      roughness: 0.12,
      metalness: 0.4
    });
    this.coreMesh = new THREE.Mesh(coreGeo, coreMat);
    this.mesh.add(this.coreMesh);

    // Inner fiery core
    const innerGeo = new THREE.OctahedronGeometry(0.4, 0);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xffa500,
      wireframe: true
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    this.coreMesh.add(innerMesh);

    // Seraphic Fresnel Rim Aura (Cosmic golden-cyan radiance)
    const auraGeo = new THREE.IcosahedronGeometry(0.88, 3);
    this.auraUniforms = {
      uTime: { value: 0 },
      uIntensity: { value: 1.0 },
      uColorCore: { value: new THREE.Color(0xffd700) },
      uColorRim: { value: new THREE.Color(0x38bdf8) }
    };
    const auraMat = new THREE.ShaderMaterial({
      uniforms: this.auraUniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPos;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vViewPos = -mvPos.xyz;
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uIntensity;
        uniform vec3 uColorCore;
        uniform vec3 uColorRim;
        varying vec3 vNormal;
        varying vec3 vViewPos;
        void main() {
          vec3 n = normalize(vNormal);
          vec3 v = normalize(vViewPos);
          float fresnel = pow(clamp(1.0 - max(0.0, dot(v, n)), 0.0, 1.0), 2.8);
          float pulse = 0.85 + 0.15 * sin(uTime * 4.0);
          vec3 col = mix(uColorCore, uColorRim, fresnel);
          gl_FragColor = vec4(col * fresnel * pulse * uIntensity, fresnel * 0.9 * uIntensity);
        }
      `
    });
    this.auraMesh = new THREE.Mesh(auraGeo, auraMat);
    this.coreMesh.add(this.auraMesh);

    // 2. Kinetic Astrolabe Golden Rings (High-metal PBR reflections)
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.15,
      metalness: 0.95
    });

    const ringRadii = [1.1, 1.35, 1.6];
    ringRadii.forEach((radius, i) => {
      const ringGeo = new THREE.TorusGeometry(radius, 0.035, 8, 48);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = (i * Math.PI) / 3;
      ring.rotation.y = (i * Math.PI) / 4;
      this.astrolabeRings.push(ring);
      this.mesh.add(ring);
    });

    // 3. Ethereal Celestial Wings (Feathered Crystal Shards)
    this.wingGroupLeft = new THREE.Group();
    this.wingGroupRight = new THREE.Group();

    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xffea75,
      emissive: 0xffd700,
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.3,
      side: THREE.DoubleSide
    });

    const featherCount = 6;
    for (let i = 0; i < featherCount; i++) {
      const scale = 1 - i * 0.12;
      const featherGeo = new THREE.ConeGeometry(0.2 * scale, 1.8 * scale, 4);
      featherGeo.rotateZ(Math.PI / 2);

      // Left wing feather
      const fLeft = new THREE.Mesh(featherGeo, wingMat);
      fLeft.position.set(-0.6 - i * 0.35, 0.2 - i * 0.18, -0.3 + i * 0.1);
      fLeft.rotation.z = 0.35 + i * 0.18;
      fLeft.rotation.y = -0.3;
      this.wingGroupLeft.add(fLeft);

      // Right wing feather (Mirrored)
      const fRight = new THREE.Mesh(featherGeo, wingMat);
      fRight.position.set(0.6 + i * 0.35, 0.2 - i * 0.18, -0.3 + i * 0.1);
      fRight.rotation.z = -(0.35 + i * 0.18);
      fRight.rotation.y = 0.3;
      this.wingGroupRight.add(fRight);
    }

    this.wingGroupLeft.position.set(-0.5, 0.3, -0.2);
    this.wingGroupRight.position.set(0.5, 0.3, -0.2);
    this.mesh.add(this.wingGroupLeft);
    this.mesh.add(this.wingGroupRight);

    // 4. Floating Crown / Halo of Celestial Shards
    const haloGroup = new THREE.Group();
    haloGroup.position.set(0, 1.5, 0);
    haloGroup.rotation.x = 0.2;

    const shardGeo = new THREE.TetrahedronGeometry(0.12);
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0xfff7c2,
      emissive: 0xffd700,
      emissiveIntensity: 0.6,
      roughness: 0.15,
      metalness: 0.8
    });
    const shardCount = 8;

    for (let i = 0; i < shardCount; i++) {
      const angle = (i / shardCount) * Math.PI * 2;
      const shard = new THREE.Mesh(shardGeo, shardMat);
      shard.position.set(Math.cos(angle) * 0.75, 0, Math.sin(angle) * 0.75);
      shard.rotation.set(Math.random(), Math.random(), Math.random());
      haloGroup.add(shard);
    }
    this.haloMesh = haloGroup;
    this.mesh.add(this.haloMesh);

    // 5. Dynamic Divine Point Light
    this.lightPoint = new THREE.PointLight(0xffe066, 1.5, 14);
    this.lightPoint.position.set(0, 1.2, 0);
    this.mesh.add(this.lightPoint);
  }

  initWindParticles() {
    const wCount = 100;
    const wGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(wCount * 6);
    const colors = new Float32Array(wCount * 6);

    for (let i = 0; i < wCount; i++) {
      const x = (Math.random() - 0.5) * 24;
      const y = (Math.random() - 0.5) * 14;
      const z = (Math.random() - 0.5) * 24;

      positions[i * 6] = x;
      positions[i * 6 + 1] = y;
      positions[i * 6 + 2] = z;
      positions[i * 6 + 3] = x;
      positions[i * 6 + 4] = y;
      positions[i * 6 + 5] = z + 4;

      for (let v = 0; v < 2; v++) {
        colors[i * 6 + v * 3] = 0.6;
        colors[i * 6 + v * 3 + 1] = 0.85;
        colors[i * 6 + v * 3 + 2] = 1.0;
      }
    }

    wGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    wGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const wMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending
    });

    this.windLines = new THREE.LineSegments(wGeo, wMat);
    this.scene.add(this.windLines);
  }

  initParticles() {
    // Trailing stardust particle system behind the seraph
    const pCount = 120;
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(pCount * 3);
    const colors = new Float32Array(pCount * 3);
    const sizes = new Float32Array(pCount);

    const goldColor = new THREE.Color(0xffd700);
    const cyanColor = new THREE.Color(0x60a5fa);

    for (let i = 0; i < pCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      const lerped = goldColor.clone().lerp(cyanColor, Math.random());
      colors[i * 3] = lerped.r;
      colors[i * 3 + 1] = lerped.g;
      colors[i * 3 + 2] = lerped.b;

      sizes[i] = Math.random() * 4 + 1.5;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    pGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Custom star particle canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.4, 'rgba(255,220,100,0.8)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);

    const pMat = new THREE.PointsMaterial({
      size: 0.4,
      vertexColors: true,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.trailParticles = new THREE.Points(pGeo, pMat);
    this.scene.add(this.trailParticles);

    // Initialize position history
    for (let i = 0; i < pCount; i++) {
      this.trailPositions.push(this.position.clone());
    }
  }

  initGroundRipples() {
    this.groundRipples = [];
    const rippleGeo = new THREE.RingGeometry(0.4, 0.58, 32);
    rippleGeo.rotateX(-Math.PI / 2);

    for (let i = 0; i < 3; i++) {
      const rippleMat = new THREE.MeshBasicMaterial({
        color: 0xfde047,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const rMesh = new THREE.Mesh(rippleGeo, rippleMat);
      this.scene.add(rMesh);
      this.groundRipples.push({
        mesh: rMesh,
        phase: i * 0.33,
        speed: 0.75
      });
    }
  }

  updateGroundRipples(delta, floorY) {
    if (!this.groundRipples || this.groundRipples.length === 0) return;

    const altDiff = this.position.y - floorY;
    const isClose = altDiff >= -0.5 && altDiff < 7.0 && floorY > -50;
    const proximityFactor = isClose ? Math.max(0.0, 1.0 - (altDiff / 7.0)) : 0.0;

    for (let i = 0; i < this.groundRipples.length; i++) {
      const r = this.groundRipples[i];
      r.phase = (r.phase + delta * r.speed) % 1.0;

      if (proximityFactor > 0.01) {
        r.mesh.visible = true;
        const scale = 1.0 + r.phase * 5.2;
        r.mesh.scale.set(scale, 1, scale);
        r.mesh.position.set(this.position.x, floorY + 0.08, this.position.z);
        // Fade out as it expands
        const fade = Math.sin(r.phase * Math.PI) * proximityFactor * 0.55;
        r.mesh.material.opacity = fade;
      } else {
        r.mesh.visible = false;
        r.mesh.material.opacity = 0.0;
      }
    }
  }

  update(delta, inputState) {
    // 1. Divine Favor Regeneration
    if (this.divineFavor < this.maxDivineFavor) {
      this.divineFavor = Math.min(this.maxDivineFavor, this.divineFavor + delta * 12);
    }

    const isSprinting = inputState.sprint && this.divineFavor > 10;

    // When riding a celestial mount (Star-Manta), position & orientation are locked to the mount's saddle
    if (this.isMounted) {
      this.velocity.set(0, 0, 0);
      if (this.windLines) {
        this.windLines.material.opacity = isSprinting ? 0.8 : 0.35;
        this.windLines.position.copy(this.position);
        this.windLines.rotation.y = this.rotation.y;
      }
      this.hoverBob += delta * (isSprinting ? 8 : 4);
    } else if (this.isFlying) {
      const flightSpeed = isSprinting ? this.flightSpeed * this.flightSprintMultiplier : this.flightSpeed;
      if (isSprinting && (inputState.moveForward || inputState.moveBackward || inputState.moveLeft || inputState.moveRight)) {
        this.divineFavor = Math.max(0, this.divineFavor - delta * 12);
      }

      // Calculate 3D Flight Direction relative to camera pitch and yaw
      const pitch = inputState.cameraPitch || 0;
      const yaw = inputState.cameraYaw || 0;

      // 3D forward vector: aims wherever camera points
      const forward3D = new THREE.Vector3(
        -Math.sin(yaw) * Math.cos(pitch),
        -Math.sin(pitch),
        -Math.cos(yaw) * Math.cos(pitch)
      );

      // Right strafe vector (horizontal)
      const right3D = new THREE.Vector3(
        Math.cos(yaw),
        0,
        -Math.sin(yaw)
      );

      // Desired flight velocity
      const targetVel = new THREE.Vector3(0, 0, 0);

      if (inputState.moveForward) targetVel.addScaledVector(forward3D, flightSpeed);
      if (inputState.moveBackward) targetVel.addScaledVector(forward3D, -flightSpeed * 0.6);
      if (inputState.moveRight) targetVel.addScaledVector(right3D, flightSpeed * 0.85);
      if (inputState.moveLeft) targetVel.addScaledVector(right3D, -flightSpeed * 0.85);

      // Vertical ascent / descent thrusters
      if (inputState.jump) targetVel.y += flightSpeed * 0.75;
      if (inputState.sprint && !inputState.moveForward) targetVel.y -= flightSpeed * 0.75;

      // Smooth flight acceleration & deceleration
      this.velocity.lerp(targetVel, Math.min(1, delta * 6));

      // Move player in 3D
      this.position.addScaledVector(this.velocity, delta);

      // Avatar rotation & banking
      const horizontalVel = new THREE.Vector2(this.velocity.x, this.velocity.z);
      const isThrusting = horizontalVel.lengthSq() > 1;

      if (isThrusting) {
        this.targetRotationY = Math.atan2(this.velocity.x, this.velocity.z);
      }

      // Smooth heading interpolation
      let diff = this.targetRotationY - this.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.rotation.y += diff * Math.min(1, delta * 10);

      // Dynamic Flight Roll Banking into turns
      const strafeFactor = (inputState.moveRight ? -0.45 : 0) + (inputState.moveLeft ? 0.45 : 0);
      this.flightRoll = THREE.MathUtils.lerp(this.flightRoll, strafeFactor, delta * 8);
      this.mesh.rotation.z = this.flightRoll;

      // Avatar pitch tilt along flight trajectory
      const pitchTilt = Math.max(-0.6, Math.min(0.6, this.velocity.y / flightSpeed));
      this.mesh.rotation.x = -pitchTilt * 0.6;

      // Wing flapping animation (faster during thrust, wide glide when coasting)
      this.hoverBob += delta * (isThrusting ? 14 : 4);

      // Check if player lands gently on an island surface
      const floorY = this.getFloorHeight(this.position.x, this.position.z);
      if (this.position.y <= floorY + 2.3 && this.velocity.y <= 0 && !inputState.jump) {
        this.position.y = floorY + 2.2;
        this.isFlying = false;
        this.isGrounded = true;
        this.mesh.rotation.x = 0;
        this.mesh.rotation.z = 0;
      }

      // Wind particle streaks active during flight
      if (this.windLines) {
        this.windLines.material.opacity = isSprinting ? 0.85 : 0.45;
        this.windLines.position.copy(this.position);
        this.windLines.rotation.y = this.rotation.y;
      }
    } else {
      // -------------------------------------------------------------
      // TERRESTRIAL HOVER / LOCOMOTION
      // -------------------------------------------------------------
      const currentSpeed = isSprinting ? this.speed * this.sprintMultiplier : this.speed;

      if (isSprinting && (inputState.moveForward || inputState.moveBackward || inputState.moveLeft || inputState.moveRight)) {
        this.divineFavor = Math.max(0, this.divineFavor - delta * 15);
      }

      const moveX = (inputState.moveRight ? 1 : 0) - (inputState.moveLeft ? 1 : 0);
      const moveZ = (inputState.moveBackward ? 1 : 0) - (inputState.moveForward ? 1 : 0);

      const inputVector = new THREE.Vector3(moveX, 0, moveZ);
      const isMoving = inputVector.lengthSq() > 0.001;

      if (isMoving) {
        inputVector.normalize();
        inputVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), inputState.cameraYaw);

        this.velocity.x = inputVector.x * currentSpeed;
        this.velocity.z = inputVector.z * currentSpeed;
        this.targetRotationY = Math.atan2(inputVector.x, inputVector.z);
      } else {
        this.velocity.x *= 0.82;
        this.velocity.z *= 0.82;
      }

      let diff = this.targetRotationY - this.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.rotation.y += diff * Math.min(1, delta * 12);

      this.mesh.rotation.z = 0;
      this.mesh.rotation.x = 0;

      // Jump and Divine Gliding Physics
      if (inputState.jump) {
        if (this.isGrounded) {
          this.velocity.y = this.jumpForce;
          this.isGrounded = false;
        } else if (this.velocity.y < 0) {
          this.velocity.y = -2.5; // Gliding descent
        }
      }

      if (!this.isGrounded) {
        this.velocity.y -= this.gravity * delta;
      }

      this.position.x += this.velocity.x * delta;
      this.position.z += this.velocity.z * delta;
      this.position.y += this.velocity.y * delta;

      const floorY = this.getFloorHeight(this.position.x, this.position.z);
      const hoverBaseY = floorY + 2.2;

      this.hoverBob += delta * (isMoving ? 7 : 3);
      const bobOffset = Math.sin(this.hoverBob) * 0.22;

      if (this.position.y <= hoverBaseY + bobOffset) {
        this.position.y = hoverBaseY + bobOffset;
        this.velocity.y = 0;
        this.isGrounded = true;
      }

      if (this.windLines) {
        this.windLines.material.opacity = 0;
      }
    }

    // Keep within The Astral Expanse cosmic boundary (2600m across overworld & sub-realms)
    if (!this.isMounted) {
      const maxRadius = 2600;
      const distFromOrigin = Math.hypot(this.position.x, this.position.z);
      if (distFromOrigin > maxRadius) {
        const angle = Math.atan2(this.position.z, this.position.x);
        this.position.x = Math.cos(angle) * maxRadius;
        this.position.z = Math.sin(angle) * maxRadius;
        this.velocity.set(0, 0, 0);
      }
    }

    // Altitude floor limit in deep space void
    if (this.position.y < -120) {
      this.position.y = -120;
      this.velocity.y = Math.max(0, this.velocity.y);
    }

    // 4. Animate Divine Geometry
    // Astrolabe rings rotation
    this.astrolabeRings.forEach((ring, idx) => {
      const speedMult = (idx + 1) * 0.8 * (isSprinting || this.isFlying ? 2.5 : 1);
      ring.rotation.x += delta * speedMult;
      ring.rotation.y += delta * speedMult * 0.7;
    });

    // Core pulsing scale
    const pulse = 1 + Math.sin(this.hoverBob * 1.5) * 0.08;
    this.coreMesh.scale.set(pulse, pulse, pulse);

    // Halo rotation
    if (this.haloMesh) {
      this.haloMesh.rotation.y += delta * 1.2;
    }

    // Ethereal wings flapping
    const wingFlap = Math.sin(this.hoverBob * (this.isFlying ? 2.5 : 1.4)) * (this.isFlying ? 0.6 : 0.28);
    if (this.wingGroupLeft && this.wingGroupRight) {
      this.wingGroupLeft.rotation.y = -0.3 + wingFlap;
      this.wingGroupLeft.rotation.z = wingFlap * 0.5;

      this.wingGroupRight.rotation.y = 0.3 - wingFlap;
      this.wingGroupRight.rotation.z = -wingFlap * 0.5;
    }

    // 5. Update Stardust Trail Particles
    this.updateParticles(delta, true);

    // 6. Update Seraphic Fresnel Rim Aura
    if (this.auraUniforms) {
      this.auraUniforms.uTime.value += delta;
      const targetIntensity = (this.isFlying || isSprinting) ? 1.85 : 1.05;
      this.auraUniforms.uIntensity.value = THREE.MathUtils.lerp(
        this.auraUniforms.uIntensity.value,
        targetIntensity,
        delta * 5.0
      );
    }

    // 7. Update Ground Attunement Ripples
    const curFloorY = this.getFloorHeight(this.position.x, this.position.z);
    this.updateGroundRipples(delta, curFloorY);
  }

  // Determines ground elevation for sanctuary, open world expanse islands, and ley-line light bridges
  getFloorHeight(x, z) {
    // 0. Check Luminous Ley-Line Walkway Bridges
    if (this.vfx && this.vfx.leyLineWalkways) {
      for (let i = 0; i < this.vfx.leyLineWalkways.length; i++) {
        const w = this.vfx.leyLineWalkways[i];
        const dx = x - w.start.x;
        const dz = z - w.start.z;
        const lx = w.end.x - w.start.x;
        const lz = w.end.z - w.start.z;
        const lenSq = lx * lx + lz * lz;
        if (lenSq > 0) {
          const t = Math.max(0, Math.min(1, (dx * lx + dz * lz) / lenSq));
          const projX = w.start.x + t * lx;
          const projZ = w.start.z + t * lz;
          const distToBridge = Math.hypot(x - projX, z - projZ);
          if (distToBridge <= w.width * 0.5) {
            return w.startY + t * (w.endY - w.startY);
          }
        }
      }
    }

    // 1. Check open world archipelagos first
    if (this.expanse) {
      const expFloor = this.expanse.getFloorHeight(x, z);
      if (expFloor !== null) return expFloor;
    }

    // 2. Sanctuary Central Island
    const dist = Math.sqrt(x * x + z * z);
    if (dist < 22) return 0;

    // Bridges from center to the 4 shrines
    if (Math.abs(x) < 4.5 && z < 0 && z > -55) return 0;
    if (Math.abs(x) < 4.5 && z > 0 && z < 55) return 0;
    if (Math.abs(z) < 4.5 && x > 0 && x < 55) return 0;
    if (Math.abs(z) < 4.5 && x < 0 && x > -55) return 0;

    // Outlying Platforms (Radius ~ 18 around each shrine center)
    const dGenesis = Math.sqrt(x * x + (z + 48) * (z + 48));
    if (dGenesis < 18) return 0;

    const dVault = Math.sqrt((x - 48) * (x - 48) + z * z);
    if (dVault < 19) return 0;

    const dSpire = Math.sqrt(x * x + (z - 48) * (z - 48));
    if (dSpire < 18) return 0;

    const dBeacon = Math.sqrt((x + 48) * (x + 48) + z * z);
    if (dBeacon < 18) return 0;

    // Over the cosmic void
    return -60.0;
  }

  updateParticles(delta, isMoving) {
    if (!this.trailParticles || !this.trailPositions.length) return;

    this.trailHead = (this.trailHead + 1) % this.trailPositions.length;
    this.trailPositions[this.trailHead].copy(this.position);
    this.trailPositions[this.trailHead].y -= 0.2;

    const positions = this.trailParticles.geometry.attributes.position.array;
    const len = this.trailPositions.length;
    for (let i = 0; i < len; i++) {
      const idx = (this.trailHead - i + len) % len;
      const pos = this.trailPositions[idx];
      positions[i * 3] = pos.x + (Math.sin(i * 0.5) * 0.15);
      positions[i * 3 + 1] = pos.y + (Math.cos(i * 0.5) * 0.1);
      positions[i * 3 + 2] = pos.z + (Math.sin(i * 0.7) * 0.15);
    }
    this.trailParticles.geometry.attributes.position.needsUpdate = true;
  }
}
