import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import blogData from "../assets/data/blogData.js";
import ArticleNav from "../assets/components/ArticleNav.jsx";
import ReadMore from "../assets/components/ReadMore.jsx";
import Footer from "../assets/components/Footer.jsx";

export default function ArticleDetails() {
  const { id } = useParams();
  const article = blogData.find((a) => a.id.toString() === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const paragraphs = useMemo(() => {
    const raw = article?.content ?? "";
    return raw
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  }, [article]);

  if (!article) {
    return (
      <>
        <ArticleNav theme="light" />
        <main role="main" className="articleWrapper">
          <section role="status" aria-live="polite" className="articleStatus">
            <h1>Artikel nicht gefunden</h1>
            <p>Der angeforderte Beitrag existiert nicht oder wurde verschoben.</p>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  const headingId = "article-title";
  const descId = "article-desc";

  let credit = (article.imageCredit ?? "").trim();
  let creditUrl = (article.imageCreditUrl ?? "").trim();

  if (!credit && /miasbar/i.test(article.image || "")) {
    credit = "Foto: Mias Bar (Instagram)";
  }

  return (
    <>
      <ArticleNav theme="light" />

      <main role="main" id="main-content" tabIndex={-1}>
        <article
          className="articleWrapper"
          aria-labelledby={headingId}
          aria-describedby={descId}
        >
          <header className="articleHeader">
            {article.category && (
              <p className="category" aria-label={`Kategorie: ${article.category}`}>
                {article.category}
              </p>
            )}

            <h1 id={headingId} className="title">
              {article.title || "Beitrag"}
            </h1>

            {article.description && (
              <p id={descId} className="description">
                {article.description}
              </p>
            )}

            {article.date && (
              <p className="date">
                <time
                  dateTime={toISODate(article.date)}
                  aria-label={`Erscheinungsdatum: ${article.date}`}
                >
                  {article.date}
                </time>
              </p>
            )}
          </header>

          {(article.image || credit || creditUrl) && (
            <figure
              className="articleImage"
              role="group"
              aria-label="Abbildung"
            >
              {article.image && (
                <img
                  src={article.image}
                  alt={article.imageAlt || article.title || "Artikelbild"}
                  loading="lazy"
                  className="articleImageImg"
                />
              )}

              {(credit || creditUrl) && (
                <figcaption
                  className="imageCredit"
                  aria-label="Bildquelle"
                >
                  {creditUrl ? (
                    <a
                      href={creditUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {credit || "Bildquelle"}
                    </a>
                  ) : (
                    <span>{credit}</span>
                  )}
                </figcaption>
              )}
            </figure>
          )}

          <section className="articleContent">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </section>
        </article>

        <section aria-label="Weitere Artikel">
          <ReadMore />
        </section>
      </main>

      <Footer />
    </>
  );
}

function toISODate(dateStr = "") {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(dateStr.trim());
  if (!m) return "";
  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}`;
}