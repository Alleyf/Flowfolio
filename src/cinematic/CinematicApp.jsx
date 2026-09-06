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
import { contactConfig } from "../config/siteConfig";

/* ------------------------------------------------------------------ */
/* CinematicApp — scene orchestration, chrome, navigation              */
/* wheel / arrow keys / page keys / touch swipe -> scene progression   */
/* ------------------------------------------------------------------ */

const SCENES = [
  { id: "profile", en: "PROFILE", cn: "主页" },
  { id: "education", en: "EDUCATION", cn: "教育背景" },
  { id: "experience", en: "EXPERIENCE", cn: "实习经历" },
  { id: "skills", en: "SKILLS", cn: "个人技能" },
  { id: "projects", en: "PROJECTS", cn: "项目经历" },
  { id: "works", en: "WORK MATRIX", cn: "作品矩阵" },
  { id: "writing", en: "WRITING", cn: "博客推文" },
  { id: "contact", en: "CONTACT", cn: "联系信息" },
];

const SCENE_COUNT = SCENES.length;
const TRANSITION_MS = 1050;
const SUBSTEP_MS = 620;

export default function CinematicApp() {
  const [scene, setScene] = useState(0);
  const [booted, setBooted] = useState(false);
  const [projIndex, setProjIndex] = useState(0);

  const sceneRef = useRef(0);
  const projIndexRef = useRef(0);
  const glApiRef = useRef(null);
  const lockRef = useRef(0);
  const wheelAccumRef = useRef(0);
  const touchYRef = useRef(null);
  const viewerOpenRef = useRef(false);

  projIndexRef.current = projIndex;

  const navigateTo = useCallback((next) => {
    const target = Math.max(0, Math.min(SCENE_COUNT - 1, next));
    const now = performance.now();
    if (now < lockRef.current || target === sceneRef.current) return;
    lockRef.current = now + TRANSITION_MS;
    sceneRef.current = target;
    glApiRef.current?.setScene(target);
    if (target !== 4) setProjIndex(0); // reset project sub-state
    setScene(target);
  }, []);

  /* returns true when the sub-step consumed the input */
  const stepProject = useCallback((dir) => {
    const next = projIndexRef.current + dir;
    if (next < 0 || next > 3) return false;
    if (performance.now() < lockRef.current) return true;
    lockRef.current = performance.now() + SUBSTEP_MS;
    setProjIndex(next);
    return true;
  }, []);

  const go = useCallback(
    (dir) => {
      if (sceneRef.current === 4 && stepProject(dir)) return;
      if (sceneRef.current === 5 && hasScrollSlack(dir)) return;
      navigateTo(sceneRef.current + dir);
    },
    [navigateTo, stepProject]
  );

  /* ------------------------------ input ------------------------------ */

  useEffect(() => {
    const onWheel = (e) => {
      if (!booted || viewerOpenRef.current) return;
      if (Math.abs(e.deltaY) < 6) return;
      const now = performance.now();
      if (now < lockRef.current) {
        e.preventDefault();
        return;
      }
      // works grid keeps native scrolling while it has slack
      if (sceneRef.current === 5 && hasScrollSlack(Math.sign(e.deltaY))) return;
      e.preventDefault();
      // accumulate trackpad micro-scrolls before flipping
      wheelAccumRef.current += e.deltaY;
      if (Math.abs(wheelAccumRef.current) < 36) return;
      const dir = Math.sign(wheelAccumRef.current);
      wheelAccumRef.current = 0;
      go(dir);
    };

    const onKeyDown = (e) => {
      if (!booted || viewerOpenRef.current) return;
      const k = e.key;
      if (k === "ArrowDown" || k === "PageDown" || k === " ") {
        e.preventDefault();
        go(1);
      } else if (k === "ArrowUp" || k === "PageUp") {
        e.preventDefault();
        go(-1);
      } else if (k === "Home") {
        navigateTo(0);
      } else if (k === "End") {
        navigateTo(SCENE_COUNT - 1);
      } else if (k === "ArrowRight" && sceneRef.current === 4) {
        stepProject(1);
      } else if (k === "ArrowLeft" && sceneRef.current === 4) {
        stepProject(-1);
      }
    };

    const onTouchStart = (e) => {
      touchYRef.current = e.touches[0].clientY;
    };
    const onTouchEnd = (e) => {
      if (!booted || viewerOpenRef.current || touchYRef.current === null) return;
      const delta = touchYRef.current - e.changedTouches[0].clientY;
      touchYRef.current = null;
      if (Math.abs(delta) < 48) return;
      if (sceneRef.current === 5 && hasScrollSlack(Math.sign(delta))) return;
      go(Math.sign(delta));
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
  }, [booted, go, navigateTo, stepProject]);

  const active = SCENES[scene];

  return (
    <div className={`cinema ${booted ? "is-booted" : "is-booting"}`}>
      <SceneCanvas onApi={(api) => (glApiRef.current = api)} />

      {/* DOM scene stack — active scene mounts fresh so reveals replay */}
      <main className="stage">
        {scene === 0 && <ProfileScene />}
        {scene === 1 && <EducationScene />}
        {scene === 2 && <ExperienceScene />}
        {scene === 3 && <SkillsScene />}
        {scene === 4 && <ProjectsScene index={projIndex} onStep={stepProject} />}
        {scene === 5 && <WorksScene viewerOpenRef={viewerOpenRef} />}
        {scene === 6 && <WritingScene />}
        {scene === 7 && <ContactScene />}
      </main>

      {/* chrome */}
      <header className="chrome chrome-top">
        <button type="button" className="brand mono" onClick={() => navigateTo(0)}>
          FLOWFOLIO<span className="accent-text">®</span>
        </button>
        <nav className="top-links mono">
          <a href={contactConfig.github} target="_blank" rel="noreferrer">
            GITHUB
          </a>
          <a href={contactConfig.blog} target="_blank" rel="noreferrer">
            BLOG
          </a>
          <button type="button" onClick={() => navigateTo(7)}>
            CONTACT
          </button>
        </nav>
      </header>

      <aside className="scene-index mono" aria-label="章节导航">
        {SCENES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={i === scene ? "on" : ""}
            onClick={() => navigateTo(i)}
            aria-label={`${s.en} ${s.cn}`}
          >
            {String(i + 1).padStart(2, "0")}
          </button>
        ))}
      </aside>

      <footer className="chrome chrome-bottom mono">
        <span className="scene-label">
          <b>{String(scene + 1).padStart(2, "0")}</b> / {active.en} · {active.cn}
        </span>
        <span className="scroll-hint" key={scene}>
          {scene === 0 ? "SCROLL TO EXPLORE ↓" : `SCENE ${String(scene + 1).padStart(2, "0")} / 08`}
        </span>
      </footer>

      <div className="grain" aria-hidden="true" />
      <Cursor />

      {!booted && <BootOverlay onDone={() => setBooted(true)} glApiRef={glApiRef} />}
    </div>
  );
}

/* inner-scroll slack check for the works grid */
function hasScrollSlack(dir = 1) {
  const el = document.querySelector(".scene-works .scrollable");
  if (!el) return false;
  if (dir > 0) return el.scrollTop + el.clientHeight < el.scrollHeight - 4;
  return el.scrollTop > 4;
}
