import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Sparkles, Camera, Shuffle } from "lucide-react";
import { portfolioWorks } from "../../config/siteConfig";
import {
  artPhotoCategories,
  artCopyPool,
  artCuratorMetaPool,
  normalizeArtCategoryName,
  ART_INITIAL_VISIBLE_COUNT,
} from "../artData";

/* SCENE 06 / WORK MATRIX — two modes, like the original site:
   · works — horizontal filmstrip of all 9 works on scroll progress
   · art   — Art Matrix: lead photo + random art copy + tile grid
     (hover a tile to switch the lead, auto-advance every 5.5s)
   Click a work opens the fullscreen viewer. Full data kept. */

function ArtMatrix({ artRef }) {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(ART_INITIAL_VISIBLE_COUNT);
  const [artCopy, setArtCopy] = useState(artCopyPool[0]);
  const hoverRafRef = useRef(0);

  const hasArt = artPhotoCategories.length > 0;
  const category = hasArt ? artPhotoCategories[categoryIndex % artPhotoCategories.length] : null;
  const photos = category?.photos ?? [];
  const lead = photos[photoIndex % Math.max(1, photos.length)] ?? null;
  const visible = photos.slice(0, visibleCount);
  const curator = artCuratorMetaPool[(categoryIndex + photoIndex) % artCuratorMetaPool.length];
  const frameCode = `ART-${String(categoryIndex + 1).padStart(2, "0")}-${String(photoIndex + 1).padStart(2, "0")}`;

  /* random art copy whenever category changes */
  useEffect(() => {
    setArtCopy(artCopyPool[Math.floor(Math.random() * artCopyPool.length)]);
  }, [categoryIndex]);

  /* auto-advance the lead photo */
  useEffect(() => {
    if (!hasArt || photos.length < 2) return undefined;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setPhotoIndex((current) => (current + 1) % photos.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [hasArt, photos.length]);

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

  const hoverTile = (index) => {
    if (index === photoIndex || hoverRafRef.current) return;
    hoverRafRef.current = window.requestAnimationFrame(() => {
      setPhotoIndex(index);
      hoverRafRef.current = 0;
    });
  };

  const shuffleCopy = () => {
    setArtCopy((current) => {
      let next = current;
      while (next === current && artCopyPool.length > 1) {
        next = artCopyPool[Math.floor(Math.random() * artCopyPool.length)];
      }
      return next;
    });
  };

  return (
    <div className="art-matrix" ref={artRef}>
      <div className="art-lead-row">
        <figure className="art-lead" data-cursor="VIEW">
          {lead ? <img src={lead} alt={normalizeArtCategoryName(category.name)} /> : null}
          <figcaption className="mono">
            FRAME {String(photoIndex + 1).padStart(2, "0")} — {normalizeArtCategoryName(category.name)}
          </figcaption>
        </figure>

        <aside className="art-panel">
          <div className="art-kicker mono rv-in">
            Art Matrix / 艺术摄影
          </div>
          <h3 className="art-cat rv-in">
            {normalizeArtCategoryName(category.name)}
          </h3>
          <div className="art-copy rv-in">
            <div className="art-copy-head mono">
              <span>随机艺术文案</span>
              <button type="button" className="art-shuffle" onClick={shuffleCopy} aria-label="换一句" data-cursor="SHUFFLE">
                <Shuffle size={13} /> 换一句
              </button>
            </div>
            <p className="art-copy-text">「{artCopy}」</p>
            <div className="art-copy-meta mono">
              <span>{curator}</span>
              <span>
                分类 {categoryIndex + 1}/{artPhotoCategories.length}
              </span>
              <span>
                第 {photoIndex + 1} / {photos.length} 张
              </span>
            </div>
          </div>
          <div className="art-cats rv-in">
            {artPhotoCategories.map((cat, i) => (
              <button
                key={cat.name}
                type="button"
                className={i === categoryIndex ? "art-cat-chip active mono" : "art-cat-chip mono"}
                onClick={() => {
                  setCategoryIndex(i);
                  setPhotoIndex(0);
                  setVisibleCount(ART_INITIAL_VISIBLE_COUNT);
                }}
              >
                {normalizeArtCategoryName(cat.name)} · {cat.photos.length}
              </button>
            ))}
          </div>
        </aside>
      </div>

      <div className="art-tiles">
        {visible.map((photo, index) => (
          <figure
            key={`${category.name}-${photo}`}
            className={index === photoIndex ? "art-tile active" : "art-tile"}
            onMouseEnter={() => hoverTile(index)}
            onFocus={() => hoverTile(index)}
            onClick={() => setPhotoIndex(index)}
            data-cursor="VIEW"
          >
            <img src={photo} alt={`${normalizeArtCategoryName(category.name)}-${index + 1}`} loading="lazy" />
            <figcaption className="mono">FRAME {String(index + 1).padStart(2, "0")}</figcaption>
          </figure>
        ))}
      </div>
      {visibleCount < photos.length ? (
        <button
          type="button"
          className="art-more mono rv-in"
          onClick={() => setVisibleCount((c) => c + ART_INITIAL_VISIBLE_COUNT)}
        >
          加载更多（剩余 {photos.length - visibleCount} 张）
        </button>
      ) : null}
    </div>
  );
}

export default function WorksScene({ refCb, stripRef, innerRef, viewerOpenRef }) {
  const [viewer, setViewer] = useState(null);
  const [mode, setMode] = useState("works");
  const artRef = useRef(null);

  /* art mode: inner-scroll the tile grid first, hand back to the engine
     only when it has no slack left (same grammar as the works strip) */
  useEffect(() => {
    if (mode !== "art") return undefined;
    const root = artRef.current;
    if (!root) return undefined;
    const onWheel = (e) => {
      const scroller = root.querySelector(".art-tiles");
      if (!scroller) return;
      const slack = scroller.scrollHeight - scroller.clientHeight;
      if (slack <= 2) return;
      const before = scroller.scrollTop;
      scroller.scrollTop += e.deltaY;
      if (scroller.scrollTop !== before) e.stopPropagation();
    };
    root.addEventListener("wheel", onWheel, { passive: true });
    return () => root.removeEventListener("wheel", onWheel);
  }, [mode]);

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
