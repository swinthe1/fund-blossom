import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Globe, Mail, Menu, Phone, Search, X } from "lucide-react";

const links = [
  { to: "/der-oeif", label: "Der ÖIF" },
  { to: "/angebote", label: "Angebote" },
  { to: "/neuigkeiten", label: "Neuigkeiten" },
  { to: "/publikationen", label: "Publikationen" },
  { to: "/kontakt", label: "Kontakt" },
] as const;

function Logo() {
  return (
    <Link to="/" className="flex items-end gap-2">
      <div className="relative leading-none">
        <span className="absolute -top-2 left-1.5 h-1.5 w-4 bg-primary" />
        <span className="text-4xl font-bold sm:text-5xl tracking-tight">ÖIF</span>
      </div>
      <span className="pb-1 text-[10px] font-bold uppercase leading-tight">Österreichischer<br />Integrations<br />Fonds</span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-2 z-30 mx-2 rounded-3xl bg-card shadow-sm sm:top-4 sm:mx-4 lg:rounded-full">
      <div className="flex items-center gap-4 px-4 py-3 sm:px-6 sm:py-4 lg:gap-6">
        <div className="shrink-0"><Logo /></div>
        <nav className="hidden items-center gap-6 font-medium lg:flex">
          {links.slice(0, 4).map((l) => <Link key={l.to} to={l.to} activeProps={{ className: "text-primary" }}>{l.label}</Link>)}
        </nav>
        <a href="https://www.integration.at/" className="mx-auto hidden flex-col 2xl:flex">
          <span className="font-medium">Informationen für Zuwander/innen</span>
          <span className="text-sm text-muted-foreground">integration.at</span>
        </a>
        <div className="ml-auto flex shrink-0 items-center gap-3 font-medium sm:gap-5">
          <span className="hidden items-center gap-1 xl:flex"><Globe className="h-4 w-4" /> Deutsch</span>
          <span className="hidden items-center gap-1 md:flex"><Search className="h-4 w-4" /> <span className="hidden xl:inline">Suche</span></span>
          <Link to="/kontakt" className="hidden items-center gap-1 xl:flex"><Mail className="h-4 w-4" /> Kontakt</Link>
          <a href="tel:0504680" aria-label="Anrufen" className="flex items-center gap-2 rounded-full bg-primary p-3 text-primary-foreground sm:px-5"><Phone className="h-4 w-4" /><span className="hidden sm:inline">050 46 80</span></a>
          <button onClick={() => setOpen(!open)} aria-label="Menü" className="rounded-full bg-muted p-3 lg:hidden">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
      </div>
      {open && (
        <nav className="flex flex-col border-t px-4 pb-4 lg:hidden">
          {links.map((l) => <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="border-b py-3 text-lg font-medium" activeProps={{ className: "text-primary" }}>{l.label}</Link>)}
          <a href="https://www.integration.at/" className="py-3"><span className="font-medium">Informationen für Zuwander/innen</span><br /><span className="text-sm text-muted-foreground">integration.at</span></a>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-foreground px-4 py-12 text-background">
      <div className="mx-auto grid max-w-[1264px] gap-8 md:grid-cols-3">
        <div><p className="text-lg font-bold">Österreichischer Integrationsfonds</p><p className="mt-2 text-sm opacity-80">Landstraßer Hauptstraße 26, 1030 Wien</p></div>
        <div className="text-sm opacity-80"><p>Service-Hotline: 050 46 80</p><p>E-Mail: info@integrationsfonds.at</p></div>
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
