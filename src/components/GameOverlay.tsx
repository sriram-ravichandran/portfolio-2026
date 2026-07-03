/**
 * ctOS DRIVE — GameOverlay.tsx
 *
 * Top-down 3D car game woven into the portfolio page.
 * Three.js renders on a fixed canvas (z-index 45); sits above page content, below navbar (z-50).
 * cannon-es handles all rigid-body physics (car, bricks, boundary walls).
 *
 * G key  → toggle game on/off
 * WASD / Arrow keys → steer & accelerate
 * Shift  → NOS boost
 * Space  → handbrake / drift
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════════════════ */
const CAM_Y = 1000;           // ortho camera height
const CAR_W = 26; const CAR_L = 42; const CAR_H = 9;
const BW = 22; const BH = 11; const BD = 11;  // brick dimensions
const WALL_THICKNESS = 80;    // invisible boundary wall half-depth
const NOS_DRAIN = 12;
const NOS_REGEN = 9;

/* ═══════════════════════════════════════════════════════════════════════════
   WORLD COORDINATE HELPER
   Auto-scroll maps: scrollY = carZ − vh/2
   So carZ = scrollY + vh/2 (car is always at vertical viewport center).
═══════════════════════════════════════════════════════════════════════════ */
function domZ(el: Element): number {
  return el.getBoundingClientRect().top + window.scrollY;
}

/* ═══════════════════════════════════════════════════════════════════════════
   THREE.JS — BUILD CAR MESH  (top-down visible)
═══════════════════════════════════════════════════════════════════════════ */
function buildCarMesh(): THREE.Group {
  const G = new THREE.Group();

  const std = (col: number, met = 0.6, rou = 0.3) =>
    new THREE.MeshStandardMaterial({ color: col, metalness: met, roughness: rou, flatShading: true });

  const box = (w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.castShadow = true; G.add(m); return m;
  };

  // ── chassis ──
  box(CAR_W, CAR_H, CAR_L, std(0x0a1a2e), 0, CAR_H / 2, 0);
  box(CAR_W + 4, CAR_H * 0.4, CAR_L + 3, std(0x060f1a, 0.5, 0.4), 0, CAR_H * 0.2, 0); // lower skirt
  // front / rear bumpers
  box(CAR_W - 3, CAR_H * 0.45, 5, std(0x081422), 0, CAR_H * 0.5, -(CAR_L / 2) + 1.5);
  box(CAR_W - 3, CAR_H * 0.45, 5, std(0x081422), 0, CAR_H * 0.5,  (CAR_L / 2) - 1.5);
  // fender flares
  box(CAR_W + 7, CAR_H * 0.4, 13, std(0x0a1a2e), 0, CAR_H * 0.4, -(CAR_L / 2) + 9);
  box(CAR_W + 7, CAR_H * 0.4, 13, std(0x0a1a2e), 0, CAR_H * 0.4,  (CAR_L / 2) - 9);
  // ── cabin ──
  box(CAR_W - 5, CAR_H * 0.75, CAR_L * 0.46, std(0x0d2240, 0.6, 0.3), 0, CAR_H + CAR_H * 0.4, 1);
  box(CAR_W - 6, CAR_H * 0.2, CAR_L * 0.43, std(0x091830, 0.8, 0.2), 0, CAR_H * 1.6, 1); // roof
  // roof rack
  for (const dz of [-8, 0, 8])
    box(CAR_W - 10, 1.5, 1.8, std(0x1a3558), 0, CAR_H * 1.75, dz);

  // ── glass ──
  const glass = new THREE.MeshStandardMaterial({ color: 0x55aacc, transparent: true, opacity: 0.58, flatShading: true });
  box(CAR_W - 7, 1, 5, glass, 0, CAR_H * 1.05, -(CAR_L * 0.22));  // windshield
  box(CAR_W - 7, 1, 4, glass, 0, CAR_H * 1.05,  (CAR_L * 0.22));  // rear
  box(1.5, CAR_H * 0.55, CAR_L * 0.36, glass, -(CAR_W / 2) + 3.5, CAR_H * 1.05, 1); // side L
  box(1.5, CAR_H * 0.55, CAR_L * 0.36, glass,  (CAR_W / 2) - 3.5, CAR_H * 1.05, 1); // side R

  // ── wheels ──
  const wMat = std(0x111111, 0.2, 0.9);
  const rMat = std(0x1a3558, 0.85, 0.2);
  const wPos = [[-CAR_W / 2 - 1, -(CAR_L / 2) + 9], [CAR_W / 2 + 1, -(CAR_L / 2) + 9],
                [-CAR_W / 2 - 1, (CAR_L / 2) - 9],  [CAR_W / 2 + 1, (CAR_L / 2) - 9]];
  for (const [wx, wz] of wPos) {
    box(4.5, 5, 9, wMat, wx, 2.5, wz);
    box(5, 1.5, 5.5, rMat, wx, 3, wz);
  }

  // ── headlights ──
  const hlMat = new THREE.MeshStandardMaterial({ color: 0xffffcc, emissive: new THREE.Color(0xffee88), emissiveIntensity: 1.0 });
  box(5, 3, 2, hlMat, -(CAR_W / 2) + 4.5, CAR_H * 0.55, -(CAR_L / 2) - 0.5);
  box(5, 3, 2, hlMat,  (CAR_W / 2) - 4.5, CAR_H * 0.55, -(CAR_L / 2) - 0.5);
  // headlight point lights
  for (const sx of [-(CAR_W / 2) + 4.5, (CAR_W / 2) - 4.5]) {
    const pl = new THREE.PointLight(0xffffaa, 0.5, 120);
    pl.position.set(sx, CAR_H * 0.55, -(CAR_L / 2) - 10); G.add(pl);
  }

  // ── taillights ──
  const tlMat = new THREE.MeshStandardMaterial({ color: 0xff1111, emissive: new THREE.Color(0xff0000), emissiveIntensity: 0.9 });
  box(5, 3, 2, tlMat, -(CAR_W / 2) + 4.5, CAR_H * 0.55, (CAR_L / 2) + 0.5);
  box(5, 3, 2, tlMat,  (CAR_W / 2) - 4.5, CAR_H * 0.55, (CAR_L / 2) + 0.5);

  // ── spoiler ──
  box(CAR_W - 3, 1.5, 3.5, std(0x0a1a2e, 0.8, 0.2), 0, CAR_H * 1.1, (CAR_L / 2) - 3.5);
  box(1.8, 4.5, 2, std(0x0d2240), -(CAR_W / 2) + 5, CAR_H * 0.9, (CAR_L / 2) - 3.5);
  box(1.8, 4.5, 2, std(0x0d2240),  (CAR_W / 2) - 5, CAR_H * 0.9, (CAR_L / 2) - 3.5);

  // ── spare tyre ──
  const spare = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 3.5, 10), wMat);
  spare.rotation.x = Math.PI / 2; spare.position.set(0, CAR_H * 0.8, (CAR_L / 2) + 4);
  spare.castShadow = true; G.add(spare);

  // ── cyan edge glow ──
  const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(CAR_W, CAR_H, CAR_L));
  G.add(new THREE.LineSegments(edgeGeo,
    new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.45 })));
  // underglow plane
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(CAR_W + 8, CAR_L + 8),
    new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.10 }));
  glow.rotation.x = -Math.PI / 2; glow.position.y = 0.2; G.add(glow);

  G.traverse(o => { if ((o as THREE.Mesh).isMesh) o.castShadow = true; });
  return G;
}

