import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/* Flowfolio — Cinematic WebGL Stage                                   */
/* Fixed fullscreen scene: digital-twin point cloud + dust + agent net */
/* Camera / opacity / position interpolated per cinematic scene.       */
/* ------------------------------------------------------------------ */

const IS_MOBILE =
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 900px)").matches;
const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ACCENT = new THREE.Color("#d8ff3e");
const BODY = new THREE.Color("#c9ccd2");

/* Per-scene camera + atmosphere states (index === scene index) */
const SCENE_STATES = [
  // 00 PROFILE — twin stands on the right, camera faces it
  { pos: [0, 0.15, 7.6], look: [1.05, 0.15, 0], fov: 50, twin: 0.95, dust: 0.45, net: 0, twinPos: [1.7, -0.1, 0] },
  // 01 EDUCATION — camera slides left, twin dissolves
  { pos: [-2.0, 0.35, 7.4], look: [-0.4, 0.15, 0], fov: 52, twin: 0.1, dust: 0.3, net: 0, twinPos: [2.6, -0.3, -2] },
  // 02 EXPERIENCE — twin gone, agent network fills the space
  { pos: [0, 0.5, 6.8], look: [0, 0.1, 0], fov: 56, twin: 0, dust: 0.5, net: 1, twinPos: [0, 0, 0] },
  // 03 SKILLS — camera pushes through the dust field
  { pos: [0, 0, 5.6], look: [0, 0, -1], fov: 62, twin: 0, dust: 0.95, net: 0.18, twinPos: [0, 0, 0] },
  // 04 PROJECTS — editorial side view
  { pos: [2.4, 0.25, 8.2], look: [0.8, 0, 0], fov: 50, twin: 0.16, dust: 0.3, net: 0, twinPos: [3.4, -0.2, -2.5] },
  // 05 WORKS
  { pos: [-1.8, 0.1, 8.4], look: [-0.6, 0, 0], fov: 50, twin: 0, dust: 0.3, net: 0, twinPos: [-3.2, 0, -2.5] },
  // 06 WRITING
  { pos: [0, -0.15, 8.6], look: [0, 0, 0], fov: 50, twin: 0, dust: 0.4, net: 0.08, twinPos: [0, 0, 0] },
  // 07 CONTACT — the twin returns, closing the loop
  { pos: [0, 0.15, 7.6], look: [1.05, 0.15, 0], fov: 50, twin: 0.95, dust: 0.45, net: 0, twinPos: [1.7, -0.1, 0] },
];

/* ---------------- procedural digital-twin point cloud ---------------- */

