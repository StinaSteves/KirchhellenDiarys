import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import blogData from "../data/blogData";

export default function NavSearch() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return (blogData || [])
      .filter((a) =>
        [a.title, a.description, a.category]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(s))
      )
      .slice(0, 8);
  }, [q]);

  function closeAll() {
    setOpen(false);
    setPanelOpen(false);
  }

  function goToArticle(id) {
    closeAll();
    setQ("");
    navigate(`/artikel/${id}`);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  useEffect(() => {
    function onDoc(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) {
        closeAll();
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        setPanelOpen(false);
        if (open) setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  function onKeyNav(e) {
    if (!panelOpen || !results.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[active];
      if (r) goToArticle(r.id);
    }
  }

  function handleFocus() {
    if (q.trim()) setPanelOpen(true);
    if (window.matchMedia && window.matchMedia("(max-width: 980px)").matches) {
      setOpen(true);
    }
  }

  function handleChange(value) {
    setQ(value);
    setActive(0);
    setPanelOpen(Boolean(value.trim()));
  }

  function handleBlur() {
    setTimeout(() => setPanelOpen(false), 120);
  }

  return (
    <div ref={wrapRef} className={`navSearch ${open ? "is-open" : ""}`} role="search">
      {/* <button
        type="button"
        className="navSearchToggle"
        aria-label={open ? "Suche schließen" : "Suche öffnen"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      /> */}

      <div className="navSearchField">
        <span className="navSearchIcon" aria-hidden="true" />

        <input
          id="nav-search"
          ref={inputRef}
          type="search"
          className="navSearchInput"
          placeholder="Suche…"
          value={q}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={onKeyNav}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-label="Beiträge durchsuchen"
          autoComplete="off"
        />

        {/* {open && (
          <button
            type="button"
            className="navSearchClose"
            aria-label="Suche schließen"
            onClick={() => {
              closeAll();
              setQ("");
            }}
          >
            ✕
          </button>
        )} */}

        {panelOpen && q && results.length > 0 && (
          <div className="navSearchPanel" role="listbox" aria-label="Suchvorschläge">
            {results.map((r, i) => (
              <div
                key={r.id}
                className={`navSearchItem ${i === active ? "is-active" : ""}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => e.preventDefault()}
              >
                <button
                  type="button"
                  className="navSearchLink"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    goToArticle(r.id);
                  }}
                >
                  <span className="navSearchTitle">{r.title}</span>
                  <span className="navSearchCat">{r.category}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}