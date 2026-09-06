import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SCENES } from "./scenes";

/* ------------------------------------------------------------------ */
/* Flowfolio — Cinematic WebGL Stage (continuous)                      */
/* One morphing particle entity + dust; camera glides along a          */
/* scroll-driven path through per-scene waypoints. No page flips —     */
/* the stage is a continuous function of global progress 0..TOTAL.     */
/* ------------------------------------------------------------------ */

const IS_MOBILE =
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 900px)").matches;
const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ACCENT = new THREE.Color("#d8ff3e");
const BODY = new THREE.Color("#c9ccd2");

/* per-scene camera / atmosphere waypoints (index-aligned with SCENES) */
const WAYPOINTS = [
  // 00 PROFILE — entity stands right of the giant type
  { pos: [0, 0.1, 7.6], look: [-1.55, 0.1, 0], fov: 48, op: 0.95 },
  // 01 EDUCATION — camera slides left, entity dims into a timeline ribbon
  { pos: [-1.1, 0.35, 8.4], look: [0.9, 0.05, 0], fov: 50, op: 0.55 },
  // 02 EXPERIENCE — dissolve into agent clusters
  { pos: [0, 0.5, 6.6], look: [0, -0.05, 0], fov: 58, op: 0.9 },
  // 03 SKILLS — camera pushes inside the field
  { pos: [0, 0, 5.2], look: [0, 0, -0.6], fov: 62, op: 0.85 },
  // 04 PROJECTS — entity recedes far right behind the editorial slides
  { pos: [2.3, 0.2, 9.0], look: [-1.5, 0, 0], fov: 46, op: 0.35 },
  // 05 WORKS — far left
  { pos: [-2.1, 0.1, 9.2], look: [1.3, 0, 0], fov: 46, op: 0.3 },
  // 06 WRITING — dim backdrop behind the editorial list
  { pos: [0, -0.2, 9.4], look: [0, 0.1, 0], fov: 50, op: 0.26 },
  // 07 CONTACT — the entity returns, centered, closing the loop
  { pos: [0, 0.15, 7.4], look: [0, 0.05, 0], fov: 50, op: 0.9 },
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
  varying float vRand;
  void main() {
    vRand = aRand;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float show = step(aRand, uReveal);
    gl_PointSize = uSize * uPR * (6.0 / max(0.1, -mv.z)) * show;
    gl_Position = projectionMatrix * mv;
  }
`;

const P_FRAG = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uColor;
  uniform vec3 uAccent;
  varying float vRand;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.08, d);
    vec3 col = mix(uColor, uAccent, step(0.985, vRand));
    gl_FragColor = vec4(col, a * uOpacity * (0.35 + 0.65 * vRand));
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
      },
    });
    const entity = new THREE.Points(geom, mat);
    scene.add(entity);

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

    /* dust field */
    const dustTexture = makeDustSprite();
    const dustCount = IS_MOBILE ? 420 : 900;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 30;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 14 + 1;
      dustPos[i * 3 + 2] = -1 - Math.random() * 12;
    }
    const dustGeom = new THREE.BufferGeometry();
    dustGeom.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x9aa0a8,
      size: 0.09,
      map: dustTexture,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const dust = new THREE.Points(dustGeom, dustMat);
    scene.add(dust);

    /* ---- continuous state driven by global progress ---- */
    const cur = {
      pos: new THREE.Vector3(...WAYPOINTS[0].pos),
      look: new THREE.Vector3(...WAYPOINTS[0].look),
      fov: WAYPOINTS[0].fov,
      op: 0,
    };
    let progress = 0; // smoothed global progress
    let progressTarget = 0;
    let firstFrame = true;

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
    };
    const blended = {
      pos: new THREE.Vector3(),
      look: new THREE.Vector3(),
      fov: 48,
      op: 1,
    };
    function applyWp(out, w) {
      out.pos.set(...w.pos);
      out.look.set(...w.look);
      out.fov = w.fov;
      out.op = w.op;
    }

    const clock = new THREE.Clock();
    const tmp = new THREE.Vector3();

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

      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      camera.position.x += pointer.x * 0.28;
      camera.position.y += -pointer.y * 0.16;

      /* particle morph — formation blend follows the same progress curve */
      const n = formations.length;
      let fi = 0;
      while (fi < n - 2 && progress > SCENES[fi + 1].center) fi++;
      const c0 = SCENES[fi].center;
      const c1 = SCENES[fi + 1].center;
      const ft = smooth(Math.max(0, Math.min(1, (progress - c0) / (c1 - c0))));
      const fa = formations[fi];
      const fb = formations[fi + 1];
      for (let j = 0; j < N * 3; j++) {
        target[j] = fa[j] + (fb[j] - fa[j]) * ft;
        positions[j] += (target[j] - positions[j]) * k;
      }
      geom.attributes.position.needsUpdate = true;

      entity.rotation.y = Math.sin(t * 0.07) * 0.25 + progress * 0.12;
      mat.uniforms.uOpacity.value = cur.op;

      core.rotation.y -= dt * 0.05;
      core.rotation.x = Math.sin(t * 0.11) * 0.2;
      core.material.opacity = cur.op * 0.12;
      core.scale.setScalar(1 + Math.sin(t * 0.8) * 0.03);

      dust.rotation.y += dt * 0.012;
      dustMat.opacity = 0.4;

      renderer.render(scene, camera);
    };
    tick();

    const api = {
      setProgress(p) {
        progressTarget = Math.max(0, Math.min(SCENES[SCENES.length - 1].end, p));
        if (REDUCED) progress = progressTarget;
      },
      setReveal(r) {
        mat.uniforms.uReveal.value = Math.max(0, Math.min(1, r));
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
