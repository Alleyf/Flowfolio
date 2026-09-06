import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Sparkles, Camera, Shuffle } from "lucide-react";
import { portfolioWorks } from "../../config/siteConfig";
import {
  artPhotoCategories,
  artCopyPool,
  artCuratorMetaPool,
  normalizeArtCategoryName,
} from "../artData";

/* SCENE 06 / WORK MATRIX — two modes, like the original site:
   · works — horizontal filmstrip of all 9 works on scroll progress
   · art   — Art Matrix: the same horizontal grammar, one photo per
     frame; wheel/swipe turns the strip, boundaries hand back to the
     engine so scrolling on keeps you travelling between scenes.
   Click a work opens the fullscreen viewer. Full data kept. */

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function ArtMatrix({ artRef }) {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [copyOffset, setCopyOffset] = useState(0);
  const indexRef = useRef(0);
  const lockRef = useRef(0);
  const accRef = useRef(0);
  const touchRef = useRef(null);
  const touchAccRef = useRef(0);

  const hasArt = artPhotoCategories.length > 0;
  const category = hasArt ? artPhotoCategories[categoryIndex % artPhotoCategories.length] : null;
  const photos = category?.photos ?? [];
  const count = photos.length;
  const curator = artCuratorMetaPool[(categoryIndex + photoIndex) % artCuratorMetaPool.length];
  /* each frame gets its own caption from the pool, stable per photo */
  const copyFor = (i) => artCopyPool[(i + copyOffset) % artCopyPool.length];

  useEffect(() => {
    indexRef.current = photoIndex;
  }, [photoIndex]);

  const step = (dir) => {
    setPhotoIndex((p) => clamp(p + dir, 0, count - 1));
  };

  /* wheel — one photo per flick; at either end the event is handed
     back to the engine so the visit flows on into the next scene.
     Listened on window CAPTURE (gated by composedPath) so events that
     target chrome outside the art root (mode chips, rail…) are still
     caught before the engine's own window listener consumes them. */
  useEffect(() => {
    if (!hasArt) return undefined;
    const root = artRef.current;
    if (!root) return undefined;
    const inside = (e) => e.composedPath().includes(root);
    const onWheel = (e) => {
      if (!inside(e)) return;
      const delta = e.deltaY * (e.deltaMode === 1 ? 16 : 1);
      if (Math.abs(delta) < 2) return;
      const now = performance.now();
      const locked = now < lockRef.current;
      accRef.current = clamp(accRef.current + delta, -160, 160);
      const atStart = indexRef.current === 0 && accRef.current < 0;
      const atEnd = indexRef.current === count - 1 && accRef.current > 0;
      if (!locked && (atStart || atEnd)) return; // engine takes over
      e.stopPropagation();
      if (locked) return;
      if (Math.abs(accRef.current) >= 90) {
        const dir = accRef.current > 0 ? 1 : -1;
        accRef.current = 0;
        lockRef.current = now + 620;
        step(dir);
      }
    };
    window.addEventListener("wheel", onWheel, { capture: true, passive: true });

    /* touch swipe turns frames the same way */
    const onTouchStart = (e) => {
      if (!inside(e)) return;
      touchRef.current = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      if (!inside(e) || touchRef.current === null) return;
      const y = e.touches[0].clientY;
      touchAccRef.current += touchRef.current - y;
      touchRef.current = y;
      e.stopPropagation();
    };
    const onTouchEnd = () => {
      if (Math.abs(touchAccRef.current) > 50) {
        step(touchAccRef.current > 0 ? 1 : -1);
      }
      touchRef.current = null;
      touchAccRef.current = 0;
    };
    window.addEventListener("touchstart", onTouchStart, { capture: true, passive: true });
    window.addEventListener("touchmove", onTouchMove, { capture: true, passive: true });
    window.addEventListener("touchend", onTouchEnd, { capture: true, passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart, { capture: true });
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
      window.removeEventListener("touchend", onTouchEnd, { capture: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasArt, count]);

  if (!hasArt) {
    return (
      <div className="art-empty rv-in">
        <h3>艺术矩阵尚未检测到作品</h3>
        <p className="mono">
          请将摄影作品放入 /public/art/分类名/ 目录，例如 /public/art/street/001.webp
        </p>
      </div>
    );
  }

  return (
    <div className="art-matrix" ref={artRef}>
      <div className="art-cats rv-in" role="tablist" aria-label="艺术分类">
        {artPhotoCategories.map((cat, i) => (
          <button
            key={cat.name}
            type="button"
            className={i === categoryIndex ? "art-cat-chip active mono" : "art-cat-chip mono"}
            onClick={() => {
              setCategoryIndex(i);
              setPhotoIndex(0);
            }}
          >
            {normalizeArtCategoryName(cat.name)} · {cat.photos.length}
          </button>
        ))}
      </div>

      <div className="art-stage">
        <div
          className="art-strip"
          style={{ transform: `translate3d(${(-photoIndex * 100).toFixed(2)}%, 0, 0)` }}
        >
          {photos.map((photo, i) => (
            <div className="art-slide" key={`${category.name}-${photo}`}>
              <figure className="art-lead" data-cursor="FRAME">
                <img
                  src={photo}
                  alt={`${normalizeArtCategoryName(category.name)} ${i + 1}`}
                  loading={i < 2 ? "eager" : "lazy"}
                />
                <figcaption className="mono">
                  {frameCodeOf(categoryIndex, i)} — {normalizeArtCategoryName(category.name)}
                </figcaption>
              </figure>
              <aside className="art-panel">
                <div className="art-kicker mono">Art Matrix / 艺术摄影</div>
                <h3 className="art-cat">{normalizeArtCategoryName(category.name)}</h3>
                <div className="art-copy">
                  <div className="art-copy-head mono">
                    <span>随机艺术文案</span>
                    <button
                      type="button"
                      className="art-shuffle"
                      onClick={() => setCopyOffset((o) => o + 1 + Math.floor(Math.random() * 3))}
                      aria-label="换一句"
                      data-cursor="SHUFFLE"
                    >
                      <Shuffle size={13} /> 换一句
                    </button>
                  </div>
                  <p className="art-copy-text">「{copyFor(i)}」</p>
                  <div className="art-copy-meta mono">
                    <span>{curator}</span>
                    <span>
                      分类 {categoryIndex + 1}/{artPhotoCategories.length}
                    </span>
                    <span>
                      {String(i + 1).padStart(2, "0")} — {String(count).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </aside>
            </div>
          ))}
        </div>
      </div>

      <div className="art-hint mono rv-in">
        <span className="art-count">
          {String(photoIndex + 1).padStart(2, "0")} — {String(count).padStart(2, "0")}
        </span>
        SCROLL TO TURN THE FRAMES →
      </div>
    </div>
  );
}

const frameCodeOf = (cat, i) =>
  `ART-${String(cat + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;

export default function WorksScene({ refCb, stripRef, innerRef, viewerOpenRef }) {
  const [viewer, setViewer] = useState(null);
  const [mode, setMode] = useState("works");
  const artRef = useRef(null);

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

      <div className="works-mode rv" data-th="0.06" role="tablist" aria-label="作品模式切换">
        <button
          type="button"
          className={mode === "works" ? "mode-chip active mono" : "mode-chip mono"}
          onClick={() => setMode("works")}
        >
          <Sparkles size={13} /> 作品矩阵
        </button>
        <button
          type="button"
          className={mode === "art" ? "mode-chip active mono" : "mode-chip mono"}
          onClick={() => setMode("art")}
        >
          <Camera size={13} /> 艺术矩阵
        </button>
      </div>

      {mode === "works" ? (
        <>
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
        </>
      ) : (
        <ArtMatrix artRef={artRef} />
      )}

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
