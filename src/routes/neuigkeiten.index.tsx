import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, meta } from "@/components/Site";
import { IMG, articles } from "@/lib/content";
export const Route = createFileRoute("/neuigkeiten/")({ head: () => meta("Neuigkeiten", "Aktuelle Meldungen des Österreichischen Integrationsfonds."), component: () => (
  <Page title="Neuigkeiten">
    <div className="grid gap-6 md:grid-cols-3">
      {articles.map((n)=>(
        <Link key={n.slug} to="/neuigkeiten/$slug" params={{ slug: n.slug }} className="bg-card">
          <img src={IMG+n.img} alt="" className="aspect-[16/10] w-full object-cover" />
          <div className="p-6"><p className="text-sm text-muted-foreground">{n.date}</p><h3 className="mt-2 font-semibold leading-snug">{n.title}</h3><p className="mt-3 text-sm">{n.text}</p></div>
        </Link>))}
    </div>
  </Page>) });
