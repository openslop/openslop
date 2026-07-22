"use client";

import type { PlayerRef } from "@remotion/player";
import { useEffect, useRef, useState } from "react";
import { clamp } from "@/lib/utils";
import type { VideoLayout } from "@/lib/video/types";
import { usePlayerFrame } from "./usePlayerState";
import { SeekTooltip } from "./SeekTooltip";
import { findSegmentIndexAt, type SceneSegment } from "./useSceneSegments";
import { ScrubBar, type ScrubHover } from "./ScrubBar";
import { silenceMediaIn } from "./silenceMedia";

const HOVER_SETTLE_MS = 80;

export function SegmentedSeekBar({
	player,
	layout,
	segments,
}: {
	player: PlayerRef | null;
	layout: VideoLayout;
	segments: SceneSegment[];
}) {
	const { totalDurationSec, totalFrames } = layout;
	const frame = usePlayerFrame(player);
	const progress = clamp(frame / Math.max(1, totalFrames - 1), 0, 1);

	const [hover, setHover] = useState<ScrubHover | null>(null);
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	const [settledIndex, setSettledIndex] = useState<number | null>(null);
	const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const wasPlayingRef = useRef(false);

	useEffect(
		() => () => {
			if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
		},
		[],
	);

	if (segments.length === 0) return null;

	const scrubSegments = segments.map((seg) => ({
		id: seg.sceneId,
		basis: seg.duration / totalDurationSec,
	}));

	const onHoverChange = (h: ScrubHover | null) => {
		setHover(h);
		if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
		if (!h) {
			setHoverIndex(null);
			setSettledIndex(null);
			return;
		}
		const index = findSegmentIndexAt(segments, h.ratio * totalDurationSec);
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
			value={progress}
			segments={scrubSegments}
			onScrub={(ratio) => {
				if (!player) return;
				player.seekTo(Math.round(ratio * (totalFrames - 1)));
				if (wasPlayingRef.current) silenceMediaIn(player.getContainerNode());
			}}
			onScrubStart={() => {
				if (!player) return;
				wasPlayingRef.current = player.isPlaying();
				if (wasPlayingRef.current) {
					player.pause();
					silenceMediaIn(player.getContainerNode());
				}
			}}
			onScrubEnd={() => {
				if (wasPlayingRef.current) player?.play();
				wasPlayingRef.current = false;
			}}
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
