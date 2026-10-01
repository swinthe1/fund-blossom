// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  maintenance_enabled: boolean;
  maintenance_title: string;
  maintenance_message: string;
};

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  try {
    const { data } = await supabase
      .from("site_settings")
      .select("maintenance_enabled, maintenance_title, maintenance_message")
      .eq("id", 1)
      .maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
}

/** Paths that stay reachable while maintenance mode is on (so admins can log in and turn it off). */
export function isMaintenanceExempt(pathname: string) {
  return pathname.startsWith("/admin") || pathname.startsWith("/auth");
}
