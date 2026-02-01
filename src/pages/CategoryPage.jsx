import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import blogData from "../assets/data/blogData";
import CategoryHero from "../assets/components/CategoryHero";
import Footer from "../assets/components/Footer";

export default function CategoryPage() {
  const { categoryName = "" } = useParams();

  const initialCount = 6;
  const loadStep = 3;
  const [visibleCount, setVisibleCount] = useState(initialCount);

  useEffect(() => {
    window.scrollTo(0, 0);
    setVisibleCount(initialCount);
  }, [categoryName]);

  const normalized = String(categoryName).toLowerCase();

  const filteredArticles = useMemo(
    () =>
      blogData.filter(
        (article) => String(article.category || "").toLowerCase() === normalized
      ),
    [normalized]
  );

  const visibleArticles = useMemo(
    () => filteredArticles.slice(0, visibleCount),
    [filteredArticles, visibleCount]
  );

  function handleToggle() {
    if (visibleCount >= filteredArticles.length) {
      setVisibleCount(initialCount);
    } else {
      setVisibleCount((prev) =>
        Math.min(prev + loadStep, filteredArticles.length)
      );
    }
  }

  function toISODate(dateStr = "") {
    const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(dateStr.trim());
    if (!m) return "";
    const [, dd, mm, yyyy] = m;
    return `${yyyy}-${mm}-${dd}`;
  }

  const headingId = "cat-heading";
  const listLabel =
    filteredArticles.length === 1
      ? "1 Artikel"
      : `${filteredArticles.length} Artikel`;

  return (
    <div>
      <CategoryHero />

      <main role="main" id="main-content" tabIndex={-1}>
        <div className="headline mt-4 mb-4">
          <h2 id={headingId}>
            Alle Artikel aus der Kategorie {categoryName || "—"}
          </h2>
          <p className="sr-only" aria-live="polite">
            {listLabel} gefunden.
          </p>
        </div>

        <div
          className="articlesGrid m-3"
          role="list"
          aria-labelledby={headingId}
          aria-describedby="cat-list-desc"
        >
          <p id="cat-list-desc" className="sr-only">
            Liste der Artikel. Wähle einen Eintrag, um den vollständigen Beitrag
            zu lesen.
          </p>

          {visibleArticles.length === 0 ? (
            <p role="status" aria-live="polite">
              Keine Artikel in dieser Kategorie vorhanden.
            </p>
          ) : (
            visibleArticles.map((article) => (
              <div
                key={article.id}
                role="listitem"
                className="blogCardLink"
              >
                <Link
                  to={`/artikel/${article.id}`}
                  className="blogCardLink"
                  aria-label={`Artikel: ${article.title}`}
                >
                  <div className="blogCard">
                    <img
                      src={article.image}
                      alt={article.title}
                      loading="lazy"
                    />
                    <div className="cardText">
                      {article.category && (
                        <p
                          className="category"
                          aria-label={`Kategorie: ${article.category}`}
                        >
                          {article.category}
                        </p>
                      )}
                      <h3 className="title">{article.title}</h3>
                      {article.description && (
                        <p className="description">
                          {article.description.split(" ").slice(0, 50).join(" ")}
                          {article.description.split(" ").length > 50 && "…"}
                        </p>
                      )}
                      <hr aria-hidden="true" />
                      {article.date && (
                        <p className="date">
                          <time dateTime={toISODate(article.date)}>
                            {article.date}
                          </time>
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>

        {filteredArticles.length > initialCount && (
          <div className="loadMoreWrapper">
            <button
              onClick={handleToggle}
              className="loadMoreBtn"
              type="button"
              aria-controls="main-content"
              aria-label={
                visibleCount >= filteredArticles.length
                  ? "Weniger Artikel anzeigen"
                  : "Mehr Artikel laden"
              }
            >
              {visibleCount >= filteredArticles.length
                ? "Weniger anzeigen"
                : "Mehr laden"}
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}