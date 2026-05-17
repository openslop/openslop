import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./env";

let cached: SupabaseClient | null = null;

export function createServiceClient(): SupabaseClient {
	if (cached) return cached;
	const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
	cached = createClient(SUPABASE_URL, key, {
		auth: { autoRefreshToken: false, persistSession: false },
	});
	return cached;
}
