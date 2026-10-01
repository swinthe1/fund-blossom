import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin Login — ÖIF Zertifikatsregister" },
      { name: "description", content: "Anmeldung für Administratoren des ÖIF Zertifikatsregisters." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        setError("Konto erstellt. Bitte E-Mail bestätigen (sofern aktiviert), dann anmelden.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler bei der Anmeldung");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-muted/30 py-16">
        <div className="mx-auto w-full max-w-md px-4">
          <div className="rounded-lg border border-border bg-background p-8 shadow-sm">
            <h1 className="text-2xl font-black uppercase tracking-tight">
              {mode === "login" ? "Admin Anmeldung" : "Admin Konto erstellen"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Nur für Administrator/innen des Zertifikatsregisters.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider">E-Mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider">Passwort</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                />
              </div>

              {error && <div className="rounded-md bg-accent px-3 py-2 text-sm text-primary">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "..." : mode === "login" ? "Anmelden" : "Konto erstellen"}
              </button>
            </form>


            <div className="mt-6 text-center">
              <Link to="/verify" className="text-xs text-muted-foreground hover:text-primary">
                ← Zertifikat verifizieren
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
