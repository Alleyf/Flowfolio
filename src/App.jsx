import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Alert, AppBar, Avatar, Box, Button, Card, CardContent, Chip, Container, Divider, Grid, Stack, TextField, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { RadarChart } from "echarts/charts";
import { LegendComponent, RadarComponent, TooltipComponent } from "echarts/components";
import { init, use as useEcharts } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { ArrowUpRight, BookOpenText, Bot, BriefcaseBusiness, Building2, Camera, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Download, ExternalLink, Github, Globe, GraduationCap, Heart, Mail, MapPinned, MonitorCog, MoonStar, Phone, Radar, School, Send, Share2, Sparkles, Sun, TerminalSquare, Wrench, X } from "lucide-react";
import { blogPosts, bootLines, contactConfig, digitalIdentity, educationList, internshipExperience, personalSkills, portfolioWorks, projectExperiences, sectionMenus, siteMeta, skillTicker, terminalConfig } from "./config/siteConfig";

useEcharts([RadarChart, RadarComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

const SLIDE_TRANSITION_MS = 820;
const PUBLIC_BASE_URL = (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/");
const BUSUANZI_API_ENDPOINT = "https://cdn.busuanzi.cc/api.php";

function toBusuanziStats(data) {
  const pvValue = data.busuanzi_site_pv ?? data.busuanzi_value_site_pv;
  const uvValue = data.busuanzi_site_uv ?? data.busuanzi_value_site_uv;
  return {
    pv: pvValue != null ? String(pvValue) : "--",
    uv: uvValue != null ? String(uvValue) : "--",
  };
}

async function fetchBusuanziStats(url, referrer = "") {
  const response = await fetch(BUSUANZI_API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, referrer }),
  });
  if (!response.ok) throw new Error(`busuanzi http ${response.status}`);
  const data = await response.json();
  return toBusuanziStats(data);
}

const artPhotoModules = import.meta.glob("../public/art/**/*.webp");

const artPhotoCategoryMap = Object.keys(artPhotoModules).reduce((accumulator, path) => {
  const matched = path.match(/\/art\/([^/]+)\/[^/]+$/);
  if (!matched) return accumulator;
  const category = decodeURIComponent(matched[1]);
  if (!accumulator[category]) accumulator[category] = [];
  accumulator[category].push(`${PUBLIC_BASE_URL}${path.replace("../public/", "")}`);
  return accumulator;
}, {});

const artPhotoCategories = Object.entries(artPhotoCategoryMap)
  .map(([name, photos]) => ({
    name,
    photos: photos.sort((left, right) => left.localeCompare(right, "zh-CN")),
  }))
  .sort((left, right) => left.name.localeCompare(right.name, "zh-CN"));

function normalizeArtCategoryName(name) {
  return name.replace(/[-_]+/g, " ").trim();
}

function WarpTunnel() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    let disposed = false;
    let cleanup = () => {};

    import("three").then((THREE) => {
      if (disposed) return;

      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x04040a, 18, 90);
      const camera = new THREE.PerspectiveCamera(72, el.clientWidth / el.clientHeight, 0.1, 220);
      camera.position.set(0, 0, 26);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.setSize(el.clientWidth, el.clientHeight);
      el.appendChild(renderer.domElement);

      // ---------- radial warp streaks (quancy-style light rays) ----------
      const STREAKS = 760;
      const positions = new Float32Array(STREAKS * 2 * 3);
      const aInfo = new Float32Array(STREAKS * 2 * 4); // radius, angle, speed, length
      const aT = new Float32Array(STREAKS * 2);        // 0 = tail, 1 = head
      for (let i = 0; i < STREAKS; i += 1) {
        const radius = 2.4 + Math.random() * 46;
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.55 + Math.random() * 1.75; // outward velocity
        const length = 3.2 + Math.random() * 12.0; // streak length along radius
        for (let v = 0; v < 2; v += 1) {
          const o = (i * 2 + v) * 3;
          positions[o] = 0;
          positions[o + 1] = 0;
          positions[o + 2] = 0;
          const io = (i * 2 + v) * 4;
          aInfo[io] = radius;
          aInfo[io + 1] = angle;
          aInfo[io + 2] = speed;
          aInfo[io + 3] = length;
          aT[i * 2 + v] = v; // tail=0, head=1
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("aInfo", new THREE.BufferAttribute(aInfo, 4));
      geometry.setAttribute("aT", new THREE.BufferAttribute(aT, 1));

      const uniforms = {
        uTime: { value: 0 },
        uPointer: { value: new THREE.Vector2(0, 0) }, // parallax offset
        uWarp: { value: 1 },     // 1 = cruise, boosted while switching pages
        uOpacity: { value: 1.05 },
      };

      const vertexShader = `
        uniform float uTime;
        uniform vec2 uPointer;
        uniform float uWarp;
        attribute vec4 aInfo;
        attribute float aT;
        varying float vFade;
        varying float vWarm;
        varying float vT;

        void main(){
          float radius = aInfo.x;
          float angle = aInfo.y;
          float speed = aInfo.z;
          float len = aInfo.w;

          // outward acceleration with per-streak phase; uWarp boosts during page switches
          float r = mod(radius + uTime * speed * 6.0 * uWarp, 50.0) + 1.2;
          float stretch = len * (0.35 + speed * 0.18) * (0.7 + uWarp * 0.5);
          float vertexR = max(r - aT * stretch, 0.4);

          vec3 p = vec3(cos(angle) * vertexR + uPointer.x * vertexR * 0.14,
                        sin(angle) * vertexR + uPointer.y * vertexR * 0.14,
                        -vertexR * 0.55);

          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;

          vFade = smoothstep(1.0, 7.0, r) * smoothstep(50.0, 24.0, r);
          vWarm = smoothstep(30.0, 6.0, r);
          vT = aT;
        }
      `;

      const fragmentShader = `
        uniform float uOpacity;
        varying float vFade;
        varying float vWarm;
        varying float vT;
        void main(){
          // head bright, tail fades = motion-blur light streak
          float along = mix(0.03, 1.25, vT);
          vec3 pink = vec3(1.0, 0.18, 0.47);   // #ff2d78
          vec3 blue = vec3(0.30, 0.65, 1.0);   // #4da6ff
          vec3 col = mix(pink, blue, vWarm);
          float alpha = along * vFade * uOpacity;
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(col, alpha);
        }
      `;

      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const streaks = new THREE.LineSegments(geometry, material);
      scene.add(streaks);

      let mouseX = 0;
      let mouseY = 0;
      let frame;
      const clock = new THREE.Clock();

      const onMove = (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = (event.clientY / window.innerHeight) * 2 - 1;
      };

      const onResize = () => {
        camera.aspect = el.clientWidth / el.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(el.clientWidth, el.clientHeight);
        uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 1.75);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("resize", onResize);

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const animate = () => {
        frame = requestAnimationFrame(animate);
        const t = reduced ? 12 : clock.getElapsedTime();
        uniforms.uTime.value = t;
        uniforms.uPointer.value.set(
          uniforms.uPointer.value.x + (mouseX * 1.6 - uniforms.uPointer.value.x) * 0.04,
          uniforms.uPointer.value.y + (-mouseY * 1.6 - uniforms.uPointer.value.y) * 0.04,
        );
        uniforms.uWarp.value += (1 - uniforms.uWarp.value) * 0.045;
        streaks.rotation.z = Math.sin(t * 0.07) * 0.05;
        camera.position.x += (Math.sin(t * 0.11) * 0.9 - camera.position.x) * 0.02;
        camera.position.y += (Math.cos(t * 0.09) * 0.7 - camera.position.y) * 0.02;
        renderer.render(scene, camera);
      };

      animate();

      cleanup = () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("resize", onResize);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <Box ref={ref} className="warp-tunnel" />;
}

function HeroScene() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    let disposed = false;
    let cleanup = () => {};

    import("three").then((THREE) => {
      if (disposed) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(56, el.clientWidth / el.clientHeight, 0.1, 1000);
      camera.position.z = 30;
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(el.clientWidth, el.clientHeight);
      el.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      // ambient orbit rings (kept, subtle)
      [
        { radius: 8, color: 0x6ef2ff, speed: 0.0026 },
        { radius: 11.5, color: 0x62b6ff, speed: -0.0021 },
        { radius: 15, color: 0x7ff0b0, speed: 0.0016 },
        { radius: 18.5, color: 0xffb865, speed: -0.0012 },
      ].forEach((ring) => {
        const mesh = new THREE.Mesh(
          new THREE.TorusGeometry(ring.radius, 0.05, 24, 160),
          new THREE.MeshBasicMaterial({ color: ring.color, opacity: 0.33, transparent: true }),
        );
        mesh.userData.speed = ring.speed;
        group.add(mesh);
      });

      // ============ Lusion-style GPU flow-field particles ============
      const COUNT = 9000;
      const SPREAD = 78;

      const seeds = new Float32Array(COUNT * 4); // x, y, z, random seed
      for (let i = 0; i < COUNT * 4; i += 4) {
        seeds[i] = (Math.random() - 0.5) * SPREAD;
        seeds[i + 1] = (Math.random() - 0.5) * SPREAD * 0.66;
        seeds[i + 2] = (Math.random() - 0.5) * 44;
        seeds[i + 3] = Math.random();
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(seeds, 4));
      geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));

      const uniforms = {
        uTime: { value: 0 },
        uPointer: { value: new THREE.Vector2(9999, 9999) }, // world-space pointer
        uPointerStrength: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 1.9 },
      };

      const vertexShader = `
        uniform float uTime;
        uniform vec2 uPointer;
        uniform float uPointerStrength;
        uniform float uPixelRatio;
        uniform float uSize;
        attribute vec4 aSeed;
        varying float vGlow;
        varying float vWarm;

        // simplex noise 3d (Ashima)
        vec3 mod289(vec3 x){return x - floor(x * (1.0/289.0)) * 289.0;}
        vec4 mod289(vec4 x){return x - floor(x * (1.0/289.0)) * 289.0;}
        vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
        float snoise(vec3 v){
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ * ns.x + ns.yyyy;
          vec4 y = y_ * ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0) * 2.0 + 1.0;
          vec4 s1 = floor(b1) * 2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        vec3 curl(vec3 p){
          float e = 0.6;
          float n1 = snoise(vec3(p.x, p.y + e, p.z));
          float n2 = snoise(vec3(p.x, p.y - e, p.z));
          float n3 = snoise(vec3(p.x, p.y, p.z + e));
          float n4 = snoise(vec3(p.x, p.y, p.z - e));
          float n5 = snoise(vec3(p.x + e, p.y, p.z));
          float n6 = snoise(vec3(p.x - e, p.y, p.z));
          float x = (n1 - n2) - (n3 - n4);
          float y = (n3 - n4) - (n5 - n6);
          float z = (n5 - n6) - (n1 - n2);
          return vec3(x, y, z);
        }

        void main(){
          vec3 base = aSeed.xyz;
          float seed = aSeed.w;

          // flow field drift
          vec3 p = base;
          p += curl(base * 0.055 + vec3(0.0, 0.0, uTime * 0.045)) * (4.2 + seed * 2.4);
          // gentle vertical rise loop
          p.y += sin(uTime * (0.12 + seed * 0.22) + seed * 40.0) * 2.6;

          // pointer repulsion (world space, z ~ 0 plane)
          vec3 toPointer = p - vec3(uPointer, 0.0);
          float dist = length(toPointer);
          float radius = 13.0;
          if (dist < radius) {
            float force = (1.0 - dist / radius) * uPointerStrength;
            p += normalize(toPointer + 0.0001) * force * 7.0;
          }

          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;

          float twinkle = 0.55 + 0.45 * sin(uTime * (0.8 + seed * 1.6) + seed * 90.0);
          vGlow = twinkle * (0.35 + seed * 0.65);
          vWarm = smoothstep(6.0, 0.0, dist);

          float size = uSize * (0.5 + seed * 1.3) * (1.0 + vWarm * 1.6);
          gl_PointSize = size * uPixelRatio * (26.0 / -mv.z);
        }
      `;

      const fragmentShader = `
        varying float vGlow;
        varying float vWarm;
        void main(){
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float core = smoothstep(0.5, 0.06, d);
          float halo = smoothstep(0.5, 0.0, d) * 0.32;
          vec3 cool = vec3(0.43, 0.95, 1.0);   // #6ef2ff
          vec3 warm = vec3(1.0, 0.72, 0.4);    // #ffb865
          vec3 col = mix(cool, warm, vWarm * 0.85);
          float alpha = (core + halo) * vGlow * 0.9;
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(col, alpha);
        }
      `;

      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const flow = new THREE.Points(geometry, material);
      scene.add(flow);

      // pointer in world space + strength spring
      let pointerWorld = new THREE.Vector2(9999, 9999);
      let targetStrength = 0;
      let mouseX = 0;
      let mouseY = 0;
      let frame;
      const clock = new THREE.Clock();

      const toWorld = (clientX, clientY) => {
        const ndc = new THREE.Vector3(
          (clientX / window.innerWidth) * 2 - 1,
          -(clientY / window.innerHeight) * 2 + 1,
          0.5,
        );
        ndc.unproject(camera);
        const dir = ndc.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        return camera.position.clone().add(dir.multiplyScalar(distance));
      };

      const onMove = (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = (event.clientY / window.innerHeight) * 2 - 1;
        const world = toWorld(event.clientX, event.clientY);
        pointerWorld.set(world.x, world.y);
        targetStrength = 1;
      };

      const onLeave = () => {
        targetStrength = 0;
      };

      const onResize = () => {
        camera.aspect = el.clientWidth / el.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(el.clientWidth, el.clientHeight);
        uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseleave", onLeave);
      window.addEventListener("resize", onResize);

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const animate = () => {
        frame = requestAnimationFrame(animate);
        const t = reduced ? 0 : clock.getElapsedTime();
        uniforms.uTime.value = t;
        uniforms.uPointer.value.copy(pointerWorld);
        uniforms.uPointerStrength.value += (targetStrength - uniforms.uPointerStrength.value) * 0.06;

        group.children.forEach((child) => {
          child.rotation.z += child.userData.speed;
        });
        group.rotation.x += ((-mouseY * 0.15) - group.rotation.x) * 0.03;
        group.rotation.y += ((mouseX * 0.18) - group.rotation.y) * 0.03;
        flow.rotation.z = Math.sin(t * 0.05) * 0.08;

        renderer.render(scene, camera);
      };

      animate();

      cleanup = () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseleave", onLeave);
        window.removeEventListener("resize", onResize);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <Box ref={ref} className="hero-scene" />;
}

const DOT_GRID_SPACING = 34;
const DOT_BASE_ALPHA = 0.16;
const DOT_HOVER_RADIUS = 190;
const DOT_RIPPLE_RADIUS = 260;

function DotGrid() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    el.appendChild(canvas);

    let dots = [];
    let ripples = [];
    let frame;
    let running = true;
    let width = 0;
    let height = 0;
    let dpr = 1;
    const pointer = { x: -9999, y: -9999, active: false };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = el.clientWidth;
      height = el.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      const cols = Math.ceil(width / DOT_GRID_SPACING) + 1;
      const rows = Math.ceil(height / DOT_GRID_SPACING) + 1;
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          dots.push({
            x: col * DOT_GRID_SPACING,
            y: row * DOT_GRID_SPACING,
            energy: 0,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    const spawnRipple = (x, y) => ripples.push({ x, y, start: performance.now() });

    const onMove = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    };

    const onLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };

    const onPointerDown = (event) => {
      if (event.target.closest("input, textarea, button, a")) return;
      spawnRipple(event.clientX, event.clientY);
    };

    const draw = (now) => {
      if (!running) return;
      frame = requestAnimationFrame(draw);
      context.clearRect(0, 0, width, height);
      ripples = ripples.filter((ripple) => now - ripple.start < 1500);

      for (const dot of dots) {
        let energy = 0;
        if (pointer.active) {
          const dx = dot.x - pointer.x;
          const dy = dot.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < DOT_HOVER_RADIUS) {
            energy = Math.max(energy, 1 - distance / DOT_HOVER_RADIUS);
          }
        }
        for (const ripple of ripples) {
          const age = (now - ripple.start) / 1500;
          const ringRadius = age * DOT_RIPPLE_RADIUS * 2.2;
          const distance = Math.hypot(dot.x - ripple.x, dot.y - ripple.y);
          const band = Math.max(0, 1 - Math.abs(distance - ringRadius) / 70);
          energy = Math.max(energy, band * (1 - age));
        }
        if (!reducedMotion) {
          dot.energy += (energy - dot.energy) * 0.14;
        } else {
          dot.energy = energy;
        }
        const breathe = reducedMotion ? 0 : Math.sin(now * 0.0011 + dot.phase) * 0.25 + 0.75;
        const alpha = DOT_BASE_ALPHA * breathe + dot.energy * 0.8;
        const radius = 1 + dot.energy * 1.9;
        context.beginPath();
        context.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        context.fillStyle = dot.energy > 0.05
          ? `rgba(110, 242, 255, ${Math.min(alpha, 0.95)})`
          : `rgba(160, 190, 215, ${Math.min(alpha, 0.5)})`;
        context.fill();
      }
    };

    build();
    if (!reducedMotion) {
      const centerX = width / 2;
      const centerY = height / 2;
      [0, 160, 320].forEach((delay) => {
        window.setTimeout(() => spawnRipple(centerX, centerY), delay);
      });
    }
    frame = requestAnimationFrame(draw);

    const onResize = () => build();
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("pointerdown", onPointerDown);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("pointerdown", onPointerDown);
      if (canvas.parentNode === el) el.removeChild(canvas);
    };
  }, []);

  return <Box ref={ref} className="dot-grid" aria-hidden="true" />;
}

