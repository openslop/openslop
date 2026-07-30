"use client";

import { useState, type CSSProperties } from "react";
import { Image as ImageIcon, Video } from "@/components/ui/icon";
import { MediaToggle } from "@/components/ui/media-toggle";
import { stillFrameUrl } from "@/lib/connectors/animated_image/plugins/still-frame";
import { useQueueSelector } from "@/lib/generation/GenerationQueueProvider";
import { useElementGeneration } from "../ElementGenerationContext";
import { MediaResult } from "./results";
import type { PlaceholderProps } from "./status";

type AnimatedImagePreviewProps = PlaceholderProps & {
	stillUrl?: string;
	videoUrl?: string;
};

export function AnimatedImagePreview({
	stillUrl,
	videoUrl,
	...state
}: AnimatedImagePreviewProps) {
	const [mode, setMode] = useState<"animated" | "still">("animated");

	return (
		<div
			className="relative w-full"
			style={{ "--cancel-offset": "2.5rem" } as CSSProperties}
		>
			<MediaResult
				{...state}
				url={mode === "animated" ? videoUrl : stillUrl}
				outputKind={mode === "animated" ? "video" : "image"}
			/>
			<MediaToggle
				className="absolute top-2 right-2 z-30 shadow-sm"
				value={mode}
				onChange={setMode}
				options={[
					{ value: "animated", label: "Video", icon: Video },
					{ value: "still", label: "Still", icon: ImageIcon },
				]}
			/>
		</div>
	);
}

export function AnimatedImageOutput(state: PlaceholderProps) {
	const { node, result } = useElementGeneration();
	const stillUrl = useQueueSelector((queue) => stillFrameUrl(node, queue));

	return (
		<AnimatedImagePreview
			{...state}
			stillUrl={stillUrl}
			videoUrl={result?.videoUrl}
		/>
	);
}
