import { useEffect, useRef, useState } from "react";

/* SCENE 00 / BOOT — pure black terminal intro, ~2.5s + logo beat, skippable */

const LINES = [
  "INITIALIZING FLOWFOLIO",
  "LOADING PROFILE",
  "CONNECTING ARCHIVE",
  "RENDERING DIGITAL TWIN",
  "READY",
];

export default function BootOverlay({ onDone, glApiRef }) {
  const [phase, setPhase] = useState("lines"); // lines -> logo -> out
  const [progress, setProgress] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);
  const cleanupRef = useRef(null);
  const doneRef = useRef(false);

  useEffect(() => {
    const timers = [];
    const start = performance.now();

    LINES.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), 140 + i * 300));
    });

    const iv = setInterval(() => {
      const elapsed = performance.now() - start;
      const p = Math.min(1, elapsed / 2000);
      setProgress(Math.round(p * 100));
      glApiRef.current?.setReveal(p * 1.05);
      if (p >= 1) clearInterval(iv);
    }, 40);

    timers.push(setTimeout(() => setPhase("logo"), 2150));
    timers.push(
      setTimeout(() => {
        setPhase("out");
        glApiRef.current?.setReveal(1);
      }, 3050)
    );

    const finishTimer = setTimeout(finish, 3700);

    function finish() {
      if (doneRef.current) return;
      doneRef.current = true;
      onDone?.();
    }

    cleanupRef.current = () => {
      timers.forEach(clearTimeout);
      clearInterval(iv);
      clearTimeout(finishTimer);
    };

    return () => cleanupRef.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skip = () => {
    if (doneRef.current) return;
    cleanupRef.current?.();
    glApiRef.current?.setReveal(1);
    setPhase("out");
    setTimeout(onDone, 420);
  };

  const bar = "█".repeat(Math.max(1, Math.round((progress / 100) * 10))).padEnd(10, "░");

  return (
    <div className={`boot boot-${phase}`} aria-label="loading">
      <div className="boot-log" aria-hidden="true">
        {LINES.slice(0, visibleLines).map((l) => (
          <div key={l} className="boot-line">
            <span className="boot-caret">›</span> {l}
          </div>
        ))}
      </div>
      <div className="boot-progress" aria-hidden="true">
        <div className="boot-pct mono">{progress}%</div>
        <div className="boot-bar mono">{bar}</div>
        <div className="boot-sub mono">LOADING DIGITAL IDENTITY</div>
      </div>
      <div className="boot-logo" aria-hidden="true">
        FLOWFOLIO<span>®</span>
      </div>
      <button type="button" className="boot-skip mono" onClick={skip}>
        SKIP INTRO
      </button>
    </div>
  );
}
