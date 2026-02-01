import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import NavSearch from "./NavSearch.jsx";

export default function NavBar({ theme = "dark" }) {
  const [active, setActive] = useState("Start");
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const burgerRef = useRef(null);
  const menuRef = useRef(null);
  const firstLinkRef = useRef(null);

  const [hash, setHash] = useState(typeof window !== "undefined" ? window.location.hash : "");
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);



  const menuItems = useMemo(
    () => [
      { name: "Start",   anchor: "hero"     },
      { name: "Artikel", anchor: "artikel"  },
      { name: "Beliebt", anchor: "beliebt"  },
      { name: "Kategorie", anchor: "kategorie" },
    ],
    []
  );

  useEffect(() => {
    const h = (location.hash || "").replace(/^#/, "");
    const found = menuItems.find((m) => m.anchor === h);
    if (found) setActive(found.name);
  }, [location, menuItems]);

  const toggleMenu = () => setMenuOpen((o) => !o);
  const closeMenu = () => setMenuOpen(false);

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

  function focusSection(el) {
    if (!el) return;
    const hadTabIndex = el.hasAttribute("tabindex");
    if (!hadTabIndex) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
    if (!hadTabIndex) el.removeAttribute("tabindex");
  }

  function goToSection(id) {
    setActive(menuItems.find((m) => m.anchor === id)?.name || "Start");

    if (location.pathname === "/") {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        if (window.location.hash !== `#${id}`) {
          window.history.replaceState(null, "", `#${id}`);
        }
        setTimeout(() => focusSection(el), 350);
      }
      closeMenu();
      return;
    }

    window.location.href = `/#${id}`;
  }

  const isActiveHash = (id) =>
    location.pathname === "/" && hash === `#${id}`;

  return (
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
                <li role="listitem" key={item.name}>
                  <a
                    ref={idx === 0 ? firstLinkRef : null}
                    href={`/#${item.anchor}`}
                    className={active === item.name ? "active" : ""}
                    aria-current={
                      isActiveHash(item.anchor) || active === item.name ? "page" : undefined
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      goToSection(item.anchor);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        goToSection(item.anchor);
                      }
                    }}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <NavSearch
            onAfterSubmit={closeMenu}
            onAfterNavigate={closeMenu}
          />


        </div>
      </div>
    </div>
  );
}