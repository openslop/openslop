import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./env";

let cached: SupabaseClient | null = null;

// Admin client for server-side writes that bypass RLS. Uses the newer
// `sb_secret_*` key (legacy `SUPABASE_SERVICE_ROLE_KEY` is deprecated).
export function createServiceClient(): SupabaseClient {
	if (cached) return cached;
	const key = process.env.SUPABASE_SECRET_KEY;
	if (!key) throw new Error("SUPABASE_SECRET_KEY is required");
	cached = createClient(SUPABASE_URL, key, {
		auth: { autoRefreshToken: false, persistSession: false },
	});
	return cached;
}
