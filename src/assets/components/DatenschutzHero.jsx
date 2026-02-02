import { useEffect, useMemo, useRef } from "react";
import blogData from "../data/blogData.js";
import NavBar from "./Navbar.jsx";

const withBase = (p) => {
  if (!p) return "";
  if (/^(https?:)?\/\//.test(p)) return p;
  if (p.startsWith("/")) return `${import.meta.env.BASE_URL}${p.slice(1)}`;
  return `${import.meta.env.BASE_URL}${p}`;
};

export default function DatenschutzHero() {
  const liveRef = useRef(null);

  const bgImage = useMemo(() => {
    const facebookPosts = (blogData || []).filter(
      (post) => (post?.category || "").toLowerCase() === "facebook"
    );
    const first = facebookPosts[0];
    const candidate = first?.image;

    // Base-URL sicher machen (GitHub Pages etc.)
    return withBase(candidate) || withBase("/images/fallback-hero.jpg");
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    if (liveRef.current) liveRef.current.textContent = "Datenschutz-Seite geladen.";
  }, []);

  const headingId = "datenschutz-hero-heading";

  return (
    <section
      role="region"
      aria-labelledby={headingId}
      className="categoryHeroWrapper is-datenschutz"
    >
      <span ref={liveRef} aria-live="polite" className="sr-only" />

      <img
        src={bgImage}
        alt=""
        aria-hidden="true"
        className="heroBgImg"
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />

      <div className="NewSecondOverlay" aria-hidden="true" />
      <div className="NewOverlay" aria-hidden="true" />

      <NavBar theme="dark" />

      <div className="heroTextWrapper">
        <div className="NewHeroText">
          <h1 id={headingId} className="categoryTitel">Datenschutz</h1>
        </div>
      </div>
    </section>
  );
}