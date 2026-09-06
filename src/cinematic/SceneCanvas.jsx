import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SCENES } from "./scenes";

/* ------------------------------------------------------------------ */
/* Flowfolio — Cinematic WebGL Stage (continuous, interactive)         */
/* One morphing particle entity + orbiting sparks + dust; the camera   */
/* glides along a scroll-driven path. Scroll VELOCITY drives dolly +   */
/* roll + particle surge; the pointer repels particles; clicks fire a  */
/* shockwave through the entity. Pure function of global progress.     */
/* ------------------------------------------------------------------ */

const IS_MOBILE =
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 900px)").matches;
const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ACCENT = new THREE.Color("#d8ff3e");
const BODY = new THREE.Color("#c9ccd2");
const HOT = new THREE.Color("#ff7a3c"); // ember sparks

/* per-scene camera / atmosphere waypoints (index-aligned with SCENES).
   Each chapter carries its own color grade: bg/fog tone, particle
   accent hue, entity scale — so every cut reads like a new lens */
const WAYPOINTS = [
  // 00 PROFILE — brand lime on near-black, entity right of the type
  { pos: [0, 0.1, 7.6], look: [-1.55, 0.1, 0], fov: 48, op: 0.95, roll: 0.0, tint: 0.0,
    bg: "#050505", accent: "#d8ff3e", scale: 1.0 },
  // 01 EDUCATION — cold navy grade, ice-blue timeline strand far left
  { pos: [-2.6, 0.5, 9.6], look: [0.9, 0.05, 0], fov: 56, op: 0.55, roll: 0.06, tint: 0.3,
    bg: "#0a1a33", accent: "#7fd4ff", scale: 0.72 },
  // 02 EXPERIENCE — ember grade, camera dives into orange agent clusters
  { pos: [0.6, -0.3, 5.6], look: [0, -0.05, 0], fov: 64, op: 0.9, roll: -0.08, tint: 0.5,
    bg: "#200a03", accent: "#ff7a3c", scale: 1.18 },
  // 03 SKILLS — violet grade, deepest push-in of the whole film
  { pos: [-0.4, 0.4, 4.6], look: [0, 0, -0.6], fov: 72, op: 0.85, roll: 0.07, tint: 0.45,
    bg: "#170b2e", accent: "#b18cff", scale: 0.85 },
  // 04 PROJECTS — deep-green grade, entity recedes far right
  { pos: [3.4, 0.6, 10.5], look: [-1.5, 0, 0], fov: 44, op: 0.35, roll: 0.03, tint: 0.35,
    bg: "#06251a", accent: "#3cffb5", scale: 1.25 },
  // 05 WORKS — warm amber grade, far left
  { pos: [-3.2, 0.3, 10.8], look: [1.3, 0, 0], fov: 44, op: 0.3, roll: -0.05, tint: 0.35,
    bg: "#2a1506", accent: "#ffc93c", scale: 1.15 },
  // 06 WRITING — ink-grey monochrome grade, dim backdrop
  { pos: [0, -1.1, 10.6], look: [0, 0.1, 0], fov: 52, op: 0.26, roll: 0.04, tint: 0.25,
    bg: "#1a1a20", accent: "#e8e6df", scale: 0.95 },
  // 07 CONTACT — back to brand lime, entity returns centered, closing the loop
  { pos: [0, 0.15, 6.8], look: [0, 0.05, 0], fov: 50, op: 0.9, roll: 0.0, tint: 0.0,
    bg: "#050505", accent: "#d8ff3e", scale: 1.0 },
];

/* pre-parse grade colors once — Color.copy()/lerp() need real Colors */
for (let i = 0; i < WAYPOINTS.length; i++) {
  WAYPOINTS[i].bg = new THREE.Color(WAYPOINTS[i].bg);
  WAYPOINTS[i].accent = new THREE.Color(WAYPOINTS[i].accent);
}

/* per-chapter entity behaviour — every chapter gives the central swarm
   its own personality: spin axes, wobble life, breathing pulse */
const ACT = [
  // 00 profile — stately sphere, slow turn, gentle breath
  { ry: 0.1, rx: 0.022, rz: 0.0, wobble: 0.1, pulse: 0.02, pf: 1.1 },
  // 01 education — helix reels like a film spool
  { ry: 0.5, rx: 0.0, rz: 0.0, wobble: 0.05, pulse: 0.012, pf: 0.8 },
  // 02 experience — agent clusters seethe and churn
  { ry: 0.06, rx: 0.11, rz: 0.05, wobble: 0.24, pulse: 0.05, pf: 1.7 },
  // 03 skills — wide field shimmering in place
  { ry: 0.018, rx: 0.0, rz: 0.0, wobble: 0.17, pulse: 0.03, pf: 0.6 },
  // 04 projects — torus knot tumbles on two axes
  { ry: 0.24, rx: 0.15, rz: 0.0, wobble: 0.05, pulse: 0.015, pf: 1.3 },
  // 05 works — the wall stands almost still, steady presence
  { ry: 0.045, rx: 0.0, rz: 0.008, wobble: 0.03, pulse: 0.008, pf: 0.9 },
  // 06 writing — the stream ripples and flows
  { ry: 0.03, rx: 0.0, rz: 0.0, wobble: 0.32, pulse: 0.022, pf: 2.2 },
  // 07 contact — halo spins up to greet you
  { ry: 0.38, rx: 0.03, rz: 0.0, wobble: 0.08, pulse: 0.03, pf: 1.4 },
];

