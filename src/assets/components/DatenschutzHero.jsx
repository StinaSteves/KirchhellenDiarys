
import { useEffect, useMemo, useRef } from "react";
import blogData from "../data/blogData.js";
import NavBar from "./Navbar.jsx";

export default function DatenschutzHero() {
  const liveRef = useRef(null);

  const bgImage = useMemo(() => {
    const facebookPosts = (blogData || []).filter(
      (post) => (post?.category || "").toLowerCase() === "facebook"
    );
    const first = facebookPosts[0];
    const candidate = first?.image;
    return candidate || "/images/fallback-hero.jpg";
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (liveRef.current) liveRef.current.textContent = "Datenschutz-Seite geladen.";
  }, []);

  const headingId = "datenschutz-hero-heading";
  const hasDesc = false;
  const descId = hasDesc ? "datenschutz-hero-desc" : undefined;

  return (
    <section
      role="region"
      aria-labelledby={headingId}
      aria-describedby={descId}
      className="categoryHeroWrapper is-datenschutz"
    >
      <span ref={liveRef} aria-live="polite" className="sr-only" />

      <img
        src={bgImage}
        alt=""         
        role="presentation" 
        className="heroBgImg"
        loading="eager"
        decoding="async"
        fetchpriority="high"
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
