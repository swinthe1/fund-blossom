// @ts-nocheck
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/verify/")({
  head: () => ({
    meta: [
      { title: "Zertifikat verifizieren — ÖIF" },
      { name: "description", content: "Echtheit eines ÖIF-Zertifikats anhand der Zertifikats-Nummer prüfen." },
      { property: "og:title", content: "Zertifikat verifizieren — ÖIF" },
      { property: "og:description", content: "Echtheit eines ÖIF-Zertifikats anhand der Zertifikats-Nummer prüfen." },
    ],
  }),
  component: VerifySearchPage,
});

function VerifySearchPage() {
  const navigate = useNavigate();
  const [num, setNum] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = num.trim();
    if (!trimmed) return;
    navigate({ to: "/verify/$cert", params: { cert: trimmed } });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-muted/30 py-16">
        <div className="mx-auto max-w-2xl px-4">
          <Link to="/" className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:text-primary">← Zurück zur Startseite</Link>
          <div className="rounded-lg border border-border bg-background p-8 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
              Österreichischer Integrationsfonds
            </div>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-tight">Zertifikat verifizieren</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Geben Sie die Zertifikats-Nummer ein, um die Echtheit zu prüfen.
            </p>
            <form onSubmit={submit} className="mt-6 flex gap-2">
              <input
                type="text"
                required
                placeholder="z. B. INTA2-02728233"
                value={num}
                onChange={(e) => setNum(e.target.value)}
                className="flex-1 rounded-md border border-border bg-background px-4 py-3 font-mono text-sm"
              />
              <button
                type="submit"
                className="rounded-md bg-primary px-5 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90"
              >
                Prüfen
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
