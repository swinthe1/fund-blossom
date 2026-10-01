import { createFileRoute } from "@tanstack/react-router";
import { Page, meta } from "@/components/Site";
export const Route = createFileRoute("/publikationen")({ head: () => meta("Publikationen", "Forschungsberichte, Factsheets und Jahrbücher des ÖIF."), component: () => (
  <Page title="Publikationen">
    <ul className="grid gap-4 md:grid-cols-2">
      {["Statistisches Jahrbuch Migration & Integration 2026","Factsheet Schule und Integration","Forschungsbericht: Jugendliche ohne Ausbildung oder Arbeit","Integrationsbarometer","Länderinformationen"].map((t)=>(
        <li key={t} className="flex items-center justify-between bg-card p-6"><span className="font-semibold">{t}</span><span className="rounded-full border-2 border-foreground px-3 py-1 text-sm">PDF</span></li>))}
    </ul>
  </Page>) });