function SkillTicker() {
  const items = useMemo(() => [...skillTicker, ...skillTicker], []);
  const renderRow = (keyPrefix, reverse) => (
    <Box className={reverse ? "ticker-row reverse" : "ticker-row"}>
      <Box className="ticker-track">
        {items.map((item, index) => (
          <Box key={`${keyPrefix}-${item}-${index}`} className="ticker-item">
            {item}
            <Box component="span" className="ticker-dot" />
          </Box>
        ))}
      </Box>
    </Box>
  );
  return (
    <Box className="skill-ticker" aria-hidden="true">
      {renderRow("a", false)}
      {renderRow("b", true)}
    </Box>
  );
}

function SkillsRadar() {
  const ref = useRef(null);

  const resolveRadarPalette = () => {
    if (typeof document === "undefined") {
      return {
        axisNameColor: "#dff7ff",
        splitAreaColors: ["rgba(110,242,255,0.04)", "rgba(110,242,255,0.015)"],
        splitLineColor: "rgba(110,242,255,0.14)",
        axisLineColor: "rgba(110,242,255,0.18)",
      };
    }

    const theme = document.documentElement.getAttribute("data-theme") || "dark";
    if (theme === "light") {
      return {
        axisNameColor: "#1f476a",
        splitAreaColors: ["rgba(63,132,184,0.13)", "rgba(63,132,184,0.05)"],
        splitLineColor: "rgba(37,95,140,0.35)",
        axisLineColor: "rgba(37,95,140,0.4)",
      };
    }

    return {
      axisNameColor: "#dff7ff",
      splitAreaColors: ["rgba(110,242,255,0.04)", "rgba(110,242,255,0.015)"],
      splitLineColor: "rgba(110,242,255,0.14)",
      axisLineColor: "rgba(110,242,255,0.18)",
    };
  };

  useEffect(() => {
    const chart = init(ref.current);
    const palette = resolveRadarPalette();
    chart.setOption({
      backgroundColor: "transparent",
      radar: {
        indicator: [
          { name: "Agent工程", max: 5 },
          { name: "LLM应用", max: 5 },
          { name: "后端开发", max: 5 },
          { name: "云原生", max: 5 },
          { name: "数据中间件", max: 5 },
          { name: "前端", max: 5 },
        ],
        shape: "polygon",
        splitNumber: 5,
        radius: "68%",
        axisName: { color: palette.axisNameColor, fontSize: 12 },
        splitArea: { areaStyle: { color: palette.splitAreaColors } },
        splitLine: { lineStyle: { color: palette.splitLineColor } },
        axisLine: { lineStyle: { color: palette.axisLineColor } },
      },
      series: [
        {
          type: "radar",
          data: [
            {
              value: [5, 4, 4, 5, 3, 4],
              areaStyle: { color: "rgba(110,242,255,0.28)" },
              lineStyle: { color: "#6ef2ff", width: 2 },
              itemStyle: { color: "#6ef2ff" },
            },
          ],
        },
      ],
    });

    const resize = () => chart.resize();
    const onThemeChange = () => {
      const nextPalette = resolveRadarPalette();
      chart.setOption({
        radar: {
          axisName: { color: nextPalette.axisNameColor, fontSize: 12 },
          splitArea: { areaStyle: { color: nextPalette.splitAreaColors } },
          splitLine: { lineStyle: { color: nextPalette.splitLineColor } },
          axisLine: { lineStyle: { color: nextPalette.axisLineColor } },
        },
      });
    };

    window.addEventListener("resize", resize);
    window.addEventListener("flowfolio-theme-change", onThemeChange);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("flowfolio-theme-change", onThemeChange);
      chart.dispose();
    };
  }, []);

  return <Box ref={ref} sx={{ width: "100%", height: 320 }} />;
}

function SectionShell({ id, eyebrow, title, icon, active, align = "left", children }) {
  const stageKey = active ? "on" : "off";
  return (
    <motion.section
      id={id}
      className="section-shell"
      initial={false}
      animate={{ opacity: active ? 1 : 0.52, y: active ? 0 : 18 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <Box className={`sec-glass-panel${align === "right" ? " align-right" : ""}`}>
        <Stack spacing={1.1} sx={{ mb: 3 }} key={`head-${stageKey}`}>
          <Box className="stage-mask">
            <Chip icon={icon} label={eyebrow} variant="outlined" className="section-chip" />
          </Box>
          <Box className={`section-title-row${align === "right" ? " sec-title-row-right" : ""}`}>
            {align === "right" ? null : <Box className="section-title-tick" />}
            <Box className="stage-mask">
              <Typography variant="h3" className="section-title-gradient">{title}</Typography>
            </Box>
            {align === "right" ? <Box className="section-title-tick" /> : null}
          </Box>
        </Stack>
        <Box className="stage-rise" key={`body-${stageKey}`} sx={{ height: "100%" }}>
          {children}
        </Box>
      </Box>
    </motion.section>
  );
}

function ContactLine({ icon, label, value, href }) {
  const highlighted = value === contactConfig.status;
  const node = (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box className="icon-badge small">{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        {highlighted ? <Box component="span" className="status-highlight">{value}</Box> : <Typography>{value}</Typography>}
      </Box>
    </Stack>
  );

  return href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="contact-link">{node}</a> : node;
}

function CommandHintList() {
  return (
    <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{ mt: 2 }}>
      {terminalConfig.commands.map((item) => (
        <Chip key={item.name} label={item.name} size="small" variant="outlined" className="command-chip" />
      ))}
    </Stack>
  );
}

const agentLoopSteps = [
  { key: "thought", label: "Thought", hint: "拆解目标与约束，规划下一步要做什么。" },
  { key: "action", label: "Action", hint: "调度 Skill / MCP / Plugin，执行工具调用。" },
  { key: "observation", label: "Observation", hint: "回收工具返回，校验结果是否可信。" },
  { key: "reflection", label: "Reflection", hint: "复盘并修正计划，进入下一轮循环。" },
];

function AgentLoop() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStep((current) => (current + 1) % agentLoopSteps.length);
    }, 1900);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <Box className="react-loop">
      <Stack direction="row" spacing={1.2} alignItems="center" className="react-loop-head">
        <Box className="react-loop-pulse" />
        <Typography variant="caption" className="react-loop-title">AGENT REACT LOOP · RUNNING</Typography>
      </Stack>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
        {agentLoopSteps.map((item, index) => (
          <Fragment key={item.key}>
            <Box className={index === step ? "react-loop-node active" : "react-loop-node"}>{item.label}</Box>
            {index < agentLoopSteps.length - 1 ? <Box component="span" className="react-loop-arrow">→</Box> : null}
          </Fragment>
        ))}
      </Stack>
      <Typography variant="caption" sx={{ mt: 1.4, display: "block", color: "rgba(190, 220, 240, 0.72)" }}>
        {agentLoopSteps[step].hint}
      </Typography>
    </Box>
  );
}

const terminalActionSections = {
  "goto-skills": "skills",
  "goto-internship": "internship",
  "goto-portfolio": "portfolio",
};

