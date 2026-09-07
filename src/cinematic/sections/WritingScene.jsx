import { blogPosts } from "../../config/siteConfig";

/* SCENE 07 / WRITING — editorial list with full post data:
   index / date / title / tags / description. Hover slides the title. */

export default function WritingScene({ refCb }) {
  return (
    <section className="scene scene-writing" ref={refCb} data-scene="writing">
      <div className="scene-inner">
        <div className="scene-kicker rv" data-th="0.02">
          <i className="kicker-tick" />
          07 / WRITING
        </div>

        <h2 className="scene-title rv" data-th="0.06">
          博客推文<span className="scene-title-sub mono">WRITING</span>
        </h2>

        <div className="write-list">
          {blogPosts.map((b, i) => (
            <a
              key={b.url}
              className="write-row rv"
              data-th={0.16 + i * 0.16}
              href={b.url}
              target="_blank"
              rel="noreferrer"
            >
              <span className="wr-idx mono">{String(i + 1).padStart(3, "0")}</span>
              <span className="wr-date mono">{b.date}</span>
              <span className="wr-main">
                <span className="wr-title">{b.title}</span>
                <span className="wr-desc">{b.description}</span>
              </span>
              <span className="wr-tags mono">{b.tags.join(" / ")}</span>
              <span className="wr-arrow" aria-hidden="true">
                →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