/* --------------------- particle formations ------------------------ */
/* 8 target formations; the entity morphs between them as you scroll. */

function buildFormations(N) {
  const make = (fn) => {
    const a = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const [x, y, z] = fn(i, i / N);
      a[i * 3] = x;
      a[i * 3 + 1] = y;
      a[i * 3 + 2] = z;
    }
    return a;
  };
  const jit = (s) => (Math.random() - 0.5) * s;

  // 00 core sphere shell (golden-angle)
  const sphere = make((i, t) => {
    const y = 1 - t * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = Math.PI * (3 - Math.sqrt(5)) * i;
    const R = 2.1 * (1 + (Math.random() - 0.5) * 0.08);
    return [Math.cos(th) * r * R, y * R, Math.sin(th) * r * R];
  });

  // 01 double helix ribbon (timeline strand)
  const helix = make((_i, t) => {
    const strand = _i % 2 === 0 ? 0 : Math.PI;
    const a = t * Math.PI * 7 + strand;
    const r = 1.05 + jit(0.14);
    return [Math.cos(a) * r, (t - 0.5) * 5.4, Math.sin(a) * r];
  });

  // 02 agent cluster nebula
  const CENTERS = [
    [-2.6, 1.1, -0.6], [1.9, 1.6, -1.2], [0.2, -1.4, -0.4],
    [-1.4, -0.6, 0.8], [2.7, -0.4, 0.2], [-0.4, 2.0, 0.6], [1.1, 0.4, -2.0],
  ];
  const clusters = make((i) => {
    const c = CENTERS[i % CENTERS.length];
    return [
      c[0] + (Math.random() + Math.random() - 1) * 0.85,
      c[1] + (Math.random() + Math.random() - 1) * 0.75,
      c[2] + (Math.random() + Math.random() - 1) * 0.85,
    ];
  });

  // 03 wide scattered field (skill constellation)
  const field = make(() => [
    (Math.random() - 0.5) * 13,
    (Math.random() - 0.5) * 7,
    -2 + Math.random() * 6,
  ]);

  // 04 torus knot (projects orbit)
  const knot = make((_i, t) => {
    const p = 2, q = 3, R = 1.35;
    const u = t * Math.PI * 2;
    const r = R * (2 + Math.cos(q * u)) * 0.55;
    const jitter = 0.16;
    return [
      r * Math.cos(p * u) + jit(jitter),
      R * Math.sin(q * u) * 0.55 + jit(jitter),
      r * Math.sin(p * u) + jit(jitter),
    ];
  });

  // 05 tilted wall grid
  const cols = Math.ceil(Math.sqrt(N * 1.8));
  const rows = Math.ceil(N / cols);
  const wall = make((i) => {
    const c = i % cols, r = Math.floor(i / cols);
    return [
      (c / cols - 0.5) * 11 + jit(0.1),
      (r / rows - 0.5) * 5.6 + jit(0.1),
      jit(0.5),
    ];
  });

  // 06 flowing stream
  const stream = make((_i, t) => {
    const x = (t - 0.5) * 12;
    return [x, Math.sin(x * 0.9) * 0.7 + jit(0.3), Math.cos(x * 0.5) * 1.4 + jit(0.4)];
  });

  // 07 ring disc (contact halo)
  const ring = make((_i, t) => {
    const a = t * Math.PI * 2 * 9;
    const r = 2.3 + (Math.random() - 0.5) * 0.5;
    return [Math.cos(a) * r, (Math.random() - 0.5) * 0.5, Math.sin(a) * r];
  });

  return [sphere, helix, clusters, field, knot, wall, stream, ring];
}

/* --------------------------- shaders ------------------------------ */

const P_VERT = /* glsl */ `
  attribute float aRand;
  uniform float uReveal;
  uniform float uSize;
  uniform float uPR;
  uniform float uVel;
  uniform float uClickT;
  uniform vec3 uClickPos;
  uniform float uTime;
  uniform float uWobble;
  uniform float uBurst;
  varying float vRand;
  void main() {
    vRand = aRand;
    vec3 p = position;
    /* per-chapter life — breathing wobble along each particle's own ray */
    float wob = sin(uTime * (1.4 + aRand * 2.6) + aRand * 61.0);
    p += normalize(p + vec3(0.001)) * wob * uWobble * (0.35 + 0.65 * aRand);
    /* chapter-cut burst — the swarm briefly scatters then re-forms */
    p += normalize(p + vec3(0.001)) * uBurst * (0.4 + 0.6 * aRand) * 1.15;
    vec4 wp = modelMatrix * vec4(p, 1.0);
    /* click shockwave — expanding ring pushes particles outward */
    float dc = distance(wp.xyz, uClickPos);
    float wave = sin(dc * 5.0 - uClickT * 9.0) * exp(-uClickT * 2.4) * exp(-dc * 0.5);
    wp.xyz += normalize(wp.xyz - uClickPos + vec3(0.001)) * wave * 0.55;
    vec4 mv = viewMatrix * wp;
    float show = step(aRand, uReveal);
    float surge = 1.0 + min(abs(uVel) * 2.2, 1.5);   /* fast scroll = particles swell */
    gl_PointSize = uSize * uPR * (6.0 / max(0.1, -mv.z)) * show * surge;
    gl_Position = projectionMatrix * mv;
  }
`;

