
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { getSession } from "../../lib/commentsApi.js";
import AuthMenu from "./AuthMenu.jsx";

export default function ArticleNav({ theme = "dark" }) {
  const [active, setActive] = useState("Start");
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();
  const navigate  = useNavigate();

  const burgerRef     = useRef(null);
  const menuRef       = useRef(null);
  const firstLinkRef  = useRef(null);

  useEffect(() => {
    (async () => {
      const s = await getSession();
      if (s.ok) setUser(s.user || null);
    })();
  }, []);

  const menuItems = useMemo(
    () => [
      { name: "Start",     anchor: "hero" },
      { name: "Artikel",   anchor: "artikel" },
      { name: "Beliebt",   anchor: "beliebt" },
      { name: "Kategorie", anchor: "kategorie" },
    ],
    []
  );

  useEffect(() => {
    const hash = (location.hash || "").replace(/^#/, "");
    const found = menuItems.find((m) => m.anchor === hash);
    if (found) setActive(found.name);
  }, [location, menuItems]);

  const toggleMenu = () => setMenuOpen((o) => !o);
  const closeMenu  = () => setMenuOpen(false);

  useEffect(() => {
    if (menuOpen && firstLinkRef.current) firstLinkRef.current.focus();
  }, [menuOpen]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && menuOpen) {
        e.stopPropagation();
        closeMenu();
        burgerRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    function onDocClick(e) {
      if (!menuOpen) return;
      const t = e.target;
      if (
        menuRef.current &&
        !menuRef.current.contains(t) &&
        !burgerRef.current?.contains(t)
      ) {
        closeMenu();
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  function handleClick(item) {
    setActive(item.name);
    const targetId = item.anchor;

    if (location.pathname === "/") {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
      if (window.location.hash !== `#${targetId}`) {
        window.history.replaceState(null, "", `#${targetId}`);
      }
    } else {
      navigate(`/#${targetId}`);
    }
    closeMenu();
  }

  return (
    <div>
      <div className={`NewNavbarWrapper navbar-${theme}`}>
        <a href="#main-content" className="skipLink">
          Zum Inhalt springen
        </a>

        <div className="navbarInner">
          <h1 className="NewNavLogo">
            <Link to="/" className="logoLink">
              Kirchhellen <span>Diarys</span>
            </Link>
          </h1>

          <div className="navRight">
            <button
              ref={burgerRef}
              className="navBurgerBtn"
              aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
              aria-expanded={menuOpen}
              aria-controls="main-menu"
              onClick={toggleMenu}
              type="button"
            >
              <i className="fa-solid fa-bars" aria-hidden="true"></i>
            </button>

            <nav
              id="main-menu"
              ref={menuRef}
              className={`NewNavList ${menuOpen ? "is-open" : ""}`}
              aria-label="Hauptnavigation"
            >
              <button
                type="button"
                className="navCloseBtn"
                aria-label="Menü schließen"
                onClick={closeMenu}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    closeMenu();
                  }
                }}
              >
                ✕
              </button>

              <ul role="list">
                {menuItems.map((item, idx) => (
                  <li key={item.name}>
                    <a
                      ref={idx === 0 ? firstLinkRef : null}
                      href={`#${item.anchor}`}
                      className={active === item.name ? "active" : ""}
                      aria-current={active === item.name ? "location" : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        handleClick(item);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          e.preventDefault();
                          handleClick(item);
                        }
                      }}
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="navAuth">
              <AuthMenu user={user} setUser={setUser} />
            </div>
          </div>
        </div>
      </div>
      <div className="navUnderlineWrapper" aria-hidden="true">
        <div className="navUnderline"></div>
      </div>
    </div>
  );
}