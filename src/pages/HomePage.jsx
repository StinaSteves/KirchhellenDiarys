import { lazy, Suspense } from "react";

import HeroHeader from "../assets/components/HeroHeader.jsx";
import RecentArticles from "../assets/components/RecentArticles.jsx";
import PopularArticles from "../assets/components/PopularArticles.jsx";
import News from "../assets/components/News.jsx";
import Category from "../assets/components/Category.jsx";
import Footer from "../assets/components/Footer.jsx";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../App.css";
import "../Mobile.css";
import NewHero from "../assets/components/NewHero.jsx";
import SEO from "../assets/components/SEO.jsx";

import LazyMap from "../assets/components/LazyMap.jsx";
const BlogMap = lazy(() => import("../assets/components/BlogMap.jsx"));

export default function HomePage() {
  return (
    <>
      <SEO
        title="Kirchhellen Diarys – Aktuelles, Tipps und Nachrichten"
        description="Neueste Beiträge, beliebte Artikel und lokale News aus Kirchhellen."
        ogImage="/images/fallback-hero.jpg"
      />
      <a href="#main-content" className="sr-only sr-only-focusable">
        Zum Hauptinhalt springen
      </a>

      <main id="main-content">
        <section
          id="hero"
          role="region"
          aria-label="Einstieg und Highlight-Beitrag"
        >
          <NewHero />
        </section>

        <section id="artikel" role="region" aria-label="Neueste Artikel">
          <RecentArticles />
        </section>

        <section id="beliebt" role="region" aria-label="Beliebte Artikel">
          <PopularArticles />
        </section>
         
        <section id="facebook" role="region" aria-label="Aktuelles aus Facebook">
          <News />
        </section>

        <section id="kategorie" role="region" aria-label="Kategorienübersicht">
          <Category />
        </section>

        <section id="karte" role="region" aria-label="Interaktive Karte Kirchhellen">
          <LazyMap minHeight={480}>
            <Suspense fallback={<div style={{minHeight:480}}>Karte lädt …</div>}>
              <BlogMap />
            </Suspense>
          </LazyMap>
        </section>
      </main>
      <footer id="footer" role="contentinfo" aria-label="Seitenfuß">
        <Footer />
      </footer>
    </>
  );
}
