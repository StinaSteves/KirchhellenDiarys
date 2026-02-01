import { useEffect } from "react";
import ImpressumHero from "../assets/components/ImpressumHero";
import Footer from "../assets/components/Footer";

export default function Impressum() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.title = "Impressum – Kirchhellen Diarys";
  }, []);

  return (
    <>
      <a href="#main-content" className="sr-only sr-only-focusable">
        Zum Hauptinhalt springen
      </a>

      <ImpressumHero />

      <main id="main-content" role="main" aria-labelledby="impressum-heading">
        <h1 id="impressum-heading" className="sr-only">
          Impressum
        </h1>

        <section className="imp-page" role="region" aria-label="Impressumsangaben">
          <article className="imp-card" aria-labelledby="responsible-heading">
            
            {/* Verantwortlich */}
            <section className="imp-section" aria-labelledby="responsible-heading">
              <h2 id="responsible-heading" className="imp-h3">
                Verantwortlich für den Inhalt
              </h2>
              <address className="imp-address" style={{ fontStyle: "normal" }}>
                Max Mustermann<br />
                Musterstraße 1<br />
                12345 Musterstadt<br />
                Deutschland
              </address>
            </section>

            {/* Kontakt */}
            <section className="imp-section imp-sep" aria-labelledby="contact-heading">
              <h2 id="contact-heading" className="imp-h3">Kontakt</h2>
              <ul className="imp-list">
                <li>
                  Telefon:&nbsp;
                  <a
                    className="imp-link"
                    href="tel:+49123456789"
                    aria-label="Telefonnummer anrufen: plus vier neun eins zwei drei vier fünf sechs sieben acht neun"
                  >
                    +49 (0)123 456789
                  </a>
                </li>
                <li>
                  E-Mail:&nbsp;
                  <a
                    className="imp-link"
                    href="mailto:kontakt@musterblog.de"
                    aria-label="E-Mail schreiben an kontakt@musterblog.de"
                  >
                    kontakt@musterblog.de
                  </a>
                </li>
              </ul>
            </section>

            {/* Haftung Inhalte */}
            <section className="imp-section imp-sep" aria-labelledby="liability-content-heading">
              <h2 id="liability-content-heading" className="imp-h3">
                Haftung für Inhalte
              </h2>
              <p className="imp-text">
                Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen
                Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir
                als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
                Informationen zu überwachen oder nach Umständen zu forschen, die auf eine
                rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der
                Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
              </p>
            </section>

            {/* Haftung Links */}
            <section className="imp-section imp-sep" aria-labelledby="liability-links-heading">
              <h2 id="liability-links-heading" className="imp-h3">
                Haftung für Links
              </h2>
              <p className="imp-text">
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir
                keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine
                Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
                Anbieter oder Betreiber der Seiten verantwortlich. Bei Bekanntwerden von
                Rechtsverletzungen werden wir derartige Links umgehend entfernen.
              </p>
            </section>

            {/* Urheberrecht */}
            <section className="imp-section imp-sep" aria-labelledby="copyright-heading">
              <h2 id="copyright-heading" className="imp-h3">
                Urheberrecht
              </h2>
              <p className="imp-text">
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
                unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung,
                Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes
                bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
              </p>
            </section>

            {/* Hinweis */}
            <section className="imp-section imp-sep" aria-labelledby="note-heading">
              <h2 id="note-heading" className="imp-h3">Hinweis</h2>
              <p className="imp-text">
                Dieses Impressum dient als Muster. Bitte ersetzen Sie die Platzhalter (Name,
                Anschrift, Telefonnummer, E-Mail) durch Ihre eigenen Daten oder die eines
                Impressums-Services.
              </p>
            </section>
          </article>
        </section>
      </main>

      <Footer />
    </>
  );
}