import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Deduplicate the auth lookup per request: multiple handlers/components asking
// for the current user share a single Supabase round-trip.
export const getUser = cache(async (): Promise<User | null> => {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	return user;
});
