import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import blogData from "../assets/data/blogData.js";
import ArticleNav from "../assets/components/ArticleNav.jsx";
import ReadMore from "../assets/components/ReadMore.jsx";
import Footer from "../assets/components/Footer.jsx";
import CommentsBox from "../assets/components/CommentsBox.jsx";
import { getSession, getPostReactions, votePost } from "../lib/commentsApi";

export default function ArticleDetails() {
  const { id } = useParams();
  const article = blogData.find((a) => a.id.toString() === id);

  const [upCount, setUpCount] = useState(0);
  const [downCount, setDownCount] = useState(0);
  const [userVote, setUserVote] = useState(0);
  const [csrf, setCsrf] = useState("");
  const [msg, setMsg] = useState("");

  const liveRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!article) return;
    (async () => {
      const s = await getSession();
      if (s.ok) setCsrf(s.csrf || "");
      const r = await getPostReactions(article.id.toString());
      if (r.ok) {
        setUpCount(r.up_count ?? 0);
        setDownCount(r.down_count ?? 0);
        setUserVote(r.user_vote ?? 0);
      }
    })();
  }, [article]);

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

  async function handleVote(value) {
    setMsg("");
    const next = userVote === value ? 0 : value;
    const res = await votePost({ postId: article.id.toString(), value: next, csrf });
    if (res.ok) {
      setUpCount(res.up_count ?? 0);
      setDownCount(res.down_count ?? 0);
      setUserVote(res.user_vote ?? 0);
      if (liveRef.current) {
        const label =
          next === 0
            ? "Stimme zurückgenommen."
            : next === 1
            ? "Gefällt mir abgegeben."
            : "Gefällt mir nicht abgegeben.";
        liveRef.current.textContent = `${label} Gesamt: ${res.up_count ?? 0} positiv, ${res.down_count ?? 0} negativ.`;
      }
    } else {
      setMsg(res.error || "Aktion fehlgeschlagen");
      if (liveRef.current) liveRef.current.textContent = "Aktion fehlgeschlagen.";
    }
  }

  const headingId = "article-title";
  const descId = "article-desc";

  let credit = (article.imageCredit ?? "").trim();
  let creditUrl = (article.imageCreditUrl ?? "").trim();

  if (process.env.NODE_ENV !== "production") {
    console.log("Image credit fields:", { credit, creditUrl, image: article.image });
  }

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
                <time dateTime={toISODate(article.date)} aria-label={`Erscheinungsdatum: ${article.date}`}>
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
          <a href={creditUrl} target="_blank" rel="noopener noreferrer">
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

          <section
            className="article-reactions"
            role="group"
            aria-label="Reaktionen zum Beitrag"
          >
            <span ref={liveRef} aria-live="polite" className="sr-only" />
            <button
              type="button"
              onClick={() => handleVote(1)}
              aria-pressed={userVote === 1}
              aria-label={`Gefällt mir. Aktuell ${upCount} Stimmen`}
              className={`article-reactBtn ${userVote === 1 ? "is-active" : ""}`}
              title="Gefällt mir"
            >
              <i className="fa-regular fa-thumbs-up" aria-hidden="true"></i>
              <span className="sr-only">Gefällt mir</span>
            </button>
            <span className="article-reactNum" aria-hidden="true">
              {upCount}
            </span>

            <button
              type="button"
              onClick={() => handleVote(-1)}
              aria-pressed={userVote === -1}
              aria-label={`Gefällt mir nicht. Aktuell ${downCount} Stimmen`}
              className={`article-reactBtn ${userVote === -1 ? "is-active" : ""}`}
              title="Gefällt mir nicht"
            >
              <i className="fa-regular fa-thumbs-down" aria-hidden="true"></i>
              <span className="sr-only">Gefällt mir nicht</span>
            </button>
            <span className="article-reactNum" aria-hidden="true">
              {downCount}
            </span>

            {msg && (
              <span className="article-reactMsg" role="status" aria-live="polite">
                {msg}
              </span>
            )}
          </section>
        </article>

        <section aria-label="Kommentare">
          <CommentsBox postId={article.id.toString()} />
        </section>

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