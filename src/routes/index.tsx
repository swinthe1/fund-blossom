import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronRight, Globe, Mail, Newspaper, Phone, Search } from "lucide-react";

const IMG = "https://www.integrationsfonds.at/fileadmin/_processed_/";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Startseite - integrationsfonds.at" },
      { name: "description", content: "Österreichischer Integrationsfonds: Neuigkeiten, Deutschkurse, Integrationsmaßnahmen und Integrationsdaten." },
      { property: "og:title", content: "Startseite - integrationsfonds.at" },
      { property: "og:description", content: "Neuigkeiten, Angebote und Integrationsdaten des ÖIF." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const slides = [
  { img: "d/0/csm_Adrian_Almasan-0154_2e799f6fb1.jpg", date: "25.09.2026", title: "Karriere im ÖIF: Talente von heute werden zu Führungskräften von morgen", text: "9 von 10 Führungskräften haben ihre Karriere als Mitarbeiter/in im ÖIF begonnen / Nachwuchsführungskräfte- und Mentoringprogramme unterstützen Mitarbeiter/innen bei ihrer beruflichen Entwicklung" },
  { img: "1/c/csm_FB_NEETs_Website_Bild_74d09b4b1d.jpg", date: "25.09.2026", title: "Neuer ÖIF-Forschungsbericht: Migrantische Jugendliche der ersten Generation deutlich häufiger ohne Ausbildung oder Arbeit", text: "Analyse auf Basis verfügbarer Daten aus 2022: 27 % der Jugendlichen mit Migrationshintergrund der ersten Generation weder in Beschäftigung, Ausbildung noch Schulung" },
  { img: "7/2/csm_20260924_web46__c_Soldatenko-OEIF_3c3617f386.jpg", date: "24.09.2026", title: "Frauen und Mädchen schützen: ÖIF-Expert/innen-Dialog zur Gewaltprävention im Integrationskontext", text: "Die ÖIF-Gesprächsreihe bringt Fachleute aus Bildung, Sicherheit, Justiz, Gewaltschutz und Beratung zusammen." },
  { img: "c/7/csm_20260921_web11__c_Soldatenko-OEIF_6eac775efa.jpg", date: "19.09.2026", title: "Frauen und Vielfalt prägen den ÖIF", text: "2 von 3 ÖIF-Mitarbeiter/innen sind Frauen / Rund 60 % haben Migrationshintergrund / Mehrfach für Frauenförderung und Familienfreundlichkeit ausgezeichnet" },
  { img: "c/c/csm_Seminarprogramm_Herbst_2026_Website_Newsbild2_a030444561.jpg", date: "15.09.2026", title: "Neues ÖIF-Seminarprogramm Herbst 2026", text: "Weiterbildungen für Multiplikator/innen in ganz Österreich." },
];

const news = [
  { img: "c/e/csm_20250905_print68_c_Soldatenko_OEIF_4cc43a2a5a.jpg", date: "14.09.2026", title: "ÖIF-Befragung: 8 von 10 der Teilnehmer/innen befürworten die Berücksichtigung von Dialekt im Unterricht / Deutschkurse helfen im Alltag und Beruf", text: "ÖIF-Befragung unter rund 1.400 Teilnehmer/innen von Deutschkursen zeigt hohe Relevanz von Verständnis regionaler Sprachvarianten für Alltag und Beruf" },
  { img: "e/c/csm_Website_Bild_Statistisches_Jahrbuch_2026_a7c0789837.jpg", date: "11.09.2026", title: "Statistisches Jahrbuch „Migration & Integration“: Anteil der Bevölkerung mit Migrationshintergrund steigt auf 28,2 %", text: "Asylanträge und Asylgewährungen im Vergleich zum Vorjahr deutlich gesunken / Umfassende Daten zu Migration und Integration von Statistik Austria und ÖIF" },
  { img: "8/e/csm_Website_Bild_Factsheet_Schule_und_Integration_2026-02_7bb088672d.jpg", date: "05.09.2026", title: "Neues ÖIF-Factsheet: 26 % der Schüler/innen mit nicht-deutscher Umgangssprache", text: "Zuwachs bei Schüler/innen entfällt vollständig auf ausländische Staatsangehörige / 21 % der Schüler/innen in Österreich haben eine ausländische Staatsangehörigkeit" },
];

const offers = [
  { label: "Integrationsmaßnahmen", img: "5/0/csm_Beratung_IZ_Wien_2_OEIF_Unger_d7413b2d29.jpg" },
  { label: "Deutsch lernen", img: "0/e/csm_20240506_Praesentation_Sprachportal_OEIF_Slider_cd942bf4bb.jpg" },
  { label: "Veranstaltungen", img: "5/6/csm_20231002-print3_b7175806f0.jpg" },
  { label: "Weiterbildungen", img: "f/1/csm_WOK_Kurs_2024_OEIF_223dcb6e50.jpg" },
];

const tabs = ["Asyl", "Bevölkerung", "Arbeit", "RWR-Karte", "Frauen", "Ukraine", "Familiennachzug", "Schule und Jugend"];

function Logo() {
  return (
    <div className="flex items-end gap-2">
      <div className="relative leading-none">
        <span className="absolute -top-2 left-1.5 h-1.5 w-4 bg-primary" />
        <span className="text-5xl font-bold tracking-tight">ÖIF</span>
      </div>
      <span className="pb-1 text-[10px] font-bold uppercase leading-tight">Österreichischer<br />Integrations<br />Fonds</span>
    </div>
  );
}

function Index() {
  const [i, setI] = useState(0);
  const [tab, setTab] = useState(0);
  const [cookies, setCookies] = useState(true);
  const s = slides[i];
  const go = (d: number) => setI((i + d + slides.length) % slides.length);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-4 z-30 mx-4 flex items-center gap-6 rounded-full bg-card px-6 py-4 shadow-sm">
        <Logo />
        <nav className="hidden items-center gap-6 font-medium lg:flex">
          <a className="flex items-center gap-1">Der ÖIF <ChevronDown className="h-4 w-4" /></a>
          <a className="flex items-center gap-1">Angebote <ChevronDown className="h-4 w-4" /></a>
          <a>Publikationen</a>
        </nav>
        <a href="https://www.integration.at/" className="mx-auto hidden flex-col xl:flex">
          <span className="font-medium">Informationen für Zuwander/innen</span>
          <span className="text-sm text-muted-foreground">integration.at</span>
        </a>
        <div className="ml-auto flex items-center gap-5 font-medium">
          <span className="hidden items-center gap-1 md:flex"><Globe className="h-4 w-4" /> Deutsch <ChevronDown className="h-4 w-4" /></span>
          <span className="hidden items-center gap-1 md:flex"><Search className="h-4 w-4" /> Suche</span>
          <span className="hidden items-center gap-1 md:flex"><Mail className="h-4 w-4" /> Kontakt</span>
          <a href="tel:050468" className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-primary-foreground"><Phone className="h-4 w-4" /> 050 46 80</a>
        </div>
      </header>

      <main className="mx-auto max-w-[1264px] px-4 pb-24">
        <section className="relative mt-20">
          <button onClick={() => go(-1)} aria-label="Zurück" className="absolute -left-14 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-muted lg:flex"><ArrowLeft /></button>
          <button onClick={() => go(1)} aria-label="Weiter" className="absolute -right-14 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-muted lg:flex"><ArrowRight /></button>
          <div className="grid overflow-hidden bg-card md:grid-cols-[2fr_1fr]">
            <img src={IMG + s.img} alt={s.title} className="h-[506px] w-full object-cover" />
            <div className="flex flex-col justify-center p-8">
              <p className="text-sm font-medium text-muted-foreground">{s.date}</p>
              <h2 className="mt-2 text-xl font-semibold leading-snug">{s.title}</h2>
              <p className="mt-6 leading-relaxed">{s.text}</p>
              <button className="mt-6 w-fit rounded-full border-2 border-foreground px-4 py-2 font-medium">Weiterlesen</button>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-2">
            {slides.map((_, k) => (
              <button key={k} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} className={`h-2 w-2 rounded-full ${k === i ? "bg-foreground" : "bg-muted-foreground/40"}`} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="flex items-center gap-2 text-2xl font-semibold"><Newspaper className="text-muted-foreground" /> Neuigkeiten</h2>
            <a className="flex items-center gap-1 font-medium">Alle Neuigkeiten <ChevronRight className="h-4 w-4" /></a>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {news.map((n) => (
              <article key={n.title} className="bg-card">
                <img src={IMG + n.img} alt="" className="aspect-[16/10] w-full object-cover" />
                <div className="p-6">
                  <p className="text-sm text-muted-foreground">{n.date}</p>
                  <h3 className="mt-2 font-semibold leading-snug">{n.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed">{n.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 grid items-center gap-10 bg-card p-8 md:grid-cols-2">
          <img src={IMG + "3/f/csm_csm_sprachportal-mockup-laptop-7_1831664450_24b69d3909.jpg"} alt="Nutzer von Sprachportal.at" className="w-full" />
          <div>
            <h2 className="text-2xl font-semibold">Deutsch lernen mit dem ÖIF</h2>
            <p className="mt-4 leading-relaxed">Neben <b>Deutschkursen</b> an 250 Standorten bietet der ÖIF auch ein umfangreiches <b>Online-Deutschlern-Angebot (sprachportal.at)</b> sowie <b>Deutsch- und Integrationsprüfungen.</b></p>
            <button className="mt-6 rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground">Zu den Deutschlernmaßnahmen</button>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="border-b pb-2 text-2xl font-semibold">Angebote des ÖIF</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {offers.map((o) => (
              <a key={o.label} className="group relative block overflow-hidden">
                <img src={IMG + o.img} alt="" className="aspect-[4/3] w-full object-cover transition group-hover:scale-105" />
                <span className="absolute inset-x-0 bottom-0 bg-card/95 p-4 font-semibold">{o.label}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-16 bg-card p-8">
          <h2 className="text-2xl font-semibold">integration.at</h2>
          <p className="mt-4">Die <b>Informationswebseite für Zuwander/innen</b> ist die digitale Anlaufstelle für Integration in Österreich. Sie informiert mehrsprachig über sämtliche Integrationsmaßnahmen des ÖIF, unter anderem zu:</p>
          <ul className="mt-4 list-disc space-y-1 pl-6 underline">
            {["Integrationsberatungen", "Deutschkursen", "Werte- und Orientierungskursen", "Unterstützung für Frauen", "Unterstützung für Männer", "Berufsanerkennung"].map((x) => <li key={x}>{x}</li>)}
          </ul>
          <a href="https://www.integration.at/" className="mt-6 inline-block rounded-full border-2 border-foreground px-4 py-2 font-medium">Zu integration.at</a>
        </section>

        <section className="mt-16">
          <h2 className="border-b pb-2 text-2xl font-semibold">Integrationsdaten</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {tabs.map((t, k) => (
              <button key={t} onClick={() => setTab(k)} className={`rounded-full px-4 py-2 text-sm font-medium ${k === tab ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{t}</button>
            ))}
          </div>
          <div className="mt-6 bg-card p-8">
            <p className="font-semibold">{tabs[tab]}</p>
            <p className="mt-4 leading-relaxed">Die ÖIF-Integrationsdaten bieten aktuelle Statistiken, Zahlen, Daten und Fakten zu Migration und Integration in Österreich. In unterschiedlichen Themenbereichen werden zentrale Entwicklungen anhand <b>interaktiver Grafiken</b> dargestellt. Die Daten werden laufend aktualisiert.</p>
          </div>
        </section>
      </main>

      <footer className="bg-foreground px-4 py-12 text-background">
        <div className="mx-auto grid max-w-[1264px] gap-8 md:grid-cols-3">
          <div><p className="text-lg font-bold">Österreichischer Integrationsfonds</p><p className="mt-2 text-sm opacity-80">Landstraßer Hauptstraße 26, 1030 Wien</p></div>
          <div className="text-sm opacity-80"><p>Service-Hotline: 050 46 80</p><p>E-Mail: info@integrationsfonds.at</p></div>
          <div className="flex gap-4 text-sm opacity-80 md:justify-end"><a>Impressum</a><a>Datenschutz</a><a>Barrierefreiheit</a></div>
        </div>
      </footer>

      {cookies && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background py-6">
          <div className="mx-auto max-w-[1264px] px-4">
            <h3 className="font-semibold">Hinweis zu Cookies</h3>
            <p className="mt-3 text-sm">Unsere Webseite verwendet Cookies. Diese haben zwei Funktionen: Zum einen sind sie erforderlich für die grundlegende Funktionalität unserer Website. Zum anderen können wir mit Hilfe der Cookies unsere Inhalte für Sie immer weiter verbessern. Weitere Informationen finden Sie in unserer <u>Datenschutzerklärung</u> und im <u>Impressum</u>.</p>
            <div className="mt-4 flex items-center justify-between">
              <button className="rounded-full border-2 border-foreground px-3 py-1.5 text-sm font-medium">Einstellungen</button>
              <div className="flex gap-3">
                <button onClick={() => setCookies(false)} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Speichern</button>
                <button onClick={() => setCookies(false)} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Alle Cookies akzeptieren</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