function TerminalPlayground({ onNavigate }) {
  const [lines, setLines] = useState(() => [
    "Flowfolio interactive shell v2.0",
    "输入 help 查看命令，agent / intern / matrix 会直接跳转到对应分栏。",
  ]);
  const [value, setValue] = useState("");
  const [pointer, setPointer] = useState({ prefix: "", matches: [], index: 0 });
  const outputRef = useRef(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  const submit = () => {
    const raw = value.trim();
    if (!raw) return;

    const name = raw.toLowerCase();
    const echo = `${terminalConfig.prompt} ${raw}`;
    const matched = terminalConfig.commands.find((item) => item.name === name);

    if (!matched) {
      setLines((prev) => [...prev, echo, `command not found: ${name}  (输入 help 查看可用命令)`]);
      setValue("");
      setPointer({ prefix: "", matches: [], index: 0 });
      return;
    }

    if (matched.action === "clear") {
      setLines([]);
      setValue("");
      setPointer({ prefix: "", matches: [], index: 0 });
      return;
    }

    const output = [...(matched.output ?? [])];
    const targetId = terminalActionSections[matched.action];

    if (targetId) {
      const target = sectionMenus.find((item) => item.id === targetId);
      output.push(`[跳转] 正在前往「${target ? target.label : targetId}」分栏...`);
      if (typeof onNavigate === "function") onNavigate(targetId);
    }

    if (matched.action === "unlock") {
      output.push("[提示] 简历已解锁，你当前就在主页。");
    }

    setLines((prev) => [...prev, echo, ...output]);
    setValue("");
    setPointer({ prefix: "", matches: [], index: 0 });
  };

  const complete = () => {
    const prefix = value.trim().toLowerCase();
    const available = terminalConfig.commands.map((item) => item.name);
    const matches = available.filter((item) => item.startsWith(prefix));
    if (!matches.length) return;
    const nextIndex = pointer.prefix === prefix && pointer.matches.length ? (pointer.index + 1) % matches.length : 0;
    setPointer({ prefix, matches, index: nextIndex });
    setValue(matches[nextIndex]);
  };

  return (
    <Card className="glass-card playground-card">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.6 }}>
          <Box>
            <Typography variant="overline">Interactive Shell</Typography>
            <Typography variant="h5">命令行名片</Typography>
          </Box>
          <Chip icon={<TerminalSquare size={15} />} label="TRY IT" className="hero-chip" />
        </Stack>
        <Box className="playground-output" ref={outputRef}>
          {lines.map((line, index) => (
            <Box key={`${index}-${line}`} component="div" className="playground-line">{line}</Box>
          ))}
        </Box>
        <Box className="playground-input-row">
          <Typography className="terminal-prompt playground-prompt">{terminalConfig.prompt}</Typography>
          <input
            className="playground-input"
            value={value}
            placeholder={terminalConfig.placeholder}
            aria-label="terminal playground input"
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submit();
                return;
              }
              if (event.key === "Tab") {
                event.preventDefault();
                complete();
              }
            }}
          />
          <Button size="small" variant="contained" onClick={submit}>执行</Button>
        </Box>
        <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{ mt: 1.6 }}>
          {terminalConfig.commands.map((item) => (
            <Chip
              key={item.name}
              label={item.name}
              size="small"
              variant="outlined"
              className="command-chip"
              onClick={() => setValue(item.name)}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function CarouselNav({ onPrev, onNext }) {
  return (
    <Stack direction="row" spacing={1}>
      <Button variant="outlined" size="small" onClick={onPrev} startIcon={<ChevronLeft size={16} />}>上一项</Button>
      <Button variant="outlined" size="small" onClick={onNext} endIcon={<ChevronRight size={16} />}>下一项</Button>
    </Stack>
  );
}

const highlightTerms = [
  "Orchestrator-Worker",
  "多智能体",
  "Multi-Agent",
  "Workflow",
  "ReAct",
  "MCP",
  "RAG",
  "82%+",
  "500+ QPS",
  "10 倍",
  "Plan-Execute-Replan",
  "SpringAI-Alibaba",
  "日活 2W+",
  "Human in the loop",
  "缓存预热",
  "异步解耦",
  "削峰",
  "40 个节点",
  "Kubernetes",
  "渐进式重构",
];

const artCopyPool = [
  "光线不是背景，它是情绪的旁白。",
  "每一次快门，都是和时间短暂握手。",
  "城市在夜里更诚实，影子会替人说话。",
  "风景不止在远方，也在你停下来的那一秒。",
  "有些颜色会发声，只是需要慢一点看。",
  "镜头收集的不是画面，是当天的呼吸。",
  "当构图安静下来，故事就开始流动。",
  "照片会老去，但被看见的瞬间不会。",
  "光从边缘进入，记忆从细节开始。",
  "按下快门前，我先听见了画面的节奏。",
  "把噪点留下来，像给夜色留一段证词。",
  "当人群走散，街角才开始发光。",
  "焦外是沉默，焦内是回答。",
  "远处的灯，不是目的地，是方向感。",
  "有些瞬间不属于构图，只属于直觉。",
  "风吹过来时，画面会自己站稳。",
  "光影交叠的地方，最容易长出故事。",
  "我把日常拍成了证据，把证据拍成了诗。",
  "快门闭合的一刻，世界短暂地同意了我。",
  "颜色先抵达情绪，然后才抵达眼睛。",
  "比清晰更重要的，是这张照片想说什么。",
  "每一帧都在提醒我：生活值得被认真看见。",
  "镜头不是窗口，是与世界谈判的方式。",
  "画面边缘的留白，刚好容纳想象。",
  "我追逐的不是风景，是风景里的呼吸。",
  "当光落在脸上，时间就有了形状。",
  "拍摄让瞬间慢下来，也让记忆更准确。",
  "你看到的是照片，我看到的是当时的温度。",
  "每次对焦，都是一次选择与舍弃。",
  "镜头向外，心却在向内生长。",
];

const artCuratorMetaPool = [
  "Curator Note",
  "Light Study",
  "Street Archive",
  "Color Field",
  "Silent Frame",
  "Moment Record",
];

const ART_INITIAL_VISIBLE_COUNT = 6;

function HighlightText({ text }) {
  const pattern = new RegExp(`(${highlightTerms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  const termSet = new Set(highlightTerms);
  return text.split(pattern).filter(Boolean).map((part, index) => (
    termSet.has(part)
      ? <Box key={`${part}-${index}`} component="span" className="keyword-highlight">{part}</Box>
      : <Box key={`${part}-${index}`} component="span">{part}</Box>
  ));
}

function getProjectStatusClass(status) {
  const normalized = status.toLowerCase();
  if (normalized === "live") return "project-status-chip live";
  if (normalized === "stable") return "project-status-chip stable";
  if (normalized === "maintain") return "project-status-chip maintain";
  return "project-status-chip";
}

export default function App() {
  const [terminalText, setTerminalText] = useState("");
  const [command, setCommand] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [terminalHint, setTerminalHint] = useState(terminalConfig.hint);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadedIndexes, setLoadedIndexes] = useState(() => new Set([0]));
  const [portfolioIndex, setPortfolioIndex] = useState(0);
  const [portfolioMode, setPortfolioMode] = useState("works");
  const [artCategoryIndex, setArtCategoryIndex] = useState(0);
  const [artPhotoIndex, setArtPhotoIndex] = useState(0);
  const [artVisibleCount, setArtVisibleCount] = useState(ART_INITIAL_VISIBLE_COUNT);
  const [artCopy, setArtCopy] = useState(artCopyPool[0]);
  const [toolboxOpen, setToolboxOpen] = useState(false);
  const [liked, setLiked] = useState(() => (typeof window !== "undefined" ? window.localStorage.getItem("flowfolio-liked") === "true" : false));
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [sharePosterPreview, setSharePosterPreview] = useState(null);
  const [sharePosterGeneratedAt, setSharePosterGeneratedAt] = useState("");
  const [showPosterGeneratingModal, setShowPosterGeneratingModal] = useState(false);
  const [busuanziStats, setBusuanziStats] = useState({ pv: "--", uv: "--" });
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window === "undefined") return "dark";
    const saved = window.localStorage.getItem("flowfolio-theme-mode");
    return saved === "light" || saved === "dark" || saved === "system" ? saved : "dark";
  });
  const [systemTheme, setSystemTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [completionState, setCompletionState] = useState({ prefix: "", matches: [], pointer: 0 });
  const [pendingSectionId, setPendingSectionId] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", subject: contactConfig.defaultSubject, message: "" });
  const touchStartY = useRef(null);
  const artHoverRafRef = useRef(null);
  const toolboxRef = useRef(null);
  const unlockTimerRef = useRef(null);
  const transitionTimerRef = useRef(null);
  const portfolioSectionIndex = sectionMenus.findIndex((item) => item.id === "portfolio");
  const internshipSectionIndex = sectionMenus.findIndex((item) => item.id === "internship");
  const skillsSectionIndex = sectionMenus.findIndex((item) => item.id === "skills");
  const projectsSectionIndex = sectionMenus.findIndex((item) => item.id === "projects");
  const blogSectionIndex = sectionMenus.findIndex((item) => item.id === "blog");

  useEffect(() => {
    document.title = siteMeta.pageTitle;
  }, []);

  useEffect(() => {
    window.localStorage.setItem("flowfolio-liked", String(liked));
  }, [liked]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("flowfolio-theme-mode", themeMode);
  }, [themeMode]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemTheme = () => {
      setSystemTheme(media.matches ? "dark" : "light");
    };

    handleSystemTheme();
    media.addEventListener("change", handleSystemTheme);
    return () => media.removeEventListener("change", handleSystemTheme);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const resolvedTheme = themeMode === "system" ? systemTheme : themeMode;
    document.documentElement.setAttribute("data-theme", resolvedTheme);
    document.documentElement.setAttribute("data-theme-mode", themeMode);
    window.dispatchEvent(new Event("flowfolio-theme-change"));
  }, [systemTheme, themeMode]);

  useEffect(() => {
    if (!unlocked || activeIndex < Math.max(1, portfolioSectionIndex - 1)) return;
    portfolioWorks.slice(0, 4).forEach((item) => {
      const image = new Image();
      image.src = item.image;
    });
  }, [activeIndex, portfolioSectionIndex, unlocked]);

  useEffect(() => {
    if (!unlocked || typeof window === "undefined" || typeof window.gtag !== "function") return;

    const currentSection = sectionMenus[activeIndex];
    const pagePath = `/${currentSection.id}`;
    const pageLocation = `${window.location.origin}${window.location.pathname}#${currentSection.id}`;

    if (window.history?.replaceState) {
      window.history.replaceState(null, "", `#${currentSection.id}`);
    }

    window.gtag("event", "page_view", {
      page_title: `${siteMeta.projectName} - ${currentSection.label}`,
      page_path: pagePath,
      page_location: pageLocation,
    });
  }, [activeIndex, unlocked]);

  // quancy-style console signature: greet the curious ones who open devtools
  useEffect(() => {
    if (typeof window === "undefined") return;
    const titleStyle = "color:#6ef2ff;text-shadow:0 0 18px rgba(110,242,255,.55);font-weight:bolder;font-size:44px";
    const subStyle = "color:#ffb865;font-size:18px;font-weight:bolder";
    const hintStyle = "color:#9dd6ec;font-size:13px";
    const timer = window.setTimeout(() => {
      console.info("%cFlowfolio", titleStyle);
      console.info("%cFlow-driven portfolio · Agent 应用研发工程师", subStyle);
      console.info("%c提示：试试 help / whoami / agent / matrix 命令，滚轮或方向键翻页。", hintStyle);
    }, 2600);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!unlocked || typeof window === "undefined") return undefined;

    const onEscapeCloseModal = (event) => {
      if (event.key !== "Escape") return;
      if (showPosterGeneratingModal) {
        setShowPosterGeneratingModal(false);
      }
      if (sharePosterPreview) {
        closeSharePosterPreview();
      }
    };

    window.addEventListener("keydown", onEscapeCloseModal);
    return () => window.removeEventListener("keydown", onEscapeCloseModal);
  }, [sharePosterPreview, showPosterGeneratingModal, unlocked]);

  useEffect(() => {
    if (!unlocked || typeof window === "undefined") return undefined;

    let disposed = false;
    const pageUrl = `${window.location.origin}${window.location.pathname}`;
    const refreshBusuanzi = async () => {
      try {
        const next = await fetchBusuanziStats(pageUrl, document.referrer || "");
        if (disposed) return;
        setBusuanziStats(next);
      } catch (error) {
        console.error("busuanzi refresh failed", error);
      }
    };

    refreshBusuanzi();
    const timer = window.setInterval(refreshBusuanzi, 60000);
    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
  }, [unlocked]);

  useEffect(() => {
    if (!toolboxOpen || typeof window === "undefined") return undefined;

    const onPointerDownOutsideToolbox = (event) => {
      if (!(event.target instanceof Element)) return;
      if (toolboxRef.current?.contains(event.target)) return;
      setToolboxOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDownOutsideToolbox);
    return () => window.removeEventListener("pointerdown", onPointerDownOutsideToolbox);
  }, [toolboxOpen]);

  useEffect(() => {
    let line = 0;
    let char = 0;
    let timer;

    const type = () => {
      if (line >= bootLines.length) return;
      const current = bootLines[line];
      if (char < current.length) {
        setTerminalText((prev) => `${prev}${current.charAt(char)}`);
        char += 1;
        timer = window.setTimeout(type, 15);
        return;
      }
      setTerminalText((prev) => `${prev}\n`);
      line += 1;
      char = 0;
      if (line >= bootLines.length) {
          timer = window.setTimeout(() => {
            setUnlocked(true);
          }, 700);
        return;
      }
      timer = window.setTimeout(type, 110);
    };

    type();
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => () => {
    window.clearTimeout(unlockTimerRef.current);
    window.clearTimeout(transitionTimerRef.current);
    if (artHoverRafRef.current) window.cancelAnimationFrame(artHoverRafRef.current);
  }, []);

  useEffect(() => {
    setArtPhotoIndex(0);
    setArtVisibleCount(ART_INITIAL_VISIBLE_COUNT);
  }, [artCategoryIndex, portfolioMode]);

  useEffect(() => {
    if (portfolioMode !== "art" || !artPhotoCategories.length || activeIndex !== portfolioSectionIndex) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    if ((navigator.hardwareConcurrency ?? 8) <= 4) return undefined;

    const safeCategoryIndex = ((artCategoryIndex % artPhotoCategories.length) + artPhotoCategories.length) % artPhotoCategories.length;
    const currentPhotos = artPhotoCategories[safeCategoryIndex]?.photos ?? [];
    if (currentPhotos.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setArtPhotoIndex((current) => (current + 1) % currentPhotos.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [activeIndex, artCategoryIndex, portfolioMode, portfolioSectionIndex]);

  useEffect(() => {
    if (portfolioMode !== "art") return;
    const randomIndex = Math.floor(Math.random() * artCopyPool.length);
    setArtCopy(artCopyPool[randomIndex]);
  }, [portfolioMode, artCategoryIndex]);

  const handleArtTileHover = (index) => {
    if (index === artPhotoIndex || artHoverRafRef.current) return;
    artHoverRafRef.current = window.requestAnimationFrame(() => {
      setArtPhotoIndex(index);
      artHoverRafRef.current = null;
    });
  };

  const preloadAround = (index) => {
    setLoadedIndexes((current) => {
      const next = new Set(current);
      [index - 1, index, index + 1].forEach((item) => {
        if (item >= 0 && item < sectionMenus.length) next.add(item);
      });
      return next;
    });
  };

  const navigateTo = (nextIndex) => {
    if (!unlocked || isTransitioning) return;
    if (nextIndex < 0 || nextIndex >= sectionMenus.length || nextIndex === activeIndex) return;

    preloadAround(nextIndex);
    setToolboxOpen(false);
    setIsTransitioning(true);
    setActiveIndex(nextIndex);
    transitionTimerRef.current = window.setTimeout(() => setIsTransitioning(false), SLIDE_TRANSITION_MS);
  };

  const navigateToSectionId = (sectionId) => {
    const nextIndex = sectionMenus.findIndex((item) => item.id === sectionId);
    if (nextIndex < 0) return;
    if (unlocked) {
      navigateTo(nextIndex);
      return;
    }
    setPendingSectionId(sectionId);
  };

  useEffect(() => {
    if (!unlocked || !pendingSectionId) return undefined;
    const nextIndex = sectionMenus.findIndex((item) => item.id === pendingSectionId);
    const timer = window.setTimeout(() => {
      setPendingSectionId(null);
      if (nextIndex >= 0) navigateTo(nextIndex);
    }, 420);
    return () => window.clearTimeout(timer);
  }, [pendingSectionId, unlocked]);

  useEffect(() => {
    if (!unlocked) return undefined;

    // current page's inner scroller (only pages taller than viewport actually scroll)
    const activeScroller = () => {
      const shells = document.querySelectorAll(".slide-shell");
      const shell = shells[activeIndex];
      return shell ? shell.querySelector(".stage-rise") : null;
    };

    // true when the inner scroller can still move in the given direction
    const innerCanScroll = (direction) => {
      const scroller = activeScroller();
      if (!scroller) return false;
      const slack = scroller.scrollHeight - scroller.clientHeight;
      if (slack <= 2) return false;
      if (direction > 0) return scroller.scrollTop < slack - 1;
      return scroller.scrollTop > 1;
    };

    // quancy-style full-page hijack: wheel flips pages; if a page is taller
    // than the viewport, its inner content scrolls first, then flips
    const onWheel = (event) => {
      if (Math.abs(event.deltaY) < 24 || isTransitioning) return;
      const direction = event.deltaY > 0 ? 1 : -1;
      event.preventDefault();
      if (innerCanScroll(direction)) {
        const scroller = activeScroller();
        scroller.scrollTop += event.deltaY;
        return;
      }
      navigateTo(activeIndex + direction);
    };

    const onKeyDown = (event) => {
      const keyTarget = event.target instanceof Element ? event.target : null;
      if (keyTarget && (keyTarget.matches("input, textarea, select") || keyTarget.isContentEditable)) return;

      if (activeIndex === portfolioSectionIndex && ["ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();

        if (portfolioMode !== "art") {
          setPortfolioIndex((current) => {
            if (event.key === "ArrowLeft") return (current - 1 + portfolioWorks.length) % portfolioWorks.length;
            return (current + 1) % portfolioWorks.length;
          });
          return;
        }

        if (!artPhotoCategories.length) return;

        const safeCategoryIndex = ((artCategoryIndex % artPhotoCategories.length) + artPhotoCategories.length) % artPhotoCategories.length;
        const currentPhotos = artPhotoCategories[safeCategoryIndex]?.photos ?? [];
        if (!currentPhotos.length) return;

        setArtPhotoIndex((current) => {
          if (event.key === "ArrowLeft") return (current - 1 + currentPhotos.length) % currentPhotos.length;
          return (current + 1) % currentPhotos.length;
        });
      } else if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        if (innerCanScroll(1)) {
          const scroller = activeScroller();
          scroller.scrollTop += Math.min(320, scroller.clientHeight * 0.6);
          return;
        }
        navigateTo(activeIndex + 1);
      } else if (["ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault();
        if (innerCanScroll(-1)) {
          const scroller = activeScroller();
          scroller.scrollTop -= Math.min(320, scroller.clientHeight * 0.6);
          return;
        }
        navigateTo(activeIndex - 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        navigateTo(0);
      } else if (event.key === "End") {
        event.preventDefault();
        navigateTo(sectionMenus.length - 1);
      }
    };

    const onTouchStart = (event) => {
      touchStartY.current = event.touches[0]?.clientY ?? null;
    };

    const onTouchEnd = (event) => {
      if (touchStartY.current == null) return;
      const deltaY = touchStartY.current - (event.changedTouches[0]?.clientY ?? touchStartY.current);
      const direction = deltaY > 0 ? 1 : -1;
      if (Math.abs(deltaY) > 70) {
        navigateTo(activeIndex + direction);
      }
      touchStartY.current = null;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [activeIndex, artCategoryIndex, isTransitioning, portfolioMode, portfolioSectionIndex, unlocked]);

  const terminalCommandMap = useMemo(
    () => Object.fromEntries(terminalConfig.commands.map((item) => [item.name, item])),
    [],
  );

  const appendTerminalLines = (prefix, lines) => {
    const content = lines.length ? `${lines.join("\n")}\n` : "";
    setTerminalText((prev) => `${prev}${prefix}${content}`);
  };

  const runCommand = () => {
    const raw = command.trim().toLowerCase();
    const prefix = `${terminalConfig.prompt} ${command}\n`;

    if (!raw) {
      setTerminalText((prev) => `${prev}${prefix}`);
      return;
    }

    const matched = terminalCommandMap[raw];

    if (!matched) {
      setTerminalText((prev) => `${prev}${prefix}command not found: ${raw}\n`);
      setTerminalHint("命令不存在，按 Tab 自动补全或输入 help 查看。");
      setCommand("");
      setCompletionState({ prefix: "", matches: [], pointer: 0 });
      return;
    }

    if (matched.action === "clear") {
      setTerminalText("");
      setTerminalHint("终端已清空。");
    } else {
      appendTerminalLines(prefix, matched.output ?? []);
      if (matched.name === "help") setTerminalHint("已输出所有可用命令。");
      if (matched.name === "whoami") setTerminalHint("候选人摘要已输出。");
      if (matched.name === "contact") setTerminalHint("联系方式已输出。");
        if (matched.action === "unlock") {
          setTerminalHint("正在进入 Flowfolio。");
          unlockTimerRef.current = window.setTimeout(() => {
            setUnlocked(true);
          }, 500);
        }
        if (terminalActionSections[matched.action]) {
          const targetId = terminalActionSections[matched.action];
          const target = sectionMenus.find((item) => item.id === targetId);
          setTerminalHint(`正在前往「${target ? target.label : targetId}」分栏。`);
          if (!unlocked) {
            unlockTimerRef.current = window.setTimeout(() => setUnlocked(true), 500);
          }
          navigateToSectionId(targetId);
        }
    }

    setCommand("");
    setCompletionState({ prefix: "", matches: [], pointer: 0 });
  };

  const handleTerminalTab = () => {
    const prefix = command.trim().toLowerCase();
    const available = terminalConfig.commands.map((item) => item.name);

    if (completionState.prefix === prefix && completionState.matches.length > 0) {
      const nextPointer = (completionState.pointer + 1) % completionState.matches.length;
      const nextValue = completionState.matches[nextPointer];
      setCompletionState((current) => ({ ...current, pointer: nextPointer }));
      setCommand(nextValue);
      setTerminalHint(`Tab 补全：${completionState.matches.join(" / ")}`);
      return;
    }

    const matches = available.filter((item) => item.startsWith(prefix));
    if (!matches.length) {
      setTerminalHint("没有可补全的命令。");
      return;
    }

    setCommand(matches[0]);
    setCompletionState({ prefix, matches, pointer: 0 });
    setTerminalHint(`Tab 补全：${matches.join(" / ")}`);
  };

  const sendMessage = () => {
    const subject = encodeURIComponent(form.subject || contactConfig.defaultSubject);
    const body = encodeURIComponent(`姓名：${form.name || "未填写"}\n访客公司：${form.email || "未填写"}\n\n${form.message || ""}`);
    window.location.href = `mailto:${contactConfig.inboxEmail}?subject=${subject}&body=${body}`;
  };

  const loadImage = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Image load failed: ${src}`));
    img.src = src;
  });

  const generateSharePoster = async () => {
    if (isGeneratingPoster) return;
    setIsGeneratingPoster(true);
    setShowPosterGeneratingModal(true);

    const shareUrl = "https://alleyf.github.io/Flowfolio";
    const generatedAt = new Date().toLocaleString("zh-CN", { hour12: false });
    let ipInfo = { query: "", country: "", city: "" };
    try {
      const ipResponse = await fetch("http://ip-api.com/json/?lang=zh-CN");
      if (ipResponse.ok) {
        ipInfo = await ipResponse.json();
      }
    } catch (e) {
      console.warn("IP address fetch failed, skipping.", e);
    }

    const posterWidth = 1080;
    const posterHeight = 1620;
    const canvas = document.createElement("canvas");
    canvas.width = posterWidth;
    canvas.height = posterHeight;
    const context = canvas.getContext("2d");

    if (!context) {
      setIsGeneratingPoster(false);
      return;
    }

    try {
      const backgroundGradient = context.createLinearGradient(0, 0, posterWidth, posterHeight);
      backgroundGradient.addColorStop(0, "#061018");
      backgroundGradient.addColorStop(0.55, "#10283a");
      backgroundGradient.addColorStop(1, "#071019");
      context.fillStyle = backgroundGradient;
      context.fillRect(0, 0, posterWidth, posterHeight);

      context.fillStyle = "rgba(110, 242, 255, 0.16)";
      context.beginPath();
      context.arc(860, 230, 250, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = "rgba(255, 184, 101, 0.14)";
      context.beginPath();
      context.arc(180, 1340, 280, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = "#8cecff";
      context.font = "700 34px 'Azeret Mono', 'Noto Sans SC', sans-serif";
      context.fillText("FLOWFOLIO // PERSONAL SHARE CARD", 84, 116);

      context.fillStyle = "#ffffff";
      context.font = "900 96px 'Noto Sans SC', sans-serif";
      context.fillText("CsFan", 84, 236);

      context.fillStyle = "#d9eefc";
      context.font = "600 36px 'Noto Sans SC', sans-serif";
      context.fillText("Agent 应用研发 · 多智能体 · 云原生 · 全栈工程化", 84, 296);

      context.fillStyle = "rgba(7, 20, 32, 0.86)";
      context.strokeStyle = "rgba(110, 242, 255, 0.32)";
      context.lineWidth = 3;
      context.beginPath();
      context.roundRect(84, 352, 912, 680, 34);
      context.fill();
      context.stroke();

      const gridWorks = portfolioWorks.slice(0, 4);
      const gridTileWidth = 408;
      const gridTileHeight = 296;
      const gridXStart = 114;
      const gridYStart = 396;
      for (let i = 0; i < gridWorks.length; i += 1) {
        const item = gridWorks[i];
        const col = i % 2;
        const row = Math.floor(i / 2);
        const tileX = gridXStart + col * (gridTileWidth + 24);
        const tileY = gridYStart + row * (gridTileHeight + 24);
        try {
          const workImage = await loadImage(item.image);
          context.save();
          context.beginPath();
          context.roundRect(tileX, tileY, gridTileWidth, gridTileHeight, 20);
          context.clip();
          context.drawImage(workImage, tileX, tileY, gridTileWidth, gridTileHeight);
          context.restore();
        } catch (error) {
          context.fillStyle = "rgba(110, 242, 255, 0.08)";
          context.beginPath();
          context.roundRect(tileX, tileY, gridTileWidth, gridTileHeight, 20);
          context.fill();
        }
        context.fillStyle = "rgba(5, 16, 26, 0.78)";
        context.beginPath();
        context.roundRect(tileX, tileY + gridTileHeight - 58, gridTileWidth, 58, 0);
        context.fill();
        context.fillStyle = "#ebf8ff";
        context.font = "600 26px 'Noto Sans SC', sans-serif";
        context.fillText(item.title, tileX + 20, tileY + gridTileHeight - 22);
      }

      context.fillStyle = "rgba(7, 20, 32, 0.9)";
      context.strokeStyle = "rgba(255, 255, 255, 0.08)";
      context.beginPath();
      context.roundRect(84, 1076, 912, 470, 28);
      context.fill();
      context.stroke();

      context.fillStyle = "#ebf8ff";
      context.font = "700 44px 'Noto Sans SC', sans-serif";
      context.fillText("扫码查看完整站点", 124, 1160);

      context.fillStyle = "#9fc4dc";
      context.font = "500 26px 'Noto Sans SC', sans-serif";
      context.fillText("作品矩阵 · 项目经历 · 博客推文 · 联系方式", 124, 1202);

      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(shareUrl)}`;
      const qrImage = await loadImage(qrUrl);

      context.fillStyle = "rgba(255, 255, 255, 0.12)";
      context.beginPath();
      context.roundRect(678, 1112, 300, 344, 28);
      context.fill();

      context.fillStyle = "#ffffff";
      context.beginPath();
      context.roundRect(700, 1134, 256, 256, 22);
      context.fill();

      context.lineWidth = 1;
      context.strokeStyle = "rgba(12, 30, 45, 0.14)";
      context.beginPath();
      context.roundRect(706, 1140, 244, 244, 18);
      context.stroke();

      context.drawImage(qrImage, 718, 1152, 220, 220);

      context.fillStyle = "#d6ecff";
      context.font = "600 20px 'Noto Sans SC', sans-serif";
      context.fillText("微信扫码访问", 756, 1416);

      context.fillStyle = "#9ec3dc";
      context.font = "500 25px 'Azeret Mono', 'Noto Sans SC', sans-serif";
      context.fillText(shareUrl, 124, 1312);

      context.fillStyle = "#7fa3bb";
      context.font = "500 24px 'Azeret Mono', 'Noto Sans SC', sans-serif";
      context.fillText(`Generated at: ${generatedAt}`, 124, 1360);
      if (ipInfo.query) {
        const ipLine = `Visitor IP: ${ipInfo.query} (${ipInfo.country} ${ipInfo.city})`;
        context.fillText(ipLine, 124, 1392);
      }

      context.fillStyle = "#6ef2ff";
      context.font = "700 24px 'Azeret Mono', 'Noto Sans SC', sans-serif";
      context.fillText("FLOWFOLIO", 124, 1460);
      context.fillStyle = "#a9c8dd";
      context.font = "500 24px 'Noto Sans SC', sans-serif";
      context.fillText("让简历成为可交互的作品", 276, 1460);

      canvas.toBlob((blob) => {
        if (!blob) {
          setTerminalHint("海报生成失败，请稍后再试。");
          setIsGeneratingPoster(false);
          return;
        }

        const objectUrl = URL.createObjectURL(blob);
        setSharePosterPreview((previous) => {
          if (previous) URL.revokeObjectURL(previous);
          return objectUrl;
        });
        setSharePosterGeneratedAt(generatedAt);
        setTerminalHint("分享海报已生成，可在预览窗中复制图片。");
        setToolboxOpen(false);
        setShowPosterGeneratingModal(false);
        setIsGeneratingPoster(false);
      }, "image/png", 0.96);
    } catch (error) {
      console.error(error);
      setTerminalHint("海报生成失败，请检查网络后重试。");
      setShowPosterGeneratingModal(false);
      setIsGeneratingPoster(false);
    }
  };

  const handleCopyPosterImage = async () => {
    if (!sharePosterPreview || !window.ClipboardItem || !navigator.clipboard?.write) {
      setTerminalHint("当前浏览器不支持图片复制，请使用下载按钮。");
      return;
    }

    try {
      const response = await fetch(sharePosterPreview);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      setTerminalHint("分享海报已复制到剪贴板，可直接粘贴发送。");
    } catch (error) {
      console.error(error);
      setTerminalHint("复制失败，请使用下载按钮。");
    }
  };

  const handleDownloadPosterImage = () => {
    if (!sharePosterPreview) return;
    const anchor = document.createElement("a");
    anchor.href = sharePosterPreview;
    anchor.download = `flowfolio-share-${Date.now()}.png`;
    anchor.click();
  };

  const closeSharePosterPreview = () => {
    setSharePosterPreview((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return null;
    });
    setSharePosterGeneratedAt("");
  };

  const sectionNodes = [
    {
      id: "overview",
      eyebrow: siteMeta.overviewEyebrow,
      title: siteMeta.overviewTitle,
      icon: <TerminalSquare size={18} />,
      render: () => (
        <Grid container spacing={3} alignItems="stretch">
          <Grid size={{ xs: 12, md: 7 }}>
            <Chip icon={<TerminalSquare size={16} />} label="SYSTEM ONLINE / DIGITAL IDENTITY" className="hero-chip" />
            <Typography variant="h1" className="hero-display-title" aria-label="CsFan" sx={{ mt: 2, mb: 2 }}>
              {"CsFan".split("").map((char, index) => (
                <Box component="span" key={`${char}-${index}`} className="char-up" aria-hidden="true">
                  <span style={{ "--ci": index }}>{char}</span>
                </Box>
              ))}
            </Typography>
            <Typography className="hero-subtitle">Agent 应用研发工程师 / 多智能体系统实践者 / Java 全栈与云原生</Typography>
            <Typography className="hero-copy" sx={{ mt: 3 }}>
              围绕 ReAct - Plan - Execute - Replan - Reflection 架构范式构建可落地的 Agent 系统，同时在 Java 微服务、云原生交付与工程效率上保持全栈动手能力，把模型能力真正接进业务闭环。
            </Typography>
            <AgentLoop />
            <CommandHintList />
            <SkillTicker />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card className="glass-card identity-panel">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="overline">Digital Identity</Typography>
                    <Typography variant="h5">数字身份证</Typography>
                  </Box>
                  <Chip label="VERIFIED" color="primary" />
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src={digitalIdentity.avatar || undefined} className="avatar-badge">{digitalIdentity.avatarFallback}</Avatar>
                  <Box>
                    <Typography variant="h6">{digitalIdentity.name}</Typography>
                    <Typography color="text.secondary">{digitalIdentity.role}</Typography>
                  </Box>
                </Stack>
                <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.08)" }} />
                <Stack spacing={1.5}>
                  {digitalIdentity.fields.map((field) => (
                    <Box key={field.label} className="metric-row">
                      <Typography color="text.secondary">{field.label}</Typography>
                      {field.value === contactConfig.status ? <Box component="span" className="status-highlight">{field.value}</Box> : <Typography>{field.value}</Typography>}
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TerminalPlayground onNavigate={navigateToSectionId} />
          </Grid>
        </Grid>
      ),
    },
    {
      id: "education",
      eyebrow: "Education",
      title: "教育背景",
      icon: <School size={18} />,
      render: () => (
        <Box className="education-timeline">
          {educationList.map((item, index) => (
            <Box key={item.title} className="education-node stagger-card" style={{ "--gi": index }}>
              <Box className="education-axis">
                <Typography className="period-label education-period">{item.period}</Typography>
                <Box className="education-dot" />
                <Box className="education-line" />
              </Box>
              <Card
                className="glass-card timeline-card education-card"
                component="a"
                href={item.schoolUrl}
                target="_blank"
                rel="noreferrer"
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box className="education-logo-shell">
                      <img src={item.logo} alt={`${item.school} logo`} className="education-logo" loading="lazy" />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="h5">{item.title}</Typography>
                      <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{ mt: 1 }}>
                        {item.tiers?.map((tier) => <Box key={tier} component="span" className="education-tier-badge">{tier}</Box>)}
                      </Stack>
                    </Box>
                  </Stack>
                  <Typography color="text.secondary" sx={{ mt: 1.5 }}>{item.body}</Typography>
                  <Stack component="ul" spacing={1.1} className="bullet-list compact">
                    {item.details?.map((detail) => <Typography component="li" key={detail} color="text.secondary">{detail}</Typography>)}
                  </Stack>
                  <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{ mt: 2.5 }}>
                    {item.chips.map((chip) => <Chip key={chip} label={chip} variant="outlined" />)}
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      ),
    },
    {
      id: "internship",
      eyebrow: "Internship",
      title: "实习经历",
      icon: <Bot size={18} />,
      render: () => (
        <Grid container spacing={3} alignItems="stretch">
          <Grid size={{ xs: 12, md: 4 }}>
            <Card className="glass-card internship-company-card">
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box className="icon-badge"><Building2 size={20} /></Box>
                  <Typography variant="overline">Taotian Group · Alimama</Typography>
                </Stack>
                <Typography variant="h4" sx={{ mt: 2 }}>{internshipExperience.org}</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.6 }}>{internshipExperience.company}</Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 2 }}>
                  <Chip label={internshipExperience.role} color="primary" />
                  <Chip label={internshipExperience.period} variant="outlined" className="internship-period-chip" />
                </Stack>
                <Typography color="text.secondary" sx={{ mt: 2.2, lineHeight: 1.95 }}>{internshipExperience.intro}</Typography>
                <Divider sx={{ my: 2.2, borderColor: "rgba(255,255,255,0.08)" }} />
                <Typography variant="overline">Tech Keywords</Typography>
                <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{ mt: 1.2 }}>
                  {internshipExperience.stack.map((item) => <Chip key={item} label={item} size="small" variant="outlined" />)}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <motion.div
              initial={false}
              animate={activeIndex === internshipSectionIndex ? { opacity: 1, y: 0 } : { opacity: 0.72, y: 22 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              style={{ height: "100%" }}
            >
              <Card className="glass-card mission-card expanded" sx={{ height: "100%" }}>
                <CardContent>
                  <Stack direction="row" spacing={1.6} alignItems="flex-start" sx={{ minWidth: 0 }}>
                    <Box component="span" className="mission-code">WORK</Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="h6">{internshipExperience.summaryTitle}</Typography>
                      <Typography color="text.secondary" className="mission-summary" sx={{ mt: 1, lineHeight: 2 }}>{internshipExperience.summary}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{ mt: 2 }}>
                    {internshipExperience.metrics.map((metric) => <Box key={metric} component="span" className="mission-metric">{metric}</Box>)}
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      ),
    },
    {
      id: "skills",
      eyebrow: "Skills",
      title: "个人技能",
      icon: <Radar size={18} />,
      render: () => (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card className="glass-card" sx={{ height: "100%" }}>
              <CardContent><SkillsRadar /></CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Grid container spacing={2}>
              {personalSkills.map((item, index) => (
                <Grid key={item.title} size={{ xs: 12, sm: 6 }}>
                  <motion.div
                    className="skill-card-wrap"
                    initial={false}
                    animate={activeIndex === skillsSectionIndex ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0.74, y: 26, scale: 0.97 }}
                    transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
                    whileHover={{ y: -10, rotateX: -4, rotateY: index % 2 === 0 ? 3 : -3 }}
                  >
                    <Card className="glass-card skill-card">
                      <CardContent>
                        <Typography variant="h6">{item.title}</Typography>
                        <Typography color="text.secondary" sx={{ mt: 1 }}>{item.body}</Typography>
                        <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{ mt: 2 }}>
                          {item.tags.map((tag) => <Chip key={tag} label={tag} size="small" />)}
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      ),
    },
    {
      id: "projects",
      eyebrow: "Project Experience",
      title: "项目经历",
      icon: <BriefcaseBusiness size={18} />,
      render: () => (
        <Box className="education-timeline">
          {projectExperiences.map((project, index) => (
            <Box key={project.title} className="education-node">
              <Box className="education-axis">
                <Typography className="period-label education-period">{project.period}</Typography>
                <Box className="education-dot" />
                <Box className="education-line" />
              </Box>
              <motion.div
                className="project-timeline-wrap"
                initial={false}
                animate={activeIndex === projectsSectionIndex ? { opacity: 1, y: 0 } : { opacity: 0.74, y: 24 }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
              >
                <Card className={`glass-card timeline-card project-timeline-card ${project.color}`}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
                      <Typography variant="h5" sx={{ pr: 1 }}>{project.title}</Typography>
                      <Chip label={project.status} size="small" className={getProjectStatusClass(project.status)} />
                    </Stack>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1.2 }}>
                      <Chip label={project.role} size="small" variant="outlined" />
                    </Stack>
                    <Typography color="text.secondary" sx={{ mt: 1.6 }}>
                      <HighlightText text={project.description} />
                    </Typography>
                    <Stack component="ul" spacing={1.2} className="bullet-list compact">
                      {project.bullets.map((bullet) => (
                        <Typography component="li" key={bullet} color="text.secondary">
                          <HighlightText text={bullet} />
                        </Typography>
                      ))}
                    </Stack>
                    <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{ mt: 2 }}>
                      {project.stack.map((item) => <Chip key={item} label={item} size="small" variant="outlined" />)}
                    </Stack>
                    {project.external !== false && project.url ? (
                      <Button href={project.url} target="_blank" rel="noreferrer" endIcon={<ArrowUpRight size={16} />} sx={{ mt: 2.2 }}>访问项目</Button>
                    ) : null}
                  </CardContent>
                </Card>
              </motion.div>
            </Box>
          ))}
        </Box>
      ),
    },
    {
      id: "portfolio",
      eyebrow: "Portfolio Feed",
      title: "作品矩阵",
      icon: <Sparkles size={18} />,
      render: () => {
        const safePortfolioIndex = ((portfolioIndex % portfolioWorks.length) + portfolioWorks.length) % portfolioWorks.length;
        const work = portfolioWorks[safePortfolioIndex];
        const hasArtPhotos = artPhotoCategories.length > 0;
        const safeArtCategoryIndex = hasArtPhotos ? ((artCategoryIndex % artPhotoCategories.length) + artPhotoCategories.length) % artPhotoCategories.length : 0;
        const activeArtCategory = hasArtPhotos ? artPhotoCategories[safeArtCategoryIndex] : null;
        const activeArtPhotos = activeArtCategory?.photos ?? [];
        const visibleArtPhotos = activeArtPhotos.slice(0, artVisibleCount);
        const canLoadMoreArtPhotos = activeArtPhotos.length > artVisibleCount;
        const safeArtPhotoIndex = activeArtPhotos.length > 0 ? ((artPhotoIndex % activeArtPhotos.length) + activeArtPhotos.length) % activeArtPhotos.length : 0;
        const artLeadPhoto = activeArtPhotos[safeArtPhotoIndex] ?? null;
        const curatorMeta = artCuratorMetaPool[(safeArtCategoryIndex + safeArtPhotoIndex) % artCuratorMetaPool.length];
        const frameCode = `ART-${String(safeArtCategoryIndex + 1).padStart(2, "0")}-${String(safeArtPhotoIndex + 1).padStart(2, "0")}`;
        return (
          <Stack spacing={2.5}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2}>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip
                  icon={<Sparkles size={14} />}
                  label="作品矩阵"
                  onClick={() => setPortfolioMode("works")}
                  className={portfolioMode === "works" ? "portfolio-mode-chip active" : "portfolio-mode-chip"}
                />
                <Chip
                  icon={<Camera size={14} />}
                  label="艺术矩阵"
                  onClick={() => setPortfolioMode("art")}
                  className={portfolioMode === "art" ? "portfolio-mode-chip active" : "portfolio-mode-chip"}
                />
              </Stack>
              {portfolioMode === "works" ? (
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Typography color="text.secondary">共 {portfolioWorks.length} 个开源作品</Typography>
                  <CarouselNav
                    onPrev={() => setPortfolioIndex((current) => (current - 1 + portfolioWorks.length) % portfolioWorks.length)}
                    onNext={() => setPortfolioIndex((current) => (current + 1) % portfolioWorks.length)}
                  />
                </Stack>
              ) : (
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Typography color="text.secondary">艺术源于生活而高于生活</Typography>
                  {activeArtPhotos.length > 1 ? (
                    <CarouselNav
                      onPrev={() => setArtPhotoIndex((current) => (current - 1 + activeArtPhotos.length) % activeArtPhotos.length)}
                      onNext={() => setArtPhotoIndex((current) => (current + 1) % activeArtPhotos.length)}
                    />
                  ) : null}
                </Stack>
              )}
            </Stack>
            {portfolioMode === "works" ? (
              <>
                <motion.article key={work.title} initial={{ opacity: 0, x: 44 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, ease: "easeOut" }}>
                  <Card className="glass-card portfolio-card featured-item-card">
                    <Grid container>
                      <Grid size={{ xs: 12, md: 7 }}>
                        <motion.div
                          className="portfolio-cover-wrap featured-cover"
                          whileHover={{ scale: 1.018 }}
                          transition={{ type: "spring", stiffness: 160, damping: 14, mass: 0.9 }}
                        >
                          <img src={work.image} alt={work.title} loading="lazy" decoding="async" className="portfolio-image portfolio-image-large" />
                          <Box className="portfolio-cover-shine" />
                        </motion.div>
                      </Grid>
                      <Grid size={{ xs: 12, md: 5 }}>
                        <CardContent className="portfolio-content">
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                            <Box>
                              <Typography variant="h4">{work.title}</Typography>
                              <Typography color="text.secondary">{work.subtitle}</Typography>
                            </Box>
                            <Chip label={work.kind} size="small" />
                          </Stack>
                          <Typography color="text.secondary" sx={{ mt: 1.6 }}>{work.summary}</Typography>
                          <Stack component="ul" spacing={1.1} className="bullet-list compact">
                            {work.highlights.map((item) => <Typography component="li" key={item} color="text.secondary">{item}</Typography>)}
                          </Stack>
                          <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{ mt: 2 }}>
                            {work.stack.map((tag) => <Chip key={tag} label={tag} size="small" variant="outlined" />)}
                          </Stack>
                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2.5 }}>
                            <Button component="a" href={work.repo} target="_blank" rel="noreferrer" variant="outlined" size="small" startIcon={<Github size={16} />}>GitHub</Button>
                            {work.downloadUrl ? <Button component="a" href={work.downloadUrl} target="_blank" rel="noreferrer" variant="outlined" size="small" startIcon={<Download size={16} />}>下载安装</Button> : null}
                            {work.demo ? <Button component="a" href={work.demo} target="_blank" rel="noreferrer" variant="contained" size="small" endIcon={<ExternalLink size={16} />}>在线 Demo</Button> : null}
                          </Stack>
                        </CardContent>
                      </Grid>
                    </Grid>
                  </Card>
                </motion.article>
                <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1}>
                  {portfolioWorks.map((item, index) => (
                    <Chip key={item.title} label={item.title} onClick={() => setPortfolioIndex(index)} className={index === portfolioIndex ? "portfolio-chip active" : "portfolio-chip"} />
                  ))}
                </Stack>
              </>
            ) : (
              <motion.article key={activeArtCategory?.name || "art-empty"} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.42, ease: "easeOut" }}>
                {hasArtPhotos ? (
                  <Stack spacing={2}>
                    <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1}>
                      {artPhotoCategories.map((category, index) => (
                        <Chip
                          key={category.name}
                          label={`${normalizeArtCategoryName(category.name)} · ${category.photos.length}`}
                          onClick={() => setArtCategoryIndex(index)}
                          className={index === safeArtCategoryIndex ? "portfolio-chip active" : "portfolio-chip"}
                        />
                      ))}
                    </Stack>
                    <Card className="glass-card portfolio-card art-matrix-shell">
                      <Grid container>
                        <Grid size={{ xs: 12, md: 7 }}>
                          {artLeadPhoto ? <img src={artLeadPhoto} alt={normalizeArtCategoryName(activeArtCategory.name)} loading="lazy" decoding="async" className="portfolio-image portfolio-image-large art-lead-image" /> : null}
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }}>
                          <CardContent className="portfolio-content">
                            <Typography variant="overline" className="art-matrix-kicker">Art Matrix / 艺术摄影</Typography>
                            <Typography variant="h4">{normalizeArtCategoryName(activeArtCategory.name)}</Typography>
                            <Box className="art-copy-block">
                              <Stack direction="row" justifyContent="space-between" alignItems="center" className="art-copy-header">
                                <Typography variant="caption" className="art-copy-label">随机艺术文案</Typography>
                                <Typography variant="caption" className="art-copy-code">{frameCode}</Typography>
                              </Stack>
                              <Typography className="art-copy-text">{artCopy}</Typography>
                              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" className="art-copy-meta">
                                <Chip label={curatorMeta} size="small" variant="outlined" />
                                <Chip label={`分类 ${safeArtCategoryIndex + 1}/${artPhotoCategories.length}`} size="small" variant="outlined" />
                              </Stack>
                            </Box>
                            <Stack direction="row" spacing={1} sx={{ mt: 2.5 }}>
                              <Chip label={`总计 ${activeArtCategory.photos.length} 张`} size="small" variant="outlined" />
                              {activeArtPhotos.length > 0 ? <Chip label={`第 ${safeArtPhotoIndex + 1} 张`} size="small" variant="outlined" /> : null}
                            </Stack>
                          </CardContent>
                        </Grid>
                      </Grid>
                    </Card>
                    <Box className="art-matrix-grid">
                      {visibleArtPhotos.map((photo, index) => {
                        return (
                          <motion.figure
                            key={`${activeArtCategory.name}-${photo}`}
                            className={index === safeArtPhotoIndex ? "art-photo-tile active" : "art-photo-tile"}
                            style={{ "--tile-tilt": `${((index % 3) - 1) * 0.35}deg` }}
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.28), ease: "easeOut" }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            onMouseEnter={() => handleArtTileHover(index)}
                            onFocus={() => handleArtTileHover(index)}
                            onClick={() => setArtPhotoIndex(index)}
                          >
                            <img src={photo} alt={`${normalizeArtCategoryName(activeArtCategory.name)}-${index + 1}`} loading="lazy" decoding="async" className="art-photo-image" />
                            <Box component="figcaption" className="art-photo-caption">FRAME {String(index + 1).padStart(2, "0")}</Box>
                          </motion.figure>
                        );
                      })}
                    </Box>
                    {canLoadMoreArtPhotos ? (
                      <Stack direction="row" justifyContent="center" sx={{ mt: 1.25 }}>
                        <Button variant="outlined" onClick={() => setArtVisibleCount((current) => current + ART_INITIAL_VISIBLE_COUNT)}>
                          加载更多（剩余 {activeArtPhotos.length - artVisibleCount} 张）
                        </Button>
                      </Stack>
                    ) : null}
                  </Stack>
                ) : (
                  <Card className="glass-card portfolio-card">
                    <CardContent>
                      <Typography variant="h5">艺术矩阵尚未检测到作品</Typography>
                      <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                        请将摄影作品放入 <code>/public/art/分类名/</code> 目录，例如：
                        <code> /public/art/street/001.webp </code>。
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </motion.article>
            )}
          </Stack>
        );
      },
    },
    {
      id: "blog",
      eyebrow: "Blog Tweets",
      title: "博客推文",
      icon: <BookOpenText size={18} />,
      render: () => (
        <Grid container spacing={2.5}>
          {blogPosts.map((post, index) => (
            <Grid key={post.title} size={{ xs: 12, md: 6 }}>
              <motion.div
                className="tweet-card-wrap"
                initial={false}
                animate={activeIndex === blogSectionIndex ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0.76, y: 28, scale: 0.975 }}
                transition={{ duration: 0.48, delay: index * 0.08, ease: "easeOut" }}
                whileHover={{ y: -8 }}
              >
                <Card className="glass-card tweet-card">
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar src={digitalIdentity.avatar || undefined} className="tweet-avatar">{digitalIdentity.avatarFallback}</Avatar>
                        <Box>
                          <Typography variant="body1">CsFan</Typography>
                          <Typography variant="caption" color="text.secondary">@{post.handle}</Typography>
                        </Box>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">{post.date}</Typography>
                    </Stack>
                    <Typography sx={{ mt: 2, lineHeight: 1.9 }}>{post.description}</Typography>
                    <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{ mt: 2 }}>
                      {post.tags.map((tag) => <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" />)}
                    </Stack>
                    <Button href={post.url} target="_blank" sx={{ mt: 2 }} rel="noreferrer" endIcon={<ExternalLink size={16} />}>阅读原文</Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      ),
    },
    {
      id: "contact",
      eyebrow: "Contact",
      title: "联系信息",
      icon: <Mail size={18} />,
      render: () => (
        <Stack spacing={3}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card className="glass-card about-card">
                <CardContent>
                  <Stack spacing={2.2}>
                    <ContactLine icon={<Mail size={18} />} label="邮箱" value={contactConfig.email} href={`mailto:${contactConfig.email}`} />
                    <ContactLine icon={<Github size={18} />} label="GitHub" value={contactConfig.github} href={contactConfig.github} />
                    <ContactLine icon={<Globe size={18} />} label="博客" value={contactConfig.blog} href={contactConfig.blog} />
                    <ContactLine icon={<Phone size={18} />} label="电话" value={contactConfig.phone || "未公开"} />
                    <ContactLine icon={<MapPinned size={18} />} label="所在地" value={contactConfig.location} />
                    <ContactLine icon={<GraduationCap size={18} />} label="当前状态" value={contactConfig.status} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card className="glass-card contact-card">
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>直接发送消息</Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>欢迎直接留下你的联系方式与沟通意向，我会通过邮件尽快回复。</Typography>
                  <Stack spacing={2}>
                    <TextField label="你的姓名" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} fullWidth />
                    <TextField label="你的公司" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} fullWidth />
                    <TextField label="邮件主题" value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} fullWidth />
                    <TextField label="消息内容" multiline minRows={5} value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} fullWidth />
                    <Button variant="contained" startIcon={<Send size={18} />} onClick={sendMessage}>发送消息</Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Box className="site-copyright">
            <Typography variant="caption" color="text.secondary">
              © {siteMeta.copyrightRange} {siteMeta.copyrightOwner}. All rights reserved.
              <Box component="span" className="site-counter">
                {" · "}PV {busuanziStats.pv}
              </Box>
              <Box component="span" className="site-counter">
                {" · "}UV {busuanziStats.uv}
              </Box>
            </Typography>
          </Box>
        </Stack>
      ),
    },
  ];

  return (
    <Box className="app-shell">
      {!unlocked && (
        <Box className="terminal-overlay">
          <motion.div className="terminal-window" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <Box className="terminal-head">
              <Box className="window-dots"><span className="dot red" /><span className="dot yellow" /><span className="dot green" /></Box>
              <Typography className="terminal-title">{terminalConfig.title}</Typography>
            </Box>
            <Box className="terminal-body">
              <Typography component="pre" className="terminal-output">{terminalText}</Typography>
              <Alert severity="info" variant="outlined" className="terminal-alert">系统启动完成后将自动进入首页。</Alert>
            </Box>
          </motion.div>
        </Box>
      )}
      <AppBar position="fixed" color="transparent" elevation={0} className="site-nav">
        <Box className="toolbar">
          <Box>
            <Typography variant="h6" className="brand brand-wordmark">{siteMeta.brand}</Typography>
            <Typography variant="caption" color="text.secondary" className="brand-subtitle">Flow-driven portfolio resume</Typography>
          </Box>
          <Stack direction="row" spacing={0.8} className="theme-switch" aria-label="主题切换">
            <Button variant={themeMode === "system" ? "contained" : "outlined"} size="small" className="theme-switch-btn" onClick={() => setThemeMode("system")} aria-label="跟随系统主题" title="跟随系统主题">
              <MonitorCog size={14} />
            </Button>
            <Button variant={themeMode === "light" ? "contained" : "outlined"} size="small" className="theme-switch-btn" onClick={() => setThemeMode("light")} aria-label="浅色主题" title="浅色主题">
              <Sun size={14} />
            </Button>
            <Button variant={themeMode === "dark" ? "contained" : "outlined"} size="small" className="theme-switch-btn" onClick={() => setThemeMode("dark")} aria-label="深色主题" title="深色主题">
              <MoonStar size={14} />
            </Button>
          </Stack>
          <Stack direction="row" spacing={1} className="nav-actions">
            {sectionMenus.map((menu, index) => (
              <Button key={menu.id} onClick={() => navigateTo(index)} color={activeIndex === index ? "primary" : "inherit"} className={activeIndex === index ? "nav-button-active" : ""}>
                {menu.label}
              </Button>
            ))}
          </Stack>
        </Box>
      </AppBar>

      <Box className="page-glow" />
      {unlocked ? (
        <>
          <Box className="side-hint" aria-hidden="true">SCROLL / 探索更多</Box>
          <WarpTunnel />
          <HeroScene />
          <DotGrid />
        </>
      ) : null}

      <AnimatePresence>
        {unlocked && showPosterGeneratingModal ? (
          <motion.div className="share-poster-generating-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="share-poster-generating-panel" initial={{ opacity: 0, y: 22, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 14, scale: 0.97 }} transition={{ duration: 0.24, ease: "easeOut" }}>
              <Box className="poster-loader-ring" />
              <Typography variant="h6" sx={{ mt: 2 }}>正在生成分享海报</Typography>
              <Typography color="text.secondary" sx={{ mt: 1.2 }}>请稍等片刻，海报会自动弹出预览。生成过程中你也可以按 ESC 关闭提示窗。</Typography>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {unlocked && (
        <>
          <AnimatePresence>
            {sharePosterPreview ? (
              <motion.div className="share-poster-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div className="share-poster-modal-shell" initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 14, scale: 0.97 }} transition={{ duration: 0.26, ease: "easeOut" }}>
                  <Card className="glass-card share-poster-modal-card">
                    <CardContent>
                      <Stack direction={{ xs: "column", md: "row" }} spacing={2.2} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
                        <Box>
                          <Typography variant="h5">分享海报预览</Typography>
                          <Typography color="text.secondary">网站：https://alleyf.github.io/Flowfolio</Typography>
                          <Typography variant="caption" color="text.secondary">生成时间：{sharePosterGeneratedAt}</Typography>
                        </Box>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                          <Button variant="contained" onClick={handleCopyPosterImage}>复制海报图片</Button>
                          <Button variant="outlined" onClick={handleDownloadPosterImage}>下载海报</Button>
                          <Button variant="text" onClick={closeSharePosterPreview}>关闭</Button>
                        </Stack>
                      </Stack>
                      <Box className="share-poster-preview-wrap">
                        <img src={sharePosterPreview} alt="分享海报预览" className="share-poster-preview-image" />
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <Box className="scroll-indicator-rail">
            {sectionMenus.map((menu, index) => (
              <button key={menu.id} type="button" onClick={() => navigateTo(index)} className={activeIndex === index ? "rail-dot active" : "rail-dot"} aria-label={menu.label} />
            ))}
          </Box>

          <Box className="slide-status">
            <Chip label={`第 ${activeIndex + 1} / ${sectionMenus.length} 页`} className="status-chip" />
            <Typography variant="caption" color="text.secondary">{isTransitioning ? "正在切换页面..." : "滚轮 / 方向键 / 触控切换"}</Typography>
          </Box>

          <Box className="slides-viewport">
            <Box className="slides-track" sx={{ transform: `translate3d(0, -${activeIndex * 100}vh, 0)` }}>
              {sectionNodes.map((section, index) => (
                <Box key={section.id} className="slide-shell">
                  <Container maxWidth="lg" className="slide-frame">
                    {loadedIndexes.has(index) ? (
                      <SectionShell id={section.id} eyebrow={section.eyebrow} title={section.title} icon={section.icon} active={activeIndex === index} align={index % 2 === 1 ? "right" : "left"}>
                        {section.render()}
                      </SectionShell>
                    ) : (
                      <Card className="glass-card loading-card">
                        <CardContent>
                          <Typography variant="overline">Lazy Section</Typography>
                          <Typography variant="h4" sx={{ mt: 1.5 }}>内容加载中</Typography>
                          <Typography color="text.secondary" sx={{ mt: 1.5 }}>请继续浏览下一屏内容。</Typography>
                        </CardContent>
                      </Card>
                    )}
                  </Container>
                </Box>
              ))}
            </Box>
          </Box>

          <Box ref={toolboxRef} className={toolboxOpen ? "floating-toolbox open" : "floating-toolbox"}>
            <AnimatePresence>
              {toolboxOpen && (
                <motion.div className="floating-toolbox-panel" initial={{ opacity: 0, y: 14, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.94 }} transition={{ duration: 0.2 }}>
                  <Button className="toolbox-action" variant="outlined" onClick={() => navigateTo(0)} aria-label="回到顶部" title="回到顶部">
                    <ChevronUp size={18} />
                  </Button>
                  <Button className="toolbox-action" variant="outlined" onClick={() => navigateTo(Math.min(activeIndex + 1, sectionMenus.length - 1))} aria-label="下一页" title="下一页">
                    <ChevronDown size={18} />
                  </Button>
                  <Button className={liked ? "toolbox-action active-like" : "toolbox-action"} variant="outlined" onClick={() => setLiked((current) => !current)} aria-label={liked ? "取消点赞" : "点赞"} title={liked ? "取消点赞" : "点赞"}>
                    <Heart size={18} fill={liked ? "currentColor" : "none"} />
                  </Button>
                  <Button className={isGeneratingPoster ? "toolbox-action active-share" : "toolbox-action"} variant="outlined" onClick={generateSharePoster} aria-label="生成分享海报" title="生成分享海报" disabled={isGeneratingPoster}>
                    <Share2 size={18} />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            <Button className="toolbox-trigger" variant="contained" onClick={() => setToolboxOpen((current) => !current)} aria-label={toolboxOpen ? "收起工具箱" : "打开工具箱"} title={toolboxOpen ? "收起工具箱" : "打开工具箱"}>
              <Wrench size={18} />
            </Button>
          </Box>

          <Box className="site-counter-fixed" aria-label="站点访问统计">
            <Typography variant="caption">PV {busuanziStats.pv} · UV {busuanziStats.uv}</Typography>
          </Box>
        </>
      )}
    </Box>
  );
}
