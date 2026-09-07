import { projectExperiences } from "../../config/siteConfig";

/* SCENE 05 / PROJECTS — horizontal editorial track. The engine drives
   track translation from local scroll progress (fully continuous).
   Full data per project: meta / description / ALL bullets / stack / url. */

export default function ProjectsScene({ refCb, trackRef, counterRef }) {
  return (
    <section className="scene scene-projects" ref={refCb} data-scene="projects">
      <div className="scene-kicker rv proj-kicker" data-th="0.02">
        <i className="kicker-tick" />
        05 / PROJECTS
      </div>

      <div className="proj-viewport">
        <div className="proj-track" ref={trackRef}>
          {projectExperiences.map((p, i) => (
            <article className="proj-slide" key={p.title}>
              <div className="proj-num mono" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="proj-info">
                <div className="proj-meta-row mono">
                  <span className="accent-text">{p.status}</span>
                  <em> / {p.period}</em>
                  <em> / {p.role}</em>
                </div>
                <h3 className="proj-title">{p.title}</h3>
                <p className="proj-desc">{p.description}</p>
                <ul className="proj-points">
                  {p.bullets.map((b) => (
                    <li key={b.slice(0, 16)}>{b}</li>
                  ))}
                </ul>
                <div className="proj-foot">
                  <p className="proj-stack mono">{p.stack.join("  ·  ")}</p>
                  {p.url && (
                    <a className="proj-link mono" href={p.url} target="_blank" rel="noreferrer" data-cursor="VISIT">
                      VISIT <span aria-hidden="true">→</span>
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="proj-nav mono">
        <span ref={counterRef}>01 — 04</span>
        <div className="proj-dots" aria-hidden="true">
          {projectExperiences.map((p, i) => (
            <i key={p.title} data-dot={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
