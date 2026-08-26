import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./env";

export function createClient() {
	return createBrowserClient(supabaseUrl(), supabaseAnonKey());
}
