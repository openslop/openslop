import { requiredEnv } from "@/lib/env";

export const supabaseUrl = () =>
	requiredEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);

export const supabaseAnonKey = () =>
	requiredEnv(
		"NEXT_PUBLIC_SUPABASE_ANON_KEY",
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
	);

export const supabaseSecretKey = () =>
	requiredEnv("SUPABASE_SECRET_KEY", process.env.SUPABASE_SECRET_KEY);
