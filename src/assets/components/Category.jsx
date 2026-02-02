
import { useState, useRef, useEffect, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import BlogCard from "./BlogCard.jsx";
import blogData from "../data/blogData.js";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";

export default function Category() {
  const [active, setActive] = useState("mood");
  const menuItems = ["mood", "inside", "dorf"];
  const navigate = useNavigate();

  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);
  const tabRefs = useRef([]);

  const filteredArticles = useMemo(
    () =>
      (blogData || []).filter(
        (article) =>
          (article.category || "").toLowerCase() === active.toLowerCase()
      ),
    [active]
  );

  useEffect(() => {
    if (swiperRef.current && prevRef.current && nextRef.current) {
      const swiper = swiperRef.current;
      if (swiper.params?.navigation) {
        swiper.params.navigation.prevEl = prevRef.current;
        swiper.params.navigation.nextEl = nextRef.current;
        swiper.navigation.destroy();
        swiper.navigation.init();
        swiper.navigation.update();
      }
    }
  }, [active]);

  function onTabsKeyDown(e) {
    const currentIndex = menuItems.indexOf(active);
    let nextIndex = currentIndex;

    switch (e.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % menuItems.length;
        break;
      case "ArrowLeft":
        nextIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = menuItems.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    const next = menuItems[nextIndex];
    setActive(next);
    tabRefs.current[nextIndex]?.focus?.();
  }

  const headingId = "category-heading";
  const regionStatusId = "category-status";
  const carouselPanelId = "category-carousel-panel";

  return (
    <section
      className="categoryWrapper mt-4"
      role="region"
      aria-labelledby={headingId}
      aria-describedby={regionStatusId}
    >
      <div className="category">
        <h2 id={headingId}>Kategorien</h2>
      </div>

      <div className="categoryList">
        <div
          role="tablist"
          aria-label="Kategorien auswählen"
          onKeyDown={onTabsKeyDown}
          className="tabs"
        >
          {menuItems.map((item, idx) => {
            const isActive = active === item;
            const tabId = `tab-${item}`;
            const thisPanelId = `panel-${item}`;
            return (
              <button
                key={item}
                ref={(el) => (tabRefs.current[idx] = el)}
                id={tabId}
                role="tab"
                type="button"
                aria-selected={isActive}
                aria-controls={thisPanelId}
                tabIndex={isActive ? 0 : -1}
                className={`tabBtn ${isActive ? "is-active" : ""}`}
                onClick={() => setActive(item)}
              >
                {item}
              </button>
            );
          })}
        </div>

        {menuItems.map((item) => {
          const tabId = `tab-${item}`;
          const thisPanelId = `panel-${item}`;
          const isActive = active === item;
          return (
            <section
              key={thisPanelId}
              id={thisPanelId}
              role="tabpanel"
              aria-labelledby={tabId}
              hidden={!isActive}
            >
            </section>
          );
        })}
      </div>

      <div className="categoryUnderlineWrapper" aria-hidden="true">
        <div className="categoryUnderline"></div>
      </div>

      <p id={regionStatusId} className="sr-only" aria-live="polite">
        Kategorie {active}. {filteredArticles.length} Beiträge.
      </p>

      <div
        id={carouselPanelId}
        role="tabpanel"
        aria-labelledby={`tab-${active}`}
        className="categorySliderWrapper mt-2"
      >
        <Swiper
          modules={[Navigation]}
          speed={300}
          watchOverflow
          onBeforeInit={(swiper) => {
            swiper.params.navigation = {
              ...(swiper.params.navigation || {}),
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            };
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            if (prevRef.current && nextRef.current) {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
            }
          }}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1300: { slidesPerView: 4 },
          }}
          aria-roledescription="Karussell"
          aria-label={`Beiträge der Kategorie ${active}`}
        >
          {filteredArticles.map((article) => (
            <SwiperSlide key={article.id}>
              <Link
                to={`/artikel/${article.id}`}
                className="blogCardLink"
                aria-label={`Zum Artikel: ${article.title}`}
              >
                <BlogCard article={article} />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="categoryControls">
          <button
            type="button"
            className="category-all"
            onClick={() => navigate(`/kategorie/${active}`)}
            aria-label={`Alle Artikel in der Kategorie ${active} anzeigen`}
          >
            Alle Artikel <FontAwesomeIcon icon={faArrowRight} />
          </button>

          <div className="controlsWrapper" role="group" aria-label="Karussell steuern">
            <button
              ref={prevRef}
              type="button"
              className="category-nav"
              aria-label="Vorherige Slides"
              aria-controls={carouselPanelId}
              onClick={() => swiperRef.current?.slidePrev()}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  swiperRef.current?.slidePrev();
                }
              }}
            >
              ‹
            </button>
            <button
              ref={nextRef}
              type="button"
              className="category-nav"
              aria-label="Nächste Slides"
              aria-controls={carouselPanelId}
              onClick={() => swiperRef.current?.slideNext()}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  swiperRef.current?.slideNext();
                }
              }}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}