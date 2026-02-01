
import { useEffect, useState, useMemo, useCallback, memo, useId } from "react";
import {
  getSession,
  listComments,
  createComment,
  voteComment,
} from "../../lib/commentsApi";

const AVATAR_SVG_URL = "../../public/svg/hirsch.svg";

function buildTree(items) {
  const map = new Map();
  items.forEach((c) => map.set(c.id, { ...c, children: [] }));
  const roots = [];
  map.forEach((node) => {
    if (node.parent_id) {
      const p = map.get(node.parent_id);
      if (p) p.children.push(node);
      else roots.push(node);
    } else roots.push(node);
  });
  return roots;
}

function toISODateTime(d) {
  const dt = new Date(d);
  return isFinite(dt) ? dt.toISOString() : null;
}

function depthClass(depth) {
  const d = Math.max(0, Math.min(depth, 4));
  return `ml-d${d}`;
}

const CommentItem = memo(function CommentItem({
  c,
  depth,
  user,
  csrf,
  postId,
  onVote,
  refresh,
  replyOpenId,
  setReplyOpenId,
  replyDrafts,
  setReplyDrafts,
}) {
  const replyOpen = replyOpenId === c.id;

  const reactBaseId = useId();
  const replyTextareaId = `${reactBaseId}-reply-ta-${c.id}`;
  const replyRegionId = `${reactBaseId}-reply-region-${c.id}`;
  const replyHelpId = `${reactBaseId}-reply-help-${c.id}`;

  const createdISO = useMemo(() => toISODateTime(c.created_at), [c.created_at]);
  const createdHuman = useMemo(
    () => new Date(c.created_at).toLocaleString(),
    [c.created_at]
  );

  const submitReply = useCallback(
    async (e) => {
      e.preventDefault();
      const text = (replyDrafts[c.id] || "").trim();
      if (!text) return;
      const r = await createComment({ postId, body: text, csrf, parentId: c.id });
      if (r.ok) {
        setReplyDrafts((prev) => ({ ...prev, [c.id]: "" }));
        setReplyOpenId(null);
        await refresh();
      }
    },
    [replyDrafts, c.id, postId, csrf, refresh, setReplyOpenId, setReplyDrafts]
  );

  const toggleReply = useCallback(() => {
    setReplyOpenId(replyOpen ? null : c.id);
  }, [replyOpen, c.id, setReplyOpenId]);

  const upCount = c.up_count ?? 0;
  const downCount = c.down_count ?? 0;

  return (
    <li className={`comment-item ${depthClass(depth)}`}>
      <article
        className="comment-card"
        aria-labelledby={`c-author-${c.id}`}
        aria-describedby={`c-meta-${c.id} c-body-${c.id}`}
      >
        <div className="comment-meta" id={`c-meta-${c.id}`}>
          <span
            className="avatar-preview comment-avatar"
            aria-hidden="true"
            style={{
              "--avatar-color": c.avatar_color || "#303474",
              "--avatar-url": `url(${AVATAR_SVG_URL})`,
            }}
          />
          <strong id={`c-author-${c.id}`}>{c.username}</strong>
          <span>
            ·{" "}
            {createdISO ? (
              <time dateTime={createdISO}>{createdHuman}</time>
            ) : (
              createdHuman
            )}
          </span>
        </div>

        <p className="comment-body" id={`c-body-${c.id}`}>
          {c.body}
        </p>

        <div className="comment-reactRow" role="group" aria-label="Reaktionen">
          <button
            type="button"
            onClick={() => onVote(c.id, 1, c.user_vote)}
            aria-pressed={c.user_vote === 1}
            aria-label="Gefällt mir"
            className={`comment-reactBtn ${c.user_vote === 1 ? "is-active" : ""}`}
          >
            <i className="fa-regular fa-thumbs-up" aria-hidden="true" />
          </button>
          <span className="comment-reactNum" aria-live="polite">
            {upCount}
          </span>

          <button
            type="button"
            onClick={() => onVote(c.id, -1, c.user_vote)}
            aria-pressed={c.user_vote === -1}
            aria-label="Gefällt mir nicht"
            className={`comment-reactBtn ${c.user_vote === -1 ? "is-active" : ""}`}
          >
            <i className="fa-regular fa-thumbs-down" aria-hidden="true" />
          </button>
          <span className="comment-reactNum" aria-live="polite">
            {downCount}
          </span>

          <button
            type="button"
            onClick={toggleReply}
            className="comment-reactBtn comment-replyBtn"
            disabled={!user}
            aria-disabled={!user}
            aria-expanded={replyOpen}
            aria-controls={replyRegionId}
            aria-label={user ? "Antwort schreiben" : "Antworten nur nach Login möglich"}
          >
            ↩︎ Antworten
          </button>
        </div>

        <div id={replyRegionId} role="region" aria-label="Antwortbereich" hidden={!replyOpen}>
          {replyOpen && (
            <form className="comment-replyWrap" onSubmit={submitReply}>
              <label htmlFor={replyTextareaId} className="sr-only">
                Antworttext
              </label>
              <textarea
                id={replyTextareaId}
                rows={3}
                placeholder="Antwort schreiben…"
                value={replyDrafts[c.id] || ""}
                onChange={(e) =>
                  setReplyDrafts((prev) => ({ ...prev, [c.id]: e.target.value }))
                }
                disabled={!user}
                aria-disabled={!user}
                aria-describedby={replyHelpId}
                className="comment-textarea"
              />
              <div id={replyHelpId} className="sr-only">
                Sende die Antwort mit „Absenden“. „Abbrechen“ schließt den Eingabebereich.
              </div>
              <div className="comment-replyActions">
                <button
                  type="submit"
                  className="comment-submit"
                  disabled={!user || !(replyDrafts[c.id] || "").trim()}
                  aria-disabled={!user || !(replyDrafts[c.id] || "").trim()}
                >
                  Absenden
                </button>
                <button
                  type="button"
                  className="comment-cancelBtn"
                  onClick={() => setReplyOpenId(null)}
                >
                  Abbrechen
                </button>
              </div>
            </form>
          )}
        </div>
      </article>

      {c.children?.length > 0 && (
        <ul
          className="comment-children"
          role="list"
          aria-label={`Antworten auf Kommentar von ${c.username}`}
        >
          {c.children.map((ch) => (
            <CommentItem
              key={ch.id}
              c={ch}
              depth={depth + 1}
              user={user}
              csrf={csrf}
              postId={postId}
              onVote={onVote}
              refresh={refresh}
              replyOpenId={replyOpenId}
              setReplyOpenId={setReplyOpenId}
              replyDrafts={replyDrafts}
              setReplyDrafts={setReplyDrafts}
            />
          ))}
        </ul>
      )}
    </li>
  );
});

export default function CommentsBox({ postId }) {
  const [items, setItems] = useState([]);
  const [csrf, setCsrf] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [body, setBody] = useState("");
  const [replyOpenId, setReplyOpenId] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState({});

  const baseId = useId();
  const titleId = `${baseId}-comments-title`;
  const formId = `${baseId}-comment-form`;
  const textareaId = `${baseId}-comment-textarea`;
  const statusId = `${baseId}-comment-status`;
  const errorId = `${baseId}-comment-error`;

  const refresh = useCallback(async () => {
    const r = await listComments(postId);
    if (r.ok) setItems(r.items || []);
  }, [postId]);

  useEffect(() => {
    (async () => {
      const s = await getSession();
      if (s.ok) {
        setUser(s.user || null);
        setCsrf(s.csrf || "");
      }
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const submitComment = useCallback(
    async (e) => {
      e.preventDefault();
      setErr("");
      const text = body.trim();
      if (!text) return;
      const r = await createComment({ postId, body: text, csrf });
      if (!r.ok) {
        setErr(r.error || "Fehler beim Senden");
        return;
      }
      setBody("");
      await refresh();
    },
    [body, postId, csrf, refresh]
  );

  const onVote = useCallback(
    async (commentId, value, currentUserVote) => {
      setErr("");
      const send = currentUserVote === value ? 0 : value;

      setItems((prev) =>
        prev.map((c) => {
          if (c.id !== commentId) return c;
          const was = c.user_vote ?? 0;
          let up = c.up_count ?? 0;
          let down = c.down_count ?? 0;

          if (was === 1) up -= 1;
          if (was === -1) down -= 1;
          if (send === 1) up += 1;
          if (send === -1) down += 1;

          return { ...c, up_count: Math.max(0, up), down_count: Math.max(0, down), user_vote: send };
        })
      );

      const r = await voteComment({ commentId, value: send, csrf });
      if (!r.ok) {
        await refresh();
        setErr(r.error || "Vote fehlgeschlagen");
      } else {
        setItems((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  up_count: r.up_count,
                  down_count: r.down_count,
                  user_vote: r.user_vote,
                  score: (r.up_count ?? 0) - (r.down_count ?? 0),
                }
              : c
          )
        );
      }
    },
    [csrf, refresh]
  );

  const tree = useMemo(() => buildTree(items), [items]);

  return (
    <section
      className="commentsWrapper"
      role="region"
      aria-labelledby={titleId}
      aria-describedby={statusId}
    >
      <div className="comments">
        <h2 className="comment-title" id={titleId}>
          Kommentare
        </h2>

        <p id={statusId} className="sr-only" aria-live="polite">
          {loading
            ? "Kommentare werden geladen …"
            : `${items.length} Kommentar${items.length === 1 ? "" : "e"} vorhanden.`}
        </p>

        {err && (
          <p id={errorId} role="alert" aria-live="assertive" className="comment-error">
            {err}
          </p>
        )}

        {!user && (
          <p className="comment-hint mb-1">
            Du kannst nur Kommentare schreiben, wenn du eingeloggt bist.
          </p>
        )}

        <form
          id={formId}
          className="comment-form"
          onSubmit={submitComment}
          aria-labelledby={titleId}
        >
          <label htmlFor={textareaId} className="sr-only">
            Kommentar schreiben
          </label>
          <textarea
            id={textareaId}
            className="comment-textarea"
            placeholder="Schreib was Nettes…"
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={!user}
            aria-disabled={!user}
            aria-describedby={err ? errorId : undefined}
            aria-invalid={!!err}
          />
          <button
            className="comment-submit"
            type="submit"
            disabled={!user || !body.trim()}
            aria-disabled={!user || !body.trim()}
          >
            Absenden
          </button>
        </form>

        {loading ? (
          <p aria-live="polite">Bitte warten …</p>
        ) : (
          <ul className="comment-list" role="list" aria-labelledby={titleId}>
            {tree.map((c) => (
              <CommentItem
                key={c.id}
                c={c}
                depth={0}
                user={user}
                csrf={csrf}
                postId={postId}
                onVote={onVote}
                refresh={refresh}
                replyOpenId={replyOpenId}
                setReplyOpenId={setReplyOpenId}
                replyDrafts={replyDrafts}
                setReplyDrafts={setReplyDrafts}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}