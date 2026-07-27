import { createClient } from "@/lib/supabase/client";

/** All Supabase sign-in links land back on the OAuth/OTP callback route. */
function callbackUrl(): string {
	return `${window.location.origin}/auth/callback`;
}

export type MagicLinkParams = {
	email: string;
	shouldCreateUser?: boolean;
	data?: Record<string, unknown>;
};

export async function sendMagicLink({
	email,
	shouldCreateUser,
	data,
}: MagicLinkParams): Promise<{ error?: string }> {
	const { error } = await createClient().auth.signInWithOtp({
		email,
		options: {
			emailRedirectTo: callbackUrl(),
			...(shouldCreateUser === false && { shouldCreateUser: false }),
			...(data && { data }),
		},
	});
	return error ? { error: error.message } : {};
}

export async function signInWithGoogle(): Promise<void> {
	await createClient().auth.signInWithOAuth({
		provider: "google",
		options: { redirectTo: callbackUrl() },
	});
}

export async function signOut(): Promise<void> {
	await createClient().auth.signOut();
}
