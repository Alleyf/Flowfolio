import { contactConfig, siteMeta } from "../../config/siteConfig";

/* SCENE 08 / CONTACT — giant close, the twin returns behind */

const LINKS = [
  { label: "EMAIL", value: contactConfig.email, href: `mailto:${contactConfig.email}` },
  { label: "GITHUB", value: "github.com/Alleyf", href: contactConfig.github },
  { label: "BLOG", value: "alleyf.github.io", href: contactConfig.blog },
  { label: "PHONE", value: contactConfig.phone, href: `tel:${contactConfig.phone}` },
];

export default function ContactScene() {
  return (
    <section className="scene scene-contact" data-scene="contact">
      <div className="scene-inner">
        <div className="scene-kicker rv" style={{ "--d": "0.05s" }}>
          <i className="kicker-tick" />
          08 / CONTACT
        </div>

        <h2 className="contact-mega">
          <span className="rv" style={{ "--d": "0.14s" }}>
            {"LET'S"}
          </span>
          <br />
          <span className="rv mega-outline" style={{ "--d": "0.3s" }}>
            CONNECT.
          </span>
        </h2>

        <ul className="contact-links">
          {LINKS.map((l, i) => (
            <li key={l.label} className="rv" style={{ "--d": `${0.45 + i * 0.08}s` }}>
              <a href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" data-cursor="GO">
                <span className="cl-label mono">{l.label}</span>
                <span className="cl-value">{l.value}</span>
                <span className="cl-arrow" aria-hidden="true">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>

        <footer className="contact-foot rv" style={{ "--d": "0.85s" }}>
          <span>
            © {siteMeta.copyrightRange} {siteMeta.copyrightOwner}
          </span>
          <span>FLOWFOLIO®</span>
          <span className="accent-text">{contactConfig.status}</span>
        </footer>
      </div>
    </section>
  );
}
