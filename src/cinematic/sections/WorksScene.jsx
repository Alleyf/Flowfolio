import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { portfolioWorks } from "../../config/siteConfig";

/* SCENE 06 / WORK MATRIX — asymmetric editorial grid, grayscale→color hover,
   click opens a fullscreen viewer (ESC / ←→ supported) */

/* column spans per item, cycles every 6 to stay asymmetric but balanced */
const SPANS = [7, 5, 5, 7, 5, 5, 7, 5, 7];

export default function WorksScene({ viewerOpenRef }) {
  const [viewer, setViewer] = useState(null); // index | null

  useEffect(() => {
    viewerOpenRef.current = viewer !== null;
    return () => {
      viewerOpenRef.current = false;
    };
  }, [viewer, viewerOpenRef]);

  useEffect(() => {
    if (viewer === null) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setViewer(null);
      if (e.key === "ArrowRight") setViewer((v) => (v + 1) % portfolioWorks.length);
      if (e.key === "ArrowLeft")
        setViewer((v) => (v - 1 + portfolioWorks.length) % portfolioWorks.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewer]);

  return (
    <section className="scene scene-works" data-scene="works">
      <div className="scene-inner works-inner">
        <div className="scene-kicker rv" style={{ "--d": "0.05s" }}>
          <i className="kicker-tick" />
          06 / WORK MATRIX
        </div>

        <div className="works-grid scrollable" tabIndex={0}>
          {portfolioWorks.map((w, i) => (
            <figure
              key={w.title}
              className={`work-cell rv ${SPANS[i % SPANS.length] >= 7 ? "work-big" : "work-small"}`}
              style={{ "--d": `${0.1 + i * 0.06}s`, gridColumn: `span ${SPANS[i % SPANS.length]}` }}
              onClick={() => setViewer(i)}
              data-cursor="VIEW"
            >
              <img src={w.image} alt={w.title} loading="lazy" />
              <figcaption>
                <span className="work-idx mono">{String(i + 1).padStart(2, "0")}</span>
                <span className="work-name">{w.title}</span>
                <span className="work-kind mono">{w.kind}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {viewer !== null && (
        <div className="work-viewer" role="dialog" aria-modal="true" aria-label={portfolioWorks[viewer].title}>
          <button type="button" className="wv-close" onClick={() => setViewer(null)} aria-label="关闭">
            <X size={20} />
          </button>
          <button
            type="button"
            className="wv-arrow wv-prev"
            onClick={() => setViewer((v) => (v - 1 + portfolioWorks.length) % portfolioWorks.length)}
            aria-label="上一张"
          >
            <ChevronLeft size={22} />
          </button>
          <figure className="wv-body">
            <img src={portfolioWorks[viewer].image} alt={portfolioWorks[viewer].title} />
            <figcaption>
              <span className="accent-text">{String(viewer + 1).padStart(2, "0")}</span>
              {"  "}
              {portfolioWorks[viewer].title} — {portfolioWorks[viewer].subtitle}
            </figcaption>
          </figure>
          <button
            type="button"
            className="wv-arrow wv-next"
            onClick={() => setViewer((v) => (v + 1) % portfolioWorks.length)}
            aria-label="下一张"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      )}
    </section>
  );
}
