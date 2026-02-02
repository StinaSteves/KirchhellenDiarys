import { useRef, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard, A11y } from "swiper/modules";
import { Link, useParams } from "react-router-dom";
import BlogCard from "./BlogCard.jsx";
import blogData from "../data/blogData.js";
import "swiper/css";
import "swiper/css/navigation";

export default function ReadMore() {
  const { id: currentId } = useParams();

  // 🏡 Nur Dorf-Artikel + aktueller Artikel rausfiltern
  const dorfArticles = useMemo(() => {
    return (blogData || []).filter((article) => {
      const cat = String(article?.category ?? "").toLowerCase().trim();
      const isDorf = cat === "dorf" || cat.includes("dorf");
      const notCurrent = article.id?.toString() !== currentId;
      return isDorf && notCurrent;
    });
  }, [currentId]);

  // 🚫 wenn nichts da ist → Section gar nicht rendern
  if (dorfArticles.length === 0) return null;

  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const liveRef = useRef(null);
  const carouselId = "readmore-carousel";

  const onSlideChange = (swiper) => {
    const idx = swiper.realIndex ?? swiper.activeIndex ?? 0;
    const total = dorfArticles.length;
    const slide = dorfArticles[idx];
    const title = slide?.title ? `„${slide.title}“` : `Slide ${idx + 1}`;
    if (liveRef.current) {
      liveRef.current.textContent = `Artikel ${idx + 1} von ${total}: ${title}`;
    }
  };

  const shouldLoop = dorfArticles.length > 3;

  return (
    <section
      className="moreSliderSection"
      role="region"
      aria-roledescription="Karussell"
      aria-labelledby="readmore-heading"
    >
      <span ref={liveRef} aria-live="polite" className="sr-only" />

      <div className="popArticles">
        <hr />
        <h2 id="readmore-heading">Mehr aus dem Dorf</h2>
        <hr />
      </div>

      <div className="moreSliderWrapper readmoreSlider">
        <button
          ref={prevRef}
          type="button"
          className="news-nav news-prev"
          aria-controls={carouselId}
          aria-label="Vorheriger Artikel"
        >
          ‹
        </button>

        <button
          ref={nextRef}
          type="button"
          className="news-nav news-next"
          aria-controls={carouselId}
          aria-label="Nächster Artikel"
        >
          ›
        </button>

        <Swiper
          modules={[Navigation, Keyboard, A11y]}
          id={carouselId}
          onBeforeInit={(sw) => {
            sw.params.navigation.prevEl = prevRef.current;
            sw.params.navigation.nextEl = nextRef.current;
          }}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          keyboard={{ enabled: true, onlyInViewport: true }}
          a11y={{
            enabled: true,
            containerRoleDescriptionMessage: "Karussell",
            slideRole: "group",
          }}
          loop={shouldLoop}
          spaceBetween={30}
          breakpoints={{
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          onInit={onSlideChange}
          onSlideChange={onSlideChange}
        >
          {dorfArticles.map((article, i) => (
            <SwiperSlide
              key={article.id}
              aria-label={`Artikel ${i + 1} von ${dorfArticles.length}`}
            >
              <Link
                to={`/artikel/${article.id}`}
                className="blogCardLink"
                aria-label={`Artikel lesen: ${article.title ?? "Artikel"}`}
                onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "auto" })}
              >
                <BlogCard article={article} />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}