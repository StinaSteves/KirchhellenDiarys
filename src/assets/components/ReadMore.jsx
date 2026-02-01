import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard, A11y } from "swiper/modules";
import { Link } from "react-router-dom";
import BlogCard from "./BlogCard.jsx";
import blogData from "../data/blogData.js";
import "swiper/css";
import "swiper/css/navigation";

export default function ReadMore() {
  const facebookArticles = blogData.filter(
    (article) => article.category?.toLowerCase() === "facebook"
  );
  if (facebookArticles.length === 0) return null;

  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const liveRef = useRef(null);
  const carouselId = "readmore-carousel";

  const onSlideChange = (swiper) => {
    const idx = swiper.realIndex ?? swiper.activeIndex ?? 0;
    const total = facebookArticles.length;
    const slide = facebookArticles[idx];
    const title = slide?.title ? `„${slide.title}“` : `Slide ${idx + 1}`;
    if (liveRef.current) {
      liveRef.current.textContent = `Slide ${idx + 1} von ${total}: ${title}`;
    }
  };

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
        <h2 id="readmore-heading">Mehr Lesen</h2>
        <hr />
      </div>

      {/* Wrapper bekommt readmoreSlider für gezieltes Styling */}
      <div className="moreSliderWrapper readmoreSlider">
        {/* Navigationspfeile */}
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
            // Refs vor der Init binden
            sw.params.navigation.prevEl = prevRef.current;
            sw.params.navigation.nextEl = nextRef.current;
          }}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          keyboard={{ enabled: true, onlyInViewport: true }}
          a11y={{ enabled: true, containerRoleDescriptionMessage: "Karussell", slideRole: "group" }}
          loop
          spaceBetween={30}
          breakpoints={{
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          onSlideChange={onSlideChange}
        >
          {facebookArticles.map((article, i) => (
            <SwiperSlide key={article.id} aria-label={`Artikel ${i + 1} von ${facebookArticles.length}`}>
        <Link
  to={`/artikel/${article.id}`}
  className="blogCardLink"
  aria-label={`Artikel lesen: ${article.title}`}
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