function buildTwinGeometry(detail = 1) {
  const pts = [];
  const push = (x, y, z) => pts.push(x, y, z);

  // point shell of a sphere (golden-angle distribution + jitter)
  const fib = (cx, cy, cz, r, n) => {
    const ga = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const rad = Math.sqrt(Math.max(0, 1 - y * y));
      const th = ga * i;
      const jr = r * (1 + (Math.random() - 0.5) * 0.07);
      push(
        cx + Math.cos(th) * rad * jr,
        cy + y * jr,
        cz + Math.sin(th) * rad * jr + (Math.random() - 0.5) * 0.02
      );
    }
  };

  // tapered elliptical tube between two rings
  const seg = (x0, y0, z0, rw0, rd0, x1, y1, z1, rw1, rd1, n) => {
    for (let i = 0; i < n; i++) {
      const t = Math.random();
      const rw = rw0 + (rw1 - rw0) * t;
      const rd = rd0 + (rd1 - rd0) * t;
      const a = Math.random() * Math.PI * 2;
      const rr = 1 + (Math.random() - 0.5) * 0.09;
      push(
        x0 + (x1 - x0) * t + Math.cos(a) * rw * rr,
        y0 + (y1 - y0) * t,
        z0 + (z1 - z0) * t + Math.sin(a) * rd * rr
      );
    }
  };

  // two-segment limb through three joints
  const limb = (p0, p1, p2, r0, r1, r2, n) => {
    seg(p0[0], p0[1], p0[2], r0, r0, p1[0], p1[1], p1[2], r1, r1, Math.floor(n * 0.45));
    seg(p1[0], p1[1], p1[2], r1, r1, p2[0], p2[1], p2[2], r1 * 0.75, r2, Math.floor(n * 0.55));
  };

  const R = (n) => Math.round(n * detail);

  fib(0, 2.42, 0, 0.4, R(1000)); // head
  seg(0, 2.02, 0, 0.13, 0.11, 0, 2.2, 0, 0.12, 0.1, R(140)); // neck
  seg(0, 2.0, 0, 0.74, 0.42, 0, 0.85, 0, 0.5, 0.34, R(2200)); // torso shoulder→waist
  seg(0, 0.85, 0, 0.5, 0.34, 0, 0.55, 0, 0.44, 0.32, R(500)); // hips
  limb([-0.72, 1.95, 0], [-0.9, 1.3, -0.05], [-0.96, 0.66, -0.08], 0.115, 0.09, 0.06, R(700)); // L arm
  limb([0.72, 1.95, 0], [0.9, 1.3, -0.05], [0.96, 0.66, -0.08], 0.115, 0.09, 0.06, R(700)); // R arm
  limb([-0.3, 0.6, 0], [-0.34, -0.45, 0.02], [-0.36, -1.55, 0.02], 0.17, 0.11, 0.075, R(950)); // L leg
  limb([0.3, 0.6, 0], [0.34, -0.45, 0.02], [0.36, -1.55, 0.02], 0.17, 0.11, 0.075, R(950)); // R leg

  const count = pts.length / 3;
  const positions = new Float32Array(pts);
  const rands = new Float32Array(count);
  for (let i = 0; i < count; i++) rands[i] = Math.random();

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  g.setAttribute("aRand", new THREE.BufferAttribute(rands, 1));
  return g;
}

const TWIN_VERT = /* glsl */ `
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

const TWIN_FRAG = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uColor;
  uniform vec3 uAccent;
  varying float vRand;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.08, d);
    vec3 col = mix(uColor, uAccent, step(0.986, vRand));
    gl_FragColor = vec4(col, a * uOpacity * (0.35 + 0.65 * vRand));
  }
`;

/* --------------------------- agent network --------------------------- */

function buildNetwork() {
  const group = new THREE.Group();
  const N = IS_MOBILE ? 18 : 30;
  const nodes = [];
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(2 * Math.random() - 1);
    const r = 1.6 + Math.random() * 2.6;
    nodes.push(
      new THREE.Vector3(
        Math.sin(b) * Math.cos(a) * r * 1.5,
        Math.sin(b) * Math.sin(a) * r * 0.55,
        Math.cos(b) * r * 0.7 - 1.2
      )
    );
  }

  const nodeGeom = new THREE.BufferGeometry().setFromPoints(nodes);
  const nodeMat = new THREE.PointsMaterial({
    color: ACCENT,
    size: 0.06,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    sizeAttenuation: true,
  });
  group.add(new THREE.Points(nodeGeom, nodeMat));

  const linePts = [];
  const done = new Set();
  nodes.forEach((p, i) => {
    const dists = nodes
      .map((q, j) => ({ j, d: p.distanceTo(q) }))
      .filter((x) => x.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    dists.forEach(({ j }) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (done.has(key)) return;
      done.add(key);
      linePts.push(p, nodes[j]);
    });
  });
  const lineGeom = new THREE.BufferGeometry().setFromPoints(linePts);
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.08,
    depthWrite: false,
  });
  group.add(new THREE.LineSegments(lineGeom, lineMat));

  group.userData = { nodeMat, lineMat };
  return group;
}

/* soft round sprite for dust points (avoids square block artifacts) */
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

/* ------------------------------ component ---------------------------- */

