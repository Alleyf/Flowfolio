import { ChevronLeft, ChevronRight } from "lucide-react";
import { projectExperiences } from "../../config/siteConfig";

/* SCENE 05 / PROJECTS — editorial gallery, one project at a time.
   wheel down cycles projects inside the scene before leaving it */

export default function ProjectsScene({ index, onStep }) {
  const p = projectExperiences[index];
  return (
    <section className="scene scene-projects" data-scene="projects">
      <div className="scene-inner">
        <div className="scene-kicker rv" style={{ "--d": "0.05s" }}>
          <i className="kicker-tick" />
          05 / PROJECTS
        </div>

        <div className="proj-stage" key={index}>
          <div className="proj-num">{String(index + 1).padStart(2, "0")}</div>

          <div className="proj-info">
            <div className="proj-meta-row">
              <span className="accent-text">{p.status}</span>
              <em> / {p.period}</em>
              <em> / {p.role}</em>
            </div>
            <h3 className="proj-title">{p.title}</h3>
            <p className="proj-desc">{p.description}</p>
            <ul className="proj-points">
              {p.bullets.slice(0, 2).map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <p className="proj-stack">{p.stack.join("  ·  ")}</p>
            {p.url && (
              <a className="proj-link" href={p.url} target="_blank" rel="noreferrer" data-cursor="view">
                VISIT <span aria-hidden="true">→</span>
              </a>
            )}
          </div>
        </div>

        <div className="proj-nav">
          <span className="proj-counter mono">
            {String(index + 1).padStart(2, "0")} — {String(projectExperiences.length).padStart(2, "0")}
          </span>
          <div className="proj-arrows">
            <button
              type="button"
              aria-label="上一个项目"
              disabled={index === 0}
              onClick={() => onStep(-1)}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="下一个项目"
              disabled={index === projectExperiences.length - 1}
              onClick={() => onStep(1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="proj-dots" aria-hidden="true">
            {projectExperiences.map((_, i) => (
              <i key={i} className={i === index ? "on" : ""} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
