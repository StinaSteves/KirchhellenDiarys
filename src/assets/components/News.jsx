import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

import blogData from "../data/blogData";
import BlogCard from "./BlogCard.jsx";

export default function News() {
  const category = "dorf";

  const items = useMemo(
    () =>
      blogData.filter(
        (a) => (a.category || "").toLowerCase() === category.toLowerCase()
      ),
    [category]
  );

  const [current, setCurrent] = useState(0);
  const liveRef = useRef(null);
  const swiperRef = useRef(null);

  useEffect(() => {
    if (!items.length || !liveRef.current) return;
    const slide = items[current];
    const title = slide?.title ? `„${slide.title}“` : `Slide ${current + 1}`;
    liveRef.current.textContent = `Slide ${current + 1} von ${items.length}: ${title}`;
  }, [current, items]);

  if (items.length === 0) {
    return (
      <section aria-labelledby="news-heading" className="newsArticle mt-4">
        <div className="newsArticleText">
          <p>Neues</p>
          <h2 id="news-heading">Aus dem Dorf</h2>
          <p>Keine Beiträge vorhanden.</p>
        </div>
      </section>
    );
  }

  const groupLabel = "News-Slider Aus dem Dorf";

  return (
    <section
      className="newsArticle mt-4"
      aria-labelledby="news-heading"
      role="region"
      aria-roledescription="Karussell"
      aria-label={groupLabel}
    >
      <span ref={liveRef} aria-live="polite" className="sr-only" />

      <div className="newsArticleText">
        <p>Neues</p>
        <h2 id="news-heading">Aus dem Dorf</h2>
        <p>Was geht in Kirchhellen</p>

        <Link
          to={`/kategorie/${category}`}
          className="category-all mt-1"
          aria-label="Alle Dorf-Artikel anzeigen"
        >
          Alle Artikel <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
        </Link>
      </div>

      <div className="newsSliderWrapper">
        <Swiper
          modules={[Navigation]}
          onSwiper={(sw) => {
            swiperRef.current = sw;
            setCurrent(sw.realIndex || 0);
          }}
          onSlideChange={(sw) => setCurrent(sw.realIndex || 0)}
          navigation={{
            nextEl: ".news-next",
            prevEl: ".news-prev",
          }}
          spaceBetween={30}
          slidesPerView={1}
          loop
        >
          {items.map((article, idx) => (
            <SwiperSlide key={article.id}>
              <article
                aria-roledescription="Slide"
                aria-label={`Slide ${idx + 1} von ${items.length}`}
              >
                <Link
                  to={`/artikel/${article.id}`}
                  className="blogCardLink"
                  aria-label={`Zum Artikel: ${article.title}`}
                >
                  <BlogCard article={article} />
                </Link>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="news-controls" role="group" aria-label="Karussellsteuerung">
          <button
           type="button" className="category-nav news-prev"
            aria-label="Vorheriger Beitrag"
            onClick={() => swiperRef.current?.slidePrev()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                swiperRef.current?.slidePrev();
              }
            }}
          >
            ‹
          </button>
          <button
            type="button"
           className="category-nav news-next"
            aria-label="Nächster Beitrag"
            onClick={() => swiperRef.current?.slideNext()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                swiperRef.current?.slideNext();
              }
            }}
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}