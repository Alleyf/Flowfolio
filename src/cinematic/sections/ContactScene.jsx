import { contactConfig, siteMeta } from "../../config/siteConfig";

/* SCENE 08 / CONTACT — giant close, the particle entity returns behind.
   Full contact data + footer note + copyright. */

const LINKS = [
  { label: "EMAIL", value: contactConfig.email, href: `mailto:${contactConfig.email}` },
  { label: "GITHUB", value: "github.com/Alleyf", href: contactConfig.github },
  { label: "BLOG", value: "alleyf.github.io", href: contactConfig.blog },
  { label: "PHONE", value: contactConfig.phone, href: `tel:${contactConfig.phone}` },
];

export default function ContactScene({ refCb }) {
  return (
    <section className="scene scene-contact" ref={refCb} data-scene="contact">
      <div className="scene-inner">
        <div className="scene-kicker rv" data-th="0.02">
          <i className="kicker-tick" />
          08 / CONTACT
        </div>

        <h2 className="ct-giant">
          <span className="rv" data-th="0.06">
            LET'S
          </span>
          <span className="hero-outline rv" data-th="0.14">
            CONNECT.
          </span>
        </h2>

        <nav className="ct-links">
          {LINKS.map((l, i) => (
            <a
              key={l.label}
              className="ct-link rv"
              data-th={0.26 + i * 0.1}
              href={l.href}
              target={l.href.startsWith("mailto") || l.href.startsWith("tel") ? undefined : "_blank"}
              rel="noreferrer"
            >
              <span className="ctl-label mono">{l.label}</span>
              <span className="ctl-value">{l.value}</span>
              <span className="ctl-arrow" aria-hidden="true">
                →
              </span>
            </a>
          ))}
        </nav>

        <div className="ct-meta mono rv" data-th="0.66">
          <span>{contactConfig.location}</span>
          <span>{contactConfig.status}</span>
        </div>

        <footer className="ct-foot rv" data-th="0.8">
          <span className="mono">
            © {siteMeta.copyrightRange} {siteMeta.copyrightOwner} — FLOWFOLIO®
          </span>
          <span className="ct-note">{siteMeta.footerNote}</span>
        </footer>
      </div>
    </section>
  );
}
