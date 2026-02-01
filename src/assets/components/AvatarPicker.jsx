import { useEffect, useState } from "react";
import { updateAvatarColor } from "../../lib/commentsApi";
import "../../App.css";

const AVATAR_SVG_URL = "/svg/hirsch.svg";

const COLORS = [
  { hex: "#78665A", name: "Braungrau" },
  { hex: "#A6B2B8", name: "Blaugrau hell" },
  { hex: "#EEDECD", name: "Sand" },
  { hex: "#80917B", name: "Olivgrün" },
  { hex: "#3C5667", name: "Petrol" },
];

export default function AvatarPicker({ user, setUser, csrf, onSaved }) {
  const [color, setColor] = useState("#303474");
  const [baseColor, setBaseColor] = useState("#303474");
  const [msg, setMsg]     = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const col = user?.avatar_color || "#303474";
    setColor(col);
    setBaseColor(col);
  }, [user?.avatar_color]);

  const notLoggedIn = !user || !csrf;
  const dirty = color !== baseColor;

  async function save() {
    if (!csrf || !dirty || saving) return;
    setMsg("");
    setSaving(true);
    const r = await updateAvatarColor({ color, csrf });
    setSaving(false);

    if (r.ok) {
      setUser(r.user);
      setBaseColor(r.user?.avatar_color || color);
      onSaved?.(r.user);
      setMsg("Avatar gespeichert.");
    } else {
      setMsg(r.error || "Speichern fehlgeschlagen");
    }
  }

  return (
    <div className="auth-form" aria-live="polite">
      <div className="avatar-row">
        <div
          className="avatar-preview avatar--56 avatar--round"
          role="img"
          aria-label={`Avatar-Vorschau in der Farbe ${color}`}
          title="Avatar-Vorschau"
          style={{ "--avatar-color": color, "--avatar-url": `url(${AVATAR_SVG_URL})` }}
        />
        <fieldset className="fieldset-reset" aria-describedby="avatar-picker-help">
          <legend className="sr-only">Avatar-Farbe wählen</legend>

          <ul className="avatar-swatchList" role="list">
            {COLORS.map(({ hex, name }) => {
              const id = `avatar-color-${hex.replace("#", "")}`;
              const selected = color === hex;
              return (
                <li key={hex}>
                  <input
                    type="radio"
                    id={id}
                    name="avatarColor"
                    value={hex}
                    checked={selected}
                    onChange={() => setColor(hex)}
                    className="visually-hidden-input"
                  />
                  <label
                    htmlFor={id}
                    title={`${name} (${hex})`}
                    className={`avatar-swatchLabel ${selected ? "is-selected" : ""}`}
                    style={{ "--swatch-color": hex }}
                  >
                    <span className="sr-only">
                      {name} – {hex} {selected ? "(ausgewählt)" : ""}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>

          <p id="avatar-picker-help" className="avatar-help">
            Wähle eine Farbe und speichere deine Auswahl.
          </p>
        </fieldset>
      </div>

      <button
        className="auth-btnFull mt-12"
        type="button"
        onClick={save}
        disabled={saving || !csrf || !dirty}
        aria-disabled={saving || !csrf || !dirty}
        aria-busy={saving}
      >
        {saving ? "Speichern…" : dirty ? "Speichern" : "Gespeichert"}
      </button>

      <p
        className={`mt-8 ${/fehler|error|db/i.test(msg) ? "auth-err" : "auth-hint"}`}
        aria-live="polite"
      >
        {notLoggedIn
          ? "Zum Ändern der Avatar-Farbe bitte zuerst einloggen."
          : msg}
      </p>
    </div>
  );
}
