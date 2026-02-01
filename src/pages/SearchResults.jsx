import { useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import blogData from "../assets/data/blogData";

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

export default function SearchResults() {
  const q = (useQuery().get("q") || "").trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return [];
    return (blogData || []).filter((a) => {
      const hay = [a.title, a.category, a.description, a.content]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [q]);

  useEffect(() => {
    if (q) {
      document.title = `Suche: "${q}" – Kirchhellen Diarys`;
    } else {
      document.title = "Suche – Kirchhellen Diarys";
    }
  }, [q]);

  return (
    <>
      <a href="#main-content" className="sr-only sr-only-focusable">
        Zum Hauptinhalt springen
      </a>

      <main
        id="main-content"
        className="searchPage"
        role="main"
        aria-labelledby="search-heading"
      >
        <h1 id="search-heading" className="searchTitle">
          Suche: {q ? `"${q}"` : "Bitte Suchbegriff eingeben"}
        </h1>

        {q && (
          <p className="searchMeta" aria-live="polite">
            {results.length}{" "}
            {results.length === 1 ? "Treffer gefunden" : "Treffer gefunden"}
          </p>
        )}

        {q && results.length === 0 && (
          <p role="status" aria-live="polite" className="searchNoResults">
            Keine Ergebnisse gefunden. Bitte versuche es mit einem anderen Suchbegriff.
          </p>
        )}

        {results.length > 0 && (
          <ul className="searchList" role="list">
            {results.map((a) => (
              <li key={a.id} className="searchItem">
                <Link
                  to={`/artikel/${a.id}`}
                  className="searchLink"
                  aria-label={`Artikel öffnen: ${a.title}`}
                >
                  <article
                    className="searchCard"
                    aria-labelledby={`s-${a.id}`}
                  >
                    <h2 id={`s-${a.id}`} className="searchItemTitle">
                      {a.title}
                    </h2>
                    {a.description && (
                      <p className="searchItemDesc">
                        {a.description.split(" ").slice(0, 24).join(" ")}
                        {a.description.split(" ").length > 24 ? "…" : ""}
                      </p>
                    )}
                    {a.category && (
                      <p className="searchItemCat">{a.category}</p>
                    )}
                  </article>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}