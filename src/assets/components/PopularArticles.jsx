import blogData from "../data/blogData";
import { Link } from "react-router-dom";

const parseDate = (date) => {
  if (!date) return 0;

  const iso = Date.parse(date);
  if (!isNaN(iso)) return iso;

  const match = date.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return new Date(`${y}-${m}-${d}`).getTime();
  }

  return 0;
};

export default function PopularArticles() {
  const popularArticles = (blogData || [])
    .slice() 
    .sort((a, b) => parseDate(b?.date) - parseDate(a?.date))
    .slice(0, 3);

  const altFor = (article) =>
    article?.image ? `Beitragsbild: ${article.title || "Artikel"}` : "";

  if (popularArticles.length === 0) {
    return (
      <section aria-labelledby="popular-heading" role="region">
        <div className="popArticles">
          <hr aria-hidden="true" />
          <h2 id="popular-heading">Beliebte Artikel</h2>
          <hr aria-hidden="true" />
        </div>
        <p role="status" aria-live="polite">
          Keine beliebten Artikel vorhanden.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="popular-heading" role="region">
      <div className="popArticles">
        <hr aria-hidden="true" />
        <h2 id="popular-heading">Beliebte Artikel</h2>
        <hr aria-hidden="true" />
      </div>

      <ul className="popularGrid" role="list">
        {popularArticles.map((article) => {
          const title = article?.title || "Unbenannter Artikel";
          const desc = article?.description || "";
          const words = desc.split(/\s+/).filter(Boolean);
          const excerpt =
            words.slice(0, 20).join(" ") +
            (words.length > 20 ? "…" : "");

          const hasImg = Boolean(article?.image);
          const titleId = `pop-title-${article.id}`;
          const dateISO = article?.date ? new Date(parseDate(article.date)) : null;

          return (
            <li key={article.id} className="popularCardItem">
              <article className="popularCard" aria-labelledby={titleId}>
                <Link to={`/artikel/${article.id}`} className="popularCardLink">
                  <figure className="popularCardMedia">
                    {hasImg ? (
                      <img
                        src={article.image}
                        alt={altFor(article)}
                        loading="lazy"
                        decoding="async"
                        width={320}
                        height={180}
                        sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                      />
                    ) : (
                      <div
                        className="popularCardMedia--fallback"
                        aria-hidden="true"
                        style={{ aspectRatio: "16/9" }}
                      />
                    )}
                  </figure>

                  <div className="cardText">
                    {article.category && (
                      <p className="category">{article.category}</p>
                    )}

                    <h3 id={titleId} className="title">
                      {title}
                    </h3>

                    {excerpt && (
                      <p className="description">{excerpt}</p>
                    )}

                    {article.date && (
                      <p className="date">
                        {dateISO instanceof Date && !isNaN(dateISO)
                          ? (
                            <time dateTime={dateISO.toISOString()}>
                              {article.date}
                            </time>
                          )
                          : <span>{article.date}</span>}
                      </p>
                    )}
                  </div>
                </Link>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}