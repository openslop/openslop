import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import once from "lodash/once";
import { supabaseSecretKey, supabaseUrl } from "./env";

// Admin client for server-side writes that bypass RLS.
export const createServiceClient = once(
	(): SupabaseClient =>
		createClient(supabaseUrl(), supabaseSecretKey(), {
			auth: { autoRefreshToken: false, persistSession: false },
		}),
);
