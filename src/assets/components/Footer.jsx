import { useEffect, useCallback, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";

export default function Footer() {
  const location = useLocation();

  const [hash, setHash] = useState(
    typeof window !== "undefined" ? window.location.hash : ""
  );

  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash, { passive: true });
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const isActiveHash = useCallback(
    (id) => location.pathname === "/" && hash === `#${id}`,
    [location.pathname, hash]
  );

  function smoothScrollTo(el) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }

  function goToSection(e, id) {
    e.preventDefault();

    if (location.pathname === "/") {
      const el = document.getElementById(id);
      if (el) {
        smoothScrollTo(el);
        window.history.replaceState(null, "", `#${id}`);
      }
      return;
    }

    window.location.href = `/#${id}`;
  }

  return (
    <footer className="footerWrapper" role="contentinfo">

      <div className="footerContentWrapper ">
            <div className="headline text-center">
        <h2>KIRCHHELLEN Diarys</h2>
        <p>Neuigkeiten, Geschichten und Leben aus Kirchhellen.</p>
        <div>
  <a
  href="https://www.instagram.com/DEINACCOUNT"
  target="_blank"
  rel="noopener noreferrer"
  className="footerInstagram"
  aria-label="Kirchhellen Diarys auf Instagram"
>
  <FontAwesomeIcon icon={faInstagram} />
  <span>@kirchhellen.diarys</span>
</a>
        </div>
      </div>
        <nav
          className="footerContent"
          aria-label="Footer Navigation"
        >
          <div className="footerColumn">
            <h3>Inhalte</h3>
            <ul>
              <li>
                <a
                  href="/#artikel"
                  onClick={(e) => goToSection(e, "artikel")}
                  aria-current={isActiveHash("artikel") ? "page" : undefined}
                >
                  Artikel
                </a>
              </li>
              <li>
                <a
                  href="/#beliebt"
                  onClick={(e) => goToSection(e, "beliebt")}
                  aria-current={isActiveHash("beliebt") ? "page" : undefined}
                >
                  Beliebt
                </a>
              </li>
              <li>
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
            <ul>
              <li><Link to="/impressum">Impressum</Link></li>
              <li><Link to="/datenschutz">Datenschutz</Link></li>
              <li><Link to="/archiev">Archiv</Link></li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="footerCopyright">
        <p>© 2025 Kirchhellen Diarys. Alle Rechte vorbehalten.</p>
      </div>
    </footer>
  );
}