import { digitalIdentity, topStats, contactConfig, siteMeta } from "../../config/siteConfig";

/* SCENE 01 / PROFILE — typography-first hero. All identity data kept,
   presented as a typographic grid instead of cards. */

export default function ProfileScene({ refCb }) {
  const rows = [
    ...topStats.map((s) => [s.label, s.value]),
    ...digitalIdentity.fields
      .filter((f) => f.label !== "邮箱" && f.label !== "博客")
      .map((f) => [f.label, f.value]),
    ["LOCATION", contactConfig.location],
    ["邮箱", contactConfig.email],
    ["博客", contactConfig.blog.replace("https://", "")],
  ];

  return (
    <section className="scene scene-profile" ref={refCb} data-scene="profile">
      <div className="scene-inner">
        <div className="scene-kicker rv" data-th="0.02">
          <i className="kicker-tick" />
          01 / PROFILE
        </div>

        <h1 className="hero-title">
          <span className="hero-line rv" data-th="0.06">
            CS
          </span>
          <span className="hero-line hero-outline rv" data-th="0.14">
            FAN
          </span>
        </h1>

        <p className="hero-role rv" data-th="0.22">
          {digitalIdentity.role}
        </p>
        <p className="hero-desc rv" data-th="0.3">
          {siteMeta.description}
        </p>

        <dl className="type-grid rv" data-th="0.42">
          {rows.map(([k, v]) => (
            <div className="type-row" key={k + v}>
              <dt className="mono">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>

        <div className="hero-status rv" data-th="0.6">
          <i className="status-dot" />
          OPEN TO WORK — {contactConfig.status}
        </div>
      </div>
    </section>
  );
}
