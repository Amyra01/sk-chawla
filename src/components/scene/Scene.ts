import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

interface CameraShot {
  pos: THREE.Vector3;
  look: THREE.Vector3;
}

const SECTION_SHOTS: CameraShot[] = [
  // 0: Hero (SC monogram + balance scale)
  { pos: new THREE.Vector3(0.4, 1.8, 7.2), look: new THREE.Vector3(0.6, 1.2, 0) },
  // 1: About (Glass degree certificate)
  { pos: new THREE.Vector3(-4.2, 2.0, 5.5), look: new THREE.Vector3(-5.0, 1.4, -1.5) },
  // 2: Services (3 glass cubes)
  { pos: new THREE.Vector3(4.5, 2.4, 5.8), look: new THREE.Vector3(5.2, 1.3, -1.5) },
  // 3: Career Journey (Luminous ribbon + milestone orbs)
  { pos: new THREE.Vector3(0.0, 3.2, -3.5), look: new THREE.Vector3(0.0, 2.0, -9.5) },
  // 4: Clients (5 orbiting ledger cards)
  { pos: new THREE.Vector3(-5.0, 2.2, -9.0), look: new THREE.Vector3(-5.0, 1.6, -14.0) },
  // 5: Why Choose Me (4 glass pillars)
  { pos: new THREE.Vector3(5.2, 2.5, -9.0), look: new THREE.Vector3(5.2, 1.5, -14.0) },
  // 6: Process (4 rotating rings)
  { pos: new THREE.Vector3(0.0, 2.4, -15.5), look: new THREE.Vector3(0.0, 1.6, -21.0) },
  // 7: Insights / Testimonials / FAQ (calm mid-stage)
  { pos: new THREE.Vector3(-3.0, 2.8, -20.5), look: new THREE.Vector3(0.0, 1.6, -24.5) },
  // 8: Contact & Forms (Document slab + tray)
  { pos: new THREE.Vector3(0.0, 2.1, -24.5), look: new THREE.Vector3(0.0, 1.1, -29.0) },
  // 9: Footer (Calm wide overview)
  { pos: new THREE.Vector3(0.0, 9.5, 11.0), look: new THREE.Vector3(0.0, 1.0, -12.0) },
];

function smoothstep(f: number): number {
  const c = Math.max(0, Math.min(1, f));
  return c * c * (3 - 2 * c);
}

