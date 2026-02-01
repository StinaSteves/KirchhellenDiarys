import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import blogData from "../data/blogData.js";
import { API_BASE as API } from "../../lib/commentsApi";

import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = new L.Icon({
  iconRetinaUrl: marker2x,
  iconUrl: marker1x,
  shadowUrl: shadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

const handleIcon = L.divIcon({
  className: "vertex-handle",
  html: '<div class="vertex-handle__dot"></div>',
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

const KIRCHHELLEN_CENTER = [51.603548, 6.919904];
const buildPostUrl = (post) => `/artikel/${post.id}`;

async function fetchText(url, opts) {
  const res = await fetch(url, opts);
  const text = await res.text();
  return { res, text };
}
function looksLikeJson(res) {
  const ct = res.headers.get("content-type") || "";
  return /application\/json/i.test(ct);
}
function parseJsonSafe(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function MapClicks({
  onAddPoint,
  onSetHome,
  drawingMode,
  onAddAreaVertex,
  onFinishArea,
  enabled,
}) {
  useMapEvents({
    click(e) {
      if (!enabled) return;
      if (e.originalEvent?.defaultPrevented) return;
      const target = e.originalEvent?.target;
      if (target instanceof HTMLElement) {
        if (target.closest(".leaflet-popup")) return;
        if (target.closest("[data-stop-map-click]")) return;
      }
      if (drawingMode) {
        onAddAreaVertex([e.latlng.lat, e.latlng.lng]);
        return;
      }
      if (e.originalEvent.shiftKey) {
        onSetHome({ lat: e.latlng.lat, lng: e.latlng.lng });
      } else {
        onAddPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
    dblclick() {
      if (enabled && drawingMode) onFinishArea();
    },
  });
  return null;
}

export default function BlogMap() {
  const [points, setPoints] = useState([]);
  const [home, setHome] = useState(null);
  const [areaVertices, setAreaVertices] = useState([]);
  const [areaPolygon, setAreaPolygon] = useState(null);

  const [drawingMode, setDrawingMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [csrf, setCsrf] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const mapRef = useRef(null);

  const postsById = useMemo(() => {
    const m = new Map();
    for (const p of blogData) m.set(p.id, p);
    return m;
  }, []);
  const postsSorted = useMemo(
    () => [...blogData].sort((a, b) => a.title.localeCompare(b.title, "de")),
    []
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        if (!API) {
          console.warn("[Map] Kein API-Basis-Pfad konfiguriert – Backend wird übersprungen.");
          setIsAdmin(false);
          return;
        }

        const c = await fetchText(`${API}/csrf.php`, { credentials: "include" });
        if (!c.res.ok) throw new Error(`HTTP ${c.res.status} beim CSRF`);
        if (!looksLikeJson(c.res)) {
          console.warn("[Map] csrf.php lieferte kein JSON:", c.text.slice(0, 120));
          setIsAdmin(false);
          return;
        }
        const cJson = parseJsonSafe(c.text);
        if (!cJson?.ok) {
          console.warn("[Map] csrf.php ok=false:", cJson);
          setIsAdmin(false);
          return;
        }
        setCsrf(cJson.csrf || "");

        const d = await fetchText(`${API}/map_get.php`, { credentials: "include" });
        if (!d.res.ok) throw new Error(`HTTP ${d.res.status} beim Datenladen`);
        if (!looksLikeJson(d.res)) {
          console.warn("[Map] map_get.php lieferte kein JSON:", d.text.slice(0, 120));
          setIsAdmin(false);
          return;
        }
        const dj = parseJsonSafe(d.text);
        if (!dj?.ok) throw new Error(dj?.error || "map_get fehlgeschlagen");

        setIsAdmin(!!dj.is_admin);
        const payload = dj.data || {};
        if (payload.home) setHome(payload.home);
        if (payload.polygon) setAreaPolygon(payload.polygon);
        if (Array.isArray(payload.points)) {
          setPoints(
            payload.points.map((pt) => ({
              id: pt.id ?? crypto.randomUUID(),
              lat: pt.lat,
              lng: pt.lng,
              postId: pt.postId ?? null,
            }))
          );
        }
      } catch (e) {
        console.warn("[Map] Laden fehlgeschlagen:", e);
        setIsAdmin(false);
        setError(e?.message || "Karte offline");
      } finally {
        setLoading(false);
        setDirty(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const onKey = (e) => {
      if (e.key.toLowerCase() === "h" && mapRef.current) {
        const c = mapRef.current.getCenter();
        setHome({ lat: c.lat, lng: c.lng });
        setDirty(true);
      }
      if (e.key.toLowerCase() === "b") {
        setDrawingMode((v) => !v);
        setEditMode(false);
      }
      if (e.key.toLowerCase() === "e") {
        if (areaPolygon) setEditMode((v) => !v);
      }
      if (e.key === "Escape") {
        setDrawingMode(false);
        setEditMode(false);
        setAreaVertices([]);
      }
      if ((e.key === "z" || e.key === "Z") && (e.ctrlKey || e.metaKey)) {
        setAreaVertices((v) => v.slice(0, -1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAdmin, areaPolygon]);

  const addPoint = (p) => {
    setPoints((prev) => [...prev, { id: crypto.randomUUID(), ...p, postId: null }]);
    setDirty(true);
  };
  const updatePoint = (id, patch) => {
    setPoints((prev) => prev.map((pt) => (pt.id === id ? { ...pt, ...patch } : pt)));
    setDirty(true);
  };
  const removePoint = (id) => {
    setPoints((prev) => prev.filter((p) => p.id !== id));
    setDirty(true);
  };
  const finishArea = () => {
    if (areaVertices.length >= 3) {
      setAreaPolygon(areaVertices);
      setDirty(true);
    }
    setAreaVertices([]);
    setDrawingMode(false);
  };
  const clearArea = () => {
    setAreaPolygon(null);
    setAreaVertices([]);
    setDrawingMode(false);
    setEditMode(false);
    setDirty(true);
  };

  const saveAll = async () => {
    if (!isAdmin || saving || !API) return;
    setSaving(true);
    try {
      const payload = { home, polygon: areaPolygon, points };
      const fd = new FormData();
      fd.append("csrf", csrf);
      fd.append("payload", JSON.stringify(payload));

      const resp = await fetch(`${API}/map_save.php`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const text = await resp.text();
      if (!looksLikeJson(resp)) throw new Error("map_save lieferte kein JSON");
      const j = parseJsonSafe(text);
      if (!j?.ok) throw new Error(j?.error || "Speichern fehlgeschlagen");
      setDirty(false);
    } catch (e) {
      console.warn("[Map] Speichern fehlgeschlagen:", e);
      setError(e?.message || "Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!isAdmin || !dirty) return;
    const t = setTimeout(() => { saveAll(); }, 800);
    return () => clearTimeout(t);
  }, [dirty, home, areaPolygon, points, isAdmin]);  

  const headingId = "map-section-title";
  const toolbarId = "map-toolbar";
  const helpId = "map-help";
  const statusId = "map-status";

  const statusText =
    !isAdmin || (!drawingMode && !editMode)
      ? "LEGENDE"
      : loading
      ? "Lade …"
      : saving
      ? "Speichere …"
      : dirty
      ? "Änderungen nicht gespeichert"
      : "Gespeichert";

  return (
    <section role="region" aria-labelledby={headingId}>
      <div className="popArticles mb-3">
        <hr />
        <h2 id={headingId}>Karte</h2>
        <hr />
      </div>

      <div className="map-wrap" aria-labelledby={headingId}>
        <div
          className="map-toolbar"
          data-stop-map-click
          role="toolbar"
          aria-label="Kartenwerkzeuge"
          id={toolbarId}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div id={statusId} className="map-status" role="status" aria-live="polite">
            {statusText}
          </div>

          {error && isAdmin && (
            <div className="map-error" aria-live="assertive">
              {error}
            </div>
          )}

          <div className="map-controls">
            {isAdmin ? (
              <>
                <button
                  type="button"
                  aria-pressed={!!drawingMode}
                  aria-controls={helpId}
                  onClick={() => {
                    setDrawingMode((v) => !v);
                    setEditMode(false);
                  }}
                  className={`btn ${drawingMode ? "is-dark" : "is-primary"}`}
                >
                  {drawingMode ? "Zeichnen: AN" : "Bereich zeichnen"}
                </button>

                <button
                  type="button"
                  aria-pressed={!!editMode}
                  onClick={() => areaPolygon && setEditMode((v) => !v)}
                  disabled={!areaPolygon}
                  className={`btn ${editMode ? "is-dark" : areaPolygon ? "is-cyan" : "is-disabled"}`}
                >
                  {editMode ? "Bearbeiten: AN" : "Bearbeiten"}
                </button>

                <button
                  type="button"
                  onClick={finishArea}
                  disabled={!drawingMode || areaVertices.length < 3}
                  className={`btn ${
                    drawingMode && areaVertices.length >= 3 ? "is-green" : "is-disabled"
                  }`}
                >
                  Fertig
                </button>

                <button
                  type="button"
                  onClick={() => setAreaVertices((v) => v.slice(0, -1))}
                  disabled={!drawingMode || areaVertices.length === 0}
                  className={`btn ${
                    !drawingMode || areaVertices.length === 0 ? "is-disabled" : "is-amber"
                  }`}
                >
                  Rückgängig
                </button>

                <button
                  type="button"
                  onClick={clearArea}
                  disabled={!areaPolygon}
                  className={`btn ${areaPolygon ? "is-red" : "is-disabled"}`}
                >
                  Bereich löschen
                </button>
              </>
            ) : (
              <div className="map-legend-hint">
                <span className="mapLine">–––</span> Radius
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="map-save">
              <button
                type="button"
                onClick={saveAll}
                disabled={!dirty || saving}
                aria-disabled={!dirty || saving}
                className={`btn btn-block ${!dirty || saving ? "is-disabled" : "is-save"}`}
              >
                {saving ? "Speichere…" : dirty ? "Änderungen speichern" : "Gespeichert"}
              </button>
            </div>
          )}

          <div id={helpId} className="map-help">
            <span className="map-help-icon">
              <i className="fa-solid fa-location-dot" />
            </span>
            Ortsmarkierte Beiträge
          </div>
        </div>

        <MapContainer
          whenCreated={(map) => (mapRef.current = map)}
          center={KIRCHHELLEN_CENTER}
          zoom={14}
          minZoom={14}
          maxZoom={18}
          scrollWheelZoom
          className="map-container"
          doubleClickZoom={false}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClicks
            enabled={isAdmin}
            drawingMode={drawingMode}
            onAddAreaVertex={(ll) => setAreaVertices((v) => [...v, ll])}
            onFinishArea={finishArea}
            onAddPoint={(p) => addPoint(p)}
            onSetHome={(h) => {
              setHome(h);
              setDirty(true);
            }}
          />


          {areaPolygon && (
            <Polygon
              positions={areaPolygon}
              pathOptions={{
                color: "#db2777",
                fillColor: "#db2777",
                fillOpacity: 0.12,
                weight: 2,
              }}
            />
          )}
          {!isAdmin && drawingMode && null}
          {isAdmin && drawingMode && areaVertices.length > 0 && (
            <Polygon
              positions={areaVertices}
              pathOptions={{
                color: "#6d28d9",
                fillColor: "#6d28d9",
                fillOpacity: 0.08,
                dashArray: "6 6",
              }}
            />
          )}

          {isAdmin &&
            !drawingMode &&
            areaPolygon &&
            areaPolygon.map(([lat, lng], idx) => (
              <Marker
                key={`handle-${idx}`}
                position={[lat, lng]}
                icon={handleIcon}
                draggable
                eventHandlers={{
                  drag: (e) => {
                    const ll = e.target.getLatLng();
                    setAreaPolygon((poly) => {
                      if (!poly) return poly;
                      const next = poly.map((p, i) => (i === idx ? [ll.lat, ll.lng] : p));
                      return next;
                    });
                    setDirty(true);
                  },
                }}
              >
                <Tooltip permanent direction="top" opacity={0} className="sr-only" />
              </Marker>
            ))}

          {home && (
            <Marker position={[home.lat, home.lng]} icon={defaultIcon}>
              <Popup>
                <div className="popup-card">
                  <strong>Zuhause</strong>
                  <div>Lat: {home.lat.toFixed(5)} — Lng: {home.lng.toFixed(5)}</div>
                </div>
              </Popup>
            </Marker>
          )}

          {points.map((p) => {
            const post = p.postId ? postsById.get(p.postId) : null;
            const title = post?.title || "Marker";
            const img = post?.image || null;
            const href = post ? buildPostUrl(post) : null;

            return (
              <Marker
                key={p.id}
                position={[p.lat, p.lng]}
                icon={defaultIcon}
                draggable={isAdmin}
                eventHandlers={
                  isAdmin
                    ? {
                        dragend: (e) => {
                          const ll = e.target.getLatLng();
                          updatePoint(p.id, { lat: ll.lat, lng: ll.lng });
                        },
                      }
                    : {}
                }
              >
                <Tooltip direction="top" offset={[0, -10]}>
                  <div className="marker-tooltip">
                    {img ? <img src={img} alt={title} className="marker-tooltip__img" /> : null}
                    <span className="marker-tooltip__title">{title}</span>
                  </div>
                </Tooltip>

                <Popup
                  eventHandlers={{
                    add: (e) => {
                      const el = e.popup.getElement();
                      if (el) {
                        L.DomEvent.disableClickPropagation(el);
                        L.DomEvent.disableScrollPropagation(el);
                        el.setAttribute("data-stop-map-click", "true");
                      }
                    },
                  }}
                >
                  <div className="popup-card popup-card--wide">
                    <div className="popup-title">
                      <strong>{title}</strong>
                      {post?.date && <div className="popup-date">{post.date}</div>}
                    </div>

                    {img ? <img src={img} alt={title} className="popup-img" /> : null}

                    {href ? (
                      <Link to={href} onClick={(e) => e.stopPropagation()} className="popup-link">
                        Zum Blogbeitrag
                      </Link>
                    ) : (
                      <div className="popup-note">Noch kein Beitrag verknüpft</div>
                    )}

                    {isAdmin && (
                      <>
                        <div className="divider" aria-hidden="true" />
                        <div>
                          <label htmlFor={`post-select-${p.id}`} className="popup-label">
                            Beitrag verknüpfen
                          </label>
                          <select
                            id={`post-select-${p.id}`}
                            value={p.postId ?? ""}
                            onChange={(e) => {
                              e.stopPropagation();
                              const val = e.target.value;
                              updatePoint(p.id, { postId: val ? Number(val) : null });
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="popup-select"
                          >
                            <option value="">— Kein Beitrag —</option>
                            {postsSorted.map((post) => (
                              <option key={post.id} value={post.id}>
                                {post.title}
                              </option>
                            ))}
                          </select>
                          <div className="popup-help">
                            Wähle einen Blogbeitrag, der mit diesem Marker verknüpft wird.
                          </div>
                        </div>

                        <div className="popup-actions">
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (e.nativeEvent) {
                                L.DomEvent.stopPropagation(e.nativeEvent);
                                L.DomEvent.preventDefault(e.nativeEvent);
                              }
                              removePoint(p.id);
                            }}
                            className="btn is-red flex-1"
                          >
                            Entfernen
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (e.nativeEvent) {
                                L.DomEvent.stopPropagation(e.nativeEvent);
                                L.DomEvent.preventDefault(e.nativeEvent);
                              }
                              setDirty(true);
                              if (mapRef.current) mapRef.current.closePopup();
                            }}
                            className="btn is-green flex-1"
                          >
                            Änderungen merken
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </section>
  );
}