/* ═══════════════════════════════════════════════════════════════════════════
   THREE.JS — BUILD BRICK MESH
═══════════════════════════════════════════════════════════════════════════ */
const BPAL = [0x8B2500, 0xA0522D, 0x993322, 0xB8442A, 0x7A2E1A, 0xCC5533];

/** Procedural brick texture: base color + surface noise + mortar edges + random cracks */
function createBrickTexture(color: THREE.Color, seed: number): THREE.CanvasTexture {
  const W = 128, H = 64;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d')!;

  // Deterministic LCG so each brick gets unique but stable cracks
  let s = seed >>> 0;
  const rng = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 0xffffffff; };

  // Base fill
  ctx.fillStyle = '#' + color.getHexString();
  ctx.fillRect(0, 0, W, H);

  // Surface speckle noise
  for (let i = 0; i < 260; i++) {
    const a = rng() * 0.14;
    ctx.fillStyle = rng() > 0.5 ? `rgba(255,210,170,${a})` : `rgba(0,0,0,${a})`;
    ctx.fillRect(rng() * W, rng() * H, 1.5, 1.5);
  }

  // Mortar borders (dark recessed edges)
  ctx.fillStyle = 'rgba(0,0,0,0.60)';
  ctx.fillRect(0,     0,     W, 3);
  ctx.fillRect(0,     H - 3, W, 3);
  ctx.fillRect(0,     0,     3, H);
  ctx.fillRect(W - 3, 0,     3, H);

  // Random cracks
  const numCracks = 1 + Math.floor(rng() * 3);
  for (let c = 0; c < numCracks; c++) {
    ctx.strokeStyle = `rgba(0,0,0,${0.48 + rng() * 0.32})`;
    ctx.lineWidth   = 0.5 + rng() * 0.9;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    let x = 6 + rng() * (W - 12);
    let y = 5 + rng() * (H - 10);
    ctx.moveTo(x, y);
    const segs = 3 + Math.floor(rng() * 4);
    for (let i = 0; i < segs; i++) {
      x += (rng() - 0.5) * 28; y += (rng() - 0.5) * 16;
      x = Math.max(3, Math.min(W - 3, x));
      y = Math.max(3, Math.min(H - 3, y));
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Hairline branch off main crack
    if (rng() > 0.38) {
      ctx.strokeStyle = `rgba(0,0,0,${0.18 + rng() * 0.18})`;
      ctx.lineWidth   = 0.35;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (rng() - 0.5) * 22, y + (rng() - 0.5) * 14);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(cv);
  tex.needsUpdate = true;
  return tex;
}

function buildBrickMesh(row: number, col: number): THREE.Group {
  const G = new THREE.Group();
  const ci = (row * 3 + col) % BPAL.length;
  const vary = ((row * 7 + col * 13) % 11 - 5) * 0.013;
  const c = new THREE.Color(BPAL[ci]); c.offsetHSL(vary, vary * 0.3, vary * 0.2);
  const seed = row * 97 + col * 31 + ci * 7 + 1;
  const tex  = createBrickTexture(c, seed);
  const geo  = new THREE.BoxGeometry(BW - 1, BH, BD - 1);
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    color: 0xffffff, map: tex, roughness: 0.90,
  }));
  mesh.castShadow = true; mesh.receiveShadow = true; G.add(mesh);
  G.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),
    new THREE.LineBasicMaterial({ color: 0x555544, transparent: true, opacity: 0.38 })));
  return G;
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
interface BrickPair { mesh: THREE.Group; body: CANNON.Body }
interface WallData { bricks: BrickPair[]; worldX: number; worldZ: number }

