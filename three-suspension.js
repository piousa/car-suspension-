/* ═══════════════════════════════════════════════════════════════
   THREE.JS 3D QUARTER-CAR SUSPENSION ENGINE — MATHS ASSIGNMENT
   Real Physical Wheel Kinematics, Rolling Contact & Dynamic Bump
   ═══════════════════════════════════════════════════════════════ */

const ThreeSuspension = {
  container: null,
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  active: true,

  // Scene Components
  groups: {
    root: null,
    chassis: null,
    strutTop: null,
    spring: null,
    damperCylinder: null,
    damperRod: null,
    controlArm: null,
    wheelHub: null,
    wheelAssembly: null,
    tireMesh: null,
    road: null,
    bumpMesh: null,
    stripes: []
  },

  // State
  isExploded: false,
  isCutaway: false,
  autoRotate: false,
  explodedProgress: 0,
  
  // Rolling Road Kinematics State
  roadScroll: 0,
  bumpZ: -10, // Position along Z travel axis
  wheelRotation: 0,
  tireRadius: 0.65,

  // Materials
  materials: {},

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container || typeof THREE === 'undefined') {
      console.warn('Three.js container or library not available');
      return;
    }

    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 560;

    // 1. SCENE
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0b10);
    this.scene.fog = new THREE.FogExp2(0x0a0b10, 0.04);

    // 2. CAMERA
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.camera.position.set(4.5, 2.4, 4.6);

    // 3. RENDERER
    // Mobile / low-power devices get a lighter render path: no MSAA, no soft
    // shadows, and a capped pixel ratio — keeps the frame rate usable on phones.
    const isMobile = (window.matchMedia && (window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(pointer: coarse)').matches));
    this.isMobile = isMobile;
    this.renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true, powerPreference: isMobile ? 'default' : 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    this.renderer.shadowMap.enabled = !isMobile;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 4. ORBIT CONTROLS
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.06;
      this.controls.maxPolarAngle = Math.PI / 2 + 0.04;
      this.controls.minDistance = 2.0;
      this.controls.maxDistance = 11.0;
      this.controls.target.set(0, 1.25, 0);
    }

    // 5. LIGHTING
    this.setupLighting();

    // 6. MATERIALS & ASSEMBLY
    this.setupMaterials();
    this.buildAssembly();

    // 7. EVENTS
    window.addEventListener('resize', () => this.onResize());

    // Start render loop
    this.animate();
  },

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    this.scene.add(ambientLight);

    // Main Studio Key Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.25);
    keyLight.position.set(6, 11, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.camera.left = -4;
    keyLight.shadow.camera.right = 4;
    keyLight.shadow.camera.top = 4;
    keyLight.shadow.camera.bottom = -4;
    keyLight.shadow.bias = -0.0004;
    this.scene.add(keyLight);

    // Warm Rim Backlight
    const rimLight = new THREE.DirectionalLight(0xfb923c, 0.85);
    rimLight.position.set(-6, 4.5, -4.5);
    this.scene.add(rimLight);

    // Technical Blue Floor/Undercarriage Light
    const fillLight = new THREE.DirectionalLight(0x60a5fa, 0.45);
    fillLight.position.set(0, -2, 3);
    this.scene.add(fillLight);
  },

  setupMaterials() {
    this.materials = {
      chassisPaint: new THREE.MeshStandardMaterial({
        color: 0x1f2430,
        metalness: 0.88,
        roughness: 0.22,
        envMapIntensity: 1.0
      }),
      chassisMount: new THREE.MeshStandardMaterial({
        color: 0x3b4252,
        metalness: 0.75,
        roughness: 0.32
      }),
      springCoil: new THREE.MeshStandardMaterial({
        color: 0xfb923c, // Industrial Orange
        metalness: 0.65,
        roughness: 0.18,
        emissive: 0x5a2308,
        emissiveIntensity: 0.22
      }),
      damperBody: new THREE.MeshStandardMaterial({
        color: 0x2563eb, // Cobalt Blue
        metalness: 0.72,
        roughness: 0.28,
        transparent: false,
        opacity: 1.0
      }),
      damperPiston: new THREE.MeshStandardMaterial({
        color: 0xe5e7eb,
        metalness: 0.95,
        roughness: 0.08
      }),
      internalPiston: new THREE.MeshStandardMaterial({
        color: 0xef4444,
        metalness: 0.8,
        roughness: 0.2
      }),
      hydraulicFluid: new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        metalness: 0.15,
        roughness: 0.1,
        transparent: true,
        opacity: 0.35
      }),
      controlArm: new THREE.MeshStandardMaterial({
        color: 0x475569,
        metalness: 0.68,
        roughness: 0.42
      }),
      bushing: new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.05,
        roughness: 0.95
      }),
      brakeRotor: new THREE.MeshStandardMaterial({
        color: 0xa8a29e,
        metalness: 0.92,
        roughness: 0.22
      }),
      brakeCaliper: new THREE.MeshStandardMaterial({
        color: 0xdc2626, // Brembo Red
        metalness: 0.4,
        roughness: 0.25
      }),
      tireRubber: new THREE.MeshStandardMaterial({
        color: 0x141417,
        metalness: 0.02,
        roughness: 0.92
      }),
      rimAlloy: new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.92,
        roughness: 0.18
      }),
      roadAsphalt: new THREE.MeshStandardMaterial({
        color: 0x131318,
        metalness: 0.05,
        roughness: 0.92
      }),
      bumpAsphalt: new THREE.MeshStandardMaterial({
        color: 0x22222b,
        metalness: 0.08,
        roughness: 0.85
      }),
      roadStripe: new THREE.MeshBasicMaterial({
        color: 0xf59e0b
      })
    };
  },

  buildAssembly() {
    this.groups.root = new THREE.Group();
    this.scene.add(this.groups.root);

    // 1. ROAD SURFACE & BUMP
    this.buildRoad();

    // 2. CHASSIS UNIBODY SECTION
    this.buildChassis();

    // 3. LOWER CONTROL ARM (A-ARM)
    this.buildControlArm();

    // 4. WHEEL HUB, BEARING & BRAKES
    this.buildWheelHub();

    // 5. WHEEL & TIRE
    this.buildWheel();

    // 6. STRUT (SPRING + DAMPER)
    this.buildStrut();
  },

  buildRoad() {
    const roadGroup = new THREE.Group();

    // Asphalt ground plane
    const roadGeo = new THREE.PlaneGeometry(16, 26);
    const roadMesh = new THREE.Mesh(roadGeo, this.materials.roadAsphalt);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.y = 0;
    roadMesh.receiveShadow = true;
    roadGroup.add(roadMesh);

    // Center lane dashed markings (animated conveyor scroll)
    this.groups.stripes = [];
    for (let i = -12; i <= 12; i += 2.4) {
      const stripeGeo = new THREE.PlaneGeometry(0.14, 1.2);
      const stripeMesh = new THREE.Mesh(stripeGeo, this.materials.roadStripe);
      stripeMesh.rotation.x = -Math.PI / 2;
      stripeMesh.position.set(0.65, 0.002, i);
      roadGroup.add(stripeMesh);
      this.groups.stripes.push({ mesh: stripeMesh, baseZ: i });
    }

    // Grid Floor
    const grid = new THREE.GridHelper(16, 32, 0x1e293b, 0x0f172a);
    grid.position.y = 0.001;
    roadGroup.add(grid);

    // Realistic Smooth Parametric Bump Mesh
    this.rebuildBumpMesh(roadGroup);

    this.groups.road = roadGroup;
    this.groups.root.add(roadGroup);
  },

  rebuildBumpMesh(parentGroup) {
    if (this.groups.bumpMesh) {
      this.groups.road.remove(this.groups.bumpMesh);
      if (this.groups.bumpMesh.geometry) this.groups.bumpMesh.geometry.dispose();
    }

    // Create a smooth curved surface profile along Z
    const widthX = 3.2;
    const lengthZ = 2.4;
    const segX = 14;
    const segZ = 64;

    const bumpGeo = new THREE.PlaneGeometry(widthX, lengthZ, segX, segZ);
    bumpGeo.rotateX(-Math.PI / 2);

    const pos = bumpGeo.attributes.position;
    const halfLen = lengthZ / 2;

    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i);
      // Cosine-squared profile for smooth transition to road
      if (Math.abs(z) < halfLen) {
        const heightFactor = Math.pow(Math.cos((z / halfLen) * (Math.PI / 2)), 2);
        pos.setY(i, heightFactor * 0.16); // Nominal scale, adjusted in runtime
      } else {
        pos.setY(i, 0);
      }
    }
    bumpGeo.computeVertexNormals();

    const bumpMesh = new THREE.Mesh(bumpGeo, this.materials.bumpAsphalt);
    bumpMesh.position.set(0, 0.002, -10);
    bumpMesh.receiveShadow = true;
    bumpMesh.castShadow = true;
    bumpMesh.visible = false;

    this.groups.bumpMesh = bumpMesh;
    (parentGroup || this.groups.road).add(bumpMesh);
  },

  buildChassis() {
    const chassisGroup = new THREE.Group();
    chassisGroup.position.set(0, 2.65, 0);

    // Frame body
    const frameGeo = new THREE.BoxGeometry(1.65, 0.3, 1.45);
    const frameMesh = new THREE.Mesh(frameGeo, this.materials.chassisPaint);
    frameMesh.position.set(-0.2, 0, 0);
    frameMesh.castShadow = true;
    chassisGroup.add(frameMesh);

    // Strut tower dome
    const towerGeo = new THREE.CylinderGeometry(0.24, 0.32, 0.24, 24);
    const towerMesh = new THREE.Mesh(towerGeo, this.materials.chassisMount);
    towerMesh.position.set(0, -0.15, 0);
    towerMesh.castShadow = true;
    chassisGroup.add(towerMesh);

    // Mounting bolts
    for (let i = 0; i < 3; i++) {
      const angle = (i * 2 * Math.PI) / 3;
      const boltGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.08, 12);
      const boltMesh = new THREE.Mesh(boltGeo, this.materials.damperPiston);
      boltMesh.position.set(Math.cos(angle) * 0.17, 0.16, Math.sin(angle) * 0.17);
      chassisGroup.add(boltMesh);
    }

    this.groups.chassis = chassisGroup;
    this.groups.root.add(chassisGroup);
  },

  buildControlArm() {
    const armGroup = new THREE.Group();
    armGroup.position.set(-0.7, 0.48, 0); // Inner chassis subframe pivot

    // A-arm wishbone tubular legs
    const leg1Geo = new THREE.CylinderGeometry(0.035, 0.035, 0.78, 16);
    const leg1 = new THREE.Mesh(leg1Geo, this.materials.controlArm);
    leg1.rotation.z = -Math.PI / 2.3;
    leg1.rotation.y = 0.38;
    leg1.position.set(0.36, 0, 0.22);
    leg1.castShadow = true;
    armGroup.add(leg1);

    const leg2 = leg1.clone();
    leg2.rotation.y = -0.38;
    leg2.position.set(0.36, 0, -0.22);
    armGroup.add(leg2);

    // Inner Subframe Bushings
    const bush1Geo = new THREE.CylinderGeometry(0.065, 0.065, 0.14, 16);
    const bush1 = new THREE.Mesh(bush1Geo, this.materials.bushing);
    bush1.rotation.x = Math.PI / 2;
    bush1.position.set(0, 0, 0.3);
    armGroup.add(bush1);

    const bush2 = bush1.clone();
    bush2.position.set(0, 0, -0.3);
    armGroup.add(bush2);

    // Outer Ball Joint
    const jointGeo = new THREE.SphereGeometry(0.075, 16, 16);
    const jointMesh = new THREE.Mesh(jointGeo, this.materials.bushing);
    jointMesh.position.set(0.72, 0, 0);
    jointMesh.castShadow = true;
    armGroup.add(jointMesh);

    this.groups.controlArm = armGroup;
    this.groups.root.add(armGroup);
  },

  buildWheelHub() {
    const hubGroup = new THREE.Group();
    hubGroup.position.set(0, 0.65, 0);

    // Steering knuckle
    const knuckleGeo = new THREE.BoxGeometry(0.14, 0.48, 0.16);
    const knuckleMesh = new THREE.Mesh(knuckleGeo, this.materials.controlArm);
    knuckleMesh.position.set(-0.06, 0, 0);
    knuckleMesh.castShadow = true;
    hubGroup.add(knuckleMesh);

    // Ventilated Brake Rotor
    const rotorGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.035, 32);
    const rotorMesh = new THREE.Mesh(rotorGeo, this.materials.brakeRotor);
    rotorMesh.rotation.z = Math.PI / 2;
    rotorMesh.position.set(0.04, 0, 0);
    rotorMesh.castShadow = true;
    hubGroup.add(rotorMesh);

    // Brake Caliper
    const caliperGeo = new THREE.BoxGeometry(0.12, 0.22, 0.14);
    const caliperMesh = new THREE.Mesh(caliperGeo, this.materials.brakeCaliper);
    caliperMesh.position.set(0.04, 0.22, 0.16);
    caliperMesh.rotation.x = 0.25;
    caliperMesh.castShadow = true;
    hubGroup.add(caliperMesh);

    this.groups.wheelHub = hubGroup;
    this.groups.root.add(hubGroup);
  },

  buildWheel() {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(0.18, 0.65, 0);

    // Tire
    const tireGeo = new THREE.TorusGeometry(0.48, 0.17, 24, 48);
    const tireMesh = new THREE.Mesh(tireGeo, this.materials.tireRubber);
    tireMesh.rotation.y = Math.PI / 2;
    tireMesh.castShadow = true;
    tireMesh.receiveShadow = true;
    wheelGroup.add(tireMesh);
    this.groups.tireMesh = tireMesh;

    // Rim Barrel
    const rimGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.28, 32, 1, true);
    const rimMesh = new THREE.Mesh(rimGeo, this.materials.rimAlloy);
    rimMesh.rotation.z = Math.PI / 2;
    wheelGroup.add(rimMesh);

    // 5-Spoke Face
    const hubCenterGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.06, 24);
    const hubCenterMesh = new THREE.Mesh(hubCenterGeo, this.materials.rimAlloy);
    hubCenterMesh.rotation.z = Math.PI / 2;
    hubCenterMesh.position.x = 0.1;
    wheelGroup.add(hubCenterMesh);

    for (let i = 0; i < 5; i++) {
      const a = (i * 2 * Math.PI) / 5;
      const spokeGeo = new THREE.BoxGeometry(0.04, 0.28, 0.06);
      const spokeMesh = new THREE.Mesh(spokeGeo, this.materials.rimAlloy);
      spokeMesh.position.set(0.09, Math.cos(a) * 0.22, Math.sin(a) * 0.22);
      spokeMesh.rotation.x = -a;
      spokeMesh.castShadow = true;
      wheelGroup.add(spokeMesh);
    }

    this.groups.wheelAssembly = wheelGroup;
    this.groups.root.add(wheelGroup);
  },

  buildStrut() {
    // ── DAMPER CYLINDER (Lower body fixed to knuckle) ──
    const cylGroup = new THREE.Group();
    cylGroup.position.set(0, 0.88, 0);

    const cylOuterGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.85, 24);
    const cylMesh = new THREE.Mesh(cylOuterGeo, this.materials.damperBody);
    cylMesh.position.y = 0.42;
    cylMesh.castShadow = true;
    cylGroup.add(cylMesh);
    this.damperMesh = cylMesh;

    // Lower spring perch
    const lowerPerchGeo = new THREE.CylinderGeometry(0.22, 0.16, 0.06, 24);
    const lowerPerchMesh = new THREE.Mesh(lowerPerchGeo, this.materials.chassisMount);
    lowerPerchMesh.position.y = 0.65;
    lowerPerchMesh.castShadow = true;
    cylGroup.add(lowerPerchMesh);

    // Fluid chamber for cutaway
    const fluidGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.65, 16);
    const fluidMesh = new THREE.Mesh(fluidGeo, this.materials.hydraulicFluid);
    fluidMesh.position.y = 0.4;
    fluidMesh.visible = false;
    cylGroup.add(fluidMesh);
    this.fluidMesh = fluidMesh;

    this.groups.damperCylinder = cylGroup;
    this.groups.root.add(cylGroup);

    // ── DAMPER PISTON ROD (Upper telescoping shaft attached to chassis) ──
    const rodGroup = new THREE.Group();
    rodGroup.position.set(0, 2.5, 0);

    const rodGeo = new THREE.CylinderGeometry(0.032, 0.032, 1.35, 20);
    const rodMesh = new THREE.Mesh(rodGeo, this.materials.damperPiston);
    rodMesh.position.y = -0.67;
    rodMesh.castShadow = true;
    rodGroup.add(rodMesh);

    // Upper spring perch
    const upperPerchGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.06, 24);
    const upperPerchMesh = new THREE.Mesh(upperPerchGeo, this.materials.chassisMount);
    upperPerchMesh.position.y = -0.05;
    upperPerchMesh.castShadow = true;
    rodGroup.add(upperPerchMesh);

    // Internal piston head
    const internalHeadGeo = new THREE.CylinderGeometry(0.078, 0.078, 0.08, 20);
    const internalHeadMesh = new THREE.Mesh(internalHeadGeo, this.materials.internalPiston);
    internalHeadMesh.position.y = -1.25;
    rodGroup.add(internalHeadMesh);

    this.groups.damperRod = rodGroup;
    this.groups.root.add(rodGroup);

    // ── 3D HELICAL COIL SPRING ──
    this.createHelicalSpring(1.0);
  },

  createHelicalSpring(length) {
    if (this.groups.spring) {
      this.groups.root.remove(this.groups.spring);
      if (this.groups.spring.geometry) this.groups.spring.geometry.dispose();
    }

    const turns = 7.5;
    const radius = 0.16;
    const wireRadius = 0.024;
    const pointsCount = 200;
    const points = [];

    for (let i = 0; i <= pointsCount; i++) {
      const t = i / pointsCount;
      const angle = t * turns * 2 * Math.PI;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = t * length;
      points.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const springGeo = new THREE.TubeGeometry(curve, 180, wireRadius, 12, false);
    const springMesh = new THREE.Mesh(springGeo, this.materials.springCoil);
    springMesh.position.set(0, 1.5, 0);
    springMesh.castShadow = true;

    this.groups.spring = springMesh;
    this.groups.root.add(springMesh);
  },

  // ═══════════════════════════════════════════════════════
  //  REALISTIC TIRE & BUMP PHYSICS KINEMATICS
  // ═══════════════════════════════════════════════════════
  getRoadSurfaceUnderWheel(contactZ, bumpZ, mode) {
    if (mode === 0) return 0; // Flat road

    const dz = contactZ - bumpZ;

    if (mode === 4) { // Corrugated / washboard road
      const lambda = 1.2;
      const wave = Math.cos(dz * (2 * Math.PI / lambda));
      return (wave > 0) ? wave * 0.055 : 0;
    }

    // Single bumps (Small, Large, Speed Bump)
    const bumpConfig = {
      1: { h: 0.075, w: 0.42 }, // Small bump
      2: { h: 0.160, w: 0.75 }, // Large bump
      3: { h: 0.120, w: 1.25 }  // Wide speed table
    }[mode] || { h: 0.10, w: 0.60 };

    if (Math.abs(dz) <= bumpConfig.w) {
      // Smooth bell-shaped cosine-squared profile
      return bumpConfig.h * Math.pow(Math.cos((dz / bumpConfig.w) * (Math.PI / 2)), 2);
    }
    return 0;
  },

  updatePhysics(disp, vel, dt) {
    if (!this.active || !this.groups.chassis) return;

    // Linear road speed (m/s)
    const carSpeed = SIM.slowMo ? 1.4 : 3.8;

    // Advance road conveyor scroll & bump position
    if (SIM.playing) {
      this.roadScroll += carSpeed * dt;
      // Wheel rotation perfectly matched to road speed (rolling forward without slipping)
      const angularVel = carSpeed / this.tireRadius;
      this.wheelRotation += angularVel * dt;
    }

    // Update road lane dashed stripes (streaming front-to-rear)
    if (this.groups.stripes) {
      this.groups.stripes.forEach(s => {
        const rawZ = s.baseZ - (this.roadScroll % 24);
        const scrolledZ = (((rawZ + 12) % 24) + 24) % 24 - 12;
        s.mesh.position.z = scrolledZ;
      });
    }

    // ── REALISTIC BUMP POSITIONING & SHAPE ──
    const bumpCycleDistance = 14.0; // Distance between repeating bumps
    if (SIM.roadMode > 0) {
      this.groups.bumpMesh.visible = true;
      // Bump moves realistically from front (+7m) -> through wheel contact (0m) -> to rear (-7m)
      const progress = ((this.roadScroll % bumpCycleDistance) + bumpCycleDistance) % bumpCycleDistance;
      const newBumpZ = 7.0 - progress;
      const prevBumpZ = this.bumpZ;
      this.bumpZ = newBumpZ;
      this.groups.bumpMesh.position.z = this.bumpZ;

      // Adjust 3D bump visual scale to match active mode
      const bumpConfig = {
        1: { h: 0.075, w: 0.42, v0: 0.45 },
        2: { h: 0.160, w: 0.75, v0: 0.95 },
        3: { h: 0.120, w: 1.25, v0: 0.70 },
        4: { h: 0.055, w: 1.00, v0: 0.35 }
      }[SIM.roadMode] || { h: 0.1, w: 0.6, v0: 0.5 };

      this.groups.bumpMesh.scale.set(1.0, bumpConfig.h / 0.16, bumpConfig.w / 1.2);

      // Trigger suspension ODE impulse when bump crest hits the tire
      if (prevBumpZ > 0 && this.bumpZ <= 0) {
        if (typeof SIM !== 'undefined' && SIM.roadMode >= 1 && SIM.roadMode <= 3) {
          SIM.solutionIdx = 0;
          SIM.t = 0;
        }
      }
    } else {
      this.groups.bumpMesh.visible = false;
      this.bumpZ = -20;
    }

    // ── PHYSICAL ROAD LIFT DIRECTLY UNDER THE WHEEL CONTACT PATCH (Z = 0) ──
    const contactPatchZ = 0;
    const roadLift = this.getRoadSurfaceUnderWheel(contactPatchZ, this.bumpZ, SIM.roadMode);

    // ── TIRE DYNAMICS & PNEUMATIC COMPLIANCE ──
    // Realistic vertical tire squash under vehicle gravity + suspension dynamic forces
    const staticSquash = 0.014; // 14mm nominal static tire deflection
    const dynamicForce = Math.max(-20, Math.min(60, (SIM.Fs || 0) + (SIM.Fd || 0)));
    const dynamicSquash = Math.max(0.004, Math.min(0.032, staticSquash + (dynamicForce / 2800)));

    // Actual Wheel Spindle Height follows road profile and tire deflection
    const nominalSpindleY = 0.65;
    const spindleY = nominalSpindleY + roadLift - dynamicSquash;

    // Exploded View progress
    if (this.isExploded) {
      this.explodedProgress = Math.min(1.0, this.explodedProgress + 0.05);
    } else {
      this.explodedProgress = Math.max(0.0, this.explodedProgress - 0.05);
    }
    const ep = this.explodedProgress;

    // ── WHEEL, HUB & ROTOR MOVE WITH SPINDLE ──
    this.groups.wheelAssembly.position.y = spindleY + ep * 0.6;
    this.groups.wheelAssembly.position.x = 0.18 + ep * 0.8;
    this.groups.wheelAssembly.rotation.x = this.wheelRotation;

    this.groups.wheelHub.position.y = spindleY - ep * 0.25;

    // Lower control arm pivots around inner subframe bushing
    const armPivotY = 0.48;
    const armLength = 0.72;
    const armAngle = Math.asin(Math.max(-0.4, Math.min(0.4, (spindleY - armPivotY) / armLength)));
    this.groups.controlArm.rotation.z = armAngle;

    // ── CAR BODY / CHASSIS MOVES ACCORDING TO ODE SOLUTION ──
    // Displacement scaling in 3D: 1m ODE = 1.5 units 3D
    const disp3D = disp * 1.5;
    const baseChassisY = 2.65;
    const chassisY = baseChassisY + disp3D + ep * 0.8;
    this.groups.chassis.position.y = chassisY;
    this.groups.chassis.position.x = -ep * 0.4;

    // Damper rod upper mount stays attached to chassis
    this.groups.damperRod.position.y = (chassisY - 0.15) + ep * 0.6;

    // Damper cylinder lower mount is attached to wheel knuckle
    const cylBaseY = spindleY + 0.23 - ep * 0.2;
    this.groups.damperCylinder.position.y = cylBaseY;

    // ── COIL SPRING COMPRESSION ──
    // Distance between upper chassis spring perch and lower damper perch
    const upperPerchY = chassisY - 0.2;
    const lowerPerchY = cylBaseY + 0.65;
    const springDistance = Math.max(0.42, upperPerchY - lowerPerchY);

    if (this.groups.spring) {
      const nominalSpringLen = 0.95;
      const scaleY = springDistance / nominalSpringLen;
      this.groups.spring.scale.set(1.0 + (1.0 - scaleY) * 0.35, scaleY, 1.0 + (1.0 - scaleY) * 0.35);
      this.groups.spring.position.y = lowerPerchY;
    }

    // Auto-Rotate
    if (this.autoRotate && this.controls) {
      this.controls.autoRotate = true;
      this.controls.autoRotateSpeed = 2.0;
    } else if (this.controls) {
      this.controls.autoRotate = false;
    }

    // 3D Callout Badges
    this.updateAnnotations();
  },

  updateAnnotations() {
    const labels = [
      { id: 'ann-body', obj: this.groups.chassis, offset: new THREE.Vector3(0, 0.4, 0) },
      { id: 'ann-spring', obj: this.groups.spring, offset: new THREE.Vector3(0.4, 0.3, 0) },
      { id: 'ann-damper', obj: this.groups.damperCylinder, offset: new THREE.Vector3(-0.4, 0.4, 0) },
      { id: 'ann-wheel', obj: this.groups.wheelAssembly, offset: new THREE.Vector3(0.4, 0.2, 0.4) }
    ];

    labels.forEach(item => {
      const el = document.getElementById(item.id);
      if (!el || !item.obj) return;

      const pos = new THREE.Vector3();
      item.obj.getWorldPosition(pos);
      pos.add(item.offset);
      pos.project(this.camera);

      if (pos.z > 1) {
        el.style.opacity = '0';
        return;
      }

      const hw = this.container.clientWidth / 2;
      const hh = this.container.clientHeight / 2;
      const x = (pos.x * hw) + hw;
      const y = -(pos.y * hh) + hh;

      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.opacity = '1';
    });
  },

  setCameraView(viewName) {
    if (!this.camera || !this.controls) return;

    const targetPos = new THREE.Vector3(0, 1.25, 0);
    this.controls.target.copy(targetPos);

    switch (viewName) {
      case 'side':
        this.animateCameraTo(new THREE.Vector3(5.5, 1.25, 0));
        break;
      case 'front':
        this.animateCameraTo(new THREE.Vector3(0, 1.25, 5.5));
        break;
      case 'rear':
        this.animateCameraTo(new THREE.Vector3(0, 1.25, -5.5));
        break;
      case 'iso':
      default:
        this.animateCameraTo(new THREE.Vector3(4.5, 2.4, 4.6));
        break;
    }
  },

  animateCameraTo(newPos) {
    const startPos = this.camera.position.clone();
    const duration = 600;
    const startTime = performance.now();

    const step = (time) => {
      const elapsed = time - startTime;
      const t = Math.min(1.0, elapsed / duration);
      const ease = 1 - Math.pow(1 - t, 3);

      this.camera.position.lerpVectors(startPos, newPos, ease);
      this.controls.update();

      if (t < 1.0) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  },

  toggleExploded() {
    this.isExploded = !this.isExploded;
    return this.isExploded;
  },

  toggleCutaway() {
    this.isCutaway = !this.isCutaway;
    if (this.damperMesh) {
      this.damperMesh.material.transparent = this.isCutaway;
      this.damperMesh.material.opacity = this.isCutaway ? 0.35 : 1.0;
      this.damperMesh.material.needsUpdate = true;
    }
    if (this.fluidMesh) {
      this.fluidMesh.visible = this.isCutaway;
    }
    return this.isCutaway;
  },

  toggleAutoRotate() {
    this.autoRotate = !this.autoRotate;
    return this.autoRotate;
  },

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  },

  animate() {
    requestAnimationFrame(() => this.animate());

    if (!this.active) return;

    if (this.controls) {
      this.controls.update();
    }

    if (typeof SIM !== 'undefined') {
      this.updatePhysics(SIM.x, SIM.v, 0.016);
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
};

window.ThreeSuspension = ThreeSuspension;
