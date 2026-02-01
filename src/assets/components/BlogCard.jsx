
import { useRef } from "react";

export default function BlogCard({
  article,
  className = "",
  maxWords = 50,
  imgWidth = 320,
  imgHeight = 180,
  imgSizes = "(max-width: 640px) 100vw, 320px",
}) {
  const title     = (article?.title || "").trim();
  const category  = (article?.category || "").trim();
  const description = (article?.description || "").trim();
  const imgSrc    = article?.image || "";
  const dateStr   = (article?.date || "").trim();

  const uidRef = useRef(
    String(article?.id ?? `x${Math.random().toString(36).slice(2)}`)
      .replace(/[^a-z0-9]+/gi, "")
  );
  const uid = uidRef.current;
  const headingId = `card-title-${uid}`;
  const descId    = `card-desc-${uid}`;

  function truncateWords(text, n) {
    if (!text) return "";
    const words = String(text).split(/\s+/);
    return words.length <= n ? text : words.slice(0, n).join(" ") + "…";
  }

  function toISODate(d) {
    if (!d) return null;
    const m = d.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (!m) return null;
    const [, dd, mm, yyyy] = m;
    return `${yyyy}-${mm}-${dd}`;
  }

  const isoDate = toISODate(dateStr);
  const imgAlt  = title ? `Beitragsbild: ${title}` : "Beitragsbild";

  return (
    <article
      className={`blogCard ${className}`}
      aria-labelledby={headingId}
      aria-describedby={description ? descId : undefined}
      itemScope
      itemType="https://schema.org/Article"
    >
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={imgAlt}
          loading="lazy"
          decoding="async"
          width={imgWidth}
          height={imgHeight}
          sizes={imgSizes}
          itemProp="image"
        />
      ) : (
        <div
          role="img"
          aria-label={title ? `Beitragsbild: ${title}` : "Beitragsbild nicht vorhanden"}
          className="cardImageFallback"
          style={{ aspectRatio: `${imgWidth} / ${imgHeight}` }}
        />
      )}

      <div className="cardText">
        {category && (
          <p className="category" aria-label={`Kategorie: ${category}`} itemProp="articleSection">
            {category}
          </p>
        )}

        <h3 id={headingId} className="title" itemProp="headline">
          {title || "Ohne Titel"}
        </h3>

        {description && (
          <p id={descId} className="description" itemProp="description">
            {truncateWords(description, maxWords)}
          </p>
        )}

        <hr aria-hidden="true" />

        {isoDate && (
          <p className="date">
            <time dateTime={isoDate} itemProp="datePublished">
              {dateStr}
            </time>
          </p>
        )}
      </div>
    </article>
  );
}