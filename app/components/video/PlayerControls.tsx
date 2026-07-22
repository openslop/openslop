"use client";

import type { PlayerRef } from "@remotion/player";
import { Maximize, Volume2, VolumeX } from "@/components/ui/icon";
import type { VideoLayout } from "@/lib/video/types";
import { scrollToScene } from "@/app/components/canvas/utils/scrollToScene";
import { IconButton } from "@/components/ui/icon-button";
import { toSeconds } from "@/lib/video/frames";
import { formatTime } from "@/lib/video/timestamps";
import { usePlayerControl } from "./PlayerControlContext";
import {
	FRAME_EVENTS,
	usePlayerMuted,
	usePlayerValue,
	usePlayerVolume,
} from "./usePlayerState";
import type { SceneSegment } from "./useSceneSegments";
import { ScrubBar } from "./ScrubBar";

export function TimeDisplay({
	player,
	layout,
}: {
	player: PlayerRef | null;
	layout: VideoLayout;
}) {
	const seconds = usePlayerValue(
		player,
		FRAME_EVENTS,
		(p) => Math.floor(toSeconds(p.getCurrentFrame(), layout.fps)),
		0,
	);
	return (
		<span className="shrink-0 font-mono text-label tabular-nums text-muted-foreground">
			<span className="text-foreground">{formatTime(seconds)}</span> /{" "}
			{formatTime(layout.totalDurationSec)}
		</span>
	);
}

export function ScenePill({
	segments,
	activeIndex,
}: {
	segments: SceneSegment[];
	activeIndex: number;
}) {
	const active = segments[activeIndex];
	if (!active) return null;
	return (
		<button
			type="button"
			onClick={() => scrollToScene(active.sceneId)}
			aria-label={`Scroll to ${active.label}`}
			className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-label font-medium text-foreground ring-1 ring-inset ring-border transition-colors hover:bg-button-hover"
		>
			{active.label}
		</button>
	);
}

export function VolumeControl() {
	const { player } = usePlayerControl();
	const volume = usePlayerVolume(player);
	const muted = usePlayerMuted(player);

	const toggleMute = () => {
		if (!player) return;
		if (player.isMuted()) player.unmute();
		else player.mute();
	};
	const onVolumeChange = (next: number) => {
		if (!player) return;
		player.setVolume(next);
		if (next > 0 && player.isMuted()) player.unmute();
	};

	return (
		<div className="flex items-center gap-1.5">
			<IconButton onClick={toggleMute} ariaLabel={muted ? "Unmute" : "Mute"}>
				{muted || volume === 0 ? (
					<VolumeX className="h-4 w-4" />
				) : (
					<Volume2 className="h-4 w-4" />
				)}
			</IconButton>
			<div className="hidden @[420px]:block">
				<ScrubBar
					className="w-[4.5rem]"
					ariaLabel="Volume"
					value={muted ? 0 : volume}
					onScrub={onVolumeChange}
				/>
			</div>
		</div>
	);
}

export function FullscreenButton() {
	const { player } = usePlayerControl();
	const onFullscreen = () => {
		if (!player) return;
		if (player.isFullscreen()) player.exitFullscreen();
		else player.requestFullscreen();
	};
	return (
		<IconButton onClick={onFullscreen} ariaLabel="Fullscreen">
			<Maximize className="h-4 w-4" />
		</IconButton>
	);
}
