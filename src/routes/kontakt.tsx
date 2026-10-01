import { createFileRoute } from "@tanstack/react-router";
import { Page, meta } from "@/components/Site";
export const Route = createFileRoute("/kontakt")({ head: () => meta("Kontakt", "Kontakt – Österreichischer Integrationsfonds"), component: () => (
  <Page title="Kontakt"><div className="max-w-2xl bg-card p-8 leading-relaxed">Service-Hotline 050 46 80, Montag bis Freitag. E-Mail: info@integrationsfondos.at. Integrationszentren gibt es in allen Bundesländern.</div></Page>) });
