import { useCallback, useEffect, useRef, useState } from "react";
import SceneCanvas from "./SceneCanvas";
import Cursor from "./Cursor";
import BootOverlay from "./sections/BootOverlay";
import ProfileScene from "./sections/ProfileScene";
import EducationScene from "./sections/EducationScene";
import ExperienceScene from "./sections/ExperienceScene";
import SkillsScene from "./sections/SkillsScene";
import ProjectsScene from "./sections/ProjectsScene";
import WorksScene from "./sections/WorksScene";
import WritingScene from "./sections/WritingScene";
import ContactScene from "./sections/ContactScene";
import { SCENES, TOTAL, sceneAt } from "./scenes";
import { contactConfig, projectExperiences } from "../config/siteConfig";

/* ------------------------------------------------------------------ */
/* CinematicApp — continuous scroll-driven stage                       */
/* Scenes EXIT first (blur + rise + scale = depth-of-field), then the  */
/* incoming scene arrives late — the boundary reads as a cut, not a    */
/* double exposure. A chapter wipe sweeps across each cut. Scroll      */
/* velocity feeds the WebGL stage (dolly/roll/streaks).                */
/* ------------------------------------------------------------------ */

const WHEEL_SPEED = 0.00135; // progress units per deltaY px
const TOUCH_SPEED = 0.0042;
const FADE_OUT = 0.22; // outgoing scene dissolve zone (exits fast, blurred)
const FADE_IN = 0.34; // incoming scene arrival zone (starts late)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export default function CinematicApp() {
  const [booted, setBooted] = useState(false);
  const [active, setActive] = useState(0);
  const [wipe, setWipe] = useState(null);

  const glApiRef = useRef(null);
  const targetRef = useRef(SCENES[0].w * 0.5); // start mid-profile so hero is revealed
  const bootedRef = useRef(false);
  const viewerOpenRef = useRef(false);
  const rootRef = useRef(null);
  const scrolledRef = useRef(false);

  const sceneElsRef = useRef([]); // scene root elements
  const rvRef = useRef({}); // sceneIdx -> [{el, th}]
  const projTrackRef = useRef(null);
  const projCounterRef = useRef(null);
  const worksStripRef = useRef(null);
  const worksInnerRef = useRef(null);
  const progressBarRef = useRef(null);
  const activeRef = useRef(0);

  /* pointer position (-1..1) for DOM parallax */
  const pointerRef = useRef({ x: 0, y: 0 });

  const setSceneEl = useCallback((i) => (el) => {
    sceneElsRef.current[i] = el;
  }, []);

  /* register .rv threshold elements once scenes are mounted */
  useEffect(() => {
    const map = {};
    sceneElsRef.current.forEach((el, i) => {
      if (!el) return;
      map[i] = Array.from(el.querySelectorAll(".rv")).map((node) => ({
        el: node,
        th: parseFloat(node.dataset.th || "0.05"),
      }));
    });
    rvRef.current = map;
  }, []);

  /* ------------------------- the film loop ------------------------- */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let cur = targetRef.current;
    let velSm = 0;

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const target = targetRef.current;
      const prev = cur;
      cur += (target - cur) * (1 - Math.pow(0.0035, dt));
      if (Math.abs(target - cur) < 0.0004) cur = target;
      glApiRef.current?.setProgress(cur);

      /* smoothed scroll velocity -> feeds the WebGL stage */
      const rawVel = (cur - prev) / Math.max(dt, 0.001);
      velSm += (rawVel - velSm) * Math.min(1, dt * 7);
      glApiRef.current?.setVelocity(velSm);

      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const ptr = pointerRef.current;

      /* per-scene staggered exit / late arrival */
      for (let i = 0; i < SCENES.length; i++) {
        const el = sceneElsRef.current[i];
        if (!el) continue;
        const s = SCENES[i].start;
        const w = SCENES[i].w;
        const d = cur - s;
        const drift = -(d - w / 2) * 10;
        let op = 0;
        let ty = 0;
        let tx = 0;
        let sc = 1;
        let blur = 0;
        let vis = false;

        if (d >= -FADE_IN && d <= w + FADE_OUT) {
          vis = true;
          if (d < 0) {
            /* incoming — arrives late, rises from below, de-blurs */
            const e = clamp((d + FADE_IN) / FADE_IN, 0, 1);
            const eo = clamp((e - 0.42) / 0.58, 0, 1);
            op = eo;
            ty = drift + (1 - e) * 110;
            sc = 0.975 + e * 0.025;
            blur = (1 - e) * 7;
          } else if (d > w) {
            /* outgoing — exits first: rises, blurs, grows */
            const e = clamp((d - w) / FADE_OUT, 0, 1);
            op = 1 - e;
            ty = drift + e * 150;
            sc = 1 + e * 0.045;
            blur = e * 12;
          } else {
            op = 1;
            ty = drift;
          }
        }

        /* gentle pointer parallax, alternating direction per scene */
        tx = ptr.x * (i % 2 === 0 ? 10 : -14);
        ty += ptr.y * (i % 2 === 0 ? 6 : -8);

        el.style.opacity = op.toFixed(3);
        el.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${sc.toFixed(4)})`;
        el.style.filter = blur > 0.15 ? `blur(${blur.toFixed(1)}px)` : "none";
        el.style.visibility = vis ? "visible" : "hidden";
        el.style.pointerEvents = op > 0.55 ? "auto" : "none";

        if (vis) {
          const lpN = clamp(d, 0, w) / w; // normalized local progress
          const rvs = rvRef.current[i];
          if (rvs) {
            for (let j = 0; j < rvs.length; j++) {
              const on = lpN >= rvs[j].th;
              if (on !== rvs[j].on) {
                rvs[j].on = on;
                rvs[j].el.classList.toggle("on", on);
              }
            }
          }
        }
      }

      /* projects horizontal track — continuous with local progress */
      const ps = SCENES[4];
      if (projTrackRef.current) {
        const lp = clamp(cur - ps.start, 0, ps.w);
        const t = lp / ps.w;
        const shift = -(projectExperiencesCount - 1) * t * vw;
        projTrackRef.current.style.transform = `translate3d(${shift.toFixed(1)}px, 0, 0)`;
        if (projCounterRef.current) {
          projCounterRef.current.textContent =
            String(clamp(Math.round(lp) + 1, 1, projectExperiencesCount)).padStart(2, "0") +
            " — 04";
        }
      }

      /* works filmstrip — continuous horizontal drift */
      const ws = SCENES[5];
      if (worksStripRef.current && worksInnerRef.current) {
        const lp = clamp(cur - ws.start, 0, ws.w);
        const t = lp / ws.w;
        const max = Math.max(
          0,
          worksStripRef.current.scrollWidth - worksInnerRef.current.clientWidth
        );
        worksStripRef.current.style.transform = `translate3d(${(-t * max).toFixed(1)}px, 0, 0)`;
      }

      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${clamp(cur / TOTAL, 0, 1).toFixed(4)})`;
      }

      const a = sceneAt(cur);
      if (a !== activeRef.current) {
        activeRef.current = a;
        setActive(a);
        if (bootedRef.current) setWipe({ idx: a, key: now });
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ---------------------------- input ------------------------------ */
  const addProgress = useCallback((delta) => {
    if (!bootedRef.current || viewerOpenRef.current) return;
    targetRef.current = clamp(targetRef.current + delta, 0, TOTAL);
    if (!scrolledRef.current && rootRef.current) {
      scrolledRef.current = true;
      rootRef.current.classList.add("is-scrolled");
    }
  }, []);

  useEffect(() => {
    bootedRef.current = booted;
  }, [booted]);

  /* rail click — glide to the scene through intermediate film frames;
     land late enough in the span that staged content is fully revealed */
  const goToScene = useCallback((i) => {
    if (!bootedRef.current) return;
    const s = SCENES[i];
    targetRef.current = clamp(s.start + s.w * (s.jump ?? 0.92), 0, TOTAL);
  }, []);

  /* pointer tracking (DOM parallax) + click pulse (vignette + GL shockwave) */
  useEffect(() => {
    const onPointerMove = (e) => {
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    let pulseTimer = 0;
    const onPointerDown = (e) => {
      glApiRef.current?.pulse(e.clientX, e.clientY);
      const root = rootRef.current;
      if (!root) return;
      root.style.setProperty("--pulse-x", `${((e.clientX / window.innerWidth) * 100).toFixed(1)}%`);
      root.style.setProperty("--pulse-y", `${((e.clientY / window.innerHeight) * 100).toFixed(1)}%`);
      root.classList.remove("is-pulse");
      void root.offsetWidth; // restart animation
      root.classList.add("is-pulse");
      clearTimeout(pulseTimer);
      pulseTimer = setTimeout(() => root.classList.remove("is-pulse"), 700);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      clearTimeout(pulseTimer);
    };
  }, []);

  useEffect(() => {
    const onWheel = (e) => {
      if (!bootedRef.current || viewerOpenRef.current) return;
      e.preventDefault();
      const delta = e.deltaY * (e.deltaMode === 1 ? 16 : 1);
      if (Math.abs(delta) < 2) return;
      addProgress(delta * WHEEL_SPEED);
    };

    const onKeyDown = (e) => {
      if (!bootedRef.current || viewerOpenRef.current) return;
      const k = e.key;
      if (k === "ArrowDown" || k === "PageDown" || k === " ") {
        e.preventDefault();
        addProgress(1);
      } else if (k === "ArrowUp" || k === "PageUp") {
        e.preventDefault();
        addProgress(-1);
      } else if (k === "ArrowRight") {
        e.preventDefault();
        goToScene(Math.min(SCENES.length - 1, activeRef.current + 1));
      } else if (k === "ArrowLeft") {
        e.preventDefault();
        goToScene(Math.max(0, activeRef.current - 1));
      } else if (k === "Home") {
        e.preventDefault();
        addProgress(-TOTAL);
      } else if (k === "End") {
        e.preventDefault();
        addProgress(TOTAL);
      } else if (/^[1-8]$/.test(k)) {
        goToScene(Number(k) - 1);
      }
    };

    let touchY = null;
    const onTouchStart = (e) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      if (!bootedRef.current || viewerOpenRef.current || touchY === null) return;
      e.preventDefault();
      const y = e.touches[0].clientY;
      addProgress((touchY - y) * TOUCH_SPEED);
      touchY = y;
    };
    const onTouchEnd = () => {
      touchY = null;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [addProgress, goToScene]);

  const activeScene = SCENES[active];

  return (
    <div ref={rootRef} className={`cinema ${booted ? "is-booted" : "is-booting"}`}>
      <SceneCanvas onApi={(api) => (glApiRef.current = api)} />

      {/* every scene stays mounted; the engine fades/drifts them */}
      <main className="stage">
        <ProfileScene refCb={setSceneEl(0)} />
        <EducationScene refCb={setSceneEl(1)} />
        <ExperienceScene refCb={setSceneEl(2)} />
        <SkillsScene refCb={setSceneEl(3)} />
        <ProjectsScene refCb={setSceneEl(4)} trackRef={projTrackRef} counterRef={projCounterRef} />
        <WorksScene
          refCb={setSceneEl(5)}
          stripRef={worksStripRef}
          innerRef={worksInnerRef}
          viewerOpenRef={viewerOpenRef}
        />
        <WritingScene refCb={setSceneEl(6)} />
        <ContactScene refCb={setSceneEl(7)} />
      </main>

      {/* chapter wipe — sweeps across the frame on every scene cut */}
      {wipe && (
        <div
          key={wipe.key}
          className="chapter-wipe mono"
          aria-hidden="true"
          onAnimationEnd={() => setWipe(null)}
        >
          <span className="cw-num">{String(wipe.idx + 1).padStart(2, "0")}</span>
          <span className="cw-name">{SCENES[wipe.idx].en}</span>
        </div>
      )}

      {/* chrome */}
      <header className="chrome chrome-top">
        <button type="button" className="brand mono" onClick={() => goToScene(0)}>
          FLOWFOLIO<span className="accent-text">®</span>
        </button>
        <nav className="top-links mono">
          <a href={contactConfig.github} target="_blank" rel="noreferrer">
            GITHUB
          </a>
          <a href={contactConfig.blog} target="_blank" rel="noreferrer">
            BLOG
          </a>
          <button type="button" onClick={() => goToScene(7)}>
            CONTACT
          </button>
        </nav>
      </header>

      <aside className="scene-index mono" aria-label="章节导航">
        {SCENES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={i === active ? "on" : ""}
            onClick={() => goToScene(i)}
            data-name={s.en}
            aria-label={`${s.en} ${s.cn}`}
          >
            {String(i + 1).padStart(2, "0")}
          </button>
        ))}
      </aside>

      <footer className="chrome chrome-bottom mono">
        <span className="scene-label">
          <b>{String(active + 1).padStart(2, "0")}</b> / {activeScene.en} · {activeScene.cn}
        </span>
        <span className="scroll-hint">
          SCROLL TO EXPLORE <i className="hint-wheel" aria-hidden="true" />
        </span>
      </footer>

      <div className="progress-line" aria-hidden="true">
        <i ref={progressBarRef} />
      </div>

      <div className="grain" aria-hidden="true" />
      <Cursor />

      {!booted && <BootOverlay onDone={() => setBooted(true)} glApiRef={glApiRef} />}
    </div>
  );
}

const projectExperiencesCount = 4;
