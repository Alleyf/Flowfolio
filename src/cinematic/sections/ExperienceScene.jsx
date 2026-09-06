import { internshipExperience as job } from "../../config/siteConfig";

/* SCENE 03 / EXPERIENCE — outline giant typography + big-number metrics,
   the WebGL layer switches to the agent network behind it */

const METRICS = [
  { k: "07 → 03", v: "DAYS", note: "话题上线时间 · AI 生图工作流 0→1" },
  { k: "MULTI", v: "AGENT", note: "Orchestrator-Worker · 云端沙箱" },
  { k: "LOOP", v: "SELF-EVOLVE", note: "Workflow × ReAct · 验证自动化闭环" },
  { k: "ODPS · CH", v: "PIPELINE", note: "意图定向结案 · ClickHouse 加速" },
];

export default function ExperienceScene() {
  return (
    <section className="scene scene-experience" data-scene="experience">
      <div className="scene-inner">
        <div className="scene-kicker rv" style={{ "--d": "0.05s" }}>
          <i className="kicker-tick" />
          03 / EXPERIENCE
        </div>

        <div className="exp-head">
          <div className="exp-company mega-outline rv" style={{ "--d": "0.14s" }}>
            ALIBABA
          </div>
          <div className="exp-org rv" style={{ "--d": "0.3s" }}>
            {job.org}
          </div>
          <div className="exp-meta rv" style={{ "--d": "0.4s" }}>
            <span className="accent-text">{job.role}</span>
            <em> / {job.period}</em>
          </div>
          <p className="exp-intro rv" style={{ "--d": "0.5s" }}>
            {job.intro}
          </p>
        </div>

        <div className="exp-metrics">
          {METRICS.map((m, i) => (
            <div key={m.k} className="metric-cell rv" style={{ "--d": `${0.6 + i * 0.1}s` }}>
              <div className="metric-k">{m.k}</div>
              <div className="metric-v accent-text">{m.v}</div>
              <div className="metric-note">{m.note}</div>
            </div>
          ))}
        </div>

        <p className="exp-stack rv" style={{ "--d": "1.05s" }}>
          {job.stack.join("  ·  ")}
        </p>
      </div>
    </section>
  );
}
