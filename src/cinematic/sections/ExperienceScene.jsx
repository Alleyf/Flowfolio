import { internshipExperience as job } from "../../config/siteConfig";

/* SCENE 03 / EXPERIENCE — outline giant typography + big-number metrics,
   staged summary segments, full stack tags. All internship data kept. */

const METRICS = [
  { k: "07 → 03", v: "DAYS", note: "话题上线时间 · AI 生图工作流 0→1" },
  { k: "MULTI", v: "AGENT", note: "Orchestrator-Worker · 云端沙箱" },
  { k: "LOOP", v: "SELF-EVOLVE", note: "Workflow × ReAct · 验证自动化闭环" },
  { k: "ODPS · CH", v: "PIPELINE", note: "意图定向结案 · ClickHouse 加速" },
];

export default function ExperienceScene({ refCb }) {
  const segments = job.summary.split("；").filter(Boolean);

  return (
    <section className="scene scene-experience" ref={refCb} data-scene="experience">
      <div className="scene-inner">
        <div className="scene-kicker rv" data-th="0.02">
          <i className="kicker-tick" />
          03 / EXPERIENCE
        </div>

        <h2 className="xp-giant rv" data-th="0.06" aria-hidden="true">
          ALIMAMA
        </h2>

        <div className="xp-head rv" data-th="0.12">
          <div className="xp-org mono">{job.org}</div>
          <div className="xp-role-row">
            <h3 className="xp-role">{job.role}</h3>
            <span className="xp-period mono">{job.company}</span>
            <span className="xp-period mono">{job.period}</span>
          </div>
          <p className="xp-intro">{job.intro}</p>
        </div>

        <div className="xp-metrics">
          {METRICS.map((m, i) => (
            <div className="xp-metric rv" data-th={0.28 + i * 0.1} key={m.v}>
              <div className="xm-k">
                {m.k} <em>{m.v}</em>
              </div>
              <p className="xm-note">{m.note}</p>
            </div>
          ))}
        </div>

        <div className="xp-summary">
          <div className="xp-summary-label mono rv" data-th="0.45">
            {job.summaryTitle} —
          </div>
          {segments.map((seg, i) => (
            <p className="xp-seg rv" data-th={0.48 + i * 0.13} key={seg.slice(0, 12)}>
              <span className="mono seg-idx">{String(i + 1).padStart(2, "0")}</span>
              {seg}
              {i < segments.length - 1 ? "；" : "。"}
            </p>
          ))}
        </div>

        <ul className="xp-stack rv" data-th="0.8">
          {job.stack.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
