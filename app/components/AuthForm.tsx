"use client";

import { useState } from "react";
import { sendMagicLink, signInWithGoogle } from "@/lib/auth/session";
import { errorMessage } from "@/lib/errors";
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
	initialError?: string;
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
	initialError = "",
	shouldCreateUser,
	otpData,
	footer,
	children,
}: AuthFormProps) {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);
	const [error, setError] = useState(initialError);

	const handleMagicLink = async (e?: React.FormEvent) => {
		e?.preventDefault();
		setLoading(true);
		setError("");

		try {
			const { error } = await sendMagicLink({
				email,
				shouldCreateUser,
				data: otpData,
			});

			if (error) {
				setError(error);
			} else {
				setSent(true);
			}
		} catch (cause) {
			setError(errorMessage(cause));
		} finally {
			setLoading(false);
		}
	};

	const handleGoogle = async () => {
		setError("");
		try {
			await signInWithGoogle();
		} catch (cause) {
			setError(errorMessage(cause));
		}
	};

	if (sent) {
		return (
			<EmailSentCard
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
					size="cta"
					disabled={loading}
					className="mt-1 w-full"
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
			<GoogleOAuthButton onClick={handleGoogle} />
		</OnboardingCard>
	);
}
