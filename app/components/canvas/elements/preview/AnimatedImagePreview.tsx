"use client";

import { useState, type CSSProperties } from "react";
import { Image as ImageIcon, Video } from "@/components/ui/icon";
import { MediaToggle } from "@/components/ui/media-toggle";
import { stillFrameUrl } from "@/lib/connectors/animated_image/plugins/still-frame";
import { useQueueSelector } from "@/lib/generation/GenerationQueueProvider";
import { useElementGeneration } from "../ElementGenerationContext";
import { MediaResult } from "./results";
import type { ElementPreviewProps } from "./status";

export function AnimatedImagePreview({
	result,
	...state
}: ElementPreviewProps) {
	const { node } = useElementGeneration();
	const stillUrl = useQueueSelector((queue) => stillFrameUrl(node, queue));
	const [mode, setMode] = useState<"animated" | "still">("animated");
	const animated = mode === "animated";

	return (
		<div
			className="relative w-full"
			style={{ "--cancel-offset": "2.5rem" } as CSSProperties}
		>
			<MediaResult
				{...state}
				url={animated ? result?.videoUrl : stillUrl}
				outputKind={animated ? "video" : "image"}
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
