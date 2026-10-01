import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Page, meta } from "@/components/Site";
import { IMG, articles } from "@/lib/content";
export const Route = createFileRoute("/neuigkeiten/$slug")({
  loader: ({ params }) => { const a = articles.find((x) => x.slug === params.slug); if (!a) throw notFound(); return a; },
  head: ({ loaderData }) => loaderData ? { ...meta(loaderData.title, loaderData.text), meta: [...meta(loaderData.title, loaderData.text).meta, { property: "og:image", content: IMG + loaderData.img }, { name: "twitter:image", content: IMG + loaderData.img }] } : { meta: [{ title: "Nicht gefunden" }, { name: "robots", content: "noindex" }] },
  component: Detail,
});
function Detail() {
  const a = Route.useLoaderData();
  return (
    <Page title={a.title}>
      <p className="text-sm text-muted-foreground">{a.date}</p>
      <img src={IMG + a.img} alt="" className="mt-4 max-h-[500px] w-full object-cover" />
      <p className="mt-6 text-lg font-medium">{a.text}</p>
      {a.body.map((p) => <p key={p} className="mt-4 leading-relaxed">{p}</p>)}
      <Link to="/neuigkeiten" className="mt-8 inline-block rounded-full border-2 border-foreground px-4 py-2 font-medium">Alle Neuigkeiten</Link>
    </Page>
  );
}
