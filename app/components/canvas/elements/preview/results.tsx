import { useState } from "react";
import { AudioPlayer } from "../AudioPlayer";
import { MediaWithSkeleton } from "../MediaWithSkeleton";
import { GenerationIndicator } from "../GenerationIndicator";
import type { GenerationState, PlaceholderProps } from "./status";
import { PlaceholderBallsLoader } from "./placeholderBalls";
import {
	AUDIO_BAR_COUNT,
	buildSoundwaveMask,
} from "@/lib/components/soundwave";
import { PlaceholderOverlay, ResultOverlay } from "./overlays";

export function AudioResult({
	src,
	status,
	seconds,
}: GenerationState & {
	src: string;
}) {
	return (
		<div className="group relative w-full min-h-16 rounded-lg overflow-hidden border border-border bg-element-card flex flex-wrap items-center gap-x-2 gap-y-1.5 px-2 py-1.5">
			{status !== "idle" && (
				<GenerationIndicator
					status={status}
					seconds={seconds}
					className="shrink-0"
				/>
			)}
			<AudioPlayer key={src} src={src} />
		</div>
	);
}

export function AudioPlaceholder(props: PlaceholderProps) {
	const [mask] = useState(() => {
		const bars = Array.from(
			{ length: AUDIO_BAR_COUNT },
			() => 20 + Math.random() * 80,
		);
		return buildSoundwaveMask(bars);
	});

	return (
		<div className="group relative h-16 w-full overflow-hidden rounded-lg border border-border bg-muted">
			<div className="absolute inset-0 blur-[6px]" aria-hidden="true">
				<div
					className="absolute inset-0"
					style={{
						maskImage: mask,
						WebkitMaskImage: mask,
						maskSize: "100% 100%",
						WebkitMaskSize: "100% 100%",
					}}
				>
					<PlaceholderBallsLoader generating={props.status === "generating"} />
				</div>
			</div>
			<PlaceholderOverlay
				{...props}
				cancelClassName="top-1/2 -translate-y-1/2"
			/>
		</div>
	);
}

export function MediaPlaceholder(
	props: PlaceholderProps & { cancelClassName?: string },
) {
	return (
		<div className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border">
			<PlaceholderOverlay {...props} />
			<PlaceholderBallsLoader generating={props.status === "generating"} />
		</div>
	);
}

export function MediaResult({
	url,
	outputKind,
	cancelClassName,
	...state
}: PlaceholderProps & {
	url: string | undefined;
	outputKind: "image" | "video";
	cancelClassName?: string;
}) {
	if (!url) {
		return <MediaPlaceholder {...state} cancelClassName={cancelClassName} />;
	}
	return (
		<MediaPreview
			key={url}
			url={url}
			outputKind={outputKind}
			status={state.status}
			seconds={state.seconds}
		/>
	);
}

export function MediaPreview({
	url,
	outputKind,
	status,
	seconds,
}: GenerationState & {
	url: string;
	outputKind: "image" | "video";
}) {
	return (
		<div className="group relative w-full aspect-video rounded-lg overflow-hidden border border-border">
			<MediaWithSkeleton
				outputKind={outputKind}
				src={url}
				alt="Generated"
				videoInteractive
				objectFit="contain"
			/>
			<ResultOverlay status={status} seconds={seconds} />
		</div>
	);
}
