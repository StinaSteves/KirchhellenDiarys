import { useMemo, useState } from "react";
import blogData from "../data/blogData";
import { Link } from "react-router-dom";

const parseDate = (date) => {
  if (!date) return 0;

  const iso = Date.parse(date);
  if (!isNaN(iso)) return iso;

  const m = date.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (m) {
    const [, d, mo, y] = m;
    return new Date(`${y}-${mo}-${d}`).getTime();
  }

  return 0;
};

export default function RecentArticles() {
  const INITIAL_COUNT = 6;
  const LOAD_STEP = 3;

  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  const total = blogData.length;

  const visibleArticles = useMemo(
    () =>
      blogData
        .slice()
        .sort((a, b) => parseDate(b?.date) - parseDate(a?.date))
        .slice(0, visibleCount),
    [visibleCount]
  );

  const srStatus = `${visibleArticles.length} von ${total} Artikeln sichtbar.`;

  function handleToggle() {
    if (visibleCount >= total) {
      setVisibleCount(INITIAL_COUNT);
    } else {
      setVisibleCount((prev) => Math.min(prev + LOAD_STEP, total));
    }
  }

  function truncateWords(text = "", max = 50) {
    const words = String(text).trim().split(/\s+/).filter(Boolean);
    if (words.length <= max) return words.join(" ");
    return words.slice(0, max).join(" ") + "…";
  }

  function isoFromDateStr(str) {
    const t = parseDate(str);
    return t ? new Date(t).toISOString() : null;
  }

  function imgAlt(article) {
    if (!article?.image) return "";
    const title = article?.title || "Artikel";
    return `Beitragsbild: ${title}`;
  }

  const listId = "recent-articles-list";
  const headingId = "recent-heading";
  const descId = "recent-desc";
  const statusId = "recent-status";

  return (
    <section
      className="recent-articles"
      role="region"
      aria-labelledby={headingId}
      aria-describedby={`${descId} ${statusId}`}
    >
      <div className="headline mt-4">
        <h2 id={headingId}>Neueste Artikel</h2>
        <p id={descId}>
          Die aktuellsten Beiträge – wähle einen Artikel aus, um die Details zu lesen.
        </p>
      </div>

      <p id={statusId} className="sr-only" aria-live="polite">
        {srStatus}
      </p>

      <ul id={listId} className="articlesGrid m-3" role="list">
        {visibleArticles.map((article) => {
          const title = article?.title || "Beitrag";
          const category = article?.category || "Allgemein";
          const desc = truncateWords(article?.description, 50);
          const dateText = article?.date || "";
          const dateISO = dateText ? isoFromDateStr(dateText) : null;
          const hasImg = Boolean(article?.image);
          const titleId = `t-${article.id}`;

          return (
            <li key={article.id} className="articleItem">
              <article className="blogCard" aria-labelledby={titleId}>
                <Link to={`/artikel/${article.id}`} className="blogCardLink">
                  <figure className="blogCardMedia">
                    {hasImg ? (
                      <img
                        src={article.image}
                        alt={imgAlt(article)}
                        loading="lazy"
                        decoding="async"
                        width={320}
                        height={200}
                        sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                        className="blogCardImage"
                      />
                    ) : (
                      <div
                        className="blogCardImage--fallback"
                        aria-hidden="true"
                        style={{ aspectRatio: "16/10" }}
                      />
                    )}
                  </figure>

                  <div className="cardText">
                    <p className="category">{category}</p>

                    <h3 id={titleId} className="title">
                      {title}
                    </h3>

                    {desc && <p className="description">{desc}</p>}

                    <hr aria-hidden="true" />

                    {dateText && (
                      <p className="date">
                        {dateISO ? (
                          <time dateTime={dateISO}>{dateText}</time>
                        ) : (
                          <span>{dateText}</span>
                        )}
                      </p>
                    )}
                  </div>
                </Link>
              </article>
            </li>
          );
        })}
      </ul>

      {total > INITIAL_COUNT && (
        <div className="loadMoreWrapper">
          <button
            type="button"
            onClick={handleToggle}
            className="loadMoreBtn"
            aria-describedby={statusId}
          >
            {visibleCount >= total ? "Weniger anzeigen" : "Mehr laden"}
          </button>
        </div>
      )}
    </section>
  );
}