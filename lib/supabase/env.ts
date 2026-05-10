type PublicSupabaseEnvKey =
	| "NEXT_PUBLIC_SUPABASE_URL"
	| "NEXT_PUBLIC_SUPABASE_ANON_KEY";

function getRequiredEnv(name: PublicSupabaseEnvKey): string {
	const value = process.env[name]?.trim();
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

export function getSupabaseEnv() {
	return {
		url: getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
		anonKey: getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
	};
}
