import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon, Tooltip, Circle } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";

import blogData from "../data/blogData.js";
import { mapState } from "../data/mapState.js";

import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

// Fix für Leaflet Marker Icons in Vite/React
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

const KIRCHHELLEN_CENTER = [51.603548, 6.919904];
const buildPostUrl = (post) => `/artikel/${post.id}`;

export default function BlogMap() {
  const postsById = useMemo(() => {
    const m = new Map();
    for (const p of blogData) m.set(p.id, p);
    return m;
  }, []);

  // Optional: sortiert für konsistente Anzeige in Tooltips/Popups
  const points = useMemo(() => {
    const raw = Array.isArray(mapState?.points) ? mapState.points : [];
    return raw.map((p) => ({
      id: p.id ?? `${p.lat}-${p.lng}-${p.postId ?? "x"}`,
      lat: Number(p.lat),
      lng: Number(p.lng),
      postId: p.postId ?? null,
      radius: p.radius ?? 0,
    }));
  }, []);

  const home = mapState?.home ?? null;
  const polygon = mapState?.polygon ?? null;

  const headingId = "map-section-title";

  return (
    <section role="region" aria-labelledby={headingId}>
      <div className="popArticles mb-3">
        <hr />
        <h2 id={headingId}>Karte</h2>
        <hr />
      </div>

      <div className="map-wrap" aria-labelledby={headingId}>
        <MapContainer
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

          {/* Optional: Bereich/Polygon */}
          {Array.isArray(polygon) && polygon.length >= 3 && (
            <Polygon
              positions={polygon}
              pathOptions={{
                color: "#db2777",
                fillColor: "#db2777",
                fillOpacity: 0.12,
                weight: 2,
              }}
            />
          )}

          {/* Optional: Home Marker */}
          {home?.lat != null && home?.lng != null && (
            <Marker position={[home.lat, home.lng]} icon={defaultIcon}>
              <Popup>
                <div className="popup-card">
                  <strong>Zuhause</strong>
                  <div>
                    Lat: {Number(home.lat).toFixed(5)} — Lng: {Number(home.lng).toFixed(5)}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Punkte + Radius + Post-Link */}
          {points.map((p) => {
            const post = p.postId ? postsById.get(p.postId) : null;
            const title = post?.title || "Marker";
            const img = post?.image || null;
            const href = post ? buildPostUrl(post) : null;

            return (
              <div key={p.id}>
                {/* Radius */}
                {p.radius > 0 ? (
                  <Circle
                    center={[p.lat, p.lng]}
                    radius={p.radius}
                    pathOptions={{ weight: 1, fillOpacity: 0.08 }}
                  />
                ) : null}

                <Marker position={[p.lat, p.lng]} icon={defaultIcon}>
                  <Tooltip direction="top" offset={[0, -10]}>
                    <div className="marker-tooltip">
                      {img ? <img src={img} alt={title} className="marker-tooltip__img" /> : null}
                      <span className="marker-tooltip__title">{title}</span>
                      {p.radius > 0 ? (
                        <span className="marker-tooltip__radius">{p.radius} m</span>
                      ) : null}
                    </div>
                  </Tooltip>

                  <Popup>
                    <div className="popup-card popup-card--wide">
                      <div className="popup-title">
                        <strong>{title}</strong>
                        {post?.date ? <div className="popup-date">{post.date}</div> : null}
                      </div>

                      {img ? <img src={img} alt={title} className="popup-img" /> : null}

                      {p.radius > 0 ? (
                        <div className="popup-note">Radius: {p.radius} m</div>
                      ) : null}

                      {href ? (
                        <Link to={href} className="popup-link">
                          Zum Blogbeitrag
                        </Link>
                      ) : (
                        <div className="popup-note">Noch kein Beitrag verknüpft</div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              </div>
            );
          })}
        </MapContainer>

        {/* Kleine Legende (optional) */}
        <div className="map-legend" aria-hidden="true">
          <span className="mapLine">–––</span> Radius
        </div>
      </div>
    </section>
  );
}