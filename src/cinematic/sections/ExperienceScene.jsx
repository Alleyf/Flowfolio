import { useEffect, useState } from "react";
import { internshipExperience as job } from "../../config/siteConfig";

/* SCENE 03 / EXPERIENCE — outline giant typography + big-number metrics,
   staged summary segments, full stack tags + the Agent ReAct Loop strip.
   All internship data kept. */

const METRICS = [
  { k: "07 → 03", v: "DAYS", note: "话题上线时间 · AI 生图工作流 0→1" },
  { k: "MULTI", v: "AGENT", note: "Orchestrator-Worker · 云端沙箱" },
  { k: "LOOP", v: "SELF-EVOLVE", note: "Workflow × ReAct · 验证自动化闭环" },
  { k: "ODPS · CH", v: "PIPELINE", note: "意图定向结案 · ClickHouse 加速" },
];

const LOOP_STEPS = [
  { key: "thought", label: "Thought", hint: "拆解目标与约束，规划下一步要做什么。" },
  { key: "action", label: "Action", hint: "调度 Skill / MCP / Plugin，执行工具调用。" },
  { key: "observation", label: "Observation", hint: "回收工具返回，校验结果是否可信。" },
  { key: "reflection", label: "Reflection", hint: "复盘并修正计划，进入下一轮循环。" },
];

function AgentLoopStrip() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setStep((current) => (current + 1) % LOOP_STEPS.length);
    }, 1900);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="react-loop rv" data-th="0.38">
      <div className="rl-head mono">
        <i className="rl-pulse" aria-hidden="true" />
        AGENT REACT LOOP · RUNNING
      </div>
      <div className="rl-track">
        {LOOP_STEPS.map((item, index) => (
          <span key={item.key} className="rl-cell">
            <span className={index === step ? "rl-node active" : "rl-node"}>
              <span className="rl-idx mono">{String(index + 1).padStart(2, "0")}</span>
              {item.label}
            </span>
            {index < LOOP_STEPS.length - 1 ? (
              <span className={index < step ? "rl-arrow lit" : "rl-arrow"} aria-hidden="true">
                →
              </span>
            ) : null}
          </span>
        ))}
      </div>
      <p className="rl-hint mono">{LOOP_STEPS[step].hint}</p>
    </div>
  );
}

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

        <AgentLoopStrip />

        <div className="xp-summary">
          <div className="xp-summary-label mono rv" data-th="0.5">
            {job.summaryTitle} —
          </div>
          {segments.map((seg, i) => (
            <p className="xp-seg rv" data-th={0.52 + i * 0.09} key={seg.slice(0, 12)}>
              <span className="mono seg-idx">{String(i + 1).padStart(2, "0")}</span>
              {seg}
              {i < segments.length - 1 ? "；" : "。"}
            </p>
          ))}
        </div>

        <ul className="xp-stack rv" data-th="0.92">
          {job.stack.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
