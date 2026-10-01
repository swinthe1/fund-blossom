import patternUrl from "@/assets/cert-pattern.svg?url";
import logoOifAssetUrl from "@/assets/logo_oif.svg";
import logoBkaAssetUrl from "@/assets/bundeskanzleramt.svg";
import ausMapAssetUrl from "@/assets/aus_map.svg";
import oifSealAssetUrl from "@/assets/oif_seal.png";

type Cert = {
  certificate_number: string;
  last_name: string;
  first_name: string;
  birth_date: string;
  birth_country: string;
  exam_date: string;
  exam_level: string;
  examiner_1: string | null;
  examiner_2: string | null;
  points_hoeren_lesen: number | null;
  points_schreiben: number | null;
  points_sprechen: number | null;
  points_werte: number | null;
  result: string;
  signed_at: string | null;
};

function formatDate(d: string) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y}`;
}

function fmtNum(v: number | null) {
  return v != null ? v.toFixed(2).replace(".", ",") : "—";
}

function formatSignedDateTime(signedAt: string | null, fallbackDate: string) {
  if (!signedAt) return fallbackDate ? `${formatDate(fallbackDate)}, 14:00` : "—";

  const normalizedSource =
    !/[zZ]|[+-]\d{2}:?\d{2}$/.test(signedAt)
      ? signedAt.replace(" ", "T") + "+02:00"
      : signedAt;
  const d = new Date(normalizedSource);

  if (Number.isNaN(d.getTime())) return "—";

  const date = d.toLocaleDateString("de-AT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Vienna",
  });
  const time = d.toLocaleTimeString("de-AT", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Europe/Vienna",
  });

  return `${date}, ${time}`;
}

const LEVEL_DESCRIPTORS: Record<string, string[]> = {
  A1: [
    "vertraute, alltägliche Ausdrücke und ganz einfache Sätze verstehen und verwenden,",
    "sich und andere vorstellen sowie einfache Fragen zur Person stellen und beantworten,",
    "einfache schriftliche Mitteilungen verstehen und kurze Notizen verfassen,",
    "sich in einfacher Weise verständigen, wenn die Gesprächspartner/innen langsam und deutlich sprechen.",
  ],
  A2: [
    "in Alltagssituationen kurze Gespräche, Ansagen und Radiomeldungen verstehen,",
    "die wesentlichen Informationen aus kurzen Zeitungstexten, Anzeigen und alltagsbezogenen Beschreibungen entnehmen,",
    "in Ämtern, Geschäften oder Banken Formulare ausfüllen und Mitteilungen zum unmittelbaren Lebensumfeld schreiben,",
    "sich im Gespräch vorstellen, über die eigene Lebenssituation austauschen und Alltagsgespräche führen,",
    "in Alltagsgesprächen etwas vereinbaren oder aushandeln.",
  ],
  B1: [
    "die Hauptpunkte verstehen, wenn klare Standardsprache verwendet wird und es um vertraute Dinge aus Arbeit, Schule, Freizeit usw. geht,",
    "wichtige Informationen aus Zeitungen, Mitteilungen und alltagsbezogenen Beschreibungen auch im Detail entnehmen,",
    "zusammenhängende, private oder halbformelle Mitteilungen schreiben wie Briefe oder E-Mails,",
    "ein einfaches, direktes Gespräch über Themen führen, die im eigenen Interessengebiet liegen, kurz ihre Meinung dazu äußern und angemessen auf die Meinung ihrer Gesprächspartner/innen reagieren,",
    "in Alltagssituationen über etwas berichten, etwas vorschlagen oder etwas vereinbaren.",
  ],
  B2: [
    "die Hauptinhalte komplexer Texte zu konkreten und abstrakten Themen verstehen,",
    "sich so spontan und fließend verständigen, dass ein normales Gespräch mit Muttersprachlern gut möglich ist,",
    "sich zu einem breiten Themenspektrum klar und detailliert ausdrücken, einen Standpunkt erläutern und Vor- und Nachteile darlegen,",
    "klare und gut strukturierte schriftliche Mitteilungen zu komplexen Sachverhalten verfassen.",
  ],
  C1: [
    "ein breites Spektrum anspruchsvoller, längerer Texte verstehen und implizite Bedeutungen erfassen,",
    "sich spontan und fließend ausdrücken, ohne häufig erkennbar nach Worten suchen zu müssen,",
    "die Sprache im gesellschaftlichen und beruflichen Leben sowie in Ausbildung und Studium wirksam und flexibel gebrauchen,",
    "sich klar, strukturiert und ausführlich zu komplexen Sachverhalten äußern und dabei verschiedene Mittel zur Textverknüpfung angemessen verwenden.",
  ],
  C2: [
    "praktisch alles, was sie/er liest oder hört, mühelos verstehen,",
    "Informationen aus verschiedenen schriftlichen und mündlichen Quellen zusammenfassen und dabei Begründungen und Erklärungen in einer kohärenten Darstellung wiedergeben,",
    "sich spontan, sehr flüssig und genau ausdrücken und auch bei komplexeren Sachverhalten feinere Bedeutungsnuancen deutlich machen.",
  ],
};

export function CertificateView({ cert }: { cert: Cert }) {
  return (
    <div className="space-y-8">
      {/* PAGE 1 — official template look */}
      <article
        className="cert-page relative mx-auto w-full max-w-[210mm] overflow-hidden border border-border bg-white shadow-md print:shadow-none px-5 py-6 sm:px-[20mm] sm:py-[18mm]"
        style={{
          backgroundImage: `url(${patternUrl})`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Austria map watermark — sits behind the field grid */}
        <img
          src={ausMapAssetUrl}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 z-0 w-[140%] -translate-x-1/2 select-none"
          style={{ top: "30%" }}
        />
        <div className="relative z-10 flex items-start justify-between gap-3">
          <img
            src={logoOifAssetUrl}
            alt="Österreichischer Integrationsfonds"
            className="h-12 sm:h-14 w-auto"
          />
          <img
            src={logoBkaAssetUrl}
            alt="Bundeskanzleramt"
            className="h-10 sm:h-12 w-auto"
          />
        </div>

        {/* Title */}
        <div className="relative z-10 mt-10 sm:mt-12 text-center">
          <h1
            className="text-3xl sm:text-[2.6rem] md:text-[3rem] uppercase leading-[1.02]"
            style={{
              fontFamily: '"Gotham Narrow Bold", "Gotham Narrow", "Gotham", "Helvetica Neue", Arial, sans-serif',
              fontWeight: 900,
              letterSpacing: "-0.005em",
              color: "#e21e26",
            }}
          >
            Zeugnis zur
            <br />
            Integrationsprüfung
            <br />
            Sprachniveau {cert.exam_level}
          </h1>
          <div
            className="mt-4 sm:mt-5 text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-foreground/80"
            style={{
              fontFamily: '"Gotham Narrow Bold", "Gotham Narrow", "Gotham", "Helvetica Neue", Arial, sans-serif',
              fontWeight: 700,
            }}
          >
            {cert.exam_level === "C1" || cert.exam_level === "C2"
              ? "Sprachkompetenz"
              : "Sprachkompetenz und Werte- und Orientierungswissen"}
          </div>
        </div>

        {/* Field grid */}
        <div className="relative z-10 mx-auto mt-8 sm:mt-10 max-w-[520px]">
          <UnderlineField label="Name" value={cert.last_name} />
          <UnderlineField label="Vorname" value={cert.first_name} />
          <div className="grid grid-cols-2 gap-x-10">
            <UnderlineField label="Geburtsdatum" value={formatDate(cert.birth_date)} />
            <UnderlineField label="Geburtsland" value={cert.birth_country} />
            <UnderlineField label="Prüfungsdatum" value={formatDate(cert.exam_date)} />
            <UnderlineField label="" value={cert.examiner_1 ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-x-10">
            <div />
            <UnderlineField label="Prüfer/innen" value={cert.examiner_2 ?? ""} />
          </div>
        </div>

        {/* Statement */}
        <p
          className="relative z-10 mt-8 text-center text-sm leading-relaxed"
          style={{
            fontFamily: '"Gotham Narrow Medium", "Gotham Narrow", "Gotham", "Helvetica Neue", Arial, sans-serif',
            fontWeight: 500,
            color: "#575756",
          }}
        >
          {cert.exam_level === "C1" || cert.exam_level === "C2" ? (
            <>
              Die Teilnehmerin/Der Teilnehmer hat die {cert.exam_level}-Prüfung
              <br />
              zur Sprachkompetenz auf dem Sprachniveau {cert.exam_level} bestanden.
            </>
          ) : (
            <>
              Die Teilnehmerin/Der Teilnehmer hat die {cert.exam_level}-Prüfung bestehend aus Inhalten
              <br />
              zur Sprachkompetenz auf dem Sprachniveau {cert.exam_level} und zu Werte- und
              Orientierungswissen bestanden.
            </>
          )}
        </p>

        {/* Points */}
        <div className="relative z-10 mx-auto mt-8 sm:mt-10 max-w-lg">
          <div className="grid grid-cols-[1fr_auto] items-end gap-x-4 sm:gap-x-12">
            <div className="text-xs sm:text-sm" style={{ fontFamily: '"Gotham Narrow Medium", "Gotham Narrow", sans-serif', fontWeight: 500, color: "#575756" }}>Prüfungsteile</div>
            <div className="text-xs sm:text-sm" style={{ fontFamily: '"Gotham Narrow Medium", "Gotham Narrow", sans-serif', fontWeight: 500, color: "#575756" }}>erreichte Punktezahl</div>
          </div>
          <PointRow label="Hören/Lesen" value={fmtNum(cert.points_hoeren_lesen)} />
          <PointRow label="Schreiben" value={fmtNum(cert.points_schreiben)} />
          <PointRow label="Sprechen" value={fmtNum(cert.points_sprechen)} />
          {cert.exam_level !== "C1" && cert.exam_level !== "C2" && (
            <PointRow label="Werte- und Orientierungswissen" value={fmtNum(cert.points_werte)} />
          )}
          <PointRow label="Gesamtergebnis" value={cert.result} bold />
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-12 flex items-end justify-end text-xs">
          <div>
            <span className="text-muted-foreground">Zertifikats-Nr.</span>{" "}
            <span className="font-mono font-bold">{cert.certificate_number}</span>
          </div>
        </div>

        {/* Verified pill */}
        <div className="relative z-10 mt-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-xs font-bold text-green-800">
            <span className="inline-block h-2 w-2 rounded-full bg-green-600" />
            Zertifikat verifiziert
          </div>
        </div>
      </article>

      {/* PAGE 2 — official back */}
      <article
        className="cert-page relative mx-auto w-full max-w-[210mm] overflow-hidden border border-border bg-white shadow-md print:shadow-none px-5 py-6 sm:px-[20mm] sm:py-[18mm]"
        style={{
          backgroundImage: `url(${patternUrl})`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="relative z-10 flex min-h-[260mm] flex-col">
          <div className="flex-1">
            <h2
              className="text-base sm:text-lg leading-tight"
              style={{ fontFamily: '"Gotham Narrow Bold", "Gotham Narrow", sans-serif', fontWeight: 700, color: "#585856" }}
            >
              Integrationsprüfung Sprachniveau {cert.exam_level}
            </h2>

            <div
              className="mt-4 space-y-3 text-[13px] leading-[1.5]"
              style={{ fontFamily: '"Gotham Narrow Book", "Gotham Narrow", sans-serif', color: "#585856" }}
            >
              <p>
                Die Integrationsprüfung {cert.exam_level} misst die Sprachkenntnisse der Niveaustufe{" "}
                {cert.exam_level} des Gemeinsamen Europäischen Referenzrahmens (GER) für Sprachen
                der Niveaustufen A1 bis C2.
              </p>
              <p>
                Prüfungsteilnehmerinnen und Prüfungsteilnehmer mit{" "}
                <span style={{ fontFamily: '"Gotham Narrow Bold", "Gotham Narrow", sans-serif', fontWeight: 700, color: "#585856" }}>Niveau {cert.exam_level}</span> können bezogen auf ihre
                Sprachkompetenz u.&nbsp;a.
              </p>
              <ul className="space-y-2.5 pl-1 pt-1">
                {(LEVEL_DESCRIPTORS[cert.exam_level] ?? LEVEL_DESCRIPTORS.A2).map((t, i) => (
                  <li key={i} className="relative pl-5">
                    <span className="absolute left-0 top-0">•</span>
                    {t}
                  </li>
                ))}
              </ul>
              {cert.exam_level !== "C1" && cert.exam_level !== "C2" && (
                <p className="pt-1">
                  Prüfungsteilnehmerinnen und Prüfungsteilnehmer haben im Rahmen dieser
                  Integrationsprüfung{" "}
                  {cert.exam_level === "A1" || cert.exam_level === "A2"
                    ? "grundlegendes"
                    : "vertieftes"}{" "}
                  Werte- und Orientierungswissen zur österreichischen Rechts- und
                  Gesellschaftsordnung nachgewiesen.
                </p>
              )}
            </div>

            <div className="mt-5 border-t border-black/70" />

            <p
              className="mt-4 text-[13px] leading-[1.5]"
              style={{ fontFamily: '"Gotham Narrow Book", "Gotham Narrow", sans-serif', color: "#585856" }}
            >
              Bei nicht bestandener Prüfung wird kein Prüfungszeugnis ausgestellt.
              <br />
              Informationen zu den Prüfungsformaten und Zertifikaten des Österreichischen
              <br />
              Integrationsfonds (ÖIF) erhalten Sie unter www.integrationsfonds.at sowie telefonisch
              unter
              <br />
              +43 1 715 10 51–250.
            </p>
          </div>

          {/* Signature block at the bottom */}
          <table className="mx-auto mt-10 w-[78%] border-collapse border border-black/80 text-[10px] leading-[1.35] text-black">
            <tbody>
              <tr className="border-b border-black/80">
                <td
                  rowSpan={3}
                  className="w-[140px] border-r border-black/80 p-1 align-middle"
                >
                  <img
                    src={oifSealAssetUrl}
                    alt="ÖIF — Österreichischer Integrationsfonds"
                    className="mx-auto h-[88px] w-[88px] object-contain"
                  />
                </td>
                <td className="w-[120px] border-b border-r border-black/80 px-2 py-0.5 align-top font-bold">
                  Unterzeichner
                </td>
                <td className="border-b border-black/80 px-2 py-0.5 align-top">
                  Österreichischer Integrationsfonds
                </td>
              </tr>
              <tr className="border-b border-black/80">
                <td className="border-b border-r border-black/80 px-2 py-0.5 align-top font-bold">
                  Datum / Zeit
                </td>
                <td className="border-b border-black/80 px-2 py-0.5 align-top">
                  {formatSignedDateTime(cert.signed_at, cert.exam_date)}
                </td>
              </tr>
              <tr className="border-b border-black/80">
                <td className="border-b border-r border-black/80 px-2 py-0.5 align-middle font-bold">
                  Prüfinformation
                </td>
                <td className="border-b border-black/80 px-2 py-0.5 align-top">
                  Informationen zur Prüfung der elektronischen Signatur finden Sie unter:{" "}
                  https://integrationsprufung.at/verify
                  <br />
                  Informationen zur Prüfung des Ausdrucks finden Sie unter:{" "}
                  https://integrationsprufung.at
                </td>
              </tr>
              <tr>
                <td className="w-[120px] border-r border-black/80 px-2 py-0.5 align-top font-bold">
                  Hinweis
                </td>
                <td colSpan={2} className="px-2 py-0.5 align-top">
                  Dieses Dokument wurde elektronisch signiert.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}

function UnderlineField({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-4">
      <div className="min-h-[1.5rem] text-base font-semibold">{value || "\u00A0"}</div>
      <div className="border-b border-foreground/60" />
      {label && (
        <div className="mt-1 text-[11px] text-muted-foreground">{label}</div>
      )}
    </div>
  );
}

function PointRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="mt-4 grid grid-cols-[1fr_auto] items-end gap-x-12">
      <div
        className="text-sm"
        style={bold ? { fontFamily: '"Gotham Narrow Bold", "Gotham Narrow", sans-serif', fontWeight: 700, color: "#575756" } : undefined}
      >
        {label}
      </div>
      <div className="min-w-[120px]">
        <div
          className="text-left text-sm"
          style={bold ? { fontFamily: '"Gotham Narrow Bold", "Gotham Narrow", sans-serif', fontWeight: 700, color: "#575756" } : undefined}
        >
          {value}
        </div>
        <div className="mt-1 border-b border-foreground/60" />
      </div>
    </div>
  );
}
