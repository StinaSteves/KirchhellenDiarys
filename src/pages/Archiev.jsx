import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import blogData from "../assets/data/blogData";
import ArchievHero from "../assets/components/ArchievHero.jsx";
import Footer from "../assets/components/Footer";
import SEO from "../assets/components/SEO.jsx";

function parseDMY(dmy = "") {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(String(dmy).trim());
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), 12, 0, 0, 0);
  return isNaN(d.getTime()) ? null : d;
}
function toISODate(dmy = "") {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(String(dmy).trim());
  if (!m) return "";
  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}`;
}

const MONTHS = [
  "Januar","Februar","März","April","Mai","Juni",
  "Juli","August","September","Oktober","November","Dezember"
];

export default function Archiev() {
  const INITIAL_COUNT = 12;
  const LOAD_STEP = 6;
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setVisibleCount(INITIAL_COUNT);
  }, [location.pathname]);

  const sorted = useMemo(() => {
    return (blogData || [])
      .map((a) => ({ ...a, jsDate: parseDMY(a.date) }))
      .sort((a, b) => {
        if (a.jsDate && b.jsDate) return b.jsDate - a.jsDate;
        if (a.jsDate && !b.jsDate) return -1;
        if (!a.jsDate && b.jsDate) return 1;
        return 0;
      });
  }, []);

  const visibleArticles = useMemo(
    () => sorted.slice(0, visibleCount),
    [sorted, visibleCount]
  );

  const grouped = useMemo(() => {
    const years = new Map();
    for (const a of visibleArticles) {
      const year = a.jsDate ? a.jsDate.getFullYear() : "Ohne Datum";
      const monthIdx = a.jsDate ? a.jsDate.getMonth() : -1;
      if (!years.has(year)) years.set(year, new Map());
      const months = years.get(year);
      if (!months.has(monthIdx)) months.set(monthIdx, []);
      months.get(monthIdx).push(a);
    }
    const yearEntries = Array.from(years.entries()).sort((a, b) => {
      const [ya] = a, [yb] = b;
      if (ya === "Ohne Datum") return 1;
      if (yb === "Ohne Datum") return -1;
      return Number(yb) - Number(ya);
    });
    return yearEntries.map(([year, monthsMap]) => {
      const monthEntries = Array.from(monthsMap.entries()).sort((a, b) => {
        const [ma] = a, [mb] = b;
        if (ma === -1) return 1;
        if (mb === -1) return -1;
        return mb - ma;
      });
      return { year, months: monthEntries };
    });
  }, [visibleArticles]);

  function handleToggle() {
    if (visibleCount >= sorted.length) {
      setVisibleCount(INITIAL_COUNT);
    } else {
      setVisibleCount((prev) => Math.min(prev + LOAD_STEP, sorted.length));
    }
  }

  const headingId = "archive-heading";
  const statusId = "archive-status";

  return (
    <div>
      <SEO
        title="Archiv – Kirchhellen Diarys"
        description="Alle Blogbeiträge nach Jahr und Monat im Archiv."
        ogImage="/images/fallback-hero.jpg"
      />
      <ArchievHero />

      <main role="main" id="main-content" tabIndex={-1} aria-labelledby={headingId} aria-describedby={statusId}>
        <div className="headline mt-4 mb-4">
          <h2 id={headingId}>Archiv</h2>
          <p id={statusId} className="sr-only" aria-live="polite">
            {visibleArticles.length} von {sorted.length} Artikeln sichtbar.
          </p>
        </div>

        <div className="archiveWrapper m-3">
          {grouped.map(({ year, months }) => (
            <section key={year} className="archiveYearSection" aria-labelledby={`year-${year}`}>
              <h3 className="archiveYearHeading" id={`year-${year}`}>{year}</h3>

              {months.map(([mIdx, items], iMonth) => {
                const monthLabel = mIdx === -1 ? "Ohne Datum" : MONTHS[mIdx];
                const detailsId = `month-${year}-${mIdx}`;
                return (
                  <details
                    key={detailsId}
                    className="archiveMonthDetails"
                    {...(iMonth === 0 ? { open: true } : {})}
                  >
                    <summary className="archiveMonthSummary">
                      <span className="archiveMonthName">{monthLabel}</span>
                      <span className="archiveMonthCount" aria-hidden="true">
                        &nbsp;· {items.length}
                      </span>
                      <span className="sr-only"> — {items.length} Artikel</span>
                    </summary>

                    <ul className="archiveList" role="list" aria-label={`${monthLabel} ${year}`}>
                      {items.map((article) => (
                        <li key={article.id} className="archiveItem">
                          <Link
                            to={`/artikel/${article.id}`}
                            className="archiveLink"
                            aria-label={`Artikel öffnen: ${article.title || "Beitrag"}${article.date ? `, vom ${article.date}` : ""}`}
                          >
                            <div className="archiveRow">
                              <span className="archiveDate">
                                {article.date ? (
                                  <time dateTime={toISODate(article.date)}>{article.date}</time>
                                ) : (
                                  "—"
                                )}
                              </span>
                              <span className="archiveTitle">{article.title}</span>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                );
              })}
            </section>
          ))}

          {grouped.length === 0 && (
            <p role="status" aria-live="polite">Keine Einträge gefunden.</p>
          )}
        </div>

        {sorted.length > INITIAL_COUNT && (
          <div className="loadMoreWrapper">
            <button
              onClick={handleToggle}
              className="loadMoreBtn"
              type="button"
              aria-describedby={statusId}
            >
              {visibleCount >= sorted.length ? "Weniger anzeigen" : "Mehr laden"}
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
