import "server-only";
import { createClient } from "@supabase/supabase-js";
export function database() {
  return process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false, autoRefreshToken: false } },
      )
    : null;
}
export function submissionsReady() {
  return (
    process.env.SUBMISSIONS_ENABLED === "true" &&
    Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}
export async function checkReference(reference: string, kind: string) {
  if (!/^[0-9a-f-]{36}$/i.test(reference)) return false;
  const db = database();
  if (!db) return false;
  const { data, error } = await db
    .from("submissions")
    .select("id")
    .eq("id", reference)
    .eq("kind", kind)
    .maybeSingle();
  return !error && Boolean(data);
}