function createCanvasLabelTexture(
  title: string,
  subtitle?: string,
  accent = "#E0B860"
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "rgba(10, 15, 28, 0.92)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 44px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(title, canvas.width / 2, subtitle ? 105 : 128);

    if (subtitle) {
      ctx.fillStyle = accent;
      ctx.font = "500 24px Inter, system-ui, sans-serif";
      ctx.fillText(subtitle, canvas.width / 2, 165);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class Scene {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private rafId: number | null = null;
  private lastTime = performance.now();
  private elapsed = 0;

  private targetProgress = 0;
  private smoothProgress = 0;
  private pointer = new THREE.Vector2(0, 0);
  private smoothPointer = new THREE.Vector2(0, 0);
  private reducedMotion = false;
  private lowPower = false;

  // Interactive & animated groups
  private scaleBeam!: THREE.Group;
  private monogramGroup!: THREE.Group;
  private degreeCard!: THREE.Mesh;
  private serviceCubes: THREE.Mesh[] = [];
  private serviceHitBoxes: THREE.Mesh[] = [];
  private selectedServiceIndex = -1;
  private hoveredServiceIndex = -1;
  private clientCards: THREE.Mesh[] = [];
  private pillars: THREE.Mesh[] = [];
  private processRings: THREE.Mesh[] = [];
  private instancedTokens!: THREE.InstancedMesh;
  private tokenCount = 24;
  private revealedTokens = 0;
  private tokenTimer = 0;

  // Gravity drop slab & feedback flash
  private docSlab!: THREE.Mesh;
  private docVelocityY = 0;
  private docDropping = false;
  private docRestY = 1.35;
  private pulseIntensity = 0;
  private failIntensity = 0;

  private baseBg = new THREE.Color("#0A0F1C");
  private failBg = new THREE.Color("#2a060a");
  private pulseBg = new THREE.Color("#0F1A38");
  private currentBg = new THREE.Color("#0A0F1C");

  private raycaster = new THREE.Raycaster();
  private onSelectCallback?: (index: number) => void;

  private disposables: Array<{ dispose: () => void }> = [];

  constructor(
    canvas: HTMLCanvasElement,
    options?: { onSelect?: (index: number) => void }
  ) {
    this.canvas = canvas;
    this.onSelectCallback = options?.onSelect;

    this.reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const nav = navigator as Navigator & { deviceMemory?: number };
    const lowMem = (nav.deviceMemory ?? 8) <= 4;
    const lowCores = (navigator.hardwareConcurrency ?? 8) <= 4;
    const isMobile = window.innerWidth < 768;
    this.lowPower = lowMem || lowCores;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !this.lowPower,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.shadowMap.enabled = !this.lowPower;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.scene = new THREE.Scene();
    this.scene.background = this.baseBg.clone();
    this.scene.fog = new THREE.FogExp2("#0A0F1C", 0.032);

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      120
    );
    this.camera.position.copy(SECTION_SHOTS[0].pos);
    this.camera.lookAt(SECTION_SHOTS[0].look);

    this.setupLights(isMobile);
    this.setupEnvironment();
    this.setupHeroObjects();
    this.setupAboutObjects();
    this.setupServiceCubes();
    this.setupJourneyRibbon();
    this.setupClientCards();
    this.setupWhyPillars();
    this.setupProcessRings();
    this.setupContactTray();

    this.bindEvents();
    this.loop();
  }

  private track<T extends { dispose: () => void }>(item: T): T {
    this.disposables.push(item);
    return item;
  }

  private setupLights(isMobile: boolean) {
    const hemi = new THREE.HemisphereLight("#4F74E8", "#0A0F1C", 0.9);
    this.scene.add(hemi);

    const dir = new THREE.DirectionalLight("#ffffff", 1.6);
    dir.position.set(6, 14, 10);
    if (!this.lowPower) {
      dir.castShadow = true;
      const mapSize = isMobile ? 1024 : 2048;
      dir.shadow.mapSize.set(mapSize, mapSize);
      dir.shadow.camera.near = 1;
      dir.shadow.camera.far = 60;
    }
    this.scene.add(dir);

    const bluePoint = new THREE.PointLight("#4F74E8", 3.5, 25);
    bluePoint.position.set(1.5, 3, 2);
    this.scene.add(bluePoint);

    const cyanPoint = new THREE.PointLight("#E0B860", 2.5, 30);
    cyanPoint.position.set(-4, 4, -14);
    this.scene.add(cyanPoint);
  }

  private setupEnvironment() {
    const floorGeo = this.track(new THREE.PlaneGeometry(120, 120));
    const floorMat = this.track(
      new THREE.MeshStandardMaterial({
        color: "#0C1220",
        roughness: 0.85,
        metalness: 0.2,
      })
    );
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -0.5, -12);
    floor.receiveShadow = true;
    this.scene.add(floor);

    const grid = new THREE.GridHelper(120, 60, "#4F74E8", "#16213D");
    grid.position.set(0, -0.49, -12);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.28;
    this.scene.add(grid);

    // Instanced rupee/ledger tokens along the floor
    const tokenGeo = this.track(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 16));
    const tokenMat = this.track(
      new THREE.MeshStandardMaterial({
        color: "#D4AF37",
        metalness: 0.8,
        roughness: 0.25,
      })
    );
    this.instancedTokens = new THREE.InstancedMesh(
      tokenGeo,
      tokenMat,
      this.tokenCount
    );
    const dummy = new THREE.Object3D();
    for (let i = 0; i < this.tokenCount; i++) {
      dummy.position.set(
        Math.sin(i * 0.9) * 3.8,
        -0.42,
        -2 - i * 1.1
      );
      dummy.scale.setScalar(this.reducedMotion ? 1 : 0.001);
      dummy.updateMatrix();
      this.instancedTokens.setMatrixAt(i, dummy.matrix);
    }
    this.instancedTokens.instanceMatrix.needsUpdate = true;
    this.scene.add(this.instancedTokens);
  }

  private createGlassMaterial(emissive = "#4F74E8", opacity = 0.28) {
    return this.track(
      new THREE.MeshPhysicalMaterial({
        color: "#D9E2FF",
        emissive,
        emissiveIntensity: 0.25,
        roughness: 0.1,
        metalness: 0.05,
        transmission: 0.65,
        thickness: 0.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity,
      })
    );
  }

  private setupHeroObjects() {
    // Floating SC monogram slab
    this.monogramGroup = new THREE.Group();
    this.monogramGroup.position.set(1.8, 1.5, 0.4);

    const scTex = this.track(
      createCanvasLabelTexture("SC", "ADVOCATE & TAX", "#E0B860")
    );
    const slabGeo = this.track(new RoundedBoxGeometry(1.7, 1.1, 0.18, 4, 0.06));
    const slabMat = this.track(
      new THREE.MeshStandardMaterial({
        map: scTex,
        roughness: 0.25,
        metalness: 0.3,
        emissive: "#4F74E8",
        emissiveIntensity: 0.22,
      })
    );
    const slab = new THREE.Mesh(slabGeo, slabMat);
    slab.castShadow = true;
    this.monogramGroup.add(slab);
    this.scene.add(this.monogramGroup);

    // Slim glass balance scale
    const scaleGroup = new THREE.Group();
    scaleGroup.position.set(0.3, 0.2, -0.4);

    const glassMat = this.createGlassMaterial("#4F74E8", 0.35);
    const matteBlack = this.track(
      new THREE.MeshStandardMaterial({
        color: "#141B2D",
        roughness: 0.5,
        metalness: 0.6,
      })
    );

    const base = new THREE.Mesh(
      this.track(new RoundedBoxGeometry(1.2, 0.15, 0.7, 3, 0.04)),
      matteBlack
    );
    scaleGroup.add(base);

    const pillar = new THREE.Mesh(
      this.track(new THREE.CylinderGeometry(0.05, 0.07, 2.2, 16)),
      glassMat
    );
    pillar.position.y = 1.1;
    scaleGroup.add(pillar);

    this.scaleBeam = new THREE.Group();
    this.scaleBeam.position.y = 2.15;

    const beamMesh = new THREE.Mesh(
      this.track(new RoundedBoxGeometry(2.3, 0.07, 0.07, 2, 0.02)),
      glassMat
    );
    this.scaleBeam.add(beamMesh);

    const panGeo = this.track(new THREE.CylinderGeometry(0.36, 0.24, 0.08, 24));
    const leftPan = new THREE.Mesh(panGeo, glassMat);
    leftPan.position.set(-1.05, -0.75, 0);
    const rightPan = new THREE.Mesh(panGeo, glassMat);
    rightPan.position.set(1.05, -0.75, 0);

    const cordGeo = this.track(new THREE.CylinderGeometry(0.01, 0.01, 0.75, 8));
    const leftCord = new THREE.Mesh(cordGeo, matteBlack);
    leftCord.position.set(-1.05, -0.37, 0);
    const rightCord = new THREE.Mesh(cordGeo, matteBlack);
    rightCord.position.set(1.05, -0.37, 0);

    this.scaleBeam.add(leftPan, rightPan, leftCord, rightCord);
    scaleGroup.add(this.scaleBeam);
    this.scene.add(scaleGroup);
  }

  private setupAboutObjects() {
    const certTex = this.track(
      createCanvasLabelTexture("B.A. LL.B. (HONS)", "1998-2000 • 2001-2003", "#4F74E8")
    );
    const geo = this.track(new RoundedBoxGeometry(2.4, 1.5, 0.12, 4, 0.05));
    const mat = this.track(
      new THREE.MeshStandardMaterial({
        map: certTex,
        roughness: 0.2,
        metalness: 0.25,
        emissive: "#4F74E8",
        emissiveIntensity: 0.18,
      })
    );
    this.degreeCard = new THREE.Mesh(geo, mat);
    this.degreeCard.position.set(-5.0, 1.4, -1.5);
    this.scene.add(this.degreeCard);
  }

  private setupServiceCubes() {
    const labels = ["GST", "ITR", "LITIGATION"];
    const hitMat = this.track(
      new THREE.MeshBasicMaterial({ visible: false })
    );

    labels.forEach((label, idx) => {
      const geo = this.track(new RoundedBoxGeometry(1.05, 1.05, 1.05, 4, 0.08));
      const mat = this.createGlassMaterial(
        idx === 2 ? "#E0B860" : "#4F74E8",
        0.38
      );
      const cube = new THREE.Mesh(geo, mat);
      const x = 4.0 + idx * 1.35;
      const y = 1.2 + (idx === 1 ? 0.45 : 0);
      const z = -1.6 + (idx % 2) * 0.5;
      cube.position.set(x, y, z);
      cube.userData = { serviceIndex: idx, baseY: y };
      this.serviceCubes.push(cube);
      this.scene.add(cube);

      const hit = new THREE.Mesh(
        this.track(new THREE.BoxGeometry(1.3, 1.3, 1.3)),
        hitMat
      );
      hit.position.copy(cube.position);
      hit.userData = { serviceIndex: idx };
      this.serviceHitBoxes.push(hit);
      this.scene.add(hit);
    });
  }

  private setupJourneyRibbon() {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.5, 1.0, -6.5),
      new THREE.Vector3(-0.8, 1.8, -8.2),
      new THREE.Vector3(1.2, 2.2, -10.0),
      new THREE.Vector3(2.8, 2.7, -11.8),
    ]);
    const tubeGeo = this.track(new THREE.TubeGeometry(curve, 48, 0.06, 12, false));
    const tubeMat = this.track(
      new THREE.MeshStandardMaterial({
        color: "#4F74E8",
        emissive: "#E0B860",
        emissiveIntensity: 0.7,
        roughness: 0.2,
      })
    );
    this.scene.add(new THREE.Mesh(tubeGeo, tubeMat));

    const pts = [0.05, 0.35, 0.68, 0.98];
    const orbGeo = this.track(new THREE.SphereGeometry(0.24, 24, 24));
    const orbMat = this.createGlassMaterial("#E0B860", 0.55);
    pts.forEach((t) => {
      const p = curve.getPoint(t);
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.copy(p);
      this.scene.add(orb);
    });
  }

  private setupClientCards() {
    const clients = ["KALYAN", "SIEMENS", "MAKKAR", "IQBAL", "GANPATI"];
    const geo = this.track(new RoundedBoxGeometry(1.15, 0.72, 0.08, 3, 0.04));
    clients.forEach((name, idx) => {
      const tex = this.track(
        createCanvasLabelTexture(name, "CLIENT RECORD", "#4F74E8")
      );
      const mat = this.track(
        new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.3,
          metalness: 0.3,
        })
      );
      const card = new THREE.Mesh(geo, mat);
      const angle = (idx / clients.length) * Math.PI * 2;
      card.position.set(
        -5.0 + Math.cos(angle) * 2.1,
        1.5 + Math.sin(idx) * 0.25,
        -14.0 + Math.sin(angle) * 2.1
      );
      card.userData = { angle };
      this.clientCards.push(card);
      this.scene.add(card);
    });
  }

  private setupWhyPillars() {
    const geo = this.track(new RoundedBoxGeometry(0.65, 2.2, 0.65, 3, 0.06));
    for (let i = 0; i < 4; i++) {
      const mat = this.createGlassMaterial("#4F74E8", 0.36);
      const pillar = new THREE.Mesh(geo, mat);
      pillar.position.set(3.4 + i * 1.15, 0.7 + i * 0.15, -14.0);
      this.pillars.push(pillar);
      this.scene.add(pillar);
    }
  }

  private setupProcessRings() {
    const geo = this.track(new THREE.TorusGeometry(0.68, 0.09, 16, 48));
    for (let i = 0; i < 4; i++) {
      const mat = this.createGlassMaterial(i === 0 ? "#E0B860" : "#4F74E8", 0.5);
      const ring = new THREE.Mesh(geo, mat);
      ring.position.set(-2.7 + i * 1.8, 1.5, -21.0);
      this.processRings.push(ring);
      this.scene.add(ring);
    }
  }

  private setupContactTray() {
    const trayGeo = this.track(new RoundedBoxGeometry(2.6, 0.18, 1.8, 3, 0.05));
    const trayMat = this.track(
      new THREE.MeshStandardMaterial({
        color: "#111827",
        roughness: 0.4,
        metalness: 0.7,
      })
    );
    const tray = new THREE.Mesh(trayGeo, trayMat);
    tray.position.set(0, 0.4, -29.0);
    this.scene.add(tray);

    const docGeo = this.track(new RoundedBoxGeometry(1.7, 0.14, 1.2, 3, 0.04));
    const docMat = this.createGlassMaterial("#E0B860", 0.55);
    this.docSlab = new THREE.Mesh(docGeo, docMat);
    this.docSlab.position.set(0, this.docRestY, -29.0);
    this.scene.add(this.docSlab);
  }

  private onPointerMove = (e: PointerEvent) => {
    this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.serviceHitBoxes, false);
    this.hoveredServiceIndex =
      hits.length > 0 ? (hits[0].object.userData.serviceIndex as number) : -1;
  };

  private onClick = (e: MouseEvent) => {
    const pt = new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );
    this.raycaster.setFromCamera(pt, this.camera);
    const hits = this.raycaster.intersectObjects(this.serviceHitBoxes, false);
    if (hits.length > 0) {
      const idx = hits[0].object.userData.serviceIndex as number;
      this.select(idx);
      this.onSelectCallback?.(idx);
    }
  };

  private onResize = () => {
    this.resize();
  };

  private bindEvents() {
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("click", this.onClick);
    window.addEventListener("resize", this.onResize);
  }

  public setProgress(p: number) {
    this.targetProgress = Math.max(0, Math.min(SECTION_SHOTS.length - 1, p));
    if (this.reducedMotion) {
      this.smoothProgress = this.targetProgress;
    }
  }

  public select(i: number) {
    this.selectedServiceIndex = i;
  }

  public pulse() {
    if (this.reducedMotion) return;
    this.pulseIntensity = 1.0;
    this.docSlab.position.y = 4.2;
    this.docVelocityY = 0;
    this.docDropping = true;
  }

  public fail() {
    if (this.reducedMotion) return;
    this.failIntensity = 1.0;
  }

  public resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.setSize(w, h, false);
  }

  public loop = () => {
    this.rafId = requestAnimationFrame(this.loop);
    if (document.hidden) return;

    const now = performance.now();
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;
    this.elapsed += dt;

    // Exponential damping for scroll & pointer
    if (this.reducedMotion) {
      this.smoothProgress = this.targetProgress;
    } else {
      const alpha = 1 - Math.exp(-dt * 4.5);
      this.smoothProgress += (this.targetProgress - this.smoothProgress) * alpha;
      this.smoothPointer.x += (this.pointer.x - this.smoothPointer.x) * alpha;
      this.smoothPointer.y += (this.pointer.y - this.smoothPointer.y) * alpha;
    }

    // Interpolate camera between section shots
    const idx = Math.floor(this.smoothProgress);
    const nextIdx = Math.min(SECTION_SHOTS.length - 1, idx + 1);
    const frac = smoothstep(this.smoothProgress - idx);

    const shotA = SECTION_SHOTS[idx];
    const shotB = SECTION_SHOTS[nextIdx];
    const camPos = shotA.pos.clone().lerp(shotB.pos, frac);
    const camLook = shotA.look.clone().lerp(shotB.look, frac);

    if (!this.reducedMotion) {
      camPos.x += this.smoothPointer.x * 0.9;
      camPos.y += this.smoothPointer.y * 0.5;
    }

    this.camera.position.copy(camPos);
    this.camera.lookAt(camLook);

    // Ambient & interactive object motion
    if (!this.reducedMotion) {
      this.monogramGroup.position.y = 1.5 + Math.sin(this.elapsed * 1.2) * 0.1;
      this.monogramGroup.rotation.y =
        -0.15 + this.smoothPointer.x * 0.15 + Math.sin(this.elapsed * 0.5) * 0.05;

      this.scaleBeam.rotation.z =
        -this.smoothPointer.x * 0.12 + Math.sin(this.elapsed * 0.9) * 0.03;

      this.degreeCard.rotation.y = 0.25 + Math.sin(this.elapsed * 0.6) * 0.2;
      this.degreeCard.position.y = 1.4 + Math.cos(this.elapsed * 1.1) * 0.08;

      this.serviceCubes.forEach((cube, i) => {
        const isActive =
          i === this.hoveredServiceIndex || i === this.selectedServiceIndex;
        const targetY =
          (cube.userData.baseY as number) +
          (isActive ? 0.35 : Math.sin(this.elapsed + i) * 0.08);
        cube.position.y += (targetY - cube.position.y) * 0.1;
        cube.rotation.x = this.smoothPointer.y * 0.25 + this.elapsed * 0.2;
        cube.rotation.y = this.smoothPointer.x * 0.3 + this.elapsed * 0.3;
        const mat = cube.material as THREE.MeshPhysicalMaterial;
        mat.emissiveIntensity = isActive ? 0.7 : 0.25;
      });

      this.clientCards.forEach((card, i) => {
        const baseAngle = card.userData.angle as number;
        const a = baseAngle + this.elapsed * 0.12;
        card.position.x = -5.0 + Math.cos(a) * 2.1;
        card.position.z = -14.0 + Math.sin(a) * 2.1;
        card.lookAt(-5.0, 1.5, -14.0);
        card.position.y = 1.5 + Math.sin(this.elapsed * 1.2 + i) * 0.08;
      });

      this.pillars.forEach((p, i) => {
        p.position.y = 0.7 + i * 0.15 + Math.sin(this.elapsed * 1.3 + i) * 0.05;
      });

      const activeRingIdx = Math.max(
        0,
        Math.min(3, Math.round((this.smoothProgress - 5.5) * 2))
      );
      this.processRings.forEach((ring, i) => {
        ring.rotation.x = this.elapsed * (0.4 + i * 0.15);
        ring.rotation.y = this.elapsed * (0.3 + i * 0.1);
        const targetScale = i === activeRingIdx ? 1.22 : 1.0;
        ring.scale.lerp(
          new THREE.Vector3(targetScale, targetScale, targetScale),
          0.1
        );
      });

      // Instanced growth every 0.02s
      if (this.revealedTokens < this.tokenCount) {
        this.tokenTimer += dt;
        if (this.tokenTimer >= 0.02) {
          this.tokenTimer = 0;
          const dummy = new THREE.Object3D();
          this.instancedTokens.getMatrixAt(this.revealedTokens, dummy.matrix);
          dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
          dummy.scale.setScalar(1);
          dummy.updateMatrix();
          this.instancedTokens.setMatrixAt(this.revealedTokens, dummy.matrix);
          this.instancedTokens.instanceMatrix.needsUpdate = true;
          this.revealedTokens += 1;
        }
      }

      // Gravity drop with bounce (restitution 0.28)
      if (this.docDropping) {
        this.docVelocityY -= 14.0 * dt;
        this.docSlab.position.y += this.docVelocityY * dt;
        if (this.docSlab.position.y <= this.docRestY) {
          this.docSlab.position.y = this.docRestY;
          if (Math.abs(this.docVelocityY) < 0.45) {
            this.docDropping = false;
            this.docVelocityY = 0;
          } else {
            this.docVelocityY = -this.docVelocityY * 0.28;
          }
        }
      } else {
        this.docSlab.position.y =
          this.docRestY + Math.sin(this.elapsed * 1.5) * 0.04;
      }

      // Feedback background flashes
      if (this.failIntensity > 0.01) {
        this.failIntensity *= Math.exp(-dt * 4.0);
        this.currentBg.copy(this.baseBg).lerp(this.failBg, this.failIntensity);
        this.scene.background = this.currentBg;
        if (this.scene.fog) this.scene.fog.color.copy(this.currentBg);
      } else if (this.pulseIntensity > 0.01) {
        this.pulseIntensity *= Math.exp(-dt * 3.0);
        this.currentBg.copy(this.baseBg).lerp(this.pulseBg, this.pulseIntensity);
        this.scene.background = this.currentBg;
        if (this.scene.fog) this.scene.fog.color.copy(this.currentBg);
      }
    }

    this.renderer.render(this.scene, this.camera);
  };

  public dispose() {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("click", this.onClick);
    window.removeEventListener("resize", this.onResize);
    this.disposables.forEach((d) => d.dispose());
    this.renderer.dispose();
  }
}
