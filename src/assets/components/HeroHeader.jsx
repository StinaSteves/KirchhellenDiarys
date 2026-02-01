import { useEffect, useMemo, useRef, useState, useId } from "react";
import { Link } from "react-router-dom";
import NavBar from "./Navbar.jsx";
import heroSlides from "../data/heroSlides.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

export default function HeroHeader() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const liveRef = useRef(null);
  const sectionRef = useRef(null);
  const timerRef = useRef(null);
  const wasPlayingRef = useRef(true); 

  const slides = useMemo(() => heroSlides ?? [], []);
  const total = slides.length;
  const currentSlide = slides[currentIndex] || {};

  const baseId = useId().replace(/:/g, "");
  const headingId = `${baseId}-home-hero-heading`;
  const descId = `${baseId}-home-hero-desc`;

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
    if (liveRef.current && total > 0) {
      const s = slides[currentIndex];
      const title = s?.title ? `„${s.title}“` : `Slide ${currentIndex + 1}`;
      liveRef.current.textContent = `Slide ${currentIndex + 1} von ${total}: ${title}`;
    }
  }, [currentIndex, total, slides]);

  useEffect(() => {
    const onVis = () => {
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (document.hidden) {
        wasPlayingRef.current = isPlaying;
        setIsPlaying(false);
      } else {
        if (!reduced && wasPlayingRef.current) setIsPlaying(true);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [isPlaying]);

  function onKeyDown(e) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setCurrentIndex((i) => (i === total - 1 ? 0 : i + 1));
      setIsPlaying(false);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setCurrentIndex((i) => (i === 0 ? total - 1 : i - 1));
      setIsPlaying(false);
    } else if (e.key === " " || e.key === "Enter") {
      if (document.activeElement === sectionRef.current) {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    }
  }

  const bgImage = currentSlide?.image || "/images/fallback-hero.jpg";
  const titleText = currentSlide?.title || "Aktueller Beitrag";
  const categoryText = currentSlide?.category || "Kategorie";
  const descriptionText = (() => {
    const txt = currentSlide?.description || "";
    const words = txt.split(/\s+/);
    return words.slice(0, 50).join(" ") + (words.length > 50 ? "…" : "");
  })();

  const nextIndex = (currentIndex + 1) % Math.max(total, 1);
  const nextImage = slides[nextIndex]?.image;

  return (
    <section
      ref={sectionRef}
      className="heroWrapper"
      role="region"
      aria-roledescription="Slideshow"
      aria-labelledby={headingId}
      aria-describedby={descId}
      tabIndex={0}
      onKeyDown={onKeyDown}
      style={{ backgroundImage: `url(${bgImage})` }}
      onFocus={() => setIsPlaying(false)}
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => {
        const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
        if (!mq?.matches) setIsPlaying(true);
      }}
    >
      <img
        src={bgImage}
        alt=""
        aria-hidden="true"
        decoding="async"
       fetchPriority="high" 
        style={{
          position: "absolute",
          width: 0,
          height: 0,
          overflow: "hidden",
          pointerEvents: "none",
          opacity: 0,
        }}
      />
      {nextImage ? (
        <link rel="preload" as="image" href={nextImage} />
      ) : null}

      <span ref={liveRef} aria-live="polite" className="sr-only" />

      <div className="overlay" aria-hidden="true" />
      <NavBar />

      <div className="heroTextWrapper">
        <div className="heroText">
          <p id={descId}>{categoryText}</p>
          <h1 id={headingId}>{titleText}</h1>
          {descriptionText && <p>{descriptionText}</p>}

          <div className="heroActions">
            {currentSlide?.id && (
              <Link
                to={`/artikel/${currentSlide.id}`}
                aria-label={`Zum Artikel: ${titleText}`}
                className="readArticleBtn"
              >
                <span className="iconCircle" aria-hidden="true">
                  <FontAwesomeIcon icon={faArrowRight} />
                </span>
                <span className="label">Artikel lesen</span>
              </Link>
            )}

            {total > 1 && (
              <div className="heroControls" role="group" aria-label="Slideshow-Steuerung">
                <button
                  type="button"
                  className="heroCtrlBtn"
                  onClick={() => {
                    setCurrentIndex((i) => (i === 0 ? total - 1 : i - 1));
                    setIsPlaying(false);
                  }}
                  aria-label="Vorheriger Slide"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="heroCtrlBtn"
                  onClick={() => setIsPlaying((p) => !p)}
                  aria-label={isPlaying ? "Slideshow pausieren" : "Slideshow abspielen"}
                  aria-pressed={isPlaying}
                >
                  {isPlaying ? "Pause" : "Play"}
                </button>
                <button
                  type="button"
                  className="heroCtrlBtn"
                  onClick={() => {
                    setCurrentIndex((i) => (i === total - 1 ? 0 : i + 1));
                    setIsPlaying(false);
                  }}
                  aria-label="Nächster Slide"
                >
                  ›
                </button>
                <span aria-live="polite" className="sr-only">
                  {`Slide ${currentIndex + 1} von ${total}`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}