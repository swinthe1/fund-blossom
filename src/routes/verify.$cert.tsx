import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CertificateView } from "@/components/CertificateView";
import { downloadCertificateSvg } from "@/lib/export/certificate-svg";

function parseUA(ua: string) {
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
  const isTablet = /iPad|Tablet/i.test(ua);
  const device_type = isTablet ? "Tablet" : isMobile ? "Mobile" : "Desktop";
  let os = "Unknown";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X|Macintosh/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod|iOS/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";
  let browser = "Unknown";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = "Safari";
  return { device_type, os, browser };
}

async function logVerification(certificate_number: string) {
  const ua = navigator.userAgent;
  const { device_type, os, browser } = parseUA(ua);
  let ip: string | null = null, country: string | null = null, region: string | null = null, city: string | null = null;
  try {
    const r = await fetch("https://ipapi.co/json/");
    if (r.ok) {
      const j = await r.json();
      ip = j.ip ?? null;
      country = j.country_name ?? null;
      region = j.region ?? null;
      city = j.city ?? null;
    }
  } catch {}
  await supabase.from("certificate_verifications").insert({
    certificate_number, ip, country, region, city, device_type, browser, os, user_agent: ua,
  });
}

export const Route = createFileRoute("/verify/$cert")({
  head: ({ params }) => ({
    meta: [
      { title: `Zertifikat ${params.cert} — ÖIF Verify` },
      { name: "description", content: `Verifikation des ÖIF-Zertifikats ${params.cert}.` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerifyResult,
});

function VerifyResult() {
  const { cert } = Route.useParams();
  const [data, setData] = useState<any>(null);
  const [state, setState] = useState<"loading" | "ok" | "notfound" | "error">("loading");
  const [errMsg, setErrMsg] = useState("");
  const [canDownload, setCanDownload] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id);
      setCanDownload((roles ?? []).some((r) => r.role === "admin"));
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const needle = decodeURIComponent(cert).trim();
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .ilike("certificate_number", needle)
        .maybeSingle();
      if (error) {
        setErrMsg(error.message);
        setState("error");
        return;
      }
      if (!data) {
        setState("notfound");
        return;
      }
      setData(data);
      setState("ok");
      // Log verification (fire & forget)
      logVerification(needle).catch(() => {});
    })();
  }, [cert]);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-muted/30 py-10">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-6 flex items-center justify-between">
            <Link to="/verify" className="text-sm text-primary hover:underline">← Andere Nummer prüfen</Link>
            <div className="flex items-center gap-3">
              {canDownload && state === "ok" && (
                <button
                  onClick={() => {
                    const pages = Array.from(document.querySelectorAll<HTMLElement>("article.cert-page"));
                    downloadCertificateSvg(pages, `Zertifikat-${cert}.svg`);
                  }}
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted"
                >
                  <Download size={15} />
                  Als SVG herunterladen
                </button>
              )}
              <div className="font-mono text-sm">{cert}</div>
            </div>
          </div>

          {state === "loading" && (
            <div className="rounded-lg border border-border bg-background p-10 text-center text-muted-foreground">
              Prüfe Zertifikat...
            </div>
          )}

          {state === "notfound" && (
            <div className="rounded-lg border-2 border-primary bg-background p-10 text-center">
              <div className="text-3xl">⚠️</div>
              <h2 className="mt-3 text-2xl font-black uppercase text-primary">Nicht gefunden</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Es wurde kein Zertifikat mit der Nummer <span className="font-mono">{cert}</span> registriert.
              </p>
            </div>
          )}

          {state === "error" && (
            <div className="rounded-lg border border-primary bg-background p-6 text-sm text-primary">
              Fehler: {errMsg}
            </div>
          )}

          {state === "ok" && data && <CertificateView cert={data} />}
        </div>
      </main>
    </div>
  );
}
