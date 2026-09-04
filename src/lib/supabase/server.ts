import "server-only";

import { supabaseAdmin } from "@/lib/supabase";

export async function createClient() {
  return supabaseAdmin;
}
