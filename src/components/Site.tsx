import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Globe, Mail, Menu, Phone, Search, X } from "lucide-react";

const links = [
  { to: "/der-oeif", label: "Der ÖIF" },
  { to: "/angebote", label: "Angebote" },
  { to: "/neuigkeiten", label: "Neuigkeiten" },
  { to: "/publikationen", label: "Publikationen" },
  { to: "/kontakt", label: "Kontakt" },
] as const;

type Sub = { label: string; to: "/der-oeif" | "/angebote" | "/neuigkeiten" | "/publikationen" | "/kontakt"; hash?: string };
const menus: { label: string; to: Sub["to"]; items: Sub[] }[] = [
  { label: "Der ÖIF", to: "/der-oeif", items: [
    { label: "Über uns", to: "/der-oeif" }, { label: "Neuigkeiten", to: "/neuigkeiten" }, { label: "Kontakt & Standorte", to: "/kontakt" } ] },
  { label: "Angebote", to: "/angebote", items: [
    { label: "Integrationsmaßnahmen", to: "/angebote", hash: "integrationsmassnahmen" }, { label: "Deutsch lernen", to: "/angebote", hash: "deutsch-lernen" },
    { label: "Veranstaltungen", to: "/angebote", hash: "veranstaltungen" }, { label: "Weiterbildungen", to: "/angebote", hash: "weiterbildungen" } ] },
];
const languages = ["Deutsch", "English", "العربية", "فارسی", "Українська"];
const langCodes: Record<string, string> = { Deutsch: "de", English: "en", "العربية": "ar", "فارسی": "fa", "Українська": "uk" };
function guardDom() {
  const w = window as any;
  if (w.__gtGuard) return;
  w.__gtGuard = true;
  const rc = Node.prototype.removeChild;
  Node.prototype.removeChild = function (this: Node, child: any) {
    if (child.parentNode !== this) return child;
    return rc.call(this, child);
  } as any;
  const ib = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (this: Node, n: any, ref: any) {
    if (ref && ref.parentNode !== this) return n;
    return ib.call(this, n, ref);
  } as any;
}
function loadTranslate() {
  guardDom();
  if (document.getElementById("gt-script")) return;
  const w = window as any;
  const box = document.createElement("div");
  box.id = "google_translate_element";
  box.style.display = "none";
  document.body.appendChild(box);
  w.googleTranslateElementInit = () => {
    new w.google.translate.TranslateElement({ pageLanguage: "de", includedLanguages: "en,ar,fa,uk", autoDisplay: false }, "google_translate_element");
  };
  const s = document.createElement("script");
  s.id = "gt-script";
  s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  document.body.appendChild(s);
}

function useOutside(close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close(); };
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", h); document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, [close]);
  return ref;
}

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">A</span>
      <span className="text-lg font-semibold sm:text-xl">Academy Portal</span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState<string | null>(null);
  const [acc, setAcc] = useState<string | null>(null);
  const [lang, setLangState] = useState("Deutsch");
  useEffect(() => {
    const m = document.cookie.match(/googtrans=\/de\/(\w+)/);
    const found = m && Object.entries(langCodes).find(([, c]) => c === m[1]);
    if (found) setLangState(found[0]);
    const code = found ? found[1] : "de";
    document.documentElement.dir = code === "ar" || code === "fa" ? "rtl" : "ltr";
    if (code !== "de") loadTranslate();
  }, []);
  const setLang = (l: string) => {
    const code = langCodes[l] ?? "de";
    const host = location.hostname;
    const domains = ["", `;domain=${host}`, `;domain=.${host.replace(/^www\./, "")}`];
    for (const d of domains) {
      document.cookie = code === "de"
        ? `googtrans=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/${d}`
        : `googtrans=/de/${code};path=/${d}`;
    }
    if (code === "de") { if (lang !== "Deutsch") window.location.href = window.location.pathname; return; }
    setLangState(l);
    document.documentElement.dir = code === "ar" || code === "fa" ? "rtl" : "ltr";
    loadTranslate();
    let tries = 0;
    const apply = () => {
      const sel = document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (sel) { sel.value = code; sel.dispatchEvent(new Event("change")); }
      else if (tries++ < 50) setTimeout(apply, 200);
    };
    apply();
  };
  const [search, setSearch] = useState(false);
  const ref = useOutside(() => setDrop(null));
  return (
    <>
    <header ref={ref} className="sticky top-2 z-30 mx-2 rounded-3xl bg-card shadow-[0_4px_20px_-8px_color-mix(in_oklab,var(--foreground)_25%,transparent)] sm:top-4 sm:mx-4 lg:rounded-full">
      <div className="flex items-center gap-4 px-4 py-3 sm:px-6 sm:py-4 lg:gap-6">
        <div className="shrink-0"><Logo /></div>
        <nav className="hidden items-center gap-6 font-medium lg:flex">
          {menus.map((m) => (
            <div key={m.label} className="relative">
              <button aria-expanded={drop === m.label} onClick={() => setDrop(drop === m.label ? null : m.label)} className="flex items-center gap-1 hover:text-primary">
                {m.label} <ChevronDown className={`h-4 w-4 transition-transform ${drop === m.label ? "rotate-180" : ""}`} />
              </button>
              {drop === m.label && (
                <div className="absolute left-0 top-full mt-6 w-72 rounded-2xl bg-card p-2 shadow-lg">
                  {m.items.map((it) => <Link key={it.label} to={it.to} {...(it.hash ? { hash: it.hash } : {})} onClick={() => setDrop(null)} className="block rounded-xl px-4 py-3 hover:bg-muted">{it.label}</Link>)}
                </div>
              )}
            </div>
          ))}
          <Link to="/publikationen" className="hover:text-primary" activeProps={{ className: "text-primary" }}>Publikationen</Link>
          <Link to="/verify" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">Zertifikat verifizieren</Link>
        </nav>
        <a href="https://www.integration.at/" className="mx-auto hidden flex-col 2xl:flex">
          <span className="font-medium">Informationen für Zuwander/innen</span>
          <span className="text-sm text-muted-foreground">integration.at</span>
        </a>
        <div className="ml-auto flex shrink-0 items-center gap-3 font-medium sm:gap-5">
          <div className="relative hidden xl:block">
            <button aria-expanded={drop === "lang"} onClick={() => setDrop(drop === "lang" ? null : "lang")} className="notranslate flex items-center gap-1" translate="no"><Globe className="h-4 w-4" /> {lang} <ChevronDown className="h-4 w-4" /></button>
            {drop === "lang" && (
              <div className="absolute right-0 top-full mt-6 w-44 rounded-2xl bg-card p-2 shadow-lg">
                {languages.map((l) => <button key={l} onClick={() => { setLang(l); setDrop(null); }} translate="no" className={`notranslate block w-full rounded-xl px-4 py-2 text-left hover:bg-muted ${l === lang ? "text-primary" : ""}`}>{l}</button>)}
              </div>
            )}
          </div>
          <button onClick={() => setSearch(true)} className="hidden items-center gap-1 md:flex"><Search className="h-4 w-4" /> <span className="hidden xl:inline">Suche</span></button>
          <Link to="/kontakt" className="hidden items-center gap-1 xl:flex"><Mail className="h-4 w-4" /> Kontakt</Link>
          <a href="tel:0504680" aria-label="Anrufen" className="flex items-center gap-2 rounded-full bg-primary p-3 text-primary-foreground sm:px-5"><Phone className="h-4 w-4" /><span className="hidden sm:inline">050 46 80</span></a>
          <button onClick={() => setOpen(!open)} aria-label="Menü" aria-expanded={open} className="rounded-full bg-muted p-3 lg:hidden">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
      </div>
      {open && (
        <nav className="flex max-h-[75vh] flex-col overflow-y-auto border-t px-4 pb-4 lg:hidden">
          {menus.map((m) => (
            <div key={m.label} className="border-b">
              <button aria-expanded={acc === m.label} onClick={() => setAcc(acc === m.label ? null : m.label)} className="flex w-full items-center justify-between py-3 text-lg font-medium">
                {m.label} <ChevronDown className={`h-5 w-5 transition-transform ${acc === m.label ? "rotate-180" : ""}`} />
              </button>
              {acc === m.label && <div className="pb-2 pl-4">{m.items.map((it) => <Link key={it.label} to={it.to} {...(it.hash ? { hash: it.hash } : {})} onClick={() => setOpen(false)} className="block py-2 text-muted-foreground">{it.label}</Link>)}</div>}
            </div>
          ))}
          {links.slice(2).map((l) => <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="border-b py-3 text-lg font-medium" activeProps={{ className: "text-primary" }}>{l.label}</Link>)}
          <Link to="/verify" onClick={() => setOpen(false)} className="my-3 rounded-full bg-primary px-4 py-2 text-center font-semibold text-primary-foreground">Zertifikat verifizieren</Link>
          <div className="flex flex-wrap gap-2 border-b py-3">{languages.map((l) => <button key={l} onClick={() => setLang(l)} translate="no" className={`notranslate rounded-full px-3 py-1 text-sm ${l === lang ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{l}</button>)}</div>
          <button onClick={() => { setSearch(true); setOpen(false); }} className="flex items-center gap-2 border-b py-3 text-lg font-medium"><Search className="h-5 w-5" /> Suche</button>
          <a href="https://www.integration.at/" className="py-3"><span className="font-medium">Informationen für Zuwander/innen</span><br /><span className="text-sm text-muted-foreground">integration.at</span></a>
        </nav>
      )}
    </header>
    {search && <SearchOverlay onClose={() => setSearch(false)} />}
    </>
  );
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const pages = [
    { to: "/der-oeif", t: "Der ÖIF" }, { to: "/angebote", t: "Angebote Deutschkurse Integrationsmaßnahmen Weiterbildungen" },
    { to: "/neuigkeiten", t: "Neuigkeiten Meldungen" }, { to: "/publikationen", t: "Publikationen Jahrbuch Factsheet" }, { to: "/kontakt", t: "Kontakt Hotline" },
  ] as const;
  const hits = q.trim() ? pages.filter((p) => p.t.toLowerCase().includes(q.toLowerCase())) : [];
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k); }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 p-4 pt-24" onClick={onClose}>
      <div className="mx-auto max-w-2xl rounded-3xl bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b pb-3"><Search className="h-5 w-5" /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Suchbegriff eingeben" className="flex-1 bg-transparent text-lg outline-none" /><button onClick={onClose} aria-label="Schließen"><X /></button></div>
        <ul className="mt-3">{hits.map((h) => <li key={h.to}><Link to={h.to} onClick={onClose} className="block rounded-xl px-3 py-2 hover:bg-muted">{h.t.split(" ")[0]}</Link></li>)}
          {q && !hits.length && <li className="px-3 py-2 text-muted-foreground">Keine Ergebnisse</li>}</ul>
      </div>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-foreground px-4 py-12 text-background">
      <div className="mx-auto grid max-w-[1264px] gap-8 md:grid-cols-3">
        <div><p className="text-lg font-bold">Academy Portal</p><p className="mt-2 text-sm opacity-80">Lernen, Kurse und Weiterbildung</p></div>
        <div className="text-sm opacity-80"><p>© {new Date().getFullYear()} Academy Portal</p></div>
        <div className="flex gap-4 text-sm opacity-80 md:justify-end">
          <Link to="/impressum">Impressum</Link><Link to="/datenschutz">Datenschutz</Link><Link to="/kontakt">Kontakt</Link>
        </div>
      </div>
    </footer>
  );
}

export function Page({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-[1264px] px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:pb-24 lg:pt-20">
        <p className="mb-3 text-sm font-medium text-muted-foreground"><Link to="/">Startseite</Link> / {title}</p>
        <h1 className="border-b pb-3 text-2xl font-semibold sm:text-3xl lg:text-4xl">{title}</h1>
        <div className="mt-8">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}

export const meta = (title: string, description: string) => ({
  meta: [
    { title: `${title} - integrationsfonds.at` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} - integrationsfonds.at` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});
