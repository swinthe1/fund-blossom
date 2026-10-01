import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Globe, Mail, Phone, Search } from "lucide-react";

function Logo() {
  return (
    <Link to="/" className="flex items-end gap-2">
      <div className="relative leading-none">
        <span className="absolute -top-2 left-1.5 h-1.5 w-4 bg-primary" />
        <span className="text-5xl font-bold tracking-tight">ÖIF</span>
      </div>
      <span className="pb-1 text-[10px] font-bold uppercase leading-tight">Österreichischer<br />Integrations<br />Fonds</span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-4 z-30 mx-4 flex items-center gap-6 rounded-full bg-card px-6 py-4 shadow-sm">
      <Logo />
      <nav className="hidden items-center gap-6 font-medium lg:flex">
        <Link to="/der-oeif" activeProps={{ className: "text-primary" }}>Der ÖIF</Link>
        <Link to="/angebote" activeProps={{ className: "text-primary" }}>Angebote</Link>
        <Link to="/neuigkeiten" activeProps={{ className: "text-primary" }}>Neuigkeiten</Link>
        <Link to="/publikationen" activeProps={{ className: "text-primary" }}>Publikationen</Link>
      </nav>
      <a href="https://www.integration.at/" className="mx-auto hidden flex-col xl:flex">
        <span className="font-medium">Informationen für Zuwander/innen</span>
        <span className="text-sm text-muted-foreground">integration.at</span>
      </a>
      <div className="ml-auto flex items-center gap-5 font-medium">
        <span className="hidden items-center gap-1 md:flex"><Globe className="h-4 w-4" /> Deutsch</span>
        <span className="hidden items-center gap-1 md:flex"><Search className="h-4 w-4" /> Suche</span>
        <Link to="/kontakt" className="hidden items-center gap-1 md:flex"><Mail className="h-4 w-4" /> Kontakt</Link>
        <a href="tel:0504680" className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-primary-foreground"><Phone className="h-4 w-4" /> 050 46 80</a>
      </div>
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
      <main className="mx-auto max-w-[1264px] px-4 pb-24 pt-20">
        <h1 className="border-b pb-3 text-4xl font-semibold">{title}</h1>
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
