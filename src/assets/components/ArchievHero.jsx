
import { useEffect, useMemo, useRef } from "react";
import blogData from "../data/blogData.js";
import NavBar from "./Navbar.jsx";

export default function ArchievHero() {
  const liveRef = useRef(null);

  const facebookPosts = useMemo(
    () => (blogData || []).filter(p => p.category?.toLowerCase() === "facebook"),
    []
  );

  const fallbackImage = "/images/fallback-hero.jpg";
  const bgImage =
    facebookPosts.length > 0 && facebookPosts[0]?.image
      ? facebookPosts[0].image
      : fallbackImage;


  useEffect(() => {
    if (liveRef.current) liveRef.current.textContent = "Archiev-Seite geladen.";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const headingId = "archiev-hero-heading";
  const descId = "archiev-hero-desc";

  return (
    <section
      className="categoryHeroWrapper is-archiev"
      role="region"
      aria-labelledby={headingId}
      aria-describedby={descId}
    >
      <img
        className="heroMedia"
        src={bgImage}
        alt=""                 
        decoding="async"
        fetchPriority="high" 
      />
      <div className="NewSecondOverlay" aria-hidden="true" />
      <div className="NewOverlay" aria-hidden="true" />
      <span ref={liveRef} aria-live="polite" className="sr-only" />

      <NavBar />

      <div className="heroTextWrapper">
        <div className="NewHeroText">
          <h1 id={headingId} className="categoryTitel">
            Archiev
          </h1>
          <p id={descId} className="sr-only">
            Archivübersicht der Blogbeiträge. Nutze die Navigation, um zu den Abschnitten zu springen.
          </p>
        </div>
      </div>
    </section>
  );
}