const P_FRAG = /* glsl */ `
  uniform float uOpacity;
  uniform float uTime;
  uniform float uTintMix;
  uniform vec3 uColor;
  uniform vec3 uAccent;
  varying float vRand;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.08, d);
    float tw = 0.72 + 0.28 * sin(uTime * (1.2 + vRand * 3.2) + vRand * 40.0); /* twinkle */
    /* chapter grade: a large share of the swarm rides the scene accent */
    float accShare = smoothstep(0.72 - uTintMix * 0.38, 0.95, vRand);
    vec3 col = mix(uColor, uAccent, accShare);
    gl_FragColor = vec4(col, a * uOpacity * (0.35 + 0.65 * vRand) * tw);
  }
`;

/* soft round sprite for dust points */
function makeDustSprite() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/* --- ReAct loop shaders: every element (ring / phase nodes / comet
       head) is a particle; active phase node brightens via uActive --- */
const LOOP_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute float aNode;   /* -2 head comet, -1 ring, 0..3 phase nodes */
  attribute float aRand;
  uniform float uPR;
  uniform float uTime;
  uniform float uActive;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vNode;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float isActive = (aNode >= 0.0 && abs(aNode - uActive) < 0.5) ? 1.0 : 0.0;
    float boost = aNode >= 0.0 ? mix(0.65, 3.0, isActive) : 1.0;
    float tw = 0.78 + 0.22 * sin(uTime * (1.4 + aRand * 2.6) + aRand * 40.0);
    vAlpha = aAlpha * boost * tw * uOpacity;
    vNode = aNode;
    gl_PointSize = aSize * boost * uPR * (7.0 / max(0.1, -mv.z));
    gl_Position = projectionMatrix * mv;
  }
`;

const LOOP_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  varying float vAlpha;
  varying float vNode;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.06, d);
    vec3 col = uColor;                                         /* ring = dust grey */
    if (vNode > -0.5) col = uAccent;                           /* phase nodes = accent */
    else if (vNode < -1.5) col = mix(uAccent, vec3(1.0), 0.6); /* comet head = white-hot */
    gl_FragColor = vec4(col, a * vAlpha);
  }
`;

const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

/* ------------------------------ component ------------------------- */

export default function SceneCanvas({ onApi }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    let disposed = false;
    let rafId = 0;

    const renderer = new THREE.WebGLRenderer({
      antialias: !IS_MOBILE,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x050505, 1);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, IS_MOBILE ? 1.5 : 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x050505, 7, 30);

    const camera = new THREE.PerspectiveCamera(
      48,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.1, 7.6);

    scene.add(new THREE.AmbientLight(0x404048, 0.9));
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(3, 4, 5);
    scene.add(dir);

    /* ---- morphing particle entity ---- */
    const N = IS_MOBILE ? 2400 : 5500;
    const formations = buildFormations(N);
    const positions = new Float32Array(formations[0]); // start as the core sphere
    const target = new Float32Array(N * 3);
    const rands = new Float32Array(N);
    for (let i = 0; i < N; i++) rands[i] = Math.random();

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("aRand", new THREE.BufferAttribute(rands, 1));
    const mat = new THREE.ShaderMaterial({
      vertexShader: P_VERT,
      fragmentShader: P_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uReveal: { value: REDUCED ? 1 : 0 },
        uOpacity: { value: 0 },
        uSize: { value: 2.0 },
        uPR: { value: pixelRatio },
        uColor: { value: BODY },
        uAccent: { value: ACCENT },
        uTime: { value: 0 },
        uVel: { value: 0 },
        uTintMix: { value: 0 },
        uClickT: { value: 99 },
        uClickPos: { value: new THREE.Vector3(0, 0, 0) },
        uWobble: { value: 0.1 },
        uBurst: { value: 0 },
      },
    });
    const entity = new THREE.Points(geom, mat);
    scene.add(entity);

    /* ---- living constellation web ----
       faint accent lines continually re-knit between nearby "anchor"
       particles of the entity — reads as an agent knowledge graph
       breathing inside the swarm */
    const CONS_N = IS_MOBILE ? 42 : 72;
    const CONS_LINK_R = 1.15;
    const CONS_MAX_SEG = IS_MOBILE ? 90 : 230;
    const consIdx = [];
    for (let i = 0; i < CONS_N; i++) {
      consIdx.push(Math.floor(((i + Math.random() * 0.6) / CONS_N) * N) % N);
    }
    const consPos = new Float32Array(CONS_MAX_SEG * 6);
    const consGeom = new THREE.BufferGeometry();
    consGeom.setAttribute("position", new THREE.BufferAttribute(consPos, 3));
    const consMat = new THREE.LineBasicMaterial({
      color: ACCENT,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const consLines = new THREE.LineSegments(consGeom, consMat);
    consLines.frustumCulled = false;
    scene.add(consLines);

    /* ---- velocity streaks ----
       z-aligned segments around the camera axis; they flash as radial
       warp lines only while the scroll velocity is high */
    const STREAK_N = IS_MOBILE ? 50 : 130;
    const streakPos = new Float32Array(STREAK_N * 6);
    const streakMeta = [];
    for (let i = 0; i < STREAK_N; i++) {
      const ang = Math.random() * Math.PI * 2;
      const rad = 1.2 + Math.random() * 5.5;
      streakMeta.push({
        x: Math.cos(ang) * rad,
        y: Math.sin(ang) * rad * 0.62,
        z: -5 + Math.random() * 11,
        o: 0.35 + Math.random() * 0.65,
      });
    }
    const streakGeom = new THREE.BufferGeometry();
    streakGeom.setAttribute("position", new THREE.BufferAttribute(streakPos, 3));
    const streakMat = new THREE.LineBasicMaterial({
      color: 0xc9ccd2,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const streaks = new THREE.LineSegments(streakGeom, streakMat);
    streaks.frustumCulled = false;
    scene.add(streaks);

    /* faint wireframe core */
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.85, 1),
      new THREE.MeshBasicMaterial({
        color: ACCENT,
        wireframe: true,
        transparent: true,
        opacity: 0.1,
        depthWrite: false,
      })
    );
    scene.add(core);

    /* soft round sprite shared by sparks + dust */
    const dustTexture = makeDustSprite();

    /* orbiting ember sparks — larger accent particles on wide orbits */
    const SPARKS = IS_MOBILE ? 26 : 60;
    const sparkPos = new Float32Array(SPARKS * 3);
    const sparkMeta = [];
    for (let i = 0; i < SPARKS; i++) {
      sparkMeta.push({
        r: 2.4 + Math.random() * 3.2,
        tilt: (Math.random() - 0.5) * 1.4,
        phase: Math.random() * Math.PI * 2,
        speed: 0.08 + Math.random() * 0.22,
      });
    }
    const sparkGeom = new THREE.BufferGeometry();
    sparkGeom.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0xd8ff3e,
      size: 0.14,
      map: dustTexture,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const sparks = new THREE.Points(sparkGeom, sparkMat);
    scene.add(sparks);

    /* ---- ReAct loop — drawn entirely with particles ----
       a ring of dust, four phase clusters (Thought / Action /
       Observation / Reflection) at 90° spacing, and a comet head of
       particles lapping the ring once per workflow cycle (7.6s).
       The group is pinned to the screen-center backdrop every frame. */
    const LOOP_R = 3.0;
    const LOOP_PERIOD = 7.6; // 4 steps × 1.9s
    const LOOP_START = -Math.PI / 2; // head starts at the top node
    const RING_N = IS_MOBILE ? 170 : 320;
    const NODE_N = IS_MOBILE ? 26 : 44; // particles per phase cluster
    const HEAD_N = IS_MOBILE ? 16 : 30; // comet trail length
    const LOOP_TOTAL = RING_N + NODE_N * 4 + HEAD_N;
    const HEAD0 = RING_N + NODE_N * 4;
    const loopPos = new Float32Array(LOOP_TOTAL * 3);
    const loopSize = new Float32Array(LOOP_TOTAL);
    const loopAlpha = new Float32Array(LOOP_TOTAL);
    const loopNode = new Float32Array(LOOP_TOTAL);
    const loopJit = new Float32Array(LOOP_TOTAL); // per-particle radius jitter
    let li = 0;
    const putLoop = (x, y, z, size, alpha, node) => {
      loopPos[li * 3] = x;
      loopPos[li * 3 + 1] = y;
      loopPos[li * 3 + 2] = z;
      loopSize[li] = size;
      loopAlpha[li] = alpha;
      loopNode[li] = node;
      loopJit[li] = (Math.random() - 0.5) * 0.09;
      li++;
    };
    /* ring of faint dust */
    for (let i = 0; i < RING_N; i++) {
      const a = (i / RING_N) * Math.PI * 2;
      putLoop(
        Math.cos(a) * LOOP_R,
        Math.sin(a) * LOOP_R,
        0,
        2.4 + Math.random() * 2.2,
        0.28 + Math.random() * 0.22,
        -1
      );
    }
    /* four fixed phase clusters at 90° spacing */
    for (let nI = 0; nI < 4; nI++) {
      const na = LOOP_START + nI * (Math.PI / 2);
      for (let k = 0; k < NODE_N; k++) {
        putLoop(
          Math.cos(na) * LOOP_R + (Math.random() + Math.random() - 1) * 0.2,
          Math.sin(na) * LOOP_R + (Math.random() + Math.random() - 1) * 0.2,
          (Math.random() - 0.5) * 0.1,
          2.2 + Math.random() * 2.0,
          0.55 + Math.random() * 0.3,
          nI
        );
      }
    }
    /* comet head trail — positions animated each frame */
    for (let i = 0; i < HEAD_N; i++) {
      putLoop(0, 0, 0, 3.4 + (1 - i / HEAD_N) * 4.0, Math.pow(1 - i / HEAD_N, 1.4), -2);
    }
    const loopGeom = new THREE.BufferGeometry();
    loopGeom.setAttribute("position", new THREE.BufferAttribute(loopPos, 3));
    loopGeom.setAttribute("aSize", new THREE.BufferAttribute(loopSize, 1));
    loopGeom.setAttribute("aAlpha", new THREE.BufferAttribute(loopAlpha, 1));
    loopGeom.setAttribute("aNode", new THREE.BufferAttribute(loopNode, 1));
    loopGeom.setAttribute(
      "aRand",
      new THREE.BufferAttribute(Float32Array.from({ length: LOOP_TOTAL }, () => Math.random()), 1)
    );
    const loopMat = new THREE.ShaderMaterial({
      vertexShader: LOOP_VERT,
      fragmentShader: LOOP_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uPR: { value: pixelRatio },
        uTime: { value: 0 },
        uActive: { value: 0 },
        uOpacity: { value: 0 },
        uColor: { value: BODY },
        uAccent: { value: ACCENT },
      },
    });
    const loopGroup = new THREE.Group();
    loopGroup.add(new THREE.Points(loopGeom, loopMat));
    scene.add(loopGroup);

    /* ---- layered deep-space dust (parallax + tint depth) ----
       three depths at different drift speeds, plus warm accent embers
       and a few huge soft glow sprites for a nebula feel */
    const makeStarLayer = (count, color, size, opacity, sx, sy, z0, z1) => {
      const arr = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        arr[i * 3] = (Math.random() - 0.5) * sx;
        arr[i * 3 + 1] = (Math.random() - 0.5) * sy + 1;
        arr[i * 3 + 2] = z0 + Math.random() * (z1 - z0);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
      const m = new THREE.PointsMaterial({
        color,
        size,
        map: dustTexture,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });
      return new THREE.Points(g, m);
    };
    const starsFar = makeStarLayer(IS_MOBILE ? 380 : 780, 0x6f7681, 0.07, 0.5, 34, 15, -17, -6);
    const starsMid = makeStarLayer(IS_MOBILE ? 190 : 400, 0x9aa0a8, 0.12, 0.55, 26, 11, -9, -2);
    const starsWarm = makeStarLayer(IS_MOBILE ? 60 : 130, 0xd8ff3e, 0.09, 0.16, 30, 13, -14, -3);
    scene.add(starsFar, starsMid, starsWarm);

    const GLOWS = IS_MOBILE ? 3 : 6;
    const glowPos = new Float32Array(GLOWS * 3);
    for (let i = 0; i < GLOWS; i++) {
      glowPos[i * 3] = (Math.random() - 0.5) * 17;
      glowPos[i * 3 + 1] = (Math.random() - 0.5) * 8 + 0.5;
      glowPos[i * 3 + 2] = -6 - Math.random() * 8;
    }
    const glowGeom = new THREE.BufferGeometry();
    glowGeom.setAttribute("position", new THREE.BufferAttribute(glowPos, 3));
    const glowMat = new THREE.PointsMaterial({
      color: 0x8a93a5,
      size: 7.5,
      map: dustTexture,
      transparent: true,
      opacity: 0.045,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const glows = new THREE.Points(glowGeom, glowMat);
    scene.add(glows);

    /* ---- continuous state driven by global progress ---- */
    const cur = {
      pos: new THREE.Vector3(...WAYPOINTS[0].pos),
      look: new THREE.Vector3(...WAYPOINTS[0].look),
      fov: WAYPOINTS[0].fov,
      op: 0,
      roll: 0,
      tint: 0,
      bg: new THREE.Color(WAYPOINTS[0].bg),
      accent: new THREE.Color(WAYPOINTS[0].accent),
      scale: WAYPOINTS[0].scale,
    };
    /* per-chapter entity behaviour, smoothly chased each frame */
    const actCur = { ...ACT[0] };
    let progress = 0; // smoothed global progress
    let progressTarget = 0;
    let firstFrame = true;
    let velTarget = 0;
    let velSm = 0;

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointerMove = (e) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    /* blend two scene states by progress (smoothstep across centers) */
    const blendWaypoint = (p, out) => {
      const n = WAYPOINTS.length;
      if (p <= SCENES[0].center) {
        applyWp(out, WAYPOINTS[0]);
        return;
      }
      if (p >= SCENES[n - 1].center) {
        applyWp(out, WAYPOINTS[n - 1]);
        return;
      }
      let i = 0;
      while (i < n - 2 && p > SCENES[i + 1].center) i++;
      const c0 = SCENES[i].center;
      const c1 = SCENES[i + 1].center;
      const t = smooth(Math.max(0, Math.min(1, (p - c0) / (c1 - c0))));
      const a = WAYPOINTS[i];
      const b = WAYPOINTS[i + 1];
      out.pos.set(
        lerp(a.pos[0], b.pos[0], t),
        lerp(a.pos[1], b.pos[1], t),
        lerp(a.pos[2], b.pos[2], t)
      );
      out.look.set(
        lerp(a.look[0], b.look[0], t),
        lerp(a.look[1], b.look[1], t),
        lerp(a.look[2], b.look[2], t)
      );
      out.fov = lerp(a.fov, b.fov, t);
      out.op = lerp(a.op, b.op, t);
      out.roll = lerp(a.roll, b.roll, t);
      out.tint = lerp(a.tint, b.tint, t);
      out.bg.copy(a.bg).lerp(b.bg, t);
      out.accent.copy(a.accent).lerp(b.accent, t);
      out.scale = lerp(a.scale, b.scale, t);
    };
    const blended = {
      pos: new THREE.Vector3(),
      look: new THREE.Vector3(),
      fov: 48,
      op: 1,
      roll: 0,
      tint: 0,
      bg: new THREE.Color(WAYPOINTS[0].bg),
      accent: new THREE.Color(WAYPOINTS[0].accent),
      scale: WAYPOINTS[0].scale,
    };
    function applyWp(out, w) {
      out.pos.set(...w.pos);
      out.look.set(...w.look);
      out.fov = w.fov;
      out.op = w.op;
      out.roll = w.roll;
      out.tint = w.tint;
      out.bg.set(w.bg);
      out.accent.set(w.accent);
      out.scale = w.scale;
    }

    /* pointer -> world position on the z=0 plane (for repulsion + shockwave) */
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hitPoint = new THREE.Vector3(0, 0, 5); // default far away-ish
    const planeHit = (cx, cy) => {
      ndc.set((cx / window.innerWidth) * 2 - 1, -(cy / window.innerHeight) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const dz = raycaster.ray.direction.z;
      if (Math.abs(dz) < 1e-4) return null;
      const t = -raycaster.ray.origin.z / dz;
      if (t <= 0) return null;
      return raycaster.ray.origin.clone().addScaledVector(raycaster.ray.direction, t);
    };

    const clock = new THREE.Clock();
    const tmp = new THREE.Vector3();
    const camDir = new THREE.Vector3();

    const tick = () => {
      if (disposed) return;
      rafId = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      const k = REDUCED ? 1 : 1 - Math.pow(0.002, dt);

      /* smooth the global progress itself — filmic inertia */
      progress += (progressTarget - progress) * (firstFrame ? 1 : 1 - Math.pow(0.004, dt));
      firstFrame = false;

      /* camera path */
      blendWaypoint(progress, blended);

      /* film-LUT cut — the color grade holds steady across each
         chapter's span and only swaps as the next chapter's content
         arrives, so every cut lands on a distinct palette */
      let gi = 0;
      while (gi < WAYPOINTS.length - 1 && progress > SCENES[gi].end) gi++;
      const gNext = Math.min(WAYPOINTS.length - 1, gi + 1);
      const gsw = smooth(
        Math.max(0, Math.min(1, (progress - (SCENES[gNext].start - 0.2)) / 0.4))
      );
      blended.bg.copy(WAYPOINTS[gi].bg).lerp(WAYPOINTS[gNext].bg, gsw);
      blended.accent.copy(WAYPOINTS[gi].accent).lerp(WAYPOINTS[gNext].accent, gsw);
      blended.scale = lerp(WAYPOINTS[gi].scale, WAYPOINTS[gNext].scale, gsw);
      blended.tint = lerp(WAYPOINTS[gi].tint, WAYPOINTS[gNext].tint, gsw);

      cur.pos.lerp(blended.pos, k);
      cur.look.lerp(blended.look, k);
      camera.position.copy(cur.pos);
      camera.lookAt(cur.look);
      if (Math.abs(blended.fov - cur.fov) > 0.01) {
        cur.fov += (blended.fov - cur.fov) * k;
        camera.fov = cur.fov;
        camera.updateProjectionMatrix();
      }
      cur.op += (blended.op - cur.op) * k;
      cur.roll += (blended.roll - cur.roll) * k;
      cur.tint += (blended.tint - cur.tint) * k;
      cur.bg.lerp(blended.bg, k);
      cur.accent.lerp(blended.accent, k);
      cur.scale += (blended.scale - cur.scale) * k;

      /* chapter color grade — bg, fog, accent hue and entity scale all
         ride the same curve, so every scene reads as its own lens */
      renderer.setClearColor(cur.bg);
      scene.fog.color.copy(cur.bg);
      mat.uniforms.uAccent.value.copy(cur.accent);
      consMat.color.copy(cur.accent);
      sparkMat.color.copy(cur.accent);
      core.material.color.copy(cur.accent);
      core.scale.setScalar(cur.scale * (1 + Math.sin(t * 0.8) * 0.03));

      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      camera.position.x += pointer.x * 0.28;
      camera.position.y += -pointer.y * 0.16;

      /* scroll velocity — dolly punch + camera roll (handheld feel) */
      velSm += (velTarget - velSm) * Math.min(1, dt * 5);
      const v = REDUCED ? 0 : velSm;
      camera.position.z += Math.min(Math.abs(v) * 2.5, 1.2) * Math.sign(v || 1);
      camera.rotation.z += cur.roll + Math.max(-0.06, Math.min(0.06, v * 0.35));

      /* particle morph — LUT cut, synced with the color grade: each
         chapter holds its own formation and the swarm re-forms only in
         the same swap window the palette uses (with a mid-cut burst) */
      const fa = formations[gi];
      const fb = formations[gNext];
      const ft = gsw;
      mat.uniforms.uBurst.value = Math.sin(gsw * Math.PI) * 0.55;

      /* pointer world position for repulsion (stronger when entity visible) */
      const hit = planeHit(
        (pointer.tx * 0.5 + 0.5) * window.innerWidth,
        (-pointer.ty * 0.5 + 0.5) * window.innerHeight
      );
      if (hit) hitPoint.copy(hit);
      const repelR = 1.7;
      const repelOn = cur.op > 0.25 && !REDUCED;

      for (let i = 0; i < N; i++) {
        const j = i * 3;
        let txp = fa[j] + (fb[j] - fa[j]) * ft;
        let typ = fa[j + 1] + (fb[j + 1] - fa[j + 1]) * ft;
        let tzp = fa[j + 2] + (fb[j + 2] - fa[j + 2]) * ft;

        if (repelOn) {
          const dx = positions[j] - hitPoint.x;
          const dy = positions[j + 1] - hitPoint.y;
          const dz = positions[j + 2] - hitPoint.z;
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < repelR * repelR && d2 > 1e-6) {
            const dd = Math.sqrt(d2);
            const f = ((1 - dd / repelR) * 0.55) / dd;
            txp += dx * f;
            typ += dy * f;
            tzp += dz * f;
          }
        }
        target[j] = txp;
        target[j + 1] = typ;
        target[j + 2] = tzp;
        positions[j] += (target[j] - positions[j]) * k;
        positions[j + 1] += (target[j + 1] - positions[j + 1]) * k;
        positions[j + 2] += (target[j + 2] - positions[j + 2]) * k;
      }
      geom.attributes.position.needsUpdate = true;

      /* per-chapter personality — spin style, wobble and pulse blend on
         the same grade window, then accumulate every frame */
      const A0 = ACT[gi];
      const A1 = ACT[gNext];
      actCur.ry += (lerp(A0.ry, A1.ry, gsw) - actCur.ry) * k;
      actCur.rx += (lerp(A0.rx, A1.rx, gsw) - actCur.rx) * k;
      actCur.rz += (lerp(A0.rz, A1.rz, gsw) - actCur.rz) * k;
      actCur.wobble += (lerp(A0.wobble, A1.wobble, gsw) - actCur.wobble) * k;
      actCur.pulse += (lerp(A0.pulse, A1.pulse, gsw) - actCur.pulse) * k;
      actCur.pf += (lerp(A0.pf, A1.pf, gsw) - actCur.pf) * k;
      entity.rotation.y += dt * actCur.ry;
      entity.rotation.x += dt * actCur.rx;
      entity.rotation.z += dt * actCur.rz;
      mat.uniforms.uWobble.value = actCur.wobble;
      entity.scale.setScalar(cur.scale * (1 + Math.sin(t * actCur.pf) * actCur.pulse));
      mat.uniforms.uOpacity.value = cur.op;
      mat.uniforms.uTime.value = t;
      mat.uniforms.uVel.value = v * 0.12;
      mat.uniforms.uTintMix.value = cur.tint;
      mat.uniforms.uClickT.value += dt;

      /* ember sparks on wide orbits */
      for (let i = 0; i < SPARKS; i++) {
        const m = sparkMeta[i];
        const a = m.phase + t * m.speed;
        sparkPos[i * 3] = Math.cos(a) * m.r;
        sparkPos[i * 3 + 1] = Math.sin(a * 0.8 + m.phase) * m.r * 0.35 + Math.sin(m.tilt) * 1.4;
        sparkPos[i * 3 + 2] = Math.sin(a) * m.r * 0.6 - 1;
      }
      sparkGeom.attributes.position.needsUpdate = true;
      sparkMat.opacity = (0.35 + 0.4 * cur.tint + cur.op * 0.2) * (0.8 + 0.2 * Math.sin(t * 2.3));

      /* ReAct loop — particle comet laps the ring, one phase per 1.9s;
         the loop is pinned to the screen-center backdrop and billboards
         toward the camera, so it always sits at the heart of the frame */
      const nowMs = performance.now();
      const la = REDUCED
        ? LOOP_START
        : LOOP_START + ((nowMs / 1000) / LOOP_PERIOD) * Math.PI * 2;
      for (let i = 0; i < HEAD_N; i++) {
        const tt = i / HEAD_N;
        const ang = la - tt * 0.62;
        const r = LOOP_R + loopJit[HEAD0 + i];
        const idx = (HEAD0 + i) * 3;
        loopPos[idx] = Math.cos(ang) * r;
        loopPos[idx + 1] = Math.sin(ang) * r;
        loopPos[idx + 2] = loopJit[HEAD0 + i] * 0.8;
      }
      loopGeom.attributes.position.needsUpdate = true;
      loopMat.uniforms.uTime.value = t;
      loopMat.uniforms.uActive.value = REDUCED ? 0 : Math.floor(nowMs / 1900) % 4;
      const loopBreath = 0.85 + 0.15 * Math.sin(t * 2.6);
      loopMat.uniforms.uOpacity.value = (0.52 + (1 - cur.op) * 0.3) * loopBreath;
      camera.getWorldDirection(camDir);
      loopGroup.position.copy(camera.position).addScaledVector(camDir, 9.8);
      loopGroup.quaternion.copy(camera.quaternion);
      loopGroup.rotateZ(t * 0.03);

      core.rotation.y -= dt * 0.05;
      core.rotation.x = Math.sin(t * 0.11) * 0.2;
      core.material.opacity = cur.op * 0.2;

      /* layered dust — slow parallax drift + gentle bob + pointer sway */
      starsFar.rotation.y += dt * 0.006;
      starsMid.rotation.y -= dt * 0.011;
      starsWarm.rotation.y += dt * 0.02;
      starsFar.position.y = Math.sin(t * 0.12) * 0.4;
      starsMid.position.y = Math.sin(t * 0.17 + 2) * 0.5;
      starsWarm.position.y = Math.sin(t * 0.09 + 4) * 0.6;
      starsMid.position.x = pointer.x * 0.5;
      starsWarm.position.x = -pointer.x * 0.35;
      glows.rotation.y += dt * 0.004;
      glowMat.opacity = 0.035 + 0.02 * Math.sin(t * 0.5);

      /* constellation web — re-knit each frame from live entity positions */
      let seg = 0;
      if (!REDUCED && cur.op > 0.12) {
        const lr2 = CONS_LINK_R * CONS_LINK_R;
        for (let a = 0; a < CONS_N && seg < CONS_MAX_SEG; a++) {
          const ia = consIdx[a] * 3;
          for (let b = a + 1; b < CONS_N && seg < CONS_MAX_SEG; b++) {
            const ib = consIdx[b] * 3;
            const dx = positions[ia] - positions[ib];
            const dy = positions[ia + 1] - positions[ib + 1];
            const dz = positions[ia + 2] - positions[ib + 2];
            if (dx * dx + dy * dy + dz * dz < lr2) {
              const o = seg * 6;
              consPos[o] = positions[ia];
              consPos[o + 1] = positions[ia + 1];
              consPos[o + 2] = positions[ia + 2];
              consPos[o + 3] = positions[ib];
              consPos[o + 4] = positions[ib + 1];
              consPos[o + 5] = positions[ib + 2];
              seg++;
            }
          }
        }
      }
      consGeom.setDrawRange(0, seg * 2);
      consGeom.attributes.position.needsUpdate = true;
      consMat.opacity = cur.op * (0.16 + 0.07 * Math.sin(t * 1.7));

      /* velocity streaks — radial warp lines while scrolling fast */
      const sv = Math.min((Math.abs(v) * 0.9), 1);
      streakMat.opacity = sv * 0.3;
      if (sv > 0.02) {
        const sl = 0.4 + sv * 2.6;
        for (let i = 0; i < STREAK_N; i++) {
          const m = streakMeta[i];
          const o = i * 6;
          streakPos[o] = m.x;
          streakPos[o + 1] = m.y;
          streakPos[o + 2] = m.z;
          streakPos[o + 3] = m.x;
          streakPos[o + 4] = m.y;
          streakPos[o + 5] = m.z + sl * m.o;
        }
        streakGeom.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };
    tick();

    const api = {
      setProgress(p) {
        progressTarget = Math.max(0, Math.min(SCENES[SCENES.length - 1].end, p));
        if (REDUCED) progress = progressTarget;
      },
      setVelocity(v) {
        velTarget = Math.max(-3, Math.min(3, v));
      },
      setReveal(r) {
        mat.uniforms.uReveal.value = Math.max(0, Math.min(1, r));
      },
      pulse(clientX, clientY) {
        if (REDUCED) return;
        const p = planeHit(clientX, clientY);
        if (!p) return;
        mat.uniforms.uClickPos.value.copy(p);
        mat.uniforms.uClickT.value = 0;
      },
    };
    onApi && onApi(api);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      dustTexture.dispose();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
          else o.material.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div className="gl-stage" ref={containerRef} aria-hidden="true" />;
}
