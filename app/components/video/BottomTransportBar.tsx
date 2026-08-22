"use client";

import { memo } from "react";
import { ChevronsLeft, ChevronsRight, Pause, Play } from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import { toFrames } from "@/lib/video/frames";
import { findSegmentIndexAtFrame } from "@/lib/video/sceneSegments";
import { BottomViewToggle } from "./BottomViewToggle";
import { usePlayerControl } from "./PlayerControlContext";
import { usePlayerPosition } from "./PlayerPositionContext";
import { useLayout } from "./VideoLayoutContext";
import { usePlayerPlaying } from "./usePlayerState";
import { SCRUB_BAR_HEIGHT } from "./ScrubBar";
import { SegmentedSeekBar } from "./SegmentedSeekBar";
import {
	FullscreenButton,
	ScenePill,
	TimeDisplay,
	VolumeControl,
} from "./PlayerControls";

function BottomTransportBarComponent() {
	const { player } = usePlayerControl();
	const { showPlayer } = usePlayerPosition();
	const { layout, ready, segments } = useLayout();
	const playing = usePlayerPlaying();

	// Seeking needs a live player. Play does not: it re-reveals the hidden
	// panel that mounts one.
	const canPlay = ready && segments.length > 0;
	const canSeek = canPlay && player !== null;

	const seekToAdjacentScene = (dir: -1 | 1) => {
		if (!player || segments.length === 0) return;
		const current = findSegmentIndexAtFrame(
			segments,
			player.getCurrentFrame(),
			layout.fps,
		);
		const target = segments[current + dir];
		if (target) player.seekTo(toFrames(target.start, layout.fps));
	};

	return (
		<div className="@container relative z-20 flex w-full shrink-0 flex-col gap-1.5 border-t border-border px-4 py-2 text-body text-foreground">
			<div className={cn("flex w-full items-center", SCRUB_BAR_HEIGHT)}>
				<SegmentedSeekBar />
			</div>
			<div className="flex items-center gap-2">
				<div className="flex flex-1 items-center gap-2">
					{canSeek && <TimeDisplay />}
					{canSeek && (
						<div className="hidden @[520px]:contents">
							<ScenePill />
						</div>
					)}
				</div>

				<div className="flex items-center gap-1">
					<TooltipIconButton
						label="Previous scene"
						disabled={!canSeek}
						onClick={() => seekToAdjacentScene(-1)}
					>
						<ChevronsLeft className="h-4 w-4" />
					</TooltipIconButton>
					<TooltipIconButton
						label={playing ? "Pause" : "Play"}
						disabled={!canPlay}
						onClick={() => {
							showPlayer();
							player?.toggle();
						}}
					>
						{playing ? (
							<Pause className="h-4 w-4" />
						) : (
							<Play className="h-4 w-4" />
						)}
					</TooltipIconButton>
					<TooltipIconButton
						label="Next scene"
						disabled={!canSeek}
						onClick={() => seekToAdjacentScene(1)}
					>
						<ChevronsRight className="h-4 w-4" />
					</TooltipIconButton>
				</div>

				<div className="flex flex-1 items-center justify-end gap-1.5">
					<VolumeControl />
					<FullscreenButton />
					<BottomViewToggle />
				</div>
			</div>
		</div>
	);
}

export const BottomTransportBar = memo(BottomTransportBarComponent);
