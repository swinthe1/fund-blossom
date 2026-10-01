import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronRight, Newspaper } from "lucide-react";

import { IMG, articles, offers } from "@/lib/content";
import { SiteHeader, SiteFooter } from "@/components/Site";

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

const slides = articles.slice(0, 5);
const news = articles.slice(4);

const tabs = ["Asyl", "Bevölkerung", "Arbeit", "RWR-Karte", "Frauen", "Ukraine", "Familiennachzug", "Schule und Jugend"];

function Index() {
  const [i, setI] = useState(0);
  const [tab, setTab] = useState(0);
  const [cookies, setCookies] = useState(true);
  const s = slides[i]!;
  const [paused, setPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const touch = useRef<number | null>(null);
  const go = (d: number) => setI((v) => (v + d + slides.length) % slides.length);
  useEffect(() => { if (paused) return; const t = setInterval(() => go(1), 6000); return () => clearInterval(t); }, [paused]);

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto max-w-[1264px] px-4 pb-16 sm:px-6 lg:pb-24">
        <section onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onKeyDown={(e) => { if (e.key === "ArrowLeft") go(-1); if (e.key === "ArrowRight") go(1); }} onTouchStart={(e) => (touch.current = e.touches[0]!.clientX)} onTouchEnd={(e) => { if (touch.current === null) return; const dx = e.changedTouches[0]!.clientX - touch.current; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); touch.current = null; }} aria-roledescription="carousel" className="relative mt-8 sm:mt-14 lg:mt-20">
          <button onClick={() => go(-1)} aria-label="Zurück" className="absolute -left-14 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-muted xl:flex"><ArrowLeft /></button>
          <button onClick={() => go(1)} aria-label="Weiter" className="absolute -right-14 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-muted xl:flex"><ArrowRight /></button>
          <div key={i} className="grid animate-in fade-in duration-500 overflow-hidden bg-card md:grid-cols-[2fr_1fr]">
            <img src={IMG + s.img} alt={s.title} className="aspect-[16/10] w-full md:aspect-auto md:h-[420px] lg:h-[506px] object-cover" />
            <div className="flex flex-col justify-center p-5 sm:p-8">
              <p className="text-sm font-medium text-muted-foreground">{s.date}</p>
              <h2 className="mt-2 text-xl font-semibold leading-snug">{s.title}</h2>
              <p className="mt-6 leading-relaxed">{s.text}</p>
              <Link to="/neuigkeiten/$slug" params={{ slug: s.slug }} className="mt-6 w-fit rounded-full border-2 border-foreground px-4 py-2 font-medium">Weiterlesen</Link>
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
            <h2 className="flex items-center gap-2 text-xl font-semibold sm:text-2xl"><Newspaper className="text-muted-foreground" /> Neuigkeiten</h2>
            <Link to="/neuigkeiten" className="flex items-center gap-1 font-medium">Alle Neuigkeiten <ChevronRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {news.map((n) => (
              <Link key={n.slug} to="/neuigkeiten/$slug" params={{ slug: n.slug }} className="block bg-card">
                <img src={IMG + n.img} alt="" className="aspect-[16/10] w-full object-cover" />
                <div className="p-6">
                  <p className="text-sm text-muted-foreground">{n.date}</p>
                  <h3 className="mt-2 font-semibold leading-snug">{n.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed">{n.text}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 sm:mt-16 grid items-center gap-6 bg-card p-5 sm:p-8 md:gap-10 md:grid-cols-2">
          <img src={IMG + "3/f/csm_csm_sprachportal-mockup-laptop-7_1831664450_24b69d3909.jpg"} alt="Nutzer von Sprachportal.at" className="w-full" />
          <div>
            <h2 className="text-2xl font-semibold">Deutsch lernen mit dem ÖIF</h2>
            <p className="mt-4 leading-relaxed">Neben <b>Deutschkursen</b> an 250 Standorten bietet der ÖIF auch ein umfangreiches <b>Online-Deutschlern-Angebot (sprachportal.at)</b> sowie <b>Deutsch- und Integrationsprüfungen.</b></p>
            <Link to="/angebote" hash="deutsch-lernen" className="mt-6 inline-block rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground">Zu den Deutschlernmaßnahmen</Link>
          </div>
        </section>

        <section className="mt-10 sm:mt-16">
          <h2 className="border-b pb-2 text-2xl font-semibold">Angebote des ÖIF</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {offers.map((o) => (
              <Link key={o.label} to="/angebote" hash={o.slug} className="group relative block overflow-hidden">
                <img src={IMG + o.img} alt="" className="aspect-[4/3] w-full object-cover transition group-hover:scale-105" />
                <span className="absolute inset-x-0 bottom-0 bg-card/95 p-3 text-sm font-semibold sm:p-4 sm:text-base">{o.label}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 sm:mt-16 bg-card p-5 sm:p-8">
          <h2 className="text-2xl font-semibold">integration.at</h2>
          <p className="mt-4">Die <b>Informationswebseite für Zuwander/innen</b> ist die digitale Anlaufstelle für Integration in Österreich. Sie informiert mehrsprachig über sämtliche Integrationsmaßnahmen des ÖIF, unter anderem zu:</p>
          <ul className="mt-4 list-disc space-y-1 pl-6 underline">
            {["Integrationsberatungen", "Deutschkursen", "Werte- und Orientierungskursen", "Unterstützung für Frauen", "Unterstützung für Männer", "Berufsanerkennung"].map((x) => <li key={x}>{x}</li>)}
          </ul>
          <a href="https://www.integration.at/" className="mt-6 inline-block rounded-full border-2 border-foreground px-4 py-2 font-medium">Zu integration.at</a>
        </section>

        <section className="mt-10 sm:mt-16">
          <h2 className="border-b pb-2 text-2xl font-semibold">Integrationsdaten</h2>
          <div className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
            {tabs.map((t, k) => (
              <button key={t} onClick={() => setTab(k)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${k === tab ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{t}</button>
            ))}
          </div>
          <div className="mt-6 bg-card p-5 sm:p-8">
            <p className="font-semibold">{tabs[tab]}</p>
            <p className="mt-4 leading-relaxed">Die ÖIF-Integrationsdaten bieten aktuelle Statistiken, Zahlen, Daten und Fakten zu Migration und Integration in Österreich. In unterschiedlichen Themenbereichen werden zentrale Entwicklungen anhand <b>interaktiver Grafiken</b> dargestellt. Die Daten werden laufend aktualisiert.</p>
          </div>
        </section>
      </main>

      <SiteFooter />

      {cookies && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background py-4 sm:py-6">
          <div className="mx-auto max-w-[1264px] px-4">
            <h3 className="font-semibold">Hinweis zu Cookies</h3>
            <p className="mt-3 max-h-24 overflow-y-auto text-sm sm:max-h-none">Unsere Webseite verwendet Cookies. Diese haben zwei Funktionen: Zum einen sind sie erforderlich für die grundlegende Funktionalität unserer Website. Zum anderen können wir mit Hilfe der Cookies unsere Inhalte für Sie immer weiter verbessern. Weitere Informationen finden Sie in unserer <Link to="/datenschutz" className="underline">Datenschutzerklärung</Link> und im <Link to="/impressum" className="underline">Impressum</Link>.</p>
            {showSettings && (
              <div className="mt-4 space-y-2">
                {[["Erforderliche Cookies", "Für die grundlegende Funktion der Website nötig.", true, true], ["Externe Medien", "Erlaubt das Laden von Karten.", marketing, false], ["Marketing", "Pseudonymisierte Nutzungsanalyse.", marketing, false]].map(([t, d, v, locked]) => (
                  <label key={t as string} className="flex items-start gap-3 rounded-xl bg-card p-3 text-sm">
                    <input type="checkbox" checked={v as boolean} disabled={locked as boolean} onChange={(e) => setMarketing(e.target.checked)} className="mt-1 accent-[var(--primary)]" />
                    <span><b>{t as string}</b><br />{d as string}</span>
                  </label>
                ))}
              </div>
            )}
            <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button aria-expanded={showSettings} onClick={() => setShowSettings(!showSettings)} className="rounded-full border-2 border-foreground px-3 py-1.5 text-sm font-medium">Einstellungen</button>
              <div className="flex flex-col gap-3 sm:flex-row">
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
