import { educationList } from "../../config/siteConfig";

/* SCENE 02 / EDUCATION — camera slides sideways, two data nodes on one line */

const SHORT = {
  华中科技大学: "HUST",
  武汉理工大学: "WHUT",
};

export default function EducationScene() {
  return (
    <section className="scene scene-education" data-scene="education">
      <div className="scene-inner">
        <div className="scene-kicker rv" style={{ "--d": "0.05s" }}>
          <i className="kicker-tick" />
          02 / EDUCATION
        </div>

        <div className="edu-line" aria-hidden="true">
          <span className="edu-node" style={{ left: "22%" }} />
          <span className="edu-node" style={{ left: "68%" }} />
        </div>

        <div className="edu-track">
          {educationList.map((edu, i) => {
            const year = edu.period.slice(0, 4);
            const right = i % 2 === 1;
            return (
              <article
                key={edu.title}
                className={`edu-entry ${right ? "edu-right" : "edu-left"}`}
              >
                <div className="edu-year rv" style={{ "--d": `${0.15 + i * 0.14}s` }}>
                  {year}
                </div>
                <h3 className="edu-school rv" style={{ "--d": `${0.26 + i * 0.14}s` }}>
                  {edu.school}
                  <span className="edu-abbr">{SHORT[edu.school]}</span>
                </h3>
                <p className="edu-degree rv" style={{ "--d": `${0.36 + i * 0.14}s` }}>
                  {edu.title.split("·")[1]} <em>/ {edu.period}</em>
                </p>
                <p className="edu-body rv" style={{ "--d": `${0.46 + i * 0.14}s` }}>
                  {edu.body}
                </p>
                <ul className="edu-honors">
                  {edu.chips.map((chip, j) => (
                    <li
                      key={chip}
                      className="rv"
                      style={{ "--d": `${0.56 + i * 0.14 + j * 0.07}s` }}
                    >
                      <span className="honor-idx">{String(j + 1).padStart(2, "0")}</span>
                      {chip}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
