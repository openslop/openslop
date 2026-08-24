"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
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
	PreviewOverlays,
} from "./status";

type ModeState = GenerationState & {
	error: string | null;
	url: string | undefined;
};

type AnimatedImageMediaProps = Pick<PlaceholderProps, "onDiscard"> &
	PreviewOverlays & {
		animated: ModeState;
		still: ModeState;
	};

export function AnimatedImageMedia({
	animated,
	still,
	onDiscard,
	topRight,
}: AnimatedImageMediaProps) {
	const [mode, setMode] = useState<"animated" | "still">("animated");
	const { url, ...state } = mode === "animated" ? animated : still;

	const toggle: ReactNode = (
		<MediaToggle
			className="shadow-sm"
			value={mode}
			onChange={setMode}
			options={[
				{ value: "animated", label: "Video", icon: Video },
				{ value: "still", label: "Still", icon: ImageIcon },
			]}
		/>
	);

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
				topRight={
					<>
						{topRight}
						{toggle}
					</>
				}
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
	topRight,
}: ElementPreviewProps) {
	const { node } = useElementGeneration();
	const still = useQueueSelector((queue) => stillSnapshot(node, queue));

	return (
		<AnimatedImageMedia
			onDiscard={onDiscard}
			topRight={topRight}
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
