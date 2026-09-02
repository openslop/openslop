import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseSecretKey, supabaseUrl } from "./env";

let cached: SupabaseClient | null = null;

// Admin client for server-side writes that bypass RLS.
export function createServiceClient(): SupabaseClient {
	if (cached) return cached;
	cached = createClient(supabaseUrl(), supabaseSecretKey(), {
		auth: { autoRefreshToken: false, persistSession: false },
	});
	return cached;
}
