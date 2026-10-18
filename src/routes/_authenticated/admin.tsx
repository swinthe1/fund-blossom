// @ts-nocheck
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  BarChart3,
  Link2,
  Pencil,
  Trash2,
  Check,
  Send,
  LogOut,
  ExternalLink,
  Search,
  Plus,
  ArrowLeft,
  FileText,
  Mail,
  CheckCircle2,
  Clock,
  ShieldCheck,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { sendTransactionalEmail } from "@/lib/email/send";
import { evaluatePass, autofillPointsForLevel } from "@/lib/exam/thresholds";
import { toast } from "sonner";
import { MaintenanceSettings } from "@/components/MaintenanceSettings";
import { jsPDF } from "jspdf";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [{ title: "Admin — Zertifikate verwalten" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminPage,
});

type Certificate = {
  id: string;
  certificate_number: string;
  last_name: string;
  first_name: string;
  birth_date: string;
  birth_country: string;
  exam_date: string;
  exam_level: string;
  examiner_1: string | null;
  examiner_2: string | null;
  points_hoeren_lesen: number | null;
  points_schreiben: number | null;
  points_sprechen: number | null;
  points_werte: number | null;
  result: string;
  signed_at: string | null;
  created_at: string;
  email: string | null;
  email_sent: boolean;
  email_send_count: number;
  completed: boolean;
};

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const LEVEL_META: Record<string, { label: string; hint: string }> = {
  A1: { label: "A1", hint: "Anfänger" },
  A2: { label: "A2", hint: "Grundstufe" },
  B1: { label: "B1", hint: "Mittelstufe" },
  B2: { label: "B2", hint: "Selbständig" },
  C1: { label: "C1", hint: "Fachkundig" },
  C2: { label: "C2", hint: "Annähernd muttersprachlich" },
};

const EMPTY = {
  certificate_number: "",
  last_name: "",
  first_name: "",
  birth_date: "",
  birth_country: "",
  exam_date: "",
  signed_at: "",
  exam_level: "A2",
  examiner_1: "",
  examiner_2: "",
  points_hoeren_lesen: "",
  points_schreiben: "",
  points_sprechen: "",
  points_werte: "",
  result: "A2",
  email: "",
};

/* ──────────────────────────── PDF Generator (A4) ──────────────────────────── */
function downloadCertificatePdf(c: Certificate) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm
  const margin = 20;

  // Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Outer border
  doc.setDrawColor(30, 64, 175); // indigo-800
  doc.setLineWidth(1.5);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Inner border
  doc.setLineWidth(0.4);
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 64, 175);
  doc.text("ÖSTERREICHISCHER INTEGRATIONSFONDS", pageWidth / 2, 28, { align: "center" });

  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text("ÖIF – Zertifikat Deutsch", pageWidth / 2, 35, { align: "center" });

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text("ZERTIFIKAT", pageWidth / 2, 55, { align: "center" });

  // Level badge
  doc.setFillColor(30, 64, 175);
  doc.roundedRect(pageWidth / 2 - 22, 62, 44, 14, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(c.result || c.exam_level, pageWidth / 2, 72, { align: "center" });

  // Certificate number
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Zertifikatsnummer: ${c.certificate_number}`, pageWidth / 2, 85, { align: "center" });

  // Horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, 92, pageWidth - margin, 92);

  // Participant data
  let y = 105;
  const leftCol = margin + 5;
  const labelWidth = 55;

  const addRow = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(label, leftCol, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(value || "—", leftCol + labelWidth, y);
    y += 9;
  };

  addRow("Vorname:", c.first_name);
  addRow("Nachname:", c.last_name);
  addRow("Geburtsdatum:", c.birth_date);
  addRow("Geburtsland:", c.birth_country);
  addRow("Prüfungsdatum:", c.exam_date);
  addRow("Prüfungsstufe:", c.exam_level);

  y += 6;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 12;

  // Points section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 64, 175);
  doc.text("Prüfungsergebnis", leftCol, y);
  y += 10;

  const points = [
    { label: "Hören / Lesen", value: c.points_hoeren_lesen },
    { label: "Schreiben", value: c.points_schreiben },
    { label: "Sprechen", value: c.points_sprechen },
  ];

  if (c.exam_level !== "C1" && c.exam_level !== "C2") {
    points.push({ label: "Werte & Orientierung", value: c.points_werte });
  }

  points.forEach((p) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(p.label, leftCol, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(p.value != null ? String(p.value) : "—", leftCol + 70, y);
    y += 8;
  });

  // Overall result
  y += 6;
  const passed = evaluatePass(c.exam_level, {
    pointsHoerenLesen: c.points_hoeren_lesen,
    pointsSchreiben: c.points_schreiben,
    pointsSprechen: c.points_sprechen,
    pointsWerte: c.points_werte,
  }).passed;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(passed ? 5 : 180, passed ? 150 : 30, passed ? 105 : 30);
  doc.text(passed ? `BESTANDEN – Niveau ${c.result}` : `NICHT BESTANDEN`, pageWidth / 2, y, { align: "center" });

  // Examiners
  y += 18;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`Prüfer/in 1: ${c.examiner_1 || "—"}`, leftCol, y);
  doc.text(`Prüfer/in 2: ${c.examiner_2 || "—"}`, leftCol + 90, y);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Dieses Zertifikat wurde elektronisch ausgestellt und ist ohne Unterschrift gültig.",
    pageWidth / 2,
    pageHeight - 28,
    { align: "center" },
  );
  doc.text(`Ausgestellt am ${new Date().toLocaleDateString("de-AT")}`, pageWidth / 2, pageHeight - 22, {
    align: "center",
  });

  // Download
  const filename = `Zertifikat_${c.certificate_number}_${c.last_name}.pdf`;
  doc.save(filename);
  toast.success("PDF heruntergeladen", { description: filename });
}

function AdminPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [form, setForm] = useState<Record<string, string>>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsFor, setStatsFor] = useState<string | null>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);

  async function openStats(certNumber: string) {
    setStatsFor(certNumber);
    setStatsLoading(true);
    const { data } = await supabase
      .from("certificate_verifications")
      .select("*")
      .eq("certificate_number", certNumber)
      .order("created_at", { ascending: false })
      .limit(500);
    setStats(data ?? []);
    setStatsLoading(false);
  }

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setEmail(u.user.email ?? "");
      setUserId(u.user.id);
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
      setIsAdmin((roles ?? []).some((r) => r.role === "admin"));
      await loadCerts(u.user.id);
    })();
  }, []);

  async function loadCerts(uid?: string) {
    const owner = uid ?? userId;
    if (!owner) return;
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("owner_id", owner)
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error && data) {
      setCerts(data as Certificate[]);
      const numbers = (data as Certificate[]).map((d) => d.certificate_number);
      if (numbers.length) {
        const { data: views } = await supabase
          .from("certificate_verifications")
          .select("certificate_number")
          .in("certificate_number", numbers);
        const counts: Record<string, number> = {};
        (views ?? []).forEach((r: any) => {
          counts[r.certificate_number] = (counts[r.certificate_number] ?? 0) + 1;
        });
        setViewCounts(counts);
      } else {
        setViewCounts({});
      }
    }
  }

  function update<K extends string>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function resetForm() {
    setForm(EMPTY);
    setEditId(null);
    setSelectedLevel(null);
  }

  async function copyCertUrl(certNumber: string) {
    const url = `${window.location.origin}/verify/${certNumber}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Verifikations-Link kopiert", { description: url });
    } catch {
      toast.error("Kopieren fehlgeschlagen.");
    }
  }

  function pickLevel(level: string) {
    setSelectedLevel(level);
    setEditId(null);
    const random8 = Math.floor(10000000 + Math.random() * 90000000).toString();
    const ext1 = "EXT000" + Math.floor(1000 + Math.random() * 9000).toString();
    const ext2 = "EXT0000" + Math.floor(100 + Math.random() * 900).toString();
    const autoPoints = autofillPointsForLevel(level);
    setForm({
      ...EMPTY,
      exam_level: level,
      result: level,
      certificate_number: `INT${level}-${random8}`,
      examiner_1: ext1,
      examiner_2: ext2,
      ...autoPoints,
    });
  }

  function loadIntoForm(c: Certificate) {
    setEditId(c.id);
    setSelectedLevel(c.exam_level);
    setForm({
      certificate_number: c.certificate_number,
      last_name: c.last_name,
      first_name: c.first_name,
      birth_date: c.birth_date,
      birth_country: c.birth_country,
      exam_date: c.exam_date,
      signed_at: toDatetimeLocal(c.signed_at),
      exam_level: c.exam_level,
      examiner_1: c.examiner_1 ?? "",
      examiner_2: c.examiner_2 ?? "",
      points_hoeren_lesen: c.points_hoeren_lesen?.toString() ?? "",
      points_schreiben: c.points_schreiben?.toString() ?? "",
      points_sprechen: c.points_sprechen?.toString() ?? "",
      points_werte: c.points_werte?.toString() ?? "",
      result: c.result,
      email: c.email ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    const payload = {
      certificate_number: form.certificate_number.trim(),
      last_name: form.last_name.trim(),
      first_name: form.first_name.trim(),
      birth_date: form.birth_date,
      birth_country: form.birth_country.trim(),
      exam_date: form.exam_date,
      signed_at: form.signed_at ? new Date(form.signed_at).toISOString() : null,
      exam_level: form.exam_level.trim() || "A2",
      examiner_1: form.examiner_1.trim() || null,
      examiner_2: form.examiner_2.trim() || null,
      points_hoeren_lesen: form.points_hoeren_lesen ? Number(form.points_hoeren_lesen) : null,
      points_schreiben: form.points_schreiben ? Number(form.points_schreiben) : null,
      points_sprechen: form.points_sprechen ? Number(form.points_sprechen) : null,
      points_werte: form.points_werte ? Number(form.points_werte) : null,
      result: form.result.trim() || "A2",
      email: form.email.trim() || null,
    };
    const { error } = editId
      ? await supabase.from("certificates").update(payload).eq("id", editId)
      : await supabase.from("certificates").insert({ ...payload, owner_id: userId });
    setLoading(false);
    if (error) {
      setMsg({ type: "err", text: error.message });
      toast.error(error.message);
      return;
    }
    toast.success(editId ? "Zertifikat aktualisiert." : "Zertifikat registriert.");
    resetForm();
    await loadCerts();
  }

  async function onDelete(id: string) {
    if (!confirm("Zertifikat wirklich löschen?")) return;
    const { error } = await supabase.from("certificates").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Zertifikat gelöscht.");
      await loadCerts();
    }
  }

  async function toggleEmailSent(c: Certificate) {
    const { error } = await supabase.from("certificates").update({ email_sent: !c.email_sent }).eq("id", c.id);
    if (error) toast.error(error.message);
    else await loadCerts();
  }

  async function sendCertEmail(c: Certificate) {
    if (!c.email) {
      toast.error("Keine E-Mail-Adresse hinterlegt.");
      return;
    }
    setSendingId(c.id);
    const tId = toast.loading(`E-Mail an ${c.email} wird gesendet…`);
    try {
      await sendTransactionalEmail({
        templateName: "certificate-delivery",
        certificateId: c.id,
        recipientEmail: c.email,
        idempotencyKey: `cert-delivery-${c.id}-${c.email}-${Date.now()}`,
        templateData: {
          firstName: c.first_name,
          lastName: c.last_name,
          examDate: c.exam_date,
          examLevel: c.exam_level,
          result: c.result,
          passed: evaluatePass(c.exam_level, {
            pointsHoerenLesen: c.points_hoeren_lesen,
            pointsSchreiben: c.points_schreiben,
            pointsSprechen: c.points_sprechen,
            pointsWerte: c.points_werte,
          }).passed,
          pointsHoerenLesen: c.points_hoeren_lesen,
          pointsSchreiben: c.points_schreiben,
          pointsSprechen: c.points_sprechen,
          pointsWerte: c.points_werte,
          certificateNumber: c.certificate_number,
        },
      });
      await supabase
        .from("certificates")
        .update({ email_sent: true, email_send_count: (c.email_send_count ?? 0) + 1 })
        .eq("id", c.id);
      toast.success(`E-Mail an ${c.email} erfolgreich gesendet.`, {
        id: tId,
        description: `Bisher ${(c.email_send_count ?? 0) + 1}x an diesen Empfänger versendet.`,
      });
      await loadCerts();
    } catch (e: any) {
      toast.error(e?.message ?? "E-Mail-Versand fehlgeschlagen.", { id: tId });
    } finally {
      setSendingId(null);
    }
  }

  async function toggleCompleted(c: Certificate) {
    const { error } = await supabase.from("certificates").update({ completed: !c.completed }).eq("id", c.id);
    if (error) toast.error(error.message);
    else await loadCerts();
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  const filtered = useMemo(() => {
    if (!query.trim()) return certs;
    const q = query.toLowerCase();
    return certs.filter((c) =>
      [c.certificate_number, c.first_name, c.last_name, c.email ?? "", c.exam_level]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [certs, query]);

  const kpis = useMemo(() => {
    const total = certs.length;
    const sent = certs.filter((c) => c.email_sent).length;
    const completed = certs.filter((c) => c.completed).length;
    const passed = certs.filter(
      (c) =>
        evaluatePass(c.exam_level, {
          pointsHoerenLesen: c.points_hoeren_lesen,
          pointsSchreiben: c.points_schreiben,
          pointsSprechen: c.points_sprechen,
          pointsWerte: c.points_werte,
        }).passed,
    ).length;
    return { total, sent, completed, passed };
  }, [certs]);

  if (isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          Lade Admin-Bereich…
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 bg-muted/30 py-16">
          <div className="mx-auto max-w-2xl px-4">
            <div className="rounded-xl border border-border bg-background p-8 shadow-sm">
              <h1 className="text-2xl font-black uppercase">Kein Admin-Zugriff</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Ihr Konto (<span className="font-mono">{email}</span>) hat keine Admin-Rolle.
              </p>
              <p className="mt-4 text-sm">
                Um Adminrechte zu erhalten, muss ein Eintrag in der Tabelle{" "}
                <code className="rounded bg-muted px-1.5 py-0.5">user_roles</code> für Ihre Benutzer-ID erstellt werden:
              </p>
              <pre className="mt-3 overflow-x-auto rounded-md bg-foreground p-3 text-xs text-background">
                {`INSERT INTO public.user_roles (user_id, role)
VALUES ('${userId}', 'admin');`}
              </pre>
              <button onClick={signOut} className="mt-6 text-sm text-primary hover:underline">
                Abmelden
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      {/* Sticky admin top bar */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Admin Panel</div>
              <div className="truncate text-sm font-semibold leading-tight">Zertifikate · ÖIF</div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link
              to="/verify"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ExternalLink size={14} /> Verify
            </Link>
            <div className="hidden md:flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs">
              <div className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {email.slice(0, 1).toUpperCase()}
              </div>
              <span className="max-w-[160px] truncate text-muted-foreground">{email}</span>
            </div>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Abmelden</span>
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Verwalten Sie ÖIF-Zertifikate, Empfänger-Mails und Verifikationen.
              </p>
            </div>
          </div>

          <MaintenanceSettings />

          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <KpiCard label="Zertifikate" value={kpis.total} icon={<FileText size={16} />} tint="primary" />
            <KpiCard label="E-Mails gesendet" value={kpis.sent} icon={<Mail size={16} />} tint="emerald" />
            <KpiCard label="Bestanden" value={kpis.passed} icon={<CheckCircle2 size={16} />} tint="indigo" />
            <KpiCard label="Abgeschlossen" value={kpis.completed} icon={<Clock size={16} />} tint="amber" />
          </div>

          {/* Level picker / Form */}
          <section className="mt-6 overflow-hidden rounded-xl border border-border bg-background shadow-sm">
            {!selectedLevel ? (
              <>
                <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider">Neues Zertifikat</h2>
                    <p className="text-xs text-muted-foreground">Wählen Sie die Prüfungsstufe.</p>
                  </div>
                  <Plus size={18} className="text-muted-foreground" />
                </div>
                <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 sm:p-6 lg:grid-cols-6">
                  {LEVELS.map((lv) => (
                    <button
                      key={lv}
                      type="button"
                      onClick={() => pickLevel(lv)}
                      className="group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-background to-muted/40 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
                    >
                      <div className="text-3xl font-black tracking-tight text-foreground transition-colors group-hover:text-primary">
                        {LEVEL_META[lv].label}
                      </div>
                      <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        {LEVEL_META[lv].hint}
                      </div>
                      <div className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border hover:bg-muted"
                      aria-label="Stufe ändern"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-bold uppercase tracking-wider">
                        {editId ? "Zertifikat bearbeiten" : "Neues Zertifikat"}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Stufe {selectedLevel} · alle Felder werden geprüft
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    {selectedLevel}
                  </span>
                </div>
                <form onSubmit={onSubmit} className="space-y-6 p-5 sm:p-6">
                  <FormSection title="Stammdaten">
                    <Field
                      label="Zertifikats-Nr."
                      required
                      value={form.certificate_number}
                      onChange={(v) => update("certificate_number", v)}
                      placeholder={`INT${form.exam_level}-02728233`}
                      mono
                    />
                    <SelectField
                      label="Prüfungsstufe"
                      value={form.exam_level}
                      onChange={(v) => {
                        const prefix = `INT${v}-`;
                        const suffix = form.certificate_number.includes("-")
                          ? form.certificate_number.split("-").slice(1).join("-")
                          : "";
                        update("certificate_number", prefix + suffix);
                        update("exam_level", v);
                        update("result", v);
                      }}
                      options={LEVELS}
                    />
                    <SelectField
                      label="Gesamtergebnis"
                      value={form.result}
                      onChange={(v) => update("result", v)}
                      options={LEVELS}
                    />
                  </FormSection>

                  <FormSection title="Teilnehmer/in">
                    <Field label="Vorname" required value={form.first_name} onChange={(v) => update("first_name", v)} />
                    <Field label="Nachname" required value={form.last_name} onChange={(v) => update("last_name", v)} />
                    <Field
                      label="Geburtsland"
                      required
                      value={form.birth_country}
                      onChange={(v) => update("birth_country", v)}
                    />
                    <DateField
                      label="Geburtsdatum"
                      required
                      value={form.birth_date}
                      onChange={(v) => update("birth_date", v)}
                    />
                    <DateField
                      label="Prüfungsdatum"
                      required
                      value={form.exam_date}
                      onChange={(v) => update("exam_date", v)}
                    />
                    <label className="block">
                      <span className="block text-xs font-semibold text-foreground/80">
                        Signatur Datum / Zeit
                      </span>
                      <input
                        type="datetime-local"
                        value={form.signed_at}
                        onChange={(e) => update("signed_at", e.target.value)}
                        className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      <span className="mt-1 block text-[11px] text-muted-foreground">
                        Leer lassen für automatisches Prüfungsdatum (14:00 Uhr)
                      </span>
                    </label>
                  </FormSection>

                  <FormSection title="Prüfer/innen">
                    <Field
                      label="Prüfer/in 1"
                      value={form.examiner_1}
                      onChange={(v) => update("examiner_1", v)}
                      placeholder="EXT0005532"
                      mono
                    />
                    <Field
                      label="Prüfer/in 2"
                      value={form.examiner_2}
                      onChange={(v) => update("examiner_2", v)}
                      placeholder="EXT0000511"
                      mono
                    />
                  </FormSection>

                  <FormSection title="Punkte (auto-vorausgefüllt)">
                    <Field
                      label="Hören/Lesen"
                      type="number"
                      value={form.points_hoeren_lesen}
                      onChange={(v) => update("points_hoeren_lesen", v)}
                    />
                    <Field
                      label="Schreiben"
                      type="number"
                      value={form.points_schreiben}
                      onChange={(v) => update("points_schreiben", v)}
                    />
                    <Field
                      label="Sprechen"
                      type="number"
                      value={form.points_sprechen}
                      onChange={(v) => update("points_sprechen", v)}
                    />
                    {form.exam_level !== "C1" && form.exam_level !== "C2" && (
                      <Field
                        label="Werte & Orientierung"
                        type="number"
                        value={form.points_werte}
                        onChange={(v) => update("points_werte", v)}
                      />
                    )}
                  </FormSection>

                  <FormSection title="Zustellung">
                    <div className="sm:col-span-2 lg:col-span-3">
                      <Field
                        label="E-Mail (für Zustellung)"
                        type="email"
                        value={form.email}
                        onChange={(v) => update("email", v)}
                        placeholder="empfaenger@example.com"
                      />
                    </div>
                  </FormSection>

                  <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50"
                    >
                      {loading ? "Speichert…" : editId ? "Aktualisieren" : "Registrieren"}
                    </button>
                    <button type="button" onClick={resetForm} className="text-sm text-muted-foreground hover:underline">
                      Abbrechen
                    </button>
                    {msg && msg.type === "err" && <span className="text-sm text-destructive">{msg.text}</span>}
                  </div>
                </form>
              </>
            )}
          </section>

          {/* Certificates table */}
          <section className="mt-8 overflow-hidden rounded-xl border border-border bg-background shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3 min-w-0">
                <h2 className="text-sm font-bold uppercase tracking-wider">Registrierte Zertifikate</h2>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
                  {filtered.length}/{certs.length}
                </span>
              </div>
              <div className="relative w-full sm:w-72">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Suchen: Name, Nummer, E-Mail…"
                  className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-border md:hidden">
              {filtered.map((c) => {
                const passed = evaluatePass(c.exam_level, {
                  pointsHoerenLesen: c.points_hoeren_lesen,
                  pointsSchreiben: c.points_schreiben,
                  pointsSprechen: c.points_sprechen,
                  pointsWerte: c.points_werte,
                }).passed;
                return (
                  <div key={c.id} className={"p-4 " + (c.completed ? "bg-emerald-50/50" : "")}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <CompletedCheckbox checked={c.completed} onChange={() => toggleCompleted(c)} />
                        <div className="min-w-0">
                          <div className="font-mono text-[11px] text-muted-foreground break-all">
                            {c.certificate_number}
                          </div>
                          <div className="mt-0.5 font-semibold">
                            {c.last_name}, {c.first_name}
                          </div>
                        </div>
                      </div>
                      <LevelBadge level={c.result} passed={passed} />
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <dt className="text-muted-foreground">Geburt</dt>
                        <dd>{c.birth_date}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Prüfung</dt>
                        <dd>
                          {c.exam_date} · {c.exam_level}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-muted-foreground">E-Mail</dt>
                        <dd className="mt-0.5 flex items-center gap-2 flex-wrap">
                          <span className="break-all">{c.email ?? "—"}</span>
                          {c.email && <EmailBadge sent={c.email_sent} onClick={() => toggleEmailSent(c)} />}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <ActionButton
                        tone="primary"
                        to={{ to: "/verify/$cert", params: { cert: c.certificate_number } }}
                        title="Anzeigen"
                      >
                        <Eye size={15} />
                      </ActionButton>
                      <ActionButton onClick={() => downloadCertificatePdf(c)} title="PDF herunterladen (A4)">
                        <FileText size={15} />
                      </ActionButton>
                      <StatsButton
                        count={viewCounts[c.certificate_number] ?? 0}
                        onClick={() => openStats(c.certificate_number)}
                      />
                      <ActionButton onClick={() => copyCertUrl(c.certificate_number)} title="Link kopieren">
                        <Link2 size={15} />
                      </ActionButton>
                      {c.email && (
                        <SendButton
                          count={c.email_send_count ?? 0}
                          onClick={() => sendCertEmail(c)}
                          disabled={sendingId === c.id}
                        />
                      )}
                      <ActionButton onClick={() => loadIntoForm(c)} title="Bearbeiten">
                        <Pencil size={15} />
                      </ActionButton>
                      <ActionButton tone="danger" onClick={() => onDelete(c.id)} title="Löschen">
                        <Trash2 size={15} />
                      </ActionButton>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  {certs.length === 0 ? "Noch keine Zertifikate." : "Keine Treffer."}
                </div>
              )}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 font-bold w-10"></th>
                      <th className="px-4 py-3 font-bold">Zertifikats-Nr.</th>
                      <th className="px-4 py-3 font-bold">Name</th>
                      <th className="px-4 py-3 font-bold">Geburt</th>
                      <th className="px-4 py-3 font-bold">Prüfung</th>
                      <th className="px-4 py-3 font-bold">Ergebnis</th>
                      <th className="px-4 py-3 font-bold">E-Mail</th>
                      <th className="px-4 py-3 text-right font-bold">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => {
                      const passed = evaluatePass(c.exam_level, {
                        pointsHoerenLesen: c.points_hoeren_lesen,
                        pointsSchreiben: c.points_schreiben,
                        pointsSprechen: c.points_sprechen,
                        pointsWerte: c.points_werte,
                      }).passed;
                      return (
                        <tr
                          key={c.id}
                          className={
                            "border-b border-border last:border-0 transition-colors hover:bg-muted/30 " +
                            (c.completed ? "bg-emerald-50/40" : "")
                          }
                        >
                          <td className="px-4 py-3">
                            <CompletedCheckbox checked={c.completed} onChange={() => toggleCompleted(c)} />
                          </td>
                          <td className="px-4 py-3 font-mono text-xs">{c.certificate_number}</td>
                          <td className="px-4 py-3 font-medium">
                            {c.last_name}, {c.first_name}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{c.birth_date}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {c.exam_date} · <span className="font-semibold text-foreground">{c.exam_level}</span>
                          </td>
                          <td className="px-4 py-3">
                            <LevelBadge level={c.result} passed={passed} />
                          </td>
                          <td className="px-4 py-3">
                            {c.email ? (
                              <div className="flex flex-col gap-1">
                                <span className="text-xs">{c.email}</span>
                                <EmailBadge sent={c.email_sent} onClick={() => toggleEmailSent(c)} />
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex justify-end gap-1.5">
                              <ActionButton
                                tone="primary"
                                to={{ to: "/verify/$cert", params: { cert: c.certificate_number } }}
                                title="Anzeigen"
                              >
                                <Eye size={15} />
                              </ActionButton>
                              <ActionButton onClick={() => downloadCertificatePdf(c)} title="PDF herunterladen (A4)">
                                <FileText size={15} />
                              </ActionButton>
                              <StatsButton
                                count={viewCounts[c.certificate_number] ?? 0}
                                onClick={() => openStats(c.certificate_number)}
                              />
                              <ActionButton onClick={() => copyCertUrl(c.certificate_number)} title="Link kopieren">
                                <Link2 size={15} />
                              </ActionButton>
                              {c.email && (
                                <SendButton
                                  count={c.email_send_count ?? 0}
                                  onClick={() => sendCertEmail(c)}
                                  disabled={sendingId === c.id}
                                />
                              )}
                              <ActionButton onClick={() => loadIntoForm(c)} title="Bearbeiten">
                                <Pencil size={15} />
                              </ActionButton>
                              <ActionButton tone="danger" onClick={() => onDelete(c.id)} title="Löschen">
                                <Trash2 size={15} />
                              </ActionButton>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                          {certs.length === 0 ? "Noch keine Zertifikate." : "Keine Treffer für Ihre Suche."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {statsFor && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
              onClick={() => setStatsFor(null)}
            >
              <div
                className="max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold uppercase tracking-wider">Verifikationen</h3>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {statsFor} · {stats.length} Suchen
                    </p>
                  </div>
                  <button
                    onClick={() => setStatsFor(null)}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border hover:bg-muted"
                    aria-label="Schließen"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="max-h-[70vh] overflow-auto">
                  {statsLoading ? (
                    <div className="p-10 text-center text-muted-foreground">Lade…</div>
                  ) : stats.length === 0 ? (
                    <div className="p-10 text-center text-muted-foreground">Noch keine Verifikationen.</div>
                  ) : (
                    <>
                      <div className="divide-y divide-border sm:hidden">
                        {stats.map((v) => (
                          <div key={v.id} className="p-4 text-sm">
                            <div className="font-bold">{new Date(v.created_at).toLocaleString()}</div>
                            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                              <dt className="text-muted-foreground">Standort</dt>
                              <dd>{[v.city, v.region, v.country].filter(Boolean).join(", ") || "—"}</dd>
                              <dt className="text-muted-foreground">Gerät</dt>
                              <dd>{v.device_type ?? "—"}</dd>
                              <dt className="text-muted-foreground">Browser/OS</dt>
                              <dd>{[v.browser, v.os].filter(Boolean).join(" / ") || "—"}</dd>
                              <dt className="text-muted-foreground">IP</dt>
                              <dd className="font-mono break-all">{v.ip ?? "—"}</dd>
                            </dl>
                          </div>
                        ))}
                      </div>
                      <table className="hidden w-full text-sm sm:table">
                        <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                          <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                            <th className="px-4 py-2 font-bold">Zeit</th>
                            <th className="px-4 py-2 font-bold">Standort</th>
                            <th className="px-4 py-2 font-bold">Gerät</th>
                            <th className="px-4 py-2 font-bold">Browser / OS</th>
                            <th className="px-4 py-2 font-bold">IP</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.map((v) => (
                            <tr key={v.id} className="border-t border-border">
                              <td className="px-4 py-2 whitespace-nowrap">{new Date(v.created_at).toLocaleString()}</td>
                              <td className="px-4 py-2">
                                {[v.city, v.region, v.country].filter(Boolean).join(", ") || "—"}
                              </td>
                              <td className="px-4 py-2">{v.device_type ?? "—"}</td>
                              <td className="px-4 py-2">{[v.browser, v.os].filter(Boolean).join(" / ") || "—"}</td>
                              <td className="px-4 py-2 font-mono text-xs">{v.ip ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ──────────────────────────── helper components ──────────────────────────── */

function KpiCard({
  label,
  value,
  icon,
  tint,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tint: "primary" | "emerald" | "indigo" | "amber";
}) {
  const tints: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    emerald: "bg-emerald-100 text-emerald-700",
    indigo: "bg-indigo-100 text-indigo-700",
    amber: "bg-amber-100 text-amber-700",
  };
  return (
    <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className={"grid h-7 w-7 place-items-center rounded-md " + tints[tint]}>{icon}</span>
      </div>
      <div className="mt-2 text-2xl font-black tracking-tight">{value}</div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-foreground/80">
        {label}
        {required && <span className="text-primary"> *</span>}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        step={type === "number" ? "0.01" : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={
          "mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring " +
          (mono ? "font-mono" : "")
        }
      />
    </label>
  );
}

function DateField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  const [text, setText] = useState(isoToDisplay(value));
  useEffect(() => {
    setText(isoToDisplay(value));
  }, [value]);

  function handleChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    let out = digits;
    if (digits.length > 4) out = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    else if (digits.length > 2) out = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    setText(out);
    const iso = displayToIso(out);
    onChange(iso);
  }

  return (
    <label className="block">
      <span className="block text-xs font-semibold text-foreground/80">
        {label}
        {required && <span className="text-primary"> *</span>}
      </span>
      <input
        type="text"
        inputMode="numeric"
        required={required}
        value={text}
        placeholder="dd/mm/yyyy"
        pattern="\d{2}/\d{2}/\d{4}"
        onChange={(e) => handleChange(e.target.value)}
        className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </label>
  );
}

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

function isoToDisplay(iso: string) {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
}

function displayToIso(s: string) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : "";
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-foreground/80">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function CompletedCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      title={checked ? "Als unvollständig markieren" : "Als abgeschlossen markieren"}
      aria-label="Abgeschlossen umschalten"
      className={
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors " +
        (checked
          ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
          : "border-input bg-background hover:bg-muted")
      }
    >
      {checked && <Check size={12} strokeWidth={3} />}
    </button>
  );
}

function LevelBadge({ level, passed }: { level: string; passed: boolean }) {
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold " +
        (passed
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
          : "bg-muted text-muted-foreground ring-1 ring-inset ring-border")
      }
    >
      {level}
    </span>
  );
}

function EmailBadge({ sent }: { sent: boolean; onClick?: () => void }) {
  return (
    <span
      className={
        "inline-flex items-center gap-1 self-start rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider " +
        (sent ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800")
      }
    >
      <span className={"h-1.5 w-1.5 rounded-full " + (sent ? "bg-emerald-600" : "bg-amber-500")} />
      {sent ? "Gesendet" : "Ausstehend"}
    </span>
  );
}

type ActionTone = "default" | "primary" | "danger" | "success";

function ActionButton(
  props:
    | {
        tone?: ActionTone;
        onClick: () => void;
        disabled?: boolean;
        title: string;
        children: React.ReactNode;
        to?: undefined;
      }
    | {
        tone?: ActionTone;
        to: { to: string; params: Record<string, string> };
        title: string;
        children: React.ReactNode;
        onClick?: undefined;
        disabled?: undefined;
      },
) {
  const tone = props.tone ?? "default";
  const cls =
    "inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm transition-colors disabled:opacity-50 disabled:pointer-events-none " +
    (tone === "primary"
      ? "border-primary bg-primary text-primary-foreground hover:opacity-90"
      : tone === "danger"
        ? "border-border bg-background text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
        : tone === "success"
          ? "border-border bg-background text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
          : "border-border bg-background text-foreground hover:bg-muted");

  if ("to" in props && props.to) {
    return (
      <Link
        to={props.to.to as any}
        params={props.to.params as any}
        title={props.title}
        aria-label={props.title}
        className={cls}
      >
        {props.children}
      </Link>
    );
  }
  return (
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      title={props.title}
      aria-label={props.title}
      className={cls}
    >
      {props.children}
    </button>
  );
}

function StatsButton({ count, onClick }: { count: number; onClick: () => void }) {
  const title = count === 1 ? "1 Aufruf" : `${count} Aufrufe`;
  return (
    <span className="relative inline-flex">
      <ActionButton onClick={onClick} title={`Statistik · ${title}`}>
        <BarChart3 size={15} />
      </ActionButton>
      {count > 0 && (
        <span className="pointer-events-none absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold leading-none border border-background">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </span>
  );
}

function SendButton({ count, onClick, disabled }: { count: number; onClick: () => void; disabled?: boolean }) {
  const title =
    count === 0 ? "E-Mail senden" : count === 1 ? "1x gesendet · erneut senden" : `${count}x gesendet · erneut senden`;
  return (
    <span className="relative inline-flex">
      <ActionButton tone="success" onClick={onClick} disabled={disabled} title={title}>
        <Send size={15} />
      </ActionButton>
      {count > 0 && (
        <span className="pointer-events-none absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-bold leading-none border border-background">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </span>
  );
}
