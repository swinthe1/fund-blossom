import { createFileRoute } from "@tanstack/react-router";
import { Page, meta } from "@/components/Site";
export const Route = createFileRoute("/datenschutz")({ head: () => meta("Datenschutz", "Datenschutz – Österreichischer Integrationsfonds"), component: () => (
  <Page title="Datenschutz"><div className="max-w-2xl bg-card p-8 leading-relaxed">Diese Website verwendet notwendige Cookies sowie optionale Analyse-Cookies. Bitte die vollständige Datenschutzerklärung ergänzen.</div></Page>) });
