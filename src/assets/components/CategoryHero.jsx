
import { useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import blogData from "../data/blogData.js";
import NavBar from "./Navbar.jsx";

export default function NewHero({ category: categoryProp }) {
  const { categoryName: categoryFromUrl } = useParams();
  const categoryRaw = (categoryProp ?? categoryFromUrl ?? "")
    .toLowerCase()
    .trim();

  const displayMap = {
    mood: "Mood",
    inside: "Inside",
    dorf: "Dorf",
  };
  const displayName =
    displayMap[categoryRaw] ??
    (categoryRaw ? categoryRaw[0].toUpperCase() + categoryRaw.slice(1) : "Kategorie");

  const descriptionMap = {
    mood:
      "In dieser Kategorie geht es um den Umgang mit meiner Angststörung und den Herausforderungen des Alltags. Ich schreibe über persönliche Erfahrungen, Strategien zur Bewältigung und Gedanken rund um mentale Gesundheit.",
    dorf:
      "Kirchhellen lebt von seinem Miteinander. In dieser Kategorie geht es um das Dorfleben: Veranstaltungen, Vereine, Gastronomie, Geschäfte und besondere Momente, die das Leben hier ausmachen.",
    inside:
      "Diese Kategorie beleuchtet Hintergründe und Entwicklungen in Kirchhellen. Themen wie Immobilienlage, Lokalpolitik oder gesellschaftliche Veränderungen finden hier ihren Platz.",
  };
  const description = descriptionMap[categoryRaw] ?? "";

  const posts = useMemo(
    () => (blogData || []).filter((p) => p.category?.toLowerCase() === categoryRaw),
    [categoryRaw]
  );

  const fallbackImage = "/images/fallback-hero.jpg";
  const bgImage = posts.length > 0 && posts[0]?.image ? posts[0].image : fallbackImage;

  const liveRef = useRef(null);

  useEffect(() => {
    const titleSuffix = displayName && displayName !== "Kategorie" ? ` – ${displayName}` : "";
    document.title = `Kirchhellen Diarys${titleSuffix}`;
    liveRef.current && (liveRef.current.textContent = `Kategorie ${displayName} geladen.`);
  }, [displayName]);

  useEffect(() => {
    if (!bgImage) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = bgImage;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [bgImage]);

  const headingId = "category-hero-title";
  const descId = description ? "category-hero-desc" : undefined;

  return (
    <section
      role="region"
      aria-labelledby={headingId}
      {...(descId ? { "aria-describedby": descId } : {})}
      aria-roledescription="Hero"
      className="categoryHeroWrapper"
    >
      <span ref={liveRef} aria-live="polite" className="sr-only" />

      <div className="NewSecondOverlay" aria-hidden="true" />
      <div className="NewOverlay" aria-hidden="true" />

      <NavBar />

      <figure className="heroMedia" aria-hidden="true">
        <img
          src={bgImage}
          alt=""
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
      </figure>

      <div className="heroTextWrapper">
        <div className="NewHeroText">
          <p className="heroSectionLabel" aria-label="Bereich">
            Kategorie
          </p>
          <h1 id={headingId} className="categoryTitel">
            {displayName}
          </h1>
          {description && (
            <p id={descId} className="categoryDescription">
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}