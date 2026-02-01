
import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Footer() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [errId, setErrId] = useState(""); 

  const location = useLocation();

  const [hash, setHash] = useState(
    typeof window !== "undefined" ? window.location.hash : ""
  );
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash, { passive: true });
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const isSuccess = msg.startsWith("Danke");

  const isActiveHash = useCallback(
    (id) => location.pathname === "/" && hash === `#${id}`,
    [location.pathname, hash]
  );

  function smoothScrollTo(el) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior = reduced ? "auto" : "smooth";
    el.scrollIntoView({ behavior });
  }


  function goToSection(e, id) {
    e.preventDefault();

    if (location.pathname === "/") {
      const el = document.getElementById(id);
      if (el) {
        smoothScrollTo(el);
        if (window.location.hash !== `#${id}`) {
          window.history.replaceState(null, "", `#${id}`);
        }
        setTimeout(() => {
          const hadTabIndex = el.hasAttribute("tabindex");
          if (!hadTabIndex) el.setAttribute("tabindex", "-1");
          el.focus({ preventScroll: true });
          if (!hadTabIndex) el.removeAttribute("tabindex");
        }, 350);
      }
      return;
    }

    window.location.href = `/#${id}`;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setErrId("");

    const nameOk = !!form.name.trim();
    const mailOk = !!form.email.trim();
    const msgOk = !!form.message.trim();

    if (!nameOk || !mailOk || !msgOk) {
      setMsg("Bitte alle Felder ausfüllen.");
      setErrId("contact-status");
      return;
    }

    setSending(true);
    try {
      const s = await getSession();
      if (!s.ok) {
        setMsg(s.error || "Sessionfehler.");
        setErrId("contact-status");
        return;
      }

      const res = await sendContact({ ...form, csrf: s.csrf });
      if (res.ok) {
        setMsg("Danke! Deine Nachricht wurde gesendet.");
        setForm({ name: "", email: "", message: "" });
      } else {
        setMsg(res.error || "Senden fehlgeschlagen.");
        setErrId("contact-status");
      }
    } catch (e) {
      setMsg("Unerwarteter Fehler beim Senden.");
      setErrId("contact-status");
    } finally {
      setSending(false);
    }
  }

  return (
    <footer className="footerWrapper" role="contentinfo">
      <div className="headline pt-6 text-center">
        <h2>KIRCHHELLEN Diarys</h2>
        <p>Neuigkeiten, Geschichten und Leben aus Kirchhellen.</p>
      </div>

      <div className="footerContentWrapper"> 
        <div className="footerColumn contact">
          <h3>Kontakt</h3>

          <form
            className="contactForm"
            onSubmit={onSubmit}
            noValidate
            autoComplete="on"
            aria-describedby={msg ? "contact-status" : undefined}
          >
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />

            <div className="field">
              <label htmlFor="contact-name">Name</label>
              <input
                type="text"
                id="contact-name"
                name="name"
                placeholder="Dein Name"
                autoComplete="name"
                required
                aria-required="true"
                aria-invalid={!form.name.trim() ? "true" : "false"}
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>

            <div className="field">
              <label htmlFor="contact-email">E-Mail</label>
              <input
                type="email"
                id="contact-email"
                name="email"
                placeholder="name@beispiel.de"
                inputMode="email"
                autoComplete="email"
                required
                aria-required="true"
                aria-invalid={!form.email.trim() ? "true" : "false"}
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>

            <div className="field">
              <label htmlFor="contact-message">Nachricht</label>
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                placeholder="Schreibe mir eine Nachricht …"
                autoComplete="off"
                required
                aria-required="true"
                aria-invalid={!form.message.trim() ? "true" : "false"}
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
              />
            </div>

            <button
              type="submit"
              className="submitBtn"
              disabled={sending}
              aria-busy={sending ? "true" : "false"}
            >
              {sending ? "Senden…" : "Absenden"}
            </button>

            <p
              id="contact-status"
              className={`contact-status ${msg ? (isSuccess ? "is-success" : "is-error") : ""}`}
              role={msg && !isSuccess ? "alert" : undefined}
              aria-live="polite"
            >
              {msg}
            </p>
          </form>
        </div>

        <div className="footerContent" role="navigation" aria-label="Footer Navigation">
          <div className="footerColumn">
            <h3>Inhalte</h3>
            <ul role="list">
              <li role="listitem">
                <a
                  href="/#artikel"
                  onClick={(e) => goToSection(e, "artikel")}
                  aria-current={isActiveHash("artikel") ? "page" : undefined}
                >
                  Artikel
                </a>
              </li>
              <li role="listitem">
                <a
                  href="/#beliebt"
                  onClick={(e) => goToSection(e, "beliebt")}
                  aria-current={isActiveHash("beliebt") ? "page" : undefined}
                >
                  Beliebt
                </a>
              </li>
              <li role="listitem">
                <a
                  href="/#kategorie"
                  onClick={(e) => goToSection(e, "kategorie")}
                  aria-current={isActiveHash("kategorie") ? "page" : undefined}
                >
                  Kategorien
                </a>
              </li>
            </ul>
          </div>

          <div className="footerColumn">
            <h3>Blog</h3>
            <ul role="list">
              <li role="listitem"><Link to="/impressum">Impressum</Link></li>
              <li role="listitem"><Link to="/datenschutz">Datenschutz</Link></li>
              <li role="listitem"><Link to="/archiev">Archiev</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footerCopyright">
        <p>© 2025 Kirchhellen Diarys. Alle Rechte vorbehalten.</p>
      </div>
    </footer>
  );
}