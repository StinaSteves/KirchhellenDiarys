function normalizeApiBase(rawBase) {
  const fallback = "/api";
  if (!rawBase) return fallback;

  const base = `${rawBase}`.trim();
  if (!base) return fallback;

  if (/^https?:\/\//i.test(base)) {
    const cleaned = base.replace(/\/+$/, "");
    return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
  }

  if (base.startsWith("/")) {
    if (import.meta?.env?.DEV) return fallback;
    const cleaned = base.replace(/\/+$/, "");
    return cleaned ? `${cleaned}/api` : fallback;
  }

  return fallback;
}

export const API_BASE = normalizeApiBase(import.meta?.env?.VITE_BACKEND_URL);

async function readJsonSafe(res) {
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  if (!ct.includes("application/json")) {
    return { ok: false, error: `Unexpected response (not JSON)`, raw: text.slice(0, 300) };
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    return { ok: false, error: `Parse error: ${e.message}`, raw: text.slice(0, 300) };
  }
}

async function postForm(url, fields = {}) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v ?? ""));

  const res = await fetch(url, { method: "POST", body: fd, credentials: "include" });
  if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
  return readJsonSafe(res);
}

async function getJson(url) {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
  return readJsonSafe(res);
}

/* =========================
 * Session / CSRF
 * ========================= */

let __sessionCache = null;
let __sessionInFlight = null;
const SESSION_PATH = (import.meta?.env?.VITE_SESSION_PATH || "session.php").replace(/^\/+/, "");

export async function getSession() {
  if (__sessionCache) return __sessionCache;
  if (__sessionInFlight) return __sessionInFlight;
  if (import.meta && import.meta.env && import.meta.env.VITE_FAKE_SESSION === 'true') {
    __sessionCache = { ok: true, user: null, csrf: '' };
    return __sessionCache;
  }

  const url = `${API_BASE}/${SESSION_PATH}`;

  __sessionInFlight = (async () => {
    try {
      const data = await getJson(url);
      if (data && data.ok !== false) {
        return { ok: true, user: data.user || null, csrf: data.csrf || "" };
      }
      return { ok: false, error: data?.error || `Session error at ${url}` };
    } catch (e) {
      return { ok: false, error: e?.message || `Session request failed at ${url}` };
    }
  })();

  try {
    __sessionCache = await __sessionInFlight;
    return __sessionCache;
  } finally {
    __sessionInFlight = null;
  }
}

export function clearSessionCache() {
  __sessionCache = null;
}

/* =========================
 * Auth
 * ========================= */

export async function login({ email, password, csrf }) {
  return postForm(`${API_BASE}/login.php`, { email, password, csrf });
}

export async function registerUser({ username, email, password, csrf }) {
  return postForm(`${API_BASE}/register.php`, { username, email, password, csrf });
}

export async function logout() {
  return postForm(`${API_BASE}/logout.php`);
}

export async function updateUsername({ username, csrf }) {
  return postForm(`${API_BASE}/update_username.php`, { username, csrf });
}

export async function updatePassword({ old_password, new_password, csrf }) {
  return postForm(`${API_BASE}/update_password.php`, {
    old_password,
    new_password,
    csrf,
  });
}

export async function deleteAccount({ csrf }) {
  return postForm(`${API_BASE}/delete_account.php`, { csrf });
}

/* =========================
 * Profile / Avatar
 * ========================= */

export async function updateAvatarColor({ color, csrf }) {
  const noHash = String(color || "").replace(/^#/, "");
  return postForm(`${API_BASE}/update_avatar_color.php`, {
    color,
    avatar_color: color,
    color_hex: color,
    color_nohash: noHash,
    csrf,
    csrf_token: csrf,
  });
}

/* =========================
 * Contact (Footer form)
 * ========================= */

export async function sendContact({ name, email, message, csrf }) {
  return postForm(`${API_BASE}/contact.php`, { name, email, message, csrf });
}

/* =========================
 * Comments
 * ========================= */

export async function listComments(postId) {
  return postForm(`${API_BASE}/comments_list.php`, { post_id: String(postId) });
}

export async function createComment({ postId, body, csrf, parentId = null }) {
  return postForm(`${API_BASE}/comments_create.php`, {
    post_id: String(postId),
    body,
    parent_id: parentId ? String(parentId) : "",
    csrf,
  });
}

export async function voteComment({ commentId, value, csrf }) {
  return postForm(`${API_BASE}/comment_vote.php`, {
    comment_id: String(commentId),
    value: String(value), 
    csrf,
  });
}

/* =========================
 * Post Reactions (safe add)
 * ========================= */

export async function getPostReactions(postId) {
  try {
    const data = await postForm(`${API_BASE}/post_reactions_get.php`, {
      post_id: String(postId),
    });
    if (data && data.ok) {
      const counts = data.counts || { like: 0, love: 0, angry: 0 };
      const uv = data.user_value ?? null;
      const user_vote = uv === "like" ? 1 : uv === "angry" ? -1 : 0;
      return {
        ok: true,
        counts,
        up_count: counts.like || 0,
        down_count: counts.angry || 0,
        user_vote,
      };
    }
    return {
      ok: true,
      counts: { like: 0, love: 0, angry: 0 },
      up_count: 0,
      down_count: 0,
      user_vote: 0,
    };
  } catch (e) {
    return {
      ok: true,
      counts: { like: 0, love: 0, angry: 0 },
      up_count: 0,
      down_count: 0,
      user_vote: 0,
      dev_warning: e?.message || String(e),
    };
  }
}

export async function votePostReaction({ postId, value }) {
  try {
    const data = await postForm(`${API_BASE}/post_reaction_vote.php`, {
      post_id: String(postId),
      value,
    });
    if (data && data.ok) {
      return {
        ok: true,
        counts: data.counts || { like: 0, love: 0, angry: 0 },
        user_value: data.user_value ?? null,
      };
    }
    return { ok: false, error: data?.error || "Vote fehlgeschlagen" };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
}

export async function votePost({ postId, value, csrf }) {
  try {
    const mapped = value === 1 ? "like" : value === -1 ? "angry" : "none";
    const data = await postForm(`${API_BASE}/post_reaction_vote.php`, {
      post_id: String(postId),
      value: mapped,
      csrf: csrf || "",
    });
    if (data && data.ok) {
      const counts = data.counts || { like: 0, love: 0, angry: 0 };
      const uv = data.user_value ?? null;
      const user_vote = uv === "like" ? 1 : uv === "angry" ? -1 : 0;
      return {
        ok: true,
        up_count: counts.like || 0,
        down_count: counts.angry || 0,
        user_vote,
      };
    }
    return { ok: false, error: data?.error || "Vote fehlgeschlagen" };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
}
