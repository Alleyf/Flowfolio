import { educationList } from "../../config/siteConfig";

/* SCENE 02 / EDUCATION — two timeline nodes on one rail, alternating sides.
   Full data: period / title / tiers / body / chips / details. */

export default function EducationScene({ refCb }) {
  return (
    <section className="scene scene-education" ref={refCb} data-scene="education">
      <div className="scene-inner">
        <div className="scene-kicker rv" data-th="0.02">
          <i className="kicker-tick" />
          02 / EDUCATION
        </div>

        <h2 className="scene-title rv" data-th="0.08">
          教育背景<span className="scene-title-sub mono">EDUCATION</span>
        </h2>

        <div className="edu-rail" aria-hidden="true" />

        {educationList.map((e, i) => (
          <article
            key={e.school}
            className={`edu-node ${i % 2 === 1 ? "right" : "left"} rv`}
            data-th={0.18 + i * 0.42}
          >
            <div className="edu-period mono">{e.period}</div>
            <h3 className="edu-title">{e.title}</h3>
            <div className="edu-tiers mono">
              {e.tiers.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <p className="edu-body">{e.body}</p>
            <ul className="edu-details">
              {e.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
            <ul className="edu-chips">
              {e.chips.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
