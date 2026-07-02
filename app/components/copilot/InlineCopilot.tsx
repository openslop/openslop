"use client";

import { type ReactNode, useEffect, useState } from "react";
import { CornerDownLeft, SquareFilled, Wand2 } from "@/components/ui/icon";
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
		<span className=" pointer-events-none block select-none truncate text-label text-muted-foreground shimmer">
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
		<div className="grain relative w-full overflow-hidden rounded-xl bg-element-card shadow-elevation-3">
			<div className="relative z-10 flex items-center px-3 py-2">
				{loading ? (
					<OrbLoader />
				) : (
					<Wand2 className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
				)}
				<div className="relative flex min-w-0 flex-1 items-center">
					{loading ? (
						<LoadingText />
					) : (
						<>
							{!hasText && placeholderOverlay && (
								<div className=" pointer-events-none absolute inset-0 flex items-center overflow-hidden text-label">
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
								className=" w-full bg-transparent font-body text-label text-foreground caret-accent placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:rounded-sm"
							/>
						</>
					)}
				</div>
				{loading ? (
					<ActionButton
						label="Stop generation"
						icon={<SquareFilled className="h-3 w-3" />}
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
