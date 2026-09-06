import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { portfolioWorks } from "../../config/siteConfig";

/* SCENE 06 / WORK MATRIX — horizontal filmstrip of all 9 works, driven
   continuously by local scroll progress. Click opens fullscreen viewer.
   Full data: subtitle / kind / summary / highlights / stack / links. */

export default function WorksScene({ refCb, stripRef, innerRef, viewerOpenRef }) {
  const [viewer, setViewer] = useState(null);

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
    <section className="scene scene-works" ref={refCb} data-scene="works">
      <div className="scene-kicker rv works-kicker" data-th="0.02">
        <i className="kicker-tick" />
        06 / WORK MATRIX
      </div>

      <div className="works-viewport" ref={innerRef}>
        <div className="works-strip" ref={stripRef}>
          {portfolioWorks.map((w, i) => (
            <figure
              key={w.title}
              className="work-panel"
              onClick={() => setViewer(i)}
              data-cursor="VIEW"
            >
              <div className="wp-media">
                <img src={w.image} alt={w.title} loading="lazy" />
              </div>
              <figcaption>
                <div className="wp-head">
                  <span className="work-idx mono">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="wp-title">{w.title}</h3>
                  <span className="work-kind mono">{w.kind}</span>
                </div>
                <p className="wp-sub mono">{w.subtitle}</p>
                <p className="wp-summary">{w.summary}</p>
                <ul className="wp-highlights">
                  {w.highlights.map((h) => (
                    <li key={h.slice(0, 14)}>{h}</li>
                  ))}
                </ul>
                <div className="wp-foot">
                  <p className="wp-stack mono">{w.stack.join(" · ")}</p>
                  <div className="wp-links mono">
                    {w.demo && (
                      <a href={w.demo} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                        DEMO →
                      </a>
                    )}
                    {w.downloadUrl && (
                      <a href={w.downloadUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                        DOWNLOAD →
                      </a>
                    )}
                    {w.repo && (
                      <a href={w.repo} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                        REPO →
                      </a>
                    )}
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="works-hint mono rv" data-th="0.1">
        {String(portfolioWorks.length).padStart(2, "0")} WORKS — SCROLL TO DRAG THE STRIP →
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
