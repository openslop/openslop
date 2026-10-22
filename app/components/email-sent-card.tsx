"use client";

import OnboardingCard from "./onboarding-card";
import { Button } from "@/components/ui/button";
import { Mail } from "@/components/ui/icon";

interface EmailSentCardProps {
	subtitle: string;
	resendLabel: string;
	loading: boolean;
	error: string;
	onResend: () => void;
	onEditEmail: () => void;
}

export default function EmailSentCard({
	subtitle,
	resendLabel,
	loading,
	error,
	onResend,
	onEditEmail,
}: EmailSentCardProps) {
	return (
		<OnboardingCard
			heading="Email sent!"
			subtitle={subtitle}
			icon={<Mail size={56} className="text-foreground" />}
			footer={
				<button
					type="button"
					onClick={onEditEmail}
					className="text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
				>
					Edit my email address
				</button>
			}
		>
			<Button
				type="button"
				variant="accent"
				size="cta"
				onClick={onResend}
				disabled={loading}
				className="w-full"
			>
				{loading ? "Sending…" : resendLabel}
			</Button>
			{error && (
				<p role="alert" className="text-center text-body text-destructive">
					{error}
				</p>
			)}
		</OnboardingCard>
	);
}
