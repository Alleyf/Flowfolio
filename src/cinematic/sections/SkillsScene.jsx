import { personalSkills, skillTicker } from "../../config/siteConfig";

/* SCENE 04 / SKILLS — four capability groups with full tag sets,
   WebGL layer flies through the constellation behind. Ticker marquee. */

export default function SkillsScene({ refCb }) {
  return (
    <section className="scene scene-skills" ref={refCb} data-scene="skills">
      <div className="scene-inner">
        <div className="scene-kicker rv" data-th="0.02">
          <i className="kicker-tick" />
          04 / SKILLS
        </div>

        <h2 className="scene-title rv" data-th="0.06">
          技术矩阵<span className="scene-title-sub mono">SKILL UNIVERSE</span>
        </h2>

        <div className="skill-groups">
          {personalSkills.map((g, i) => (
            <article className="skill-group rv" data-th={0.16 + i * 0.16} key={g.title}>
              <h3 className="sg-title">
                <span className="mono sg-idx">{String(i + 1).padStart(2, "0")}</span>
                {g.title}
              </h3>
              <p className="sg-body">{g.body}</p>
              <ul className="sg-tags">
                {g.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="skill-ticker rv" data-th="0.8" aria-hidden="true">
          <div className="ticker-track mono">
            {[0, 1].map((dup) => (
              <span className="ticker-run" key={dup}>
                {skillTicker.map((s) => (
                  <b key={s}>{s}</b>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
