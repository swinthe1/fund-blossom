import { createFileRoute } from "@tanstack/react-router";
import { Page, meta } from "@/components/Site";
export const Route = createFileRoute("/impressum")({ head: () => meta("Impressum", "Impressum – Österreichischer Integrationsfonds"), component: () => (
  <Page title="Impressum"><div className="max-w-2xl bg-card p-8 leading-relaxed">Österreichischer Integrationsfonds, Landstraßer Hauptstraße 26, 1030 Wien. Bitte die vollständigen rechtlichen Angaben ergänzen.</div></Page>) });
