"use client";

import { type ReactNode, useEffect, useState } from "react";
import { CornerDownLeft, Sparkles, Square } from "lucide-react";
import OrbLoader from "../OrbLoader";
import { ActionButton } from "./ActionButton";

const LOADING_MESSAGES = [
	"Brewing creativity…",
	"Summoning the muses…",
	"Arguing with the AI writers' room…",
	"Polishing the plot twists…",
	"Convincing characters to cooperate…",
	"Sprinkling dramatic tension…",
	"Negotiating with the narrator…",
	"Adding a pinch of movie magic…",
];

function LoadingText() {
	const [index, setIndex] = useState(() =>
		Math.floor(Math.random() * LOADING_MESSAGES.length),
	);

	useEffect(() => {
		const interval = setInterval(() => {
			setIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
		}, 3000);
		return () => clearInterval(interval);
	}, []);

	return (
		<span className="font-body pointer-events-none block select-none truncate text-sm text-white/40 shimmer">
			{LOADING_MESSAGES[index]}
		</span>
	);
}

interface InlineCopilotProps {
	value: string;
	onValueChange: (value: string) => void;
	onSubmit: () => void;
	onStop?: () => void;
	placeholder?: ReactNode;
	loading?: boolean;
}

export default function InlineCopilot({
	value,
	onValueChange,
	onSubmit,
	onStop,
	placeholder,
	loading,
}: InlineCopilotProps) {
	const hasText = value.trim().length > 0;
	const handleSubmit = () => {
		if (hasText) onSubmit();
	};

	const placeholderOverlay =
		typeof placeholder !== "string" ? placeholder : undefined;
	const placeholderText =
		typeof placeholder === "string" ? placeholder : undefined;

	return (
		<div className="w-full rounded-xl border border-violet-500/30 bg-white/5 shadow-[0_0_40px_rgba(55,30,100,0.5)]">
			<div className="relative flex items-center px-4 py-3">
				{loading ? (
					<OrbLoader />
				) : (
					<Sparkles className="mr-3 h-5 w-5 shrink-0 text-violet-400/60" />
				)}
				<div className="relative min-w-0 flex-1">
					{loading ? (
						<LoadingText />
					) : (
						<>
							{!hasText && placeholderOverlay && (
								<div className="font-body pointer-events-none absolute inset-0 flex items-center overflow-hidden text-sm">
									{placeholderOverlay}
								</div>
							)}
							<input
								type="text"
								aria-label="Describe your video"
								value={value}
								onChange={(e) => onValueChange(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
								placeholder={placeholderText}
								className="font-body w-full bg-transparent text-sm text-white/80 caret-violet-400 placeholder:text-white/30 outline-none focus-visible:ring-2 focus-visible:ring-violet-400/30 focus-visible:rounded-sm"
							/>
						</>
					)}
				</div>
				{loading ? (
					<ActionButton
						label="Stop generation"
						icon={<Square className="h-3 w-3 fill-current" />}
						onClick={() => onStop?.()}
					/>
				) : (
					<ActionButton
						label="Submit prompt"
						icon={<CornerDownLeft className="h-4 w-4" strokeWidth={2.5} />}
						onClick={handleSubmit}
						disabled={!hasText}
					/>
				)}
			</div>
		</div>
	);
}