export default function GameOverlay() {
  const [visible, setVisible] = useState(false);
  const [hudSpeed, setHudSpeed] = useState(0);
  const [hudNos, setHudNos] = useState(100);
  const [hudGear, setHudGear] = useState('N');
  const [popup, setPopup] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visRef = useRef(false);
  const popTimerRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    let vw = window.innerWidth, vh = window.innerHeight;

    /* ── RENDERER ── */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(vw, vh);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0, 0);

    /* ── SCENE ── */
    const scene = new THREE.Scene();

    /* ── CAMERA: orthographic top-down, 1 world unit = 1 CSS pixel ── */
    const cam = new THREE.OrthographicCamera(-vw / 2, vw / 2, vh / 2, -vh / 2, 0.1, CAM_Y + 200);
    cam.up.set(0, 0, -1);   // screen-up = world -Z  (page scrolls in +Z)
    scene.add(cam);

    /* ── LIGHTING ── */
    scene.add(new THREE.AmbientLight(0x8899bb, 0.72));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.camera.near = 1; dirLight.shadow.camera.far = CAM_Y + 100;
    dirLight.shadow.camera.left = -vw * 0.6; dirLight.shadow.camera.right = vw * 0.6;
    dirLight.shadow.camera.top = vh * 0.6; dirLight.shadow.camera.bottom = -vh * 0.6;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight); scene.add(dirLight.target);

    /* shadow-only ground plane */
    const gndVis = new THREE.Mesh(
      new THREE.PlaneGeometry(vw * 10, 99999),
      new THREE.ShadowMaterial({ opacity: 0.18 })
    );
    gndVis.rotation.x = -Math.PI / 2; gndVis.position.y = -0.5; gndVis.receiveShadow = true;
    scene.add(gndVis);

    /* ══════════════════════════════════════════════════════════════════
       CANNON-ES WORLD
    ══════════════════════════════════════════════════════════════════ */
    const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -980, 0) });
    world.broadphase = new CANNON.SAPBroadphase(world);
    world.allowSleep = true;
    world.defaultContactMaterial.friction = 0.4;
    world.defaultContactMaterial.restitution = 0.3;

    /* physics materials */
    const carPhysMat   = new CANNON.Material('car');
    const brickPhysMat = new CANNON.Material('brick');
    const groundPhysMat = new CANNON.Material('ground');

    world.addContactMaterial(new CANNON.ContactMaterial(carPhysMat, groundPhysMat,
      { friction: 0.25, restitution: 0.05 }));
    world.addContactMaterial(new CANNON.ContactMaterial(carPhysMat, brickPhysMat,
      { friction: 0.4, restitution: 0.45 }));
    world.addContactMaterial(new CANNON.ContactMaterial(brickPhysMat, groundPhysMat,
      { friction: 0.35, restitution: 0.38 }));

    /* physics ground plane */
    const groundBody = new CANNON.Body({ mass: 0, material: groundPhysMat });
    groundBody.addShape(new CANNON.Plane());
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(groundBody);

    /* ── Left/right viewport boundary walls (kinematic, follow car each frame) ── */
    const mkBoundary = (): CANNON.Body => {
      const b = new CANNON.Body({ mass: 0, type: CANNON.Body.KINEMATIC });
      b.addShape(new CANNON.Box(new CANNON.Vec3(WALL_THICKNESS, CAR_H * 4, vh / 2 + 120)));
      world.addBody(b);
      return b;
    };
    const boundL = mkBoundary();
    const boundR = mkBoundary();

    /* ── CAR body ── */
    const carBody = new CANNON.Body({
      mass: 700,
      material: carPhysMat,
      linearDamping: 0.2,
      angularDamping: 0.92,
    });
    carBody.addShape(new CANNON.Box(new CANNON.Vec3(CAR_W / 2, CAR_H / 2, CAR_L / 2)));
    // constrain to XZ plane — no Y movement, only Y rotation
    carBody.linearFactor.set(1, 0, 1);
    carBody.angularFactor.set(0, 1, 0);
    world.addBody(carBody);

    /* car mesh */
    const carMesh = buildCarMesh();
    scene.add(carMesh);

    /* ══════════════════════════════════════════════════════════════════
       WORLD BUILDING: brick walls + page-boundary walls
    ══════════════════════════════════════════════════════════════════ */
    const walls: WallData[] = [];
    let worldBuilt = false;
    let totalPageH = 0; // measured once in buildWorld()

    function buildWorld() {
      if (worldBuilt) return;
      worldBuilt = true;

      totalPageH = document.documentElement.scrollHeight;
      const pageH = totalPageH;

      /* ── Section positions (for brick wall placement only) ── */
      const aboutEl = document.querySelector('#about');
      const projEl  = document.querySelector('#projects');
      const contEl  = document.querySelector('#contact');
      const aboutZ  = aboutEl ? domZ(aboutEl) : vh * 1.1;
      const projZ   = projEl  ? domZ(projEl)  : vh * 2.2;
      const contZ   = contEl  ? domZ(contEl)  : vh * 3.3;

      /*
       * Camera now tracks viewport center (not car), so car can be anywhere on screen.
       * True page boundaries: top at worldZ=0, bottom at worldZ=pageH.
       */
      const wallTop = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC });
      wallTop.addShape(new CANNON.Box(new CANNON.Vec3(vw / 2 + 200, CAR_H * 6, WALL_THICKNESS)));
      wallTop.position.set(0, CAR_H * 2, -WALL_THICKNESS);
      world.addBody(wallTop);

      const wallBottom = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC });
      wallBottom.addShape(new CANNON.Box(new CANNON.Vec3(vw / 2 + 200, CAR_H * 6, WALL_THICKNESS)));
      wallBottom.position.set(0, CAR_H * 2, pageH + WALL_THICKNESS);
      world.addBody(wallBottom);

      /* ── Brick walls in margins ── */
      const buildWall = (worldX: number, worldZ: number, cols: number, rows: number) => {
        const wd: WallData = { bricks: [], worldX, worldZ };
        const totalW = cols * BW;
        for (let row = 0; row < rows; row++) {
          const offset = (row % 2 === 0) ? 0 : BW * 0.5;
          for (let col = 0; col < cols; col++) {
            const bx = worldX - totalW / 2 + col * BW + offset + BW / 2;
            const by = BH / 2 + row * BH;
            const bz = worldZ;

            const mesh = buildBrickMesh(row, col);
            mesh.position.set(bx, by, bz);
            scene.add(mesh);

            const body = new CANNON.Body({
              mass: 0.35,
              material: brickPhysMat,
              linearDamping: 0.28,
              angularDamping: 0.32,
              allowSleep: true,
              sleepSpeedLimit: 2,
              sleepTimeLimit: 0.5,
            });
            body.addShape(new CANNON.Box(new CANNON.Vec3((BW - 1.5) / 2, BH / 2, (BD - 1.5) / 2)));
            body.position.set(bx, by, bz);
            world.addBody(body);

            wd.bricks.push({ mesh, body });
          }
        }
        walls.push(wd);
      };

      const marginL = -(vw / 2) + vw * 0.07;
      const marginR =  (vw / 2) - vw * 0.07;

      const wallPositions = [
        aboutZ - 40, aboutZ + vh * 0.4, aboutZ + vh * 0.85,
        projZ  - 40, projZ  + vh * 0.35, projZ  + vh * 0.75,
        contZ  - 40, contZ  + vh * 0.4,
      ];
      wallPositions.forEach((wz, i) => {
        const side = i % 2 === 0 ? marginL : marginR;
        const cols = 4 + Math.floor(Math.random() * 3);
        const rows = 3 + Math.floor(Math.random() * 3);
        buildWall(side, wz, cols, rows);
      });
    }

    /* ══════════════════════════════════════════════════════════════════
       GAME STATE
    ══════════════════════════════════════════════════════════════════ */
    const keys = new Set<string>();
    let nos = 100;
    let cameraShake = 0;
    let lastTs = 0;
    let physicsActive = false;
    let gameScrollY = window.scrollY; // scroll position owned exclusively by the game

    /* Spawn car at current viewport center */
    function spawnCar() {
      gameScrollY = window.scrollY;
      const spawnZ = gameScrollY + vh / 2; // start at viewport center
      carBody.position.set(0, CAR_H / 2, spawnZ);
      carBody.velocity.set(0, 0, 0);
      carBody.angularVelocity.set(0, 0, 0);
      carBody.quaternion.set(0, 0, 0, 1);
      carBody.wakeUp();
    }

    /* ── Keyboard ── */
    const GAME_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'w', 'a', 's', 'd', 'W', 'A', 'S', 'D', ' ', 'Shift']);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'g' || e.key === 'G') {
        const next = !visRef.current;
        visRef.current = next;
        setVisible(next);
        if (next) {
          buildWorld();
          spawnCar();
          physicsActive = true;
          document.body.style.overflow = 'hidden'; // lock native scroll — game drives the page
          setPopup('ctOS DRIVE ACTIVE');
          popTimerRef.current = 2.5;
        } else {
          physicsActive = false;
          keys.clear();
          document.body.style.overflow = ''; // restore native scroll
        }
        return;
      }
      if (!visRef.current) return;
      if (e.key === 'Escape') {
        visRef.current = false; setVisible(false);
        physicsActive = false; keys.clear();
        document.body.style.overflow = '';
        return;
      }
      if (GAME_KEYS.has(e.key)) { e.preventDefault(); keys.add(e.key); }
    };
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    /* ── Block native scroll while game is active (car drives the page) ── */
    const onWheel = (e: WheelEvent) => { if (visRef.current) e.preventDefault(); };
    const onTouch = (e: TouchEvent) => { if (visRef.current) e.preventDefault(); };
    // Catch anything that slips through (keyboard page-down, momentum scroll, etc.)
    const onScrollLock = () => {
      if (visRef.current) window.scrollTo({ top: gameScrollY, behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('wheel',     onWheel, { passive: false });
    window.addEventListener('touchmove', onTouch, { passive: false });
    window.addEventListener('scroll',    onScrollLock);

    /* ── Resize ── */
    const onResize = () => {
      vw = window.innerWidth; vh = window.innerHeight;
      renderer.setSize(vw, vh);
      cam.left = -vw / 2; cam.right = vw / 2;
      cam.top = vh / 2; cam.bottom = -vh / 2;
      cam.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    /* ══════════════════════════════════════════════════════════════════
       RAF LOOP
    ══════════════════════════════════════════════════════════════════ */
    const tmpSkids:  { mesh: THREE.Mesh; life: number }[] = [];
    const tmpFlames: { mesh: THREE.Mesh; life: number }[] = [];
    const tmpRings:  { mesh: THREE.Mesh; life: number; maxLife: number }[] = [];

    const loop = (ts: number) => {
      rafRef.current = requestAnimationFrame(loop);
      const dt = Math.min((ts - (lastTs || ts - 16)) / 1000, 0.05);
      lastTs = ts;

      if (!visRef.current || !physicsActive) {
        renderer.clear();
        return;
      }

      /* ── Car forward / lateral direction from quaternion ── */
      const fwd = new CANNON.Vec3(0, 0, -1);
      carBody.quaternion.vmult(fwd, fwd);
      const lat = new CANNON.Vec3(1, 0, 0);
      carBody.quaternion.vmult(lat, lat);

      const velX = carBody.velocity.x;
      const velZ = carBody.velocity.z;
      const fwdSpeed = fwd.x * velX + fwd.z * velZ;
      const latSpeed = lat.x * velX + lat.z * velZ;

      const cz = carBody.position.z;
      const cx = carBody.position.x;

      /* Fixed asphalt physics across the whole page */
      carBody.linearDamping  = 0.18;
      carBody.angularDamping = 0.90;

      /* ── Controls ── */
      const goFwd  = keys.has('ArrowUp')    || keys.has('w') || keys.has('W');
      const goBwd  = keys.has('ArrowDown')  || keys.has('s') || keys.has('S');
      const goL    = keys.has('ArrowLeft')  || keys.has('a') || keys.has('A');
      const goR    = keys.has('ArrowRight') || keys.has('d') || keys.has('D');
      const drift  = keys.has(' ');
      const boost  = keys.has('Shift') && nos > 0;

      /* NOS */
      if (boost) nos = Math.max(0, nos - NOS_DRAIN * dt);
      else nos = Math.min(100, nos + NOS_REGEN * dt);

      /* ── Car physics model ── */
      const speed = Math.sqrt(velX * velX + velZ * velZ);
      const maxSpd = boost ? 820 : 420;
      const accel  = boost ? 2200 : 680;
      const brakeFactor = 900;

      if (goFwd && fwdSpeed < maxSpd) {
        carBody.velocity.x += fwd.x * accel * dt;
        carBody.velocity.z += fwd.z * accel * dt;
      }
      if (goBwd && fwdSpeed > -260) {
        carBody.velocity.x -= fwd.x * brakeFactor * dt;
        carBody.velocity.z -= fwd.z * brakeFactor * dt;
      }

      if (speed > maxSpd) {
        const f = maxSpd / speed;
        carBody.velocity.x *= f;
        carBody.velocity.z *= f;
      }

      const grip = drift ? 0.06 : 0.90;
      carBody.velocity.x -= lat.x * latSpeed * grip;
      carBody.velocity.z -= lat.z * latSpeed * grip;

      const turnRate = Math.min(speed / 90, 1) * 3.2;
      const steerDir = fwdSpeed >= 0 ? 1 : -1;
      if (goL)       carBody.angularVelocity.y =  turnRate * steerDir;
      else if (goR)  carBody.angularVelocity.y = -turnRate * steerDir;
      else           carBody.angularVelocity.y *= 0.82;

      /* ── Update left/right viewport boundary walls ── */
      const halfVW = vw / 2;
      boundL.position.set(-halfVW - WALL_THICKNESS, CAR_H * 2, cz);
      boundR.position.set( halfVW + WALL_THICKNESS, CAR_H * 2, cz);

      /* ── Step physics ── */
      world.step(1 / 60, dt, 3);

      /* ── Sync car mesh ── */
      cameraShake *= 0.88;
      const shX = (Math.random() - 0.5) * cameraShake * 8;
      const shZ = (Math.random() - 0.5) * cameraShake * 8;
      carMesh.position.set(carBody.position.x + shX, 0, carBody.position.z + shZ);
      carMesh.scale.set(1, 1, 1);
      carMesh.quaternion.set(carBody.quaternion.x, carBody.quaternion.y,
        carBody.quaternion.z, carBody.quaternion.w);

      // NOS taillight glow
      carMesh.traverse(o => {
        const m = o as THREE.Mesh;
        if (!m.isMesh || !(m.material instanceof THREE.MeshStandardMaterial)) return;
        if (m.material.emissive.r > 0.8 && m.material.emissive.g < 0.2) {
          m.material.emissiveIntensity = boost ? 2.8 : 0.9;
          m.material.emissive.setHex(boost ? 0xff5500 : 0xff0000);
        }
      });

      /* ── Sync brick meshes ── */
      for (const wall of walls) {
        for (const br of wall.bricks) {
          br.mesh.position.set(br.body.position.x, br.body.position.y, br.body.position.z);
          br.mesh.quaternion.set(br.body.quaternion.x, br.body.quaternion.y,
            br.body.quaternion.z, br.body.quaternion.w);
        }
      }

      /* ── Skid marks ── */
      if (drift && speed > 80) {
        for (const side of [-1, 1]) {
          const sk = new THREE.Mesh(new THREE.PlaneGeometry(3, 9),
            new THREE.MeshBasicMaterial({ color: 0x1a1a1a, transparent: true, opacity: 0.28 }));
          sk.rotation.x = -Math.PI / 2;
          const ox = lat.x * (CAR_W * 0.42) * side;
          const oz = lat.z * (CAR_W * 0.42) * side;
          sk.position.set(carBody.position.x + ox, 0.3, carBody.position.z + oz);
          sk.rotation.z = Math.atan2(fwd.x, -fwd.z);
          scene.add(sk);
          tmpSkids.push({ mesh: sk, life: 4.5 });
        }
      }
      for (let i = tmpSkids.length - 1; i >= 0; i--) {
        tmpSkids[i].life -= dt;
        if (tmpSkids[i].life <= 0) { scene.remove(tmpSkids[i].mesh); tmpSkids.splice(i, 1); }
        else (tmpSkids[i].mesh.material as THREE.MeshBasicMaterial).opacity = tmpSkids[i].life / 4.5 * 0.28;
      }

      /* ── NOS AFTERBURNER — layered flame jets + shockwave rings ── */
      if (boost && speed > 80) {
        const flAngle = Math.atan2(fwd.x, -fwd.z);
        const baseLen = 38 + speed * 0.09;

        // Camera rumble from thrust
        cameraShake = Math.max(cameraShake, 1.6);

        // Emit layered jets every other frame
        if (Math.floor(ts / 8) % 2 === 0) {
          // Outer plume — widest, dimmest, longest (deep red-orange)
          const oLen = baseLen * 1.5 + Math.random() * 22;
          const oWid = 16 + Math.random() * 10;
          const outer = new THREE.Mesh(
            new THREE.PlaneGeometry(oWid, oLen),
            new THREE.MeshBasicMaterial({ color: 0xbb1a00, transparent: true, opacity: 0.48 })
          );
          outer.rotation.x = -Math.PI / 2; outer.rotation.z = flAngle;
          outer.position.set(
            carBody.position.x - fwd.x * (CAR_L / 2 + oLen * 0.46),
            0.4, carBody.position.z - fwd.z * (CAR_L / 2 + oLen * 0.46)
          );
          scene.add(outer); tmpFlames.push({ mesh: outer, life: 0.22 });

          // Mid flame — orange
          const mLen = baseLen * 1.05 + Math.random() * 14;
          const mWid = 9 + Math.random() * 6;
          const mid = new THREE.Mesh(
            new THREE.PlaneGeometry(mWid, mLen),
            new THREE.MeshBasicMaterial({ color: 0xff6200, transparent: true, opacity: 0.72 })
          );
          mid.rotation.x = -Math.PI / 2; mid.rotation.z = flAngle;
          mid.position.set(
            carBody.position.x - fwd.x * (CAR_L / 2 + mLen * 0.46),
            0.9, carBody.position.z - fwd.z * (CAR_L / 2 + mLen * 0.46)
          );
          scene.add(mid); tmpFlames.push({ mesh: mid, life: 0.17 });

          // Inner core — white-yellow, narrow, hottest
          const cLen = baseLen * 0.65 + Math.random() * 10;
          const cWid = 4 + Math.random() * 3;
          const core = new THREE.Mesh(
            new THREE.PlaneGeometry(cWid, cLen),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.96 })
          );
          core.rotation.x = -Math.PI / 2; core.rotation.z = flAngle;
          core.position.set(
            carBody.position.x - fwd.x * (CAR_L / 2 + cLen * 0.46),
            1.6, carBody.position.z - fwd.z * (CAR_L / 2 + cLen * 0.46)
          );
          scene.add(core); tmpFlames.push({ mesh: core, life: 0.11 });
        }

        // Shockwave ring every ~4 frames
        if (Math.random() < 0.28) {
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(10, 18, 28),
            new THREE.MeshBasicMaterial({ color: 0xff7700, transparent: true, opacity: 0.58, side: THREE.DoubleSide })
          );
          ring.rotation.x = -Math.PI / 2;
          ring.position.set(
            carBody.position.x - fwd.x * (CAR_L / 2 + 8),
            0.7, carBody.position.z - fwd.z * (CAR_L / 2 + 8)
          );
          scene.add(ring);
          tmpRings.push({ mesh: ring, life: 0.38, maxLife: 0.38 });
        }

        // Flying embers / sparks
        if (Math.random() < 0.55) {
          const spark = new THREE.Mesh(
            new THREE.PlaneGeometry(2 + Math.random() * 3, 2 + Math.random() * 3),
            new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0xffd000 : 0xff9900, transparent: true, opacity: 0.92 })
          );
          spark.rotation.x = -Math.PI / 2;
          const sDist = CAR_L / 2 + 6 + Math.random() * baseLen;
          const sOff  = (Math.random() - 0.5) * 22;
          spark.position.set(
            carBody.position.x - fwd.x * sDist + lat.x * sOff,
            1.8,
            carBody.position.z - fwd.z * sDist + lat.z * sOff
          );
          scene.add(spark); tmpFlames.push({ mesh: spark, life: 0.14 + Math.random() * 0.18 });
        }
      }

      // Fade & shrink flames
      for (let i = tmpFlames.length - 1; i >= 0; i--) {
        tmpFlames[i].life -= dt;
        if (tmpFlames[i].life <= 0) { scene.remove(tmpFlames[i].mesh); tmpFlames.splice(i, 1); }
        else {
          const mat = tmpFlames[i].mesh.material as THREE.MeshBasicMaterial;
          mat.opacity *= 0.83;
          tmpFlames[i].mesh.scale.multiplyScalar(0.95);
        }
      }

      // Expand & fade shockwave rings
      for (let i = tmpRings.length - 1; i >= 0; i--) {
        tmpRings[i].life -= dt;
        if (tmpRings[i].life <= 0) { scene.remove(tmpRings[i].mesh); tmpRings.splice(i, 1); }
        else {
          const prog = 1 - tmpRings[i].life / tmpRings[i].maxLife;
          const s = 1 + prog * 5.5;
          tmpRings[i].mesh.scale.set(s, s, s);
          (tmpRings[i].mesh.material as THREE.MeshBasicMaterial).opacity = (1 - prog) * 0.58;
        }
      }

      /* ── Edge-triggered scroll: page scrolls only when car nears top/bottom 20% ── */
      const pageH = totalPageH || document.documentElement.scrollHeight;
      const carScreenY = cz - gameScrollY; // car's pixel position from viewport top
      const edgeMargin = vh * 0.20;
      let newScrollY = gameScrollY;
      if (carScreenY < edgeMargin)      newScrollY = Math.max(0,          cz - edgeMargin);
      if (carScreenY > vh - edgeMargin) newScrollY = Math.min(pageH - vh, cz - (vh - edgeMargin));
      gameScrollY = newScrollY; // update before scrollTo so the lock listener ignores this event
      window.scrollTo({ top: newScrollY, behavior: 'instant' as ScrollBehavior });

      /* ── Camera: tracks viewport center so 3D and HTML stay aligned ── */
      const vpCenterZ = newScrollY + vh / 2;
      cam.position.set(shX * 0.08, CAM_Y, vpCenterZ + shZ * 0.08);
      cam.lookAt(0, 0, vpCenterZ);
      dirLight.position.set(cx + 150, 700, vpCenterZ - 200);
      dirLight.target.position.set(cx, 0, cz);
      dirLight.target.updateMatrixWorld();

      /* ── HUD updates (throttled) ── */
      if (Math.round(ts / 80) % 2 === 0) {
        setHudSpeed(Math.round(speed * 0.4));
        setHudNos(Math.round(nos));
        setHudGear(boost ? 'NOS' : goFwd ? (speed > 200 ? '4' : speed > 120 ? '3' : speed > 60 ? '2' : '1') : fwdSpeed < -10 ? 'R' : 'N');
      }
      if (popTimerRef.current > 0) {
        popTimerRef.current -= dt;
        if (popTimerRef.current <= 0) setPopup('');
      }

      renderer.render(scene, cam);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('wheel',     onWheel);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('scroll',    onScrollLock);
      window.removeEventListener('resize', onResize);
      document.body.style.overflow = ''; // always restore on unmount
      renderer.dispose();
      scene.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ══════════════════════════════════════════════════════════════════
     HUD
  ══════════════════════════════════════════════════════════════════ */
  return (
    <>
      {/* WebGL canvas — always mounted, always ticking */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: '100vw', height: '100vh',
          pointerEvents: 'none',
          zIndex: 45,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      />

      {/* HUD — only when game active */}
      {visible && (
        <>
          {/* Speed + info panel */}
          <div style={{
            position: 'fixed', bottom: 22, right: 22, zIndex: 9510,
            fontFamily: "'Share Tech Mono', monospace",
            background: 'rgba(3,5,9,0.90)',
            border: '1px solid rgba(0,212,255,0.28)',
            padding: '14px 20px', backdropFilter: 'blur(10px)',
            minWidth: 170, pointerEvents: 'none',
            boxShadow: '0 0 30px rgba(0,212,255,0.06)',
          }}>
            <div style={{ fontSize: 7, letterSpacing: '.3em', color: 'rgba(0,212,255,0.45)', marginBottom: 6 }}>
              ctOS DRIVE
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 36, color: '#00d4ff', letterSpacing: '.03em', lineHeight: 1 }}>
                {hudSpeed}
              </span>
              <span style={{ fontSize: 9, color: 'rgba(0,212,255,0.5)', letterSpacing: '.15em' }}>KM/H</span>
              <span style={{
                marginLeft: 'auto', fontSize: 18, fontWeight: 700,
                color: hudGear === 'NOS' ? '#ff6a00' : hudGear === 'R' ? '#ff3b3b' : '#00d4ff',
                letterSpacing: '.05em',
              }}>{hudGear}</span>
            </div>

            {/* NOS bar */}
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 7, letterSpacing: '.2em', color: 'rgba(255,106,0,0.65)' }}>NOS</span>
                <span style={{ fontSize: 7, letterSpacing: '.1em', color: 'rgba(255,106,0,0.45)' }}>SHIFT</span>
              </div>
              <div style={{ height: 5, background: 'rgba(255,106,0,0.08)', border: '1px solid rgba(255,106,0,0.2)', borderRadius: 1 }}>
                <div style={{
                  height: '100%', width: `${hudNos}%`,
                  background: 'linear-gradient(to right,#ff6a00,#ffd600)',
                  transition: 'width 0.08s linear',
                  borderRadius: 1,
                }} />
              </div>
            </div>

            <div style={{
              fontSize: 7, color: 'rgba(0,212,255,0.25)', marginTop: 12,
              letterSpacing: '.07em', lineHeight: 2.0,
              borderTop: '1px solid rgba(0,212,255,0.08)', paddingTop: 8,
            }}>
              WASD / ARROWS — DRIVE<br />
              SHIFT — BOOST · SPACE — DRIFT<br />
              G / ESC — EXIT
            </div>
          </div>

          {popup && (
            <div style={{
              position: 'fixed', top: '13%', left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9515, pointerEvents: 'none',
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 12, letterSpacing: '.18em', color: '#00d4ff',
              background: 'rgba(3,5,9,0.92)',
              border: '1px solid rgba(0,212,255,0.40)',
              padding: '10px 30px', backdropFilter: 'blur(10px)',
              whiteSpace: 'nowrap', textAlign: 'center',
            }}>
              {popup}
            </div>
          )}
        </>
      )}

      {!visible && (
        <div style={{
          position: 'fixed', bottom: 22, right: 22, zIndex: 9490,
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 10, color: 'rgba(0,212,255,0.32)',
          letterSpacing: '.18em', pointerEvents: 'none',
        }}>
          [ G ] ctOS DRIVE
        </div>
      )}
    </>
  );
}
