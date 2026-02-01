import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import heroSlides from "../data/heroSlides.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import NewNav from "./Navbar.jsx";

export default function NewHero() {
  const slides = useMemo(() => heroSlides ?? [], []);
  const total = slides.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const liveRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (mq?.matches) setIsPlaying(false);
  }, []);

  useEffect(() => {
    clearInterval(timerRef.current);
    if (isPlaying && total > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((i) => (i === total - 1 ? 0 : i + 1));
      }, 5000);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, total]);

  useEffect(() => {
    if (!liveRef.current || total === 0) return;
    const s = slides[currentIndex];
    const title = s?.title ? `„${s.title}“` : `Slide ${currentIndex + 1}`;
    liveRef.current.textContent = `Slide ${currentIndex + 1} von ${total}: ${title}`;
  }, [currentIndex, total, slides]);

  if (total === 0) {
    return (
      <section role="region" aria-label="Hero">
        <NewNav />
        <div className="heroTextWrapper">
          <div className="NewHeroText">
            <h2>Keine Inhalte</h2>
            <p>Es sind noch keine Slides vorhanden.</p>
          </div>
        </div>
      </section>
    );
  }

  const currentSlide = slides[currentIndex] || {};
  const bgImage = currentSlide.image || "/images/fallback-hero.jpg";
  const categoryText = currentSlide.category || "Kategorie";
  const titleText = currentSlide.title || "Beitrag";
  const descFull = currentSlide.description || "";
  const words = descFull.split(" ");
  const descriptionText =
    words.slice(0, 50).join(" ") + (words.length > 50 ? "…" : "");

  const headingId = "newhero-heading";
  const descId = "newhero-desc";

  return (
    <section
      className="heroWrapper"
      role="region"
      aria-roledescription="Slideshow"
      aria-labelledby={headingId}
      aria-describedby={descId}
      style={{ "--hero-bg": `url(${bgImage})` }}
    >
      <span ref={liveRef} aria-live="polite" className="sr-only" />

      <div className="NewSecondOverlay" aria-hidden="true" />
      <div className="NewOverlay" aria-hidden="true" />
      <NewNav />

      <div className="heroTextWrapper">
        <div className="NewHeroText">
          <p id={descId}>{categoryText}</p>
          <h2 id={headingId}>{titleText}</h2>
          {descriptionText && <p>{descriptionText}</p>}

          <Link to={`/artikel/${currentSlide.id}`} aria-label={`Zum Artikel: ${titleText}`}>
            <button className="readArticleBtn" type="button">
              <span className="iconCircle" aria-hidden="true">
                <FontAwesomeIcon icon={faArrowRight} />
              </span>
              <span className="label">Artikel lesen</span>
            </button>
          </Link>
        </div>
      </div>

      {total > 1 && (
        <div className="heroDotsWrapper" role="tablist" aria-label="Slides">
          {slides.map((s, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === currentIndex}
              aria-label={`Slide ${i + 1} von ${total}: ${s.title}`}
              className={`heroDot ${i === currentIndex ? "active" : ""}`}
              onClick={() => {
                setCurrentIndex(i);
                setIsPlaying(true);
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}