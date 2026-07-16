"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import OnboardingCard from "./OnboardingCard";
import EmailSentCard from "./EmailSentCard";
import OrDivider from "./OrDivider";
import GoogleOAuthButton from "./GoogleOAuthButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AuthFormProps {
	heading: string;
	subtitle: string;
	submitLabel: string;
	sentKind?: string;
	shouldCreateUser?: boolean;
	otpData?: Record<string, unknown>;
	footer?: React.ReactNode;
	children?: React.ReactNode;
}

export default function AuthForm({
	heading,
	subtitle,
	submitLabel,
	sentKind = "login",
	shouldCreateUser,
	otpData,
	footer,
	children,
}: AuthFormProps) {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);
	const [error, setError] = useState("");

	const supabase = createClient();

	const handleMagicLink = async (e?: React.FormEvent) => {
		e?.preventDefault();
		setLoading(true);
		setError("");

		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: {
				emailRedirectTo: `${window.location.origin}/auth/callback`,
				...(shouldCreateUser === false && { shouldCreateUser: false }),
				...(otpData && { data: otpData }),
			},
		});

		if (error) {
			setError(error.message);
		} else {
			setSent(true);
		}
		setLoading(false);
	};

	const handleGoogleAuth = async () => {
		setError("");
		const { error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${window.location.origin}/auth/callback`,
			},
		});
		if (error) setError(error.message);
	};

	if (sent) {
		return (
			<EmailSentCard
				email={email}
				subtitle={`We sent a ${sentKind} link to ${email}`}
				resendLabel={`Send another ${sentKind} link`}
				loading={loading}
				error={error}
				onResend={() => handleMagicLink()}
				onEditEmail={() => setSent(false)}
			/>
		);
	}

	return (
		<OnboardingCard heading={heading} subtitle={subtitle} footer={footer}>
			<form onSubmit={handleMagicLink} className="flex w-full flex-col gap-3">
				{children}
				<Input
					type="email"
					name="email"
					autoComplete="email"
					aria-label="Email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="h-11 rounded-xl"
					required
				/>
				<Button
					type="submit"
					variant="accent"
					disabled={loading}
					className="mt-1 h-11 w-full"
				>
					{loading ? "Sending…" : submitLabel}
				</Button>
			</form>

			{error && (
				<p
					aria-live="polite"
					className="text-center text-body text-destructive"
				>
					{error}
				</p>
			)}

			<OrDivider />
			<GoogleOAuthButton onClick={handleGoogleAuth} />
		</OnboardingCard>
	);
}
