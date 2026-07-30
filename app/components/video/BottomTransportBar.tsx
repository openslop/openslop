"use client";

import { memo } from "react";
import { ChevronsLeft, ChevronsRight, Pause, Play } from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { toFrames, toSeconds } from "@/lib/video/frames";
import { usePlayerControl } from "./PlayerControlContext";
import { usePlayerPosition } from "./PlayerPositionContext";
import { useLayout } from "./VideoLayoutContext";
import { findSegmentIndexAt } from "./useSceneSegments";
import { usePlayerPlaying } from "./usePlayerState";
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
	const { layout, segments } = useLayout();
	const playing = usePlayerPlaying(player);

	const ready = player !== null && segments.length > 0;

	const seekToAdjacentScene = (dir: -1 | 1) => {
		if (!player || segments.length === 0) return;
		const current = findSegmentIndexAt(
			segments,
			toSeconds(player.getCurrentFrame(), layout.fps),
		);
		const target = segments[current + dir];
		if (target) player.seekTo(toFrames(target.start, layout.fps));
	};

	return (
		<div className="@container relative z-20 flex w-full shrink-0 flex-col gap-1.5 border-t border-border px-4 py-2 text-body text-foreground">
			{ready ? (
				<SegmentedSeekBar player={player} layout={layout} segments={segments} />
			) : (
				<div className="h-3 w-full" aria-hidden />
			)}
			<div className="flex items-center gap-2">
				<div className="flex flex-1 items-center gap-2">
					{ready && <TimeDisplay player={player} layout={layout} />}
					{ready && (
						<div className="hidden @[520px]:contents">
							<ScenePill player={player} segments={segments} fps={layout.fps} />
						</div>
					)}
				</div>

				<div className="flex items-center gap-1">
					<TooltipIconButton
						label="Previous scene"
						onClick={() => seekToAdjacentScene(-1)}
					>
						<ChevronsLeft className="h-4 w-4" />
					</TooltipIconButton>
					<TooltipIconButton
						label={playing ? "Pause" : "Play"}
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
						onClick={() => seekToAdjacentScene(1)}
					>
						<ChevronsRight className="h-4 w-4" />
					</TooltipIconButton>
				</div>

				<div className="flex flex-1 items-center justify-end gap-1.5">
					<VolumeControl />
					<FullscreenButton />
				</div>
			</div>
		</div>
	);
}

export const BottomTransportBar = memo(BottomTransportBarComponent);
