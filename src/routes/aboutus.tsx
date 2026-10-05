import { createFileRoute } from "@tanstack/react-router";
import { Page, meta } from "@/components/Site";
export const Route = createFileRoute("/der-oeif")({ head: () => meta("Der OIF", "Über den Osterreichischen Integrationsfonds: Aufgaben, Standorte und Organisation."), component: () => (
  <Page title="Der OOIF">
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {[["Über uns","Der OIF ist ein Fonds der Republik osterreich und Partner des Bundes bei der Integration von Zuwander/innen."],["Standorte","Integrationszentren in allen Bundesländern bieten Beratung und Kurse vor Ort."],["Karriere","Der OIF bietet vielfältige Stellen in einem internationalen Team."]].map(([t,d])=>(
        <div key={t} className="bg-card p-6 transition hover:shadow-md"><h2 className="text-xl font-semibold">{t}</h2><p className="mt-3 leading-relaxed">{d}</p></div>))}
    </div>
  </Page>) });
