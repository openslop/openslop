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
}: MagicLinkParams): Promise<void> {
	const { error } = await createClient().auth.signInWithOtp({
		email,
		options: {
			emailRedirectTo: callbackUrl(),
			...(shouldCreateUser === false && { shouldCreateUser: false }),
			...(data && { data }),
		},
	});
	if (error) throw error;
}

export async function signInWithGoogle(): Promise<void> {
	const { error } = await createClient().auth.signInWithOAuth({
		provider: "google",
		options: { redirectTo: callbackUrl() },
	});
	if (error) throw error;
}

export async function signOut(): Promise<void> {
	const { error } = await createClient().auth.signOut();
	if (error) throw error;
}
