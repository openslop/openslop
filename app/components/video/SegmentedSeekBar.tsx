"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	const [settledIndex, setSettledIndex] = useState<number | null>(null);
	const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const scrub = usePlayerScrub();

	useEffect(
		() => () => {
			if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
		},
		[],
	);

	const scrubSegments = useMemo(
		() =>
			segments.map((seg) => ({
				id: seg.id,
				basis: seg.duration / totalDurationSec,
			})),
		[segments, totalDurationSec],
	);

	const onHoverChange = (h: ScrubHover | null) => {
		setHover(h);
		if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
		if (!h) {
			setHoverIndex(null);
			setSettledIndex(null);
			return;
		}
		const index = findSegmentIndexAtFrame(
			segments,
			toScrubFrame(h.ratio),
			layout.fps,
		);
		setHoverIndex(index);
		settleTimerRef.current = setTimeout(
			() => setSettledIndex(index),
			HOVER_SETTLE_MS,
		);
	};

	const hoverSegment = hoverIndex != null ? segments[hoverIndex] : null;
	const thumbnailSegment =
		settledIndex != null ? (segments[settledIndex] ?? null) : null;

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
			onHoverChange={onHoverChange}
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
