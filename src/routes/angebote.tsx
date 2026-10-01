import { createFileRoute } from "@tanstack/react-router";
import { Page, meta } from "@/components/Site";
import { IMG, offers } from "@/lib/content";
export const Route = createFileRoute("/angebote")({ head: () => meta("Angebote", "Integrationsmaßnahmen, Deutschkurse, Veranstaltungen und Weiterbildungen des ÖIF."), component: () => (
  <Page title="Angebote des ÖIF">
    <div className="grid gap-8">
      {offers.map((o)=>(
        <section key={o.slug} id={o.slug} className="grid items-center gap-6 bg-card sm:grid-cols-[1fr_2fr]">
          <img src={IMG+o.img} alt="" className="aspect-[4/3] w-full object-cover" />
          <div className="p-6"><h2 className="text-2xl font-semibold">{o.label}</h2><p className="mt-3 leading-relaxed">{o.text}</p></div>
        </section>))}
    </div>
  </Page>) });
