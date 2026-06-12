"use client";

import { useState } from "react";
import { MediaPreview, MediaPlaceholder } from "./results";
import type { PlaceholderProps } from "./status";

type AnimatedImagePreviewProps = PlaceholderProps & {
	imageUrl?: string;
	videoUrl?: string;
	borderColor: string;
	stale: boolean;
	onRegenerate: () => void;
};

export function AnimatedImagePreview({
	imageUrl,
	videoUrl,
	borderColor,
	status,
	seconds,
	stale,
	error,
	onRegenerate,
	onGenerate,
	onDiscard,
}: AnimatedImagePreviewProps) {
	const [mode, setMode] = useState<"animated" | "still">("animated");
	const url = mode === "animated" ? videoUrl : imageUrl;

	return (
		<div className="relative w-full">
			{url ? (
				<MediaPreview
					key={url}
					url={url}
					outputKind={mode === "animated" ? "video" : "image"}
					borderColor={borderColor}
					status={status}
					seconds={seconds}
					stale={stale}
					onRegenerate={onRegenerate}
				/>
			) : (
				<MediaPlaceholder
					status={status}
					seconds={seconds}
					error={error}
					onGenerate={onGenerate}
					onDiscard={onDiscard}
				/>
			)}
			<div className="absolute top-2 right-2 z-10 flex items-center rounded-full border border-glass-border bg-black/55 backdrop-blur-xl shadow-md shadow-black/40 p-0.5">
				<ToggleButton
					active={mode === "animated"}
					label="Video"
					onClick={() => setMode("animated")}
				/>
				<ToggleButton
					active={mode === "still"}
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
