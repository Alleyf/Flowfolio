import { blogPosts } from "../../config/siteConfig";

/* SCENE 07 / WRITING — editorial list, big rows, hover slides the title */

export default function WritingScene() {
  return (
    <section className="scene scene-writing" data-scene="writing">
      <div className="scene-inner">
        <div className="scene-kicker rv" style={{ "--d": "0.05s" }}>
          <i className="kicker-tick" />
          07 / WRITING
        </div>

        <ul className="writing-list">
          {blogPosts.map((post, i) => (
            <li key={post.url} className="rv" style={{ "--d": `${0.12 + i * 0.09}s` }}>
              <a href={post.url} target="_blank" rel="noreferrer" data-cursor="READ">
                <span className="w-line w-idx mono">{String(i + 1).padStart(3, "0")}</span>
                <span className="w-line w-date mono">{post.date.slice(0, 4)}</span>
                <span className="w-title">{post.title}</span>
                <span className="w-desc">{post.description}</span>
                <span className="w-arrow" aria-hidden="true">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>

        <p className="writing-foot rv" style={{ "--d": "0.6s" }}>
          <span className="mono">alleyf.github.io</span> — 更多沉淀持续更新
        </p>
      </div>
    </section>
  );
}
