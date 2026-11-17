import { createClient } from "@supabase/supabase-js";

export function isSupabaseAdminConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-ref")
  );
}

export function createAdminSupabaseClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key";
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
