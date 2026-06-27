"use client";

import OnboardingCard from "./OnboardingCard";
import { Button } from "@/components/ui/button";

const EnvelopeIcon = (
	<svg
		className="h-14 w-14 text-foreground"
		fill="none"
		viewBox="0 0 24 24"
		strokeWidth={1}
		stroke="currentColor"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
		/>
	</svg>
);

interface EmailSentCardProps {
	email: string;
	subtitle?: string;
	resendLabel?: string;
	loading: boolean;
	error: string;
	onResend: () => void;
	onEditEmail: () => void;
}

export default function EmailSentCard({
	email,
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
			subtitle={subtitle ?? `We sent a login link to ${email}`}
			icon={EnvelopeIcon}
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
				onClick={onResend}
				disabled={loading}
				className="h-11 w-full"
			>
				{loading ? "Sending…" : (resendLabel ?? "Send another login link")}
			</Button>
			{error && (
				<p className="text-center text-body text-destructive">{error}</p>
			)}
		</OnboardingCard>
	);
}
