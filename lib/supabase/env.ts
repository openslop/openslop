const required = (name: string, value: string | undefined): string => {
	if (!value) throw new Error(`${name} is required`);
	return value;
};

// Read at call time, not import time: a missing variable then fails where a
// client is built, with the variable's name, instead of at module load.
export const supabaseUrl = () =>
	required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);

export const supabaseAnonKey = () =>
	required(
		"NEXT_PUBLIC_SUPABASE_ANON_KEY",
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
	);

export const supabaseSecretKey = () =>
	required("SUPABASE_SECRET_KEY", process.env.SUPABASE_SECRET_KEY);
