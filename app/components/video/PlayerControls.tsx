"use client";

import type { PlayerRef } from "@remotion/player";
import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import type { VideoLayout } from "@/lib/video/types";
import { scrollToScene } from "@/app/components/canvas/utils/scrollToScene";
import { formatTime } from "@/lib/video/timestamps";
import {
	usePlayerMuted,
	usePlayerPlaying,
	usePlayerValue,
	usePlayerVolume,
} from "./usePlayerState";
import { SegmentedSeekBar } from "./SegmentedSeekBar";
import { findSegmentIndexAt, type SceneSegment } from "./useSceneSegments";
import styles from "./VideoPlayer.module.css";

export function PlayerControls({
	player,
	layout,
	segments,
	visible,
}: {
	player: PlayerRef | null;
	layout: VideoLayout;
	segments: SceneSegment[];
	visible: boolean;
}) {
	const playing = usePlayerPlaying(player);
	const volume = usePlayerVolume(player);
	const muted = usePlayerMuted(player);

	const togglePlay = () => player?.toggle();
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
	const onFullscreen = () => {
		if (!player) return;
		if (player.isFullscreen()) player.exitFullscreen();
		else player.requestFullscreen();
	};

	return (
		<div
			className={`@container absolute inset-x-0 bottom-0 z-10 flex flex-col gap-1.5 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-3 pb-2 pt-8 text-sm text-white transition-opacity duration-200 ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}
		>
			<SegmentedSeekBar player={player} layout={layout} segments={segments} />
			<div className="flex items-center gap-2">
				<IconButton onClick={togglePlay} ariaLabel={playing ? "Pause" : "Play"}>
					{playing ? (
						<Pause className="h-4 w-4" />
					) : (
						<Play className="h-4 w-4" />
					)}
				</IconButton>
				<TimeDisplay player={player} layout={layout} />
				<div className="hidden @[280px]:contents">
					<ScenePill player={player} layout={layout} segments={segments} />
				</div>
				<div className="flex-1" />
				<div className="flex shrink-0 items-center gap-1.5">
					<IconButton
						onClick={toggleMute}
						ariaLabel={muted ? "Unmute" : "Mute"}
					>
						{muted || volume === 0 ? (
							<VolumeX className="h-4 w-4" />
						) : (
							<Volume2 className="h-4 w-4" />
						)}
					</IconButton>
					<input
						type="range"
						min={0}
						max={1}
						step={0.01}
						value={muted ? 0 : volume}
						onChange={(e) => onVolumeChange(Number(e.target.value))}
						aria-label="Volume"
						className={`hidden @[240px]:block ${styles.volume}`}
					/>
				</div>
				<IconButton onClick={onFullscreen} ariaLabel="Fullscreen">
					<Maximize className="h-4 w-4" />
				</IconButton>
			</div>
		</div>
	);
}

function TimeDisplay({
	player,
	layout,
}: {
	player: PlayerRef | null;
	layout: VideoLayout;
}) {
	const seconds = usePlayerValue(
		player,
		["frameupdate"],
		(p) => Math.floor(p.getCurrentFrame() / layout.fps),
		0,
	);
	return (
		<span className="shrink-0 tabular-nums text-white/80">
			{formatTime(seconds)} / {formatTime(layout.totalDurationSec)}
		</span>
	);
}

function ScenePill({
	player,
	layout,
	segments,
}: {
	player: PlayerRef | null;
	layout: VideoLayout;
	segments: SceneSegment[];
}) {
	const activeIndex = usePlayerValue(
		player,
		["frameupdate"],
		(p) => findSegmentIndexAt(segments, p.getCurrentFrame() / layout.fps),
		-1,
	);
	const active = segments[activeIndex];
	if (!active) return null;
	return (
		<button
			type="button"
			onClick={() => scrollToScene(active.sceneId)}
			aria-label={`Scroll to ${active.label}`}
			className="shrink-0 rounded-full bg-white/15 px-2 py-0.5 text-xs font-medium text-white ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/25"
		>
			{active.label}
		</button>
	);
}

function IconButton({
	onClick,
	ariaLabel,
	children,
}: {
	onClick: () => void;
	ariaLabel: string;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={ariaLabel}
			className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
		>
			{children}
		</button>
	);
}
