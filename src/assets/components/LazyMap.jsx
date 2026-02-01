import { useEffect, useRef, useState } from "react";

export default function LazyMap({ children, minHeight = 420 }) {
  const hostRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setReady(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    if (hostRef.current) io.observe(hostRef.current);
    return () => io.disconnect();
  }, []);

  if (ready) return <div ref={hostRef}>{children}</div>;

  return (
    <div ref={hostRef} style={{ minHeight }}>
      <button
        type="button"
        className="map-placeholder"
        aria-label="Karte laden"
        onClick={() => setReady(true)}
      >
        Karte laden
      </button>
    </div>
  );
}