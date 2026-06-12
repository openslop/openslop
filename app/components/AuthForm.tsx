"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import OnboardingCard from "./OnboardingCard";
import EmailSentCard from "./EmailSentCard";
import GradientButton from "./GradientButton";
import OrDivider from "./OrDivider";
import GoogleOAuthButton from "./GoogleOAuthButton";
import authStyles from "@/app/styles/auth.module.css";

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
		await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${window.location.origin}/auth/callback`,
			},
		});
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
			<form onSubmit={handleMagicLink} className="w-full flex flex-col gap-3">
				{children}
				<input
					type="email"
					name="email"
					autoComplete="email"
					aria-label="Email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className={authStyles.input}
					required
				/>
				<GradientButton type="submit" disabled={loading} className="mt-1">
					{loading ? "Sending\u2026" : submitLabel}
				</GradientButton>
			</form>

			{error && (
				<p aria-live="polite" className="text-red-400 text-sm text-center">
					{error}
				</p>
			)}

			<OrDivider />
			<GoogleOAuthButton onClick={handleGoogleAuth} />
		</OnboardingCard>
	);
}
