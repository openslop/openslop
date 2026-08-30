"use client";

import {
	useCallback,
	useState,
	type CSSProperties,
	type ReactNode,
} from "react";
import { Image as ImageIcon, Video } from "@/components/ui/icon";
import { MediaToggle } from "@/components/ui/media-toggle";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";
import {
	stillDependency,
	stillSnapshot,
} from "@/lib/connectors/animated_image/plugins/still-frame";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import { useElementGeneration } from "../ElementGenerationContext";
import { MediaResult } from "./results";
import type {
	ElementPreviewProps,
	GenerationState,
	PlaceholderProps,
	PreviewOverlays,
} from "./status";

/** Each mode owns its own node, so Cancel has to cancel the one on screen. */
type ModeState = GenerationState &
	Pick<PlaceholderProps, "onDiscard"> & {
		error: string | null;
		url: string | undefined;
	};

type AnimatedImageMediaProps = PreviewOverlays & {
	animated: ModeState;
	still: ModeState;
};

export function AnimatedImageMedia({
	animated,
	still,
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
	const queue = useGenerationQueue();
	const { node } = useElementGeneration();
	const still = useQueueSelector((q) => stillSnapshot(node, q));
	const stillId = stillDependency(node)?.id;

	const discardStill = useCallback(() => {
		if (stillId) queue.discard(stillId);
	}, [queue, stillId]);

	return (
		<AnimatedImageMedia
			topRight={topRight}
			animated={{ status, seconds, error, onDiscard, url: result?.videoUrl }}
			still={{
				status: still.status,
				seconds: still.seconds,
				error: still.error,
				onDiscard: discardStill,
				url: getPrimaryUrl(still.result, "image"),
			}}
		/>
	);
}
