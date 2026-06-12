import { useState } from "react";
import { AudioPlayer } from "../AudioPlayer";
import { CharacterBadge } from "../CharacterBadge";
import { MediaWithSkeleton } from "../MediaWithSkeleton";
import { GenerationIndicator } from "../GenerationIndicator";
import type { CanvasElementType } from "@/lib/canvas/types";
import type { GenerationState, PlaceholderProps } from "./status";
import { WAVE_COLORS } from "./status";
import { PlaceholderBallsLoader } from "./placeholderBalls";
import { AUDIO_BAR_COUNT, buildSoundwaveMask } from "./soundwave";
import {
	PlaceholderOverlay,
	ResultOverlay,
	StaleControls,
	StaleIndicator,
} from "./overlays";
import type { GenerationInputs } from "@/lib/generation/generationInputs";

export function AudioResult({
	type,
	src,
	characterName,
	status,
	seconds,
	stale,
	onRegenerate,
}: GenerationState & {
	type: CanvasElementType;
	src: string;
	characterName?: string;
	stale: boolean;
	onRegenerate: () => void;
}) {
	return (
		<div className="group relative w-full min-h-16 rounded-lg overflow-hidden border border-white/10 bg-white/[0.03] flex flex-wrap items-center gap-x-2 gap-y-1.5 px-2 py-1.5">
			{type === "character" && <CharacterBadge name={characterName} />}
			<GenerationIndicator
				status={status}
				seconds={seconds}
				idleLabel="Regenerate"
				onClick={onRegenerate}
				className="shrink-0"
			/>
			<AudioPlayer key={src} src={src} waveColor={WAVE_COLORS[type]} />
			{stale && <StaleIndicator onClick={onRegenerate} />}
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
		<div className="group relative w-full h-16 rounded-lg overflow-hidden">
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
					<div className="absolute inset-0 bg-white/20" />
					<PlaceholderBallsLoader generating={props.status === "generating"} />
				</div>
			</div>
			<div className="absolute inset-0 grain grain-light border rounded-lg bg-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]" />
			<PlaceholderOverlay
				{...props}
				cancelClassName="top-1/2 -translate-y-1/2"
			/>
		</div>
	);
}

export function MediaPlaceholder(props: PlaceholderProps) {
	return (
		<div className="group grain grain-light relative w-full aspect-video rounded-lg overflow-hidden border flex items-center justify-center backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]">
			<PlaceholderOverlay {...props} />
			<PlaceholderBallsLoader generating={props.status === "generating"} />
		</div>
	);
}

export function MediaPreview({
	url,
	outputKind,
	borderColor,
	status,
	seconds,
	stale,
	elementId,
	onRegenerate,
	onRevert,
}: GenerationState & {
	url: string;
	outputKind: "image" | "video";
	borderColor: string;
	stale: boolean;
	elementId: string;
	onRegenerate: () => void;
	onRevert?: (resultInputs: GenerationInputs) => void;
}) {
	return (
		<div
			className={`group relative w-full aspect-video rounded-lg overflow-hidden border ${borderColor}`}
		>
			<MediaWithSkeleton
				outputKind={outputKind}
				src={url}
				alt="Generated"
				videoInteractive
				objectFit="contain"
			/>
			<ResultOverlay
				status={status}
				seconds={seconds}
				onRegenerate={onRegenerate}
			/>
			{stale && (
				<StaleControls
					elementId={elementId}
					onRegenerate={onRegenerate}
					onRevert={onRevert}
				/>
			)}
		</div>
	);
}
