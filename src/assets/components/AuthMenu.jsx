
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  getSession,
  clearSessionCache,
  login as apiLogin,
  registerUser,
  logout as apiLogout,
  updateUsername,
  updatePassword,
  deleteAccount,
} from "../../lib/commentsApi";
import AvatarPicker from "./AvatarPicker.jsx";
import "../../App.css";

const AVATAR_SVG_URL = "../../public/svg/hirsch.svg";

export default function AuthMenu({ user, setUser }) {
  const [open, setOpen] = useState(false);
  const [subTab, setSubTab] = useState("avatar");
  const [csrf, setCsrf] = useState("");
  const [msg, setMsg] = useState("");
  const [localUsername, setLocalUsername] = useState(user?.username || "");

  const triggerRef = useRef(null);
  const dialogRef = useRef(null);
  const initialFocusRef = useRef(null);

  const displayName =
    (user?.username && String(user.username).trim()) ||
    (user?.email && String(user.email).trim()) ||
    "User";

  const avatarColor = user?.avatar_color || "#303474";

  async function fetchFreshCsrf() {
    const s = await getSession();
    if (s.ok) {
      setCsrf(s.csrf || "");
      return s.csrf || "";
    }
    setMsg(s.error || "Sessionfehler");
    return "";
  }

  useEffect(() => {
    if (open) fetchFreshCsrf();
  }, [open, subTab]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const target =
          initialFocusRef.current ||
          dialogRef.current?.querySelector("[data-initial-focus]") ||
          dialogRef.current;
        target?.focus?.();
      }, 0);

      const onKeyDown = (e) => {
        if (e.key !== "Tab") return;
        const focusables = dialogRef.current?.querySelectorAll(
          'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;
        const list = Array.from(focusables);
        const first = list[0];
        const last = list[list.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };

      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    } else {
      triggerRef.current?.focus?.();
    }
  }, [open]);

  // actions
  const doLogin = async (e) => {
    e.preventDefault();
    setMsg("");
    const fd = new FormData(e.currentTarget);
    const fresh = await fetchFreshCsrf();
    if (!fresh) return;
    const r = await apiLogin({
      email: fd.get("email"),
      password: fd.get("password"),
      csrf: fresh,
    });
    if (r.ok) {
      clearSessionCache();
      setUser(r.user);
      setOpen(false);
    } else setMsg(r.error || "Login fehlgeschlagen");
  };

  const doRegister = async (e) => {
    e.preventDefault();
    setMsg("");
    const fd = new FormData(e.currentTarget);
    const fresh = await fetchFreshCsrf();
    if (!fresh) return;
    const r = await registerUser({
      username: fd.get("username"),
      email: fd.get("email"),
      password: fd.get("password"),
      csrf: fresh,
    });
    if (r.ok) {
      clearSessionCache();
      setUser(r.user);
      setOpen(false);
    } else setMsg(r.error || "Registrierung fehlgeschlagen");
  };

  const doLogout = async () => {
    setMsg("");
    const r = await apiLogout();
    if (r.ok) {
      clearSessionCache();
      setUser(null);
    }
    else setMsg(r.error || "Logout fehlgeschlagen");
  };

  async function onSaveUsername(e) {
    e.preventDefault();
    setMsg("");
    const fresh = await fetchFreshCsrf();
    if (!fresh) return;
    const r = await updateUsername({ username: localUsername.trim(), csrf: fresh });
    if (r.ok) {
      setUser(r.user);
      setMsg("Nutzername aktualisiert.");
    } else setMsg(r.error || "Aktualisieren fehlgeschlagen");
  }

  async function onChangePassword(e) {
    e.preventDefault();
    setMsg("");
    const fd = new FormData(e.currentTarget);
    const fresh = await fetchFreshCsrf();
    if (!fresh) return;
    const r = await updatePassword({
      old_password: fd.get("old_password"),
      new_password: fd.get("new_password"),
      csrf: fresh,
    });
    if (r.ok) {
      setMsg("Passwort geändert.");
      e.currentTarget.reset();
    } else setMsg(r.error || "Ändern fehlgeschlagen");
  }

  async function onDeleteAccount() {
    if (!confirm("Wirklich deinen Account unwiderruflich löschen?")) return;
    setMsg("");
    const fresh = await fetchFreshCsrf();
    if (!fresh) return;
    const r = await deleteAccount({ csrf: fresh });
    if (r.ok) {
      setUser(null);
      setOpen(false);
    } else setMsg(r.error || "Löschen fehlgeschlagen");
  }

  const dialogTitleId = "auth-dialog-title";
  const dialogDescId  = "auth-dialog-desc";

  return (
    <>
      {user ? (
        <button
          ref={triggerRef}
          onClick={() => {
            setOpen(true);
            setSubTab("avatar");
            setMsg("");
            setLocalUsername(user?.username || "");
          }}
          className="auth-accountBtn"
          title="Account"
          aria-haspopup="dialog"
          type="button"
        >
          <div
            className="avatar-preview avatar--28 avatar--round"
            style={{
              "--avatar-color": avatarColor,
              "--avatar-url": `url("${AVATAR_SVG_URL}")`,
            }}
          />
          <span className="auth-accountLabel">{displayName}</span>
        </button>
      ) : (
        <button
          ref={triggerRef}
          onClick={() => {
            setOpen(true);
            setMsg("");
          }}
          className="auth-btnPrimary"
          aria-haspopup="dialog"
          type="button"
        >
          Login
        </button>
      )}

      {createPortal(
        <>
          <div
            onClick={() => setOpen(false)}
            className={`auth-backdrop ${open ? "open" : ""}`}
            aria-hidden="true"
          />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            aria-describedby={dialogDescId}
            className={`auth-drawer ${open ? "open" : ""}`}
            tabIndex={-1}
          >
            <div className="auth-header">
              <div id={dialogTitleId}>
                {user ? "Dein Account" : "Anmelden / Registrieren"}
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Schließen"
                className="auth-btnIcon"
                type="button"
              >
                ✕
              </button>
            </div>

            <p id={dialogDescId} className="sr-only">
              Dieses Fenster enthält Anmelde-, Registrierungs- und Profileinstellungen.
            </p>

            <div className="auth-content">
              {user ? (
                <>
                  <section className="auth-profileCard" aria-label="Profil">
                    <p className="auth-info auth-infoRow">
                      <span
                        className="avatar-preview avatar--40 avatar--round"
                        style={{
                          "--avatar-color": avatarColor,
                          "--avatar-url": `url("${AVATAR_SVG_URL}")`,
                        }}
                        aria-hidden="true"
                      />
                      Eingeloggt als <b>@{displayName}</b>
                    </p>

                    <form className="auth-form mt-1" onSubmit={onSaveUsername} autoComplete="on">
                      <label className="auth-label" htmlFor="profile-username">
                        Nutzername
                      </label>
                      <input
                        id="profile-username"
                        className="auth-input"
                        value={localUsername}
                        onChange={(e) => setLocalUsername(e.target.value)}
                        minLength={2}
                        maxLength={60}
                        required
                        aria-required="true"
                        autoComplete="username"
                      />

                      <div className="auth-actionsRow">
                        <button className="auth-btnFull" type="submit">
                          Speichern
                        </button>
                        <button
                          className="auth-btnFull logout-btn"
                          type="button"
                          onClick={doLogout}
                        >
                          Logout
                        </button>
                      </div>
                    </form>
                  </section>

                  <div className="auth-subtabs" role="tablist" aria-label="Weitere Bereiche">
                    {["avatar", "security", "danger"].map((key) => (
                      <button
                        key={key}
                        role="tab"
                        id={`subtab-${key}`}
                        aria-selected={subTab === key}
                        aria-controls={`subpanel-${key}`}
                        className={`auth-subtabBtn ${subTab === key ? "active" : ""}`}
                        onClick={() => {
                          setSubTab(key);
                          setMsg("");
                        }}
                        type="button"
                        ref={subTab === "avatar" ? initialFocusRef : undefined}
                        data-initial-focus={subTab === "avatar" ? true : undefined}
                      >
                        {key === "avatar" && "Avatar"}
                        {key === "security" && "Passwort"}
                        {key === "danger" && "Löschen"}
                      </button>
                    ))}
                  </div>

                  <section
                    id="subpanel-avatar"
                    role="tabpanel"
                    aria-labelledby="subtab-avatar"
                    hidden={subTab !== "avatar"}
                  >
                    <AvatarPicker user={user} setUser={setUser} csrf={csrf} />
                  </section>

                  <section
                    id="subpanel-security"
                    role="tabpanel"
                    aria-labelledby="subtab-security"
                    hidden={subTab !== "security"}
                  >
                    <form className="auth-form" onSubmit={onChangePassword} autoComplete="on">
                      <label className="auth-label" htmlFor="old_password">
                        Altes Passwort
                      </label>
                      <input
                        className="auth-input"
                        id="old_password"
                        type="password"
                        name="old_password"
                        required
                        aria-required="true"
                        autoComplete="current-password"
                      />
                      <label className="auth-label" htmlFor="new_password">
                        Neues Passwort (≥6)
                      </label>
                      <input
                        className="auth-input"
                        id="new_password"
                        type="password"
                        name="new_password"
                        minLength={6}
                        required
                        aria-required="true"
                        autoComplete="new-password"
                      />
                      <button className="auth-btnFull" type="submit">
                        Passwort ändern
                      </button>
                    </form>
                  </section>

                  <section
                    id="subpanel-danger"
                    role="tabpanel"
                    aria-labelledby="subtab-danger"
                    hidden={subTab !== "danger"}
                  >
                    <div className="auth-form">
                      <p className="auth-info">
                        Das Löschen ist <b>unwiderruflich</b>.
                      </p>
                      <button className="auth-btnDanger" type="button" onClick={onDeleteAccount}>
                        Account löschen
                      </button>
                    </div>
                  </section>

                  <p className="auth-err" aria-live="polite">
                    {msg}
                  </p>
                </>
              ) : (
                <>
                  <div className="auth-tabsWrap" role="tablist" aria-label="Authentifizierung">
                    <button
                      id="tab-login"
                      role="tab"
                      aria-selected="true"
                      aria-controls="panel-login"
                      className="auth-tabBtn active"
                      type="button"
                      ref={initialFocusRef}
                      data-initial-focus
                    >
                      Login
                    </button>
                    <button
                      id="tab-register"
                      role="tab"
                      aria-selected="false"
                      aria-controls="panel-register"
                      className="auth-tabBtn"
                      type="button"
                      onClick={() => {}}
                    >
                      Registrieren
                    </button>
                  </div>

                  <section id="panel-login" role="tabpanel" aria-labelledby="tab-login">
                    <form onSubmit={doLogin} className="auth-form" autoComplete="on">
                      <label className="auth-label" htmlFor="login-email">
                        E-Mail
                      </label>
                      <input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="E-Mail"
                        required
                        aria-required="true"
                        autoComplete="email"
                        className="auth-input"
                      />
                      <label className="auth-label" htmlFor="login-password">
                        Passwort
                      </label>
                      <input
                        id="login-password"
                        name="password"
                        type="password"
                        placeholder="Passwort"
                        required
                        aria-required="true"
                        autoComplete="current-password"
                        className="auth-input"
                      />
                      <button type="submit" className="auth-btnFull">
                        Einloggen
                      </button>
                    </form>
                  </section>

                  <section
                    id="panel-register"
                    role="tabpanel"
                    aria-labelledby="tab-register"
                    hidden
                  >
                    <form onSubmit={doRegister} className="auth-form" autoComplete="on">
                      <label className="auth-label" htmlFor="reg-username">
                        Nutzername
                      </label>
                      <input
                        id="reg-username"
                        name="username"
                        placeholder="Nutzername"
                        required
                        aria-required="true"
                        autoComplete="username"
                        className="auth-input"
                      />
                      <label className="auth-label" htmlFor="reg-email">
                        E-Mail
                      </label>
                      <input
                        id="reg-email"
                        name="email"
                        type="email"
                        placeholder="E-Mail"
                        required
                        aria-required="true"
                        autoComplete="email"
                        className="auth-input"
                      />
                      <label className="auth-label" htmlFor="reg-password">
                        Passwort
                      </label>
                      <input
                        id="reg-password"
                        name="password"
                        type="password"
                        placeholder="Passwort (≥6)"
                        minLength={6}
                        required
                        aria-required="true"
                        autoComplete="new-password"
                        className="auth-input"
                      />
                      <button type="submit" className="auth-btnFull">
                        Registrieren
                      </button>
                    </form>
                  </section>

                  <p className="auth-err" aria-live="polite">
                    {msg}
                  </p>
                  <p className="auth-hint">
                    Tipp: Wenn du schon im Backend eingeloggt bist, bist du hier auch eingeloggt.
                  </p>
                </>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
