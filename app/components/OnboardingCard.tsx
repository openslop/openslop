import OpenSlopLogo from "./OpenSlopLogo";
import { Card } from "@/components/ui/card";

interface OnboardingCardProps {
	heading: string;
	subtitle: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
	icon?: React.ReactNode;
	extra?: React.ReactNode;
}

export default function OnboardingCard({
	heading,
	subtitle,
	children,
	footer,
	icon,
	extra,
}: OnboardingCardProps) {
	return (
		<div className="grain relative flex min-h-screen items-center justify-center px-3 py-8 sm:px-4">
			<span className="font-sentient absolute top-6 left-6 text-heading tracking-tight text-foreground">
				OpenSlop
			</span>

			<Card
				glow
				className="w-full max-w-lg items-center gap-4 rounded-3xl p-5 sm:gap-6 sm:p-8"
			>
				{icon ?? <OpenSlopLogo className="h-auto w-14 text-foreground" />}

				<h1 className="text-center text-heading font-light text-balance text-foreground sm:text-3xl">
					{heading}
				</h1>

				{extra}

				<p className="text-center text-label leading-relaxed font-light text-muted-foreground sm:text-body">
					{subtitle}
				</p>

				{children}

				<p className="text-label text-muted-foreground sm:text-body">
					{footer}
				</p>
			</Card>
		</div>
	);
}
