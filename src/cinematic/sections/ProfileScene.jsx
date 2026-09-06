/* SCENE 01 / PROFILE — typography first, twin occupies the right void */

export default function ProfileScene() {
  return (
    <section className="scene scene-profile" data-scene="profile">
      <div className="scene-inner profile-layout">
        <div className="profile-left">
          <div className="scene-kicker rv" style={{ "--d": "0.05s" }}>
            <i className="kicker-tick" />
            01 / PROFILE
          </div>
          <h1 className="mega-title" aria-label="CsFan">
            <span className="rv" style={{ "--d": "0.16s" }}>
              CS
            </span>
            <span className="rv mega-outline" style={{ "--d": "0.3s" }}>
              FAN
            </span>
          </h1>
          <p className="profile-role rv" style={{ "--d": "0.46s" }}>
            Agent Application Engineer
          </p>
          <ul className="profile-tags rv" style={{ "--d": "0.56s" }}>
            <li>Multi-Agent Systems</li>
            <li>Java Full Stack</li>
            <li>Cloud Native</li>
          </ul>
          <dl className="type-grid rv" style={{ "--d": "0.7s" }}>
            <div>
              <dt>LOCATION</dt>
              <dd>WUHAN · CN</dd>
            </div>
            <div>
              <dt>UNIVERSITY</dt>
              <dd>HUST</dd>
            </div>
            <div>
              <dt>FOCUS</dt>
              <dd>AGENT SYSTEM</dd>
            </div>
            <div>
              <dt>STACK</dt>
              <dd>JAVA / AI</dd>
            </div>
            <div>
              <dt>STATUS</dt>
              <dd className="accent-text">OPEN TO WORK</dd>
            </div>
          </dl>
        </div>
        {/* right side intentionally empty — the digital twin lives here */}
        <div className="profile-void" aria-hidden="true" />
      </div>
    </section>
  );
}
