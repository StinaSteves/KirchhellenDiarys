import { useEffect, useMemo } from "react";
import DatenschutzHero from "../assets/components/DatenschutzHero";
import Footer from "../assets/components/Footer";
import SEO from "../assets/components/SEO.jsx";

export default function Datenschutz() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.title = "Datenschutzerklärung – ";
  }, []);

  const { standText, standISO } = useMemo(() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return {
      standText: `${dd}.${mm}.${yyyy}`,
      standISO: `${yyyy}-${mm}-${dd}`,
    };
  }, []);

  const pageHeadingId = "ds-heading";
  const articleTitleId = "ds-article-title";

  return (
    <div className="ds-wrap">
      <SEO
        title="Datenschutz – "
        description="Informationen zum Datenschutz und zur Verarbeitung personenbezogener Daten."
        ogImage="/images/fallback-hero.jpg"
      />
      <DatenschutzHero />

      <main id="main-content" role="main" aria-labelledby={pageHeadingId}>
        <h2 id={pageHeadingId} className="sr-only">
          Datenschutzerklärung – Inhalte
        </h2>

        <nav aria-label="Abschnitt-Navigation" className="sr-only">
          <ul>
            <li><a href="#ds-1">Verantwortliche Stelle</a></li>
            <li><a href="#ds-2">Erhobene Daten</a></li>
            <li><a href="#ds-3">Zwecke der Verarbeitung</a></li>
            <li><a href="#ds-4">Cookies</a></li>
            <li><a href="#ds-5">Google Analytics</a></li>
            <li><a href="#ds-6">Karten-Dienst (OpenStreetMap)</a></li>
            <li><a href="#ds-7">Kontaktformular</a></li>
            <li><a href="#ds-8">Speicherdauer</a></li>
            <li><a href="#ds-9">Rechte der Nutzer</a></li>
            <li><a href="#ds-10">Stand</a></li>
          </ul>
        </nav>

        <section className="ds-page" aria-label="Datenschutzerklärung">
          <article
            className="ds-card"
            role="article"
            aria-labelledby={articleTitleId}
          >
            <h2 id={articleTitleId} className="sr-only">
              Datenschutzerklärung – Details
            </h2>

            {/* 1 */}
            <section className="ds-sec" id="ds-1" aria-labelledby="ds-h3-1">
              <h3 className="ds-h3" id="ds-h3-1">1. Verantwortliche Stelle</h3>
              <address className="ds-txt ds-address" style={{ fontStyle: "normal" }}>
                Max Mustermann<br />
                Musterstraße 1<br />
                12345 Musterstadt<br />
                Deutschland<br />
                E-Mail:{" "}
                <a className="ds-link" href="mailto:kontakt@musterblog.de">
                  kontakt@musterblog.de
                </a>
              </address>
            </section>

            {/* 2 */}
            <section className="ds-sec ds-sep" id="ds-2" aria-labelledby="ds-h3-2">
              <h3 className="ds-h3" id="ds-h3-2">2. Erhobene Daten</h3>
              <ul className="ds-list">
                <li>Registrierungsdaten: E-Mail-Adresse, Benutzername, Passwort (gehasht).</li>
                <li>Login-Daten: Session-Cookies, CSRF-Token.</li>
                <li>Protokolldaten: IP-Adresse, Datum/Uhrzeit, Browser, aufgerufene Seiten.</li>
                <li>Daten aus Kontaktformular/E-Mails (z. B. Name, Mailadresse, Nachricht).</li>
                <li>Nutzungsdaten beim Aufruf von Karten (OpenStreetMap) und Google Analytics.</li>
              </ul>
            </section>

            {/* 3 */}
            <section className="ds-sec ds-sep" id="ds-3" aria-labelledby="ds-h3-3">
              <h3 className="ds-h3" id="ds-h3-3">3. Zwecke der Verarbeitung</h3>
              <p className="ds-txt">
                Bereitstellung und Sicherheit der Website, Verwaltung von Benutzerkonten,
                Bearbeitung von Kontaktanfragen sowie Analyse der Nutzung unserer Inhalte
                (Google Analytics).
              </p>
            </section>

            {/* 4 */}
            <section className="ds-sec ds-sep" id="ds-4" aria-labelledby="ds-h3-4">
              <h3 className="ds-h3" id="ds-h3-4">4. Cookies</h3>
              <p className="ds-txt">Wir setzen folgende Cookies ein:</p>
              <ul className="ds-list">
                <li>Session-Cookie (Login, technisch erforderlich).</li>
                <li>CSRF-Cookie (Sicherheit, technisch erforderlich).</li>
                <li>Google-Analytics-Cookies (Analyse, nur mit Einwilligung).</li>
              </ul>
            </section>

            {/* 5 */}
            <section className="ds-sec ds-sep" id="ds-5" aria-labelledby="ds-h3-5">
              <h3 className="ds-h3" id="ds-h3-5">5. Google Analytics</h3>
              <p className="ds-txt">
                Wir nutzen Google Analytics (Google Ireland Limited). Dabei werden Cookies gesetzt
                und Informationen über deine Nutzung dieser Website an Google übertragen (mögliche
                Übermittlung in die USA). Die IP-Adresse wird anonymisiert.
              </p>
              <p className="ds-txt">
                Rechtsgrundlage ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).
                Du kannst deine Einwilligung jederzeit über das Cookie-Banner widerrufen.
              </p>
            </section>

            {/* 6 */}
            <section className="ds-sec ds-sep" id="ds-6" aria-labelledby="ds-h3-6">
              <h3 className="ds-h3" id="ds-h3-6">6. Karten-Dienst (OpenStreetMap)</h3>
              <p className="ds-txt">
                Für die Kartendarstellung nutzen wir OpenStreetMap. Beim Laden der Karte werden
                IP-Adresse und technische Daten an Server der OpenStreetMap Foundation (UK)
                übertragen.
              </p>
              <p className="ds-txt">
                Weitere Infos:{" "}
                <a
                  className="ds-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://wiki.osmfoundation.org/wiki/Privacy_Policy"
                >
                  https://wiki.osmfoundation.org/wiki/Privacy_Policy
                </a>
              </p>
            </section>

            {/* 7 */}
            <section className="ds-sec ds-sep" id="ds-7" aria-labelledby="ds-h3-7">
              <h3 className="ds-h3" id="ds-h3-7">7. Kontaktformular</h3>
              <p className="ds-txt">
                Angaben aus dem Kontaktformular oder E-Mails verwenden wir ausschließlich zur
                Bearbeitung deiner Anfrage. Die Daten werden gelöscht, sobald der Zweck entfällt,
                sofern keine gesetzlichen Aufbewahrungspflichten bestehen.
              </p>
            </section>

            {/* 8 */}
            <section className="ds-sec ds-sep" id="ds-8" aria-labelledby="ds-h3-8">
              <h3 className="ds-h3" id="ds-h3-8">8. Speicherdauer</h3>
              <p className="ds-txt">
                Benutzerkonten bleiben gespeichert, bis du oder wir sie löschen. Server-Logs werden
                in der Regel binnen 7–14 Tagen gelöscht. Cookies haben unterschiedliche Laufzeiten
                (Session-Cookie: Ende der Sitzung).
              </p>
            </section>

            {/* 9 */}
            <section className="ds-sec ds-sep" id="ds-9" aria-labelledby="ds-h3-9">
              <h3 className="ds-h3" id="ds-h3-9">9. Rechte der Nutzer</h3>
              <ul className="ds-list">
                <li>Auskunft (Art. 15 DSGVO)</li>
                <li>Berichtigung (Art. 16 DSGVO)</li>
                <li>Löschung (Art. 17 DSGVO)</li>
                <li>Einschränkung (Art. 18 DSGVO)</li>
                <li>Widerruf der Einwilligung (Art. 7 Abs. 3 DSGVO)</li>
                <li>Widerspruch (Art. 21 DSGVO)</li>
                <li>Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
              </ul>
            </section>

            {/* 10 */}
            <section className="ds-sec ds-sep" id="ds-10" aria-labelledby="ds-h3-10">
              <h3 className="ds-h3" id="ds-h3-10">10. Stand</h3>
              <p className="ds-txt">
                Diese Datenschutzerklärung hat den Stand:{" "}
                <time dateTime={standISO}>{standText}</time>.
              </p>
            </section>
          </article>
        </section>
      </main>

      <Footer />
    </div>
  );
}
