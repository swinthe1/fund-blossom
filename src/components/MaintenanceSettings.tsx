import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { Wrench } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { fetchSiteSettings } from "@/lib/site-settings";

export function MaintenanceSettings() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSiteSettings().then((s) => {
      if (s) {
        setEnabled(s.maintenance_enabled);
        setTitle(s.maintenance_title);
        setMessage(s.maintenance_message);
      }
      setLoaded(true);
    });
  }, []);

  async function save(patch: Partial<{ maintenance_enabled: boolean; maintenance_title: string; maintenance_message: string }>) {
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", 1);
    setSaving(false);
    if (error) {
      toast.error("Speichern fehlgeschlagen: " + error.message);
      return false;
    }
    router.invalidate();
    return true;
  }

  async function onToggle(v: boolean) {
    setEnabled(v);
    if (await save({ maintenance_enabled: v })) {
      toast.success(v ? "Wartungsmodus aktiviert" : "Wartungsmodus deaktiviert");
    } else setEnabled(!v);
  }

  if (!loaded) return null;

  return (
    <div className={`rounded-xl border bg-background p-5 shadow-sm ${enabled ? "border-primary" : "border-border"}`}>
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
          <Wrench size={18} />
        </div>
        <div className="flex-1">
          <div className="font-semibold">Wartungsmodus</div>
          <div className="text-xs text-muted-foreground">
            Wenn aktiv, sehen Besucher auf allen Seiten nur die Wartungsseite (Admin-Bereich bleibt erreichbar).
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} disabled={saving} />
      </div>
      <div className="mt-4 grid gap-3">
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Titel</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Nachricht</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="rounded-md border border-input bg-background px-3 py-2"
          />
        </label>
        <div className="flex gap-2">
          <button
            disabled={saving}
            onClick={async () => {
              if (await save({ maintenance_title: title, maintenance_message: message })) toast.success("Wartungsseite gespeichert");
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Speichern
          </button>
          <a href="/?preview-maintenance=1" target="_blank" rel="noreferrer" className="rounded-md border border-input px-4 py-2 text-sm hover:bg-muted">
            Vorschau
          </a>
        </div>
      </div>
    </div>
  );
}
