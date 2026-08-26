"use client";

import { useEffect, useMemo, useState } from "react";
import { clamp } from "@/lib/utils";
import { findSegmentIndexAtFrame } from "@/lib/video/sceneSegments";
import { usePlayerControl } from "./PlayerControlContext";
import { usePlayerFrame } from "./usePlayerState";
import { SeekTooltip } from "./SeekTooltip";
import { ScrubBar, type ScrubHover } from "./ScrubBar";
import { usePlayerScrub } from "./usePlayerScrub";
import { useLayout } from "./VideoLayoutContext";

const HOVER_SETTLE_MS = 80;

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
			segments.map((seg) => ({
				id: seg.id,
				basis: seg.duration / totalDurationSec,
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
			disabled={!player || segments.length === 0}
			value={progress}
			segments={scrubSegments.length > 0 ? scrubSegments : undefined}
			onScrub={(ratio) => scrub.seekTo(toScrubFrame(ratio))}
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
