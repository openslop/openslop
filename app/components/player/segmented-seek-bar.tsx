"use client";

import { useEffect, useMemo, useState } from "react";
import { clamp } from "@/lib/utils";
import { toSeconds } from "@/lib/render/frames";
import { findSegmentIndexAtFrame } from "@/lib/render/scene-segments";
import { formatTime } from "@/lib/render/timestamps";
import { usePlayerControl } from "./player-control-context";
import { usePlayerFrame } from "./use-player-state";
import { SeekTooltip } from "./seek-tooltip";
import { ScrubBar, type ScrubHover } from "./scrub-bar";
import { usePlayerScrub } from "./use-player-scrub";
import { useLayout } from "./render-layout-context";

const HOVER_SETTLE_MS = 80;
const KEY_SEEK_SEC = 5;

export function SegmentedSeekBar() {
	const { player } = usePlayerControl();
	const { layout, segments } = useLayout();
	const { totalDurationSec, totalFrames } = layout;
	const toScrubFrame = (ratio: number) => Math.round(ratio * (totalFrames - 1));
	const frame = usePlayerFrame();
	const progress = clamp(frame / Math.max(1, totalFrames - 1), 0, 1);

	const [hover, setHover] = useState<ScrubHover | null>(null);
	// Pulling a frame per segment the pointer sweeps across is wasted work, so
	// the thumbnail follows only once the pointer holds still.
	const [settled, setSettled] = useState<ScrubHover | null>(null);
	const scrub = usePlayerScrub();

	if (!hover && settled) setSettled(null);

	useEffect(() => {
		if (!hover) return;
		const timer = setTimeout(() => setSettled(hover), HOVER_SETTLE_MS);
		return () => clearTimeout(timer);
	}, [hover]);

	const scrubSegments = useMemo(
		() =>
			segments.map(({ id, duration }) => ({
				id,
				basis: duration / totalDurationSec,
			})),
		[segments, totalDurationSec],
	);

	const segmentAt = (at: ScrubHover | null) =>
		at
			? (segments[
					findSegmentIndexAtFrame(segments, toScrubFrame(at.ratio), layout.fps)
				] ?? null)
			: null;

	const hoverSegment = segmentAt(hover);
	const thumbnailSegment = segmentAt(settled);

	return (
		<ScrubBar
			className="w-full"
			ariaLabel="Seek"
			ariaValueText={`${formatTime(toSeconds(frame, layout.fps))} of ${formatTime(totalDurationSec)}`}
			disabled={!player || segments.length === 0}
			value={progress}
			segments={scrubSegments}
			onScrub={(ratio) => scrub.seekTo(toScrubFrame(ratio))}
			keyStep={KEY_SEEK_SEC / totalDurationSec}
			onScrubStart={scrub.start}
			onScrubEnd={scrub.end}
			onHoverChange={setHover}
		>
			{hover && hoverSegment ? (
				<SeekTooltip
					x={hover.x}
					containerWidth={hover.width}
					timeSec={hover.ratio * totalDurationSec}
					label={hoverSegment.label}
					thumbnail={thumbnailSegment?.thumbnail ?? null}
				/>
			) : null}
		</ScrubBar>
	);
}