export default function SceneCanvas({ sceneIndexRef, onApi }) {
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
    const pixelRatio = Math.min(
      window.devicePixelRatio || 1,
      IS_MOBILE ? 1.5 : 2
    );
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x050505, 7, 30);

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.15, 7.6);

    /* lights (kept minimal — points are unlit, lights serve future meshes) */
    scene.add(new THREE.AmbientLight(0x404048, 0.9));
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(3, 4, 5);
    scene.add(dir);

    /* twin */
    const twinGroup = new THREE.Group();
    const twinGeom = buildTwinGeometry(IS_MOBILE ? 0.55 : 1);
    const twinMat = new THREE.ShaderMaterial({
      vertexShader: TWIN_VERT,
      fragmentShader: TWIN_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uReveal: { value: REDUCED ? 1 : 0 },
        uOpacity: { value: 0 },
        uSize: { value: 2.1 },
        uPR: { value: pixelRatio },
        uColor: { value: BODY },
        uAccent: { value: ACCENT },
      },
    });
    twinGroup.add(new THREE.Points(twinGeom, twinMat));
    scene.add(twinGroup);

    /* dust field — soft round sprites, kept away from the camera plane */
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

    /* agent network */
    const network = buildNetwork();
    scene.add(network);
    network.traverse((o) => {
      if (o.material) o.material.opacity = 0;
    });

    /* interpolated state */
    const cur = {
      pos: new THREE.Vector3(...SCENE_STATES[0].pos),
      look: new THREE.Vector3(...SCENE_STATES[0].look),
      fov: SCENE_STATES[0].fov,
      twin: 0,
      dust: SCENE_STATES[0].dust,
      net: 0,
      twinPos: new THREE.Vector3(...SCENE_STATES[0].twinPos),
    };
    let target = SCENE_STATES[0];

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

    const clock = new THREE.Clock();
    const tmpLook = cur.look.clone();

    const tick = () => {
      if (disposed) return;
      rafId = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      const k = REDUCED ? 1 : 1 - Math.pow(0.0018, dt); // ~cubic ease-out smoothing

      cur.pos.lerp(tmpLook.set(...target.pos), k);
      camera.position.copy(cur.pos);
      cur.look.lerp(tmpLook.set(...target.look), k);
      camera.lookAt(cur.look);
      const fovDelta = target.fov - cur.fov;
      if (Math.abs(fovDelta) > 0.01) {
        cur.fov += fovDelta * k;
        camera.fov = cur.fov;
        camera.updateProjectionMatrix();
      }
      cur.twin += (target.twin - cur.twin) * k;
      cur.dust += (target.dust - cur.dust) * k;
      cur.net += (target.net - cur.net) * k;
      cur.twinPos.lerp(tmpLook.set(...target.twinPos), k);

      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      camera.position.x += pointer.x * 0.28;
      camera.position.y += -pointer.y * 0.16;

      twinGroup.position.copy(cur.twinPos);
      twinGroup.rotation.y = -0.35 + Math.sin(t * 0.13) * 0.22 + pointer.x * 0.07;
      twinGroup.scale.y = 1 + Math.sin(t * 0.9) * 0.006; // breathing
      twinMat.uniforms.uOpacity.value = cur.twin;

      dust.rotation.y += dt * 0.012;
      dustMat.opacity = cur.dust;

      network.rotation.y += dt * 0.03;
      network.rotation.z = Math.sin(t * 0.1) * 0.05;
      network.userData.nodeMat.opacity = cur.net * 0.9;
      network.userData.lineMat.opacity = cur.net * 0.08;

      renderer.render(scene, camera);
    };
    tick();

    const api = {
      setScene(i) {
        target = SCENE_STATES[i] || SCENE_STATES[0];
        if (REDUCED) {
          cur.pos.set(...target.pos);
          cur.look.set(...target.look);
          cur.fov = target.fov;
          cur.twin = target.twin;
          cur.dust = target.dust;
          cur.net = target.net;
          cur.twinPos.set(...target.twinPos);
        }
      },
      setReveal(r) {
        twinMat.uniforms.uReveal.value = Math.max(0, Math.min(1, r));
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
