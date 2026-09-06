import { useEffect, useRef, useState } from "react";

/* Custom cursor — small dot + trailing ring, label inside on data-cursor targets.
   Disabled on coarse pointers. */

export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [label, setLabel] = useState("");
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return undefined;
    setEnabled(true);

    const pos = { x: -100, y: -100 };
    const ring = { x: -100, y: -100 };
    let raf = 0;

    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      }
    };
    const onOver = (e) => {
      const t = e.target.closest("[data-cursor]");
      setLabel(t ? t.dataset.cursor || "VIEW" : "");
      const interactive = e.target.closest("a, button, [data-cursor]");
      ringRef.current?.classList.toggle("is-hover", Boolean(interactive));
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    const loop = () => {
      raf = requestAnimationFrame(loop);
      ring.x += (pos.x - ring.x) * 0.16;
      ring.y += (pos.y - ring.y) * 0.16;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.x}px, ${ring.y}px)`;
      }
    };
    loop();

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div className={`cursor-dot ${pressed ? "is-down" : ""}`} ref={dotRef} aria-hidden="true" />
      <div className={`cursor-ring ${label ? "has-label" : ""} ${pressed ? "is-down" : ""}`} ref={ringRef} aria-hidden="true">
        <span>{label}</span>
      </div>
    </>
  );
}
