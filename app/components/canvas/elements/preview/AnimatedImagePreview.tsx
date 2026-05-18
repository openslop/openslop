"use client";

import { useState } from "react";
import { MediaPreview } from "./results";
import type { GenerationState } from "./status";

type AnimatedImagePreviewProps = GenerationState & {
	url: string;
	previewUrl: string;
	borderColor: string;
	stale: boolean;
	onRegenerate: () => void;
};

export function AnimatedImagePreview({
	url,
	previewUrl,
	borderColor,
	status,
	seconds,
	stale,
	onRegenerate,
}: AnimatedImagePreviewProps) {
	const [mode, setMode] = useState<"animated" | "still">("animated");
	const isAnimated = mode === "animated";

	return (
		<div className="relative w-full">
			<MediaPreview
				key={mode}
				url={isAnimated ? url : previewUrl}
				outputKind={isAnimated ? "video" : "image"}
				borderColor={borderColor}
				status={status}
				seconds={seconds}
				stale={stale}
				onRegenerate={onRegenerate}
			/>
			<div className="absolute top-2 right-2 z-10 flex items-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl shadow-md shadow-black/20 p-0.5">
				<ToggleButton
					active={isAnimated}
					label="Video"
					onClick={() => setMode("animated")}
				/>
				<ToggleButton
					active={!isAnimated}
					label="Still"
					onClick={() => setMode("still")}
				/>
			</div>
		</div>
	);
}

function ToggleButton({
	active,
	label,
	onClick,
}: {
	active: boolean;
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`rounded-full px-2 py-0.5 text-[11px] transition-colors ${
				active ? "bg-white/15 text-white" : "text-white/60 hover:text-white"
			}`}
		>
			{label}
		</button>
	);
}
