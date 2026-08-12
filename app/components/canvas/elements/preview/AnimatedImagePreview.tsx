"use client";

import { useState, type CSSProperties } from "react";
import { Image as ImageIcon, Video } from "@/components/ui/icon";
import { MediaToggle } from "@/components/ui/media-toggle";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";
import { stillSnapshot } from "@/lib/connectors/animated_image/plugins/still-frame";
import { useQueueSelector } from "@/lib/generation/GenerationQueueProvider";
import { useElementGeneration } from "../ElementGenerationContext";
import { MediaResult } from "./results";
import type {
	ElementPreviewProps,
	GenerationState,
	PlaceholderProps,
} from "./status";

type ModeState = GenerationState & {
	error: string | null;
	url: string | undefined;
};

type AnimatedImageMediaProps = Pick<PlaceholderProps, "onDiscard"> & {
	animated: ModeState;
	still: ModeState;
};

export function AnimatedImageMedia({
	animated,
	still,
	onDiscard,
}: AnimatedImageMediaProps) {
	const [mode, setMode] = useState<"animated" | "still">("animated");
	const { url, ...state } = mode === "animated" ? animated : still;

	return (
		<div
			className="relative w-full"
			style={{ "--cancel-offset": "2.5rem" } as CSSProperties}
		>
			<MediaResult
				{...state}
				onDiscard={onDiscard}
				url={url}
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

export function AnimatedImagePreview({
	status,
	seconds,
	error,
	result,
	onDiscard,
}: ElementPreviewProps) {
	const { node } = useElementGeneration();
	const still = useQueueSelector((queue) => stillSnapshot(node, queue));

	return (
		<AnimatedImageMedia
			onDiscard={onDiscard}
			animated={{ status, seconds, error, url: result?.videoUrl }}
			still={{
				status: still.status,
				seconds: still.seconds,
				error: still.error,
				url: getPrimaryUrl(still.result, "image"),
			}}
		/>
	);
}
