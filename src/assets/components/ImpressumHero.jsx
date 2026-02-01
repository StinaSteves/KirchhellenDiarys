import { useEffect, useMemo, useRef } from "react";
import blogData from "../data/blogData.js";
import NavBar from "./Navbar.jsx";

export default function ImpressumHero() {
  const liveRef = useRef(null);

  const facebookPosts = useMemo(
    () => blogData.filter((post) => post.category?.toLowerCase() === "facebook"),
    []
  );
  const fallbackImage = "/images/fallback-hero.jpg";
  const bgImage =
    facebookPosts.length > 0 && facebookPosts[0].image
      ? facebookPosts[0].image
      : fallbackImage;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "Kirchhellen Diarys – Impressum";
    if (liveRef.current) liveRef.current.textContent = "Impressum-Seite geladen.";
  }, []);

  const headingId = "impressum-hero-heading";
  const descId = "impressum-hero-desc";

  return (
    <section
      role="region"
      aria-labelledby={headingId}
      aria-describedby={descId}
      className="categoryHeroWrapper"
      style={{ "--hero-bg": `url(${bgImage})` }}
    >
      <span ref={liveRef} aria-live="polite" className="sr-only" />

      <div className="NewSecondOverlay" aria-hidden="true" />
      <div className="NewOverlay" aria-hidden="true" />

      <NavBar />

      <div className="heroTextWrapper">
        <div className="NewHeroText">
          <h1 id={headingId} className="categoryTitel">Impressum</h1>
          <p id={descId}>Angaben gemäß § 5 TMG und § 55 RStV</p>
        </div>
      </div>
    </section>
  );
}