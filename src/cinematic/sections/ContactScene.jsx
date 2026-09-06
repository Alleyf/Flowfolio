import { useState } from "react";
import { Send } from "lucide-react";
import { contactConfig, siteMeta } from "../../config/siteConfig";

/* SCENE 08 / CONTACT — giant close, the particle entity returns behind.
   Full contact data + direct message form (mailto) + footer. */

const LINKS = [
  { label: "EMAIL", value: contactConfig.email, href: `mailto:${contactConfig.email}` },
  { label: "GITHUB", value: "github.com/Alleyf", href: contactConfig.github },
  { label: "BLOG", value: "alleyf.github.io", href: contactConfig.blog },
  { label: "PHONE", value: contactConfig.phone, href: `tel:${contactConfig.phone}` },
];

export default function ContactScene({ refCb }) {
  const [form, setForm] = useState({ name: "", from: "", message: "" });
  const [sent, setSent] = useState(false);

  const sendMessage = () => {
    const subject = encodeURIComponent(form.message ? `来自 ${form.name || "访客"} 的留言` : contactConfig.defaultSubject);
    const body = encodeURIComponent(
      `姓名：${form.name || "未填写"}\n访客公司：${form.from || "未填写"}\n\n${form.message || ""}`
    );
    window.location.href = `mailto:${contactConfig.inboxEmail}?subject=${subject}&body=${body}`;
    setSent(true);
    window.setTimeout(() => setSent(false), 3200);
  };

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

        <div className="ct-grid">
          <nav className="ct-links">
            {LINKS.map((l, i) => (
              <a
                key={l.label}
                className="ct-link rv"
                data-th={0.26 + i * 0.08}
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

          <div className="ct-form rv" data-th="0.4">
            <div className="ctf-head mono">
              <span>直接发送消息 / DIRECT MESSAGE</span>
            </div>
            <div className="ctf-row">
              <input
                className="ctf-input mono"
                placeholder="怎么称呼你"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                aria-label="你的称呼"
              />
              <input
                className="ctf-input mono"
                placeholder="公司 / 团队（可选）"
                value={form.from}
                onChange={(e) => setForm((f) => ({ ...f, from: e.target.value }))}
                aria-label="公司或团队"
              />
            </div>
            <textarea
              className="ctf-area mono"
              placeholder="想说的话…"
              rows={3}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              aria-label="留言内容"
            />
            <button type="button" className="ctf-send mono" onClick={sendMessage}>
              {sent ? "已唤起邮件客户端 ✓" : (
                <>
                  <Send size={14} /> 发送消息
                </>
              )}
            </button>
          </div>
        </div>

        <div className="ct-meta mono rv" data-th="0.7">
          <span>{contactConfig.location}</span>
          <span>{contactConfig.status}</span>
        </div>

        <footer className="ct-foot rv" data-th="0.84">
          <span className="mono">
            © {siteMeta.copyrightRange} {siteMeta.copyrightOwner} — FLOWFOLIO®
          </span>
          <span className="ct-note">{siteMeta.footerNote}</span>
        </footer>
      </div>
    </section>
  );
}
