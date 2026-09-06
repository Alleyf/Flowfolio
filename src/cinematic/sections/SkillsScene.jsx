import { useMemo } from "react";
import { personalSkills } from "../../config/siteConfig";

/* SCENE 04 / SKILLS — a constellation of keywords at different depths,
   camera pushes through; hover brings a word closer & lights it up */

const CENTER = "AGENT ENGINEERING";

/* hand-placed coordinates (percent of viewport), s = font scale, o = idle opacity */
const FIELD = [
  { t: "HARNESS", x: 12, y: 18, s: 1.15, o: 0.5 },
  { t: "REACT", x: 24, y: 64, s: 0.8, o: 0.3 },
  { t: "WORKFLOW", x: 38, y: 12, s: 0.9, o: 0.42 },
  { t: "SKILL", x: 47, y: 78, s: 0.85, o: 0.3 },
  { t: "MCP", x: 55, y: 30, s: 1.3, o: 0.55 },
  { t: "PLUGIN", x: 63, y: 68, s: 0.75, o: 0.26 },
  { t: "SANDBOX", x: 71, y: 16, s: 0.95, o: 0.4 },
  { t: "MEMORY", x: 80, y: 46, s: 1.0, o: 0.45 },
  { t: "CONTEXT", x: 88, y: 74, s: 0.85, o: 0.32 },
  { t: "JAVA", x: 8, y: 48, s: 1.25, o: 0.55 },
  { t: "SPRING", x: 16, y: 82, s: 0.95, o: 0.38 },
  { t: "K8S", x: 30, y: 34, s: 0.9, o: 0.36 },
  { t: "DOCKER", x: 68, y: 88, s: 0.8, o: 0.28 },
  { t: "REDIS", x: 42, y: 52, s: 0.7, o: 0.24 },
  { t: "RAG", x: 58, y: 8, s: 0.85, o: 0.34 },
  { t: "PLAN / EXECUTE", x: 5, y: 68, s: 0.8, o: 0.3 },
  { t: "REPLAN", x: 35, y: 90, s: 0.7, o: 0.24 },
  { t: "REFLECTION", x: 76, y: 60, s: 0.75, o: 0.26 },
  { t: "LINUX", x: 90, y: 22, s: 0.85, o: 0.32 },
  { t: "CI / CD", x: 22, y: 8, s: 0.75, o: 0.26 },
  { t: "ROCKETMQ", x: 48, y: 66, s: 0.7, o: 0.22 },
  { t: "SPRING CLOUD", x: 84, y: 90, s: 0.75, o: 0.24 },
];

export default function SkillsScene() {
  const groups = useMemo(() => personalSkills.map((g) => g.title), []);

  return (
    <section className="scene scene-skills" data-scene="skills">
      <div className="scene-inner">
        <div className="scene-kicker rv" style={{ "--d": "0.05s" }}>
          <i className="kicker-tick" />
          04 / SKILLS
        </div>

        <div className="skill-universe">
          {FIELD.map((w, i) => (
            <span
              key={w.t}
              className="skill-word rv"
              tabIndex={-1}
              style={{
                "--d": `${0.1 + i * 0.045}s`,
                left: `${w.x}%`,
                top: `${w.y}%`,
                fontSize: `calc(var(--skill-base) * ${w.s})`,
                "--idle-o": w.o,
                animationDelay: `${i * 0.6}s`,
              }}
            >
              {w.t}
            </span>
          ))}
          <div className="skill-center rv" style={{ "--d": "0.12s" }}>
            {CENTER}
          </div>
        </div>

        <ul className="skill-groups rv" style={{ "--d": "0.9s" }}>
          {groups.map((g, i) => (
            <li key={g}>
              <span className="honor-idx">{String(i + 1).padStart(2, "0")}</span>
              {g}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
