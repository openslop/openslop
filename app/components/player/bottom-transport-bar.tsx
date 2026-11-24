"use client";

import { memo } from "react";
import { ChevronsLeft, ChevronsRight, Pause, Play } from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import { toFrames } from "@/lib/render/frames";
import {
	findSegmentIndexAtFrame,
	previousSceneStart,
} from "@/lib/render/scene-segments";
import { BottomViewToggle } from "./bottom-view-toggle";
import { usePlayerControl } from "./player-control-context";
import { usePlayerPlacement } from "./player-placement-context";
import { useLayout } from "./render-layout-context";
import { usePlayerPlaying } from "./use-player-state";
import { SCRUB_BAR_HEIGHT } from "./scrub-bar";
import { SegmentedSeekBar } from "./segmented-seek-bar";
import { TimelineZoomControl } from "./timeline/timeline-zoom-control";
import {
	FullscreenButton,
	ScenePill,
	TimeDisplay,
	VolumeControl,
} from "./player-controls";

const NOTHING_TO_PLAY = "Nothing to play yet";

function BottomTransportBarComponent() {
	const { player } = usePlayerControl();
	const { showPlayer } = usePlayerPlacement();
	const { layout, ready, segments } = useLayout();
	const playing = usePlayerPlaying();

	// Seeking needs a live player. Play does not: it re-reveals the hidden
	// panel that mounts one.
	const canPlay = ready && segments.length > 0;
	const canSeek = canPlay && player !== null;
	const playLabel = playing ? "Pause" : "Play";

	const seekToPreviousScene = () => {
		if (!player) return;
		player.seekTo(
			previousSceneStart(segments, player.getCurrentFrame(), layout.fps),
		);
	};

	const seekToNextScene = () => {
		if (!player || segments.length === 0) return;
		const current = findSegmentIndexAtFrame(
			segments,
			player.getCurrentFrame(),
			layout.fps,
		);
		const target = segments[current + 1];
		if (target) player.seekTo(toFrames(target.start, layout.fps));
	};

	return (
		<div className="@container relative z-20 flex w-full shrink-0 flex-col gap-1.5 px-4 py-2 text-body text-foreground">
			<div className={cn("flex w-full items-center", SCRUB_BAR_HEIGHT)}>
				<SegmentedSeekBar />
			</div>
			<div className="scrollbar-overlay flex min-w-0 items-center gap-2 overflow-x-auto @max-xl:mask-r-from-85%">
				<div className="flex flex-1 items-center gap-2">
					{canSeek && <TimeDisplay />}
					{canSeek && (
						<div className="hidden @lg:contents">
							<ScenePill />
						</div>
					)}
				</div>

				<div className="flex items-center gap-1">
					<TooltipIconButton
						label={canSeek ? "Previous scene" : NOTHING_TO_PLAY}
						ariaLabel="Previous scene"
						unavailable={!canSeek}
						onClick={seekToPreviousScene}
					>
						<ChevronsLeft />
					</TooltipIconButton>
					<TooltipIconButton
						label={canPlay ? playLabel : NOTHING_TO_PLAY}
						ariaLabel={playLabel}
						unavailable={!canPlay}
						onClick={() => {
							showPlayer();
							player?.toggle();
						}}
					>
						{playing ? <Pause /> : <Play />}
					</TooltipIconButton>
					<TooltipIconButton
						label={canSeek ? "Next scene" : NOTHING_TO_PLAY}
						ariaLabel="Next scene"
						unavailable={!canSeek}
						onClick={seekToNextScene}
					>
						<ChevronsRight />
					</TooltipIconButton>
				</div>

				<div className="flex flex-1 items-center justify-end gap-1.5">
					<TimelineZoomControl />
					<VolumeControl />
					<FullscreenButton />
					<BottomViewToggle />
				</div>
			</div>
		</div>
	);
}

export const BottomTransportBar = memo(BottomTransportBarComponent);
