"use client";

import type { PlayerRef } from "@remotion/player";
import { type PointerEvent, useEffect, useRef, useState } from "react";
import type { VideoLayout } from "@/lib/video/types";
import { usePlayerFrame } from "./usePlayerState";
import { SeekTooltip } from "./SeekTooltip";
import { findSegmentIndexAt, type SceneSegment } from "./useSceneSegments";
import { useSeekDrag } from "./useSeekDrag";

const clamp = (n: number, min: number, max: number) =>
	Math.max(min, Math.min(max, n));

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
	const trackRef = useRef<HTMLDivElement>(null);
	const [hover, setHover] = useState<{
		x: number;
		width: number;
		index: number;
	} | null>(null);
	const [settledIndex, setSettledIndex] = useState<number | null>(null);
	const rafRef = useRef<number | null>(null);
	const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const pendingRef = useRef<{ x: number; width: number; index: number } | null>(
		null,
	);

	useEffect(
		() => () => {
			if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
			if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
		},
		[],
	);

	const { totalDurationSec, totalFrames } = layout;

	const ratioFromPointer = (e: PointerEvent<HTMLDivElement>) => {
		const track = trackRef.current;
		if (!track) return null;
		const rect = track.getBoundingClientRect();
		return {
			x: e.clientX - rect.left,
			width: rect.width,
			ratio: clamp((e.clientX - rect.left) / rect.width, 0, 1),
		};
	};

	const seekFromPointer = (e: PointerEvent<HTMLDivElement>) => {
		if (!player) return;
		const p = ratioFromPointer(e);
		if (!p) return;
		player.seekTo(Math.round(p.ratio * (totalFrames - 1)));
	};

	const seekDrag = useSeekDrag(player, seekFromPointer);

	const scheduleHover = (e: PointerEvent<HTMLDivElement>) => {
		const p = ratioFromPointer(e);
		if (!p) return;
		const index = findSegmentIndexAt(segments, p.ratio * totalDurationSec);
		pendingRef.current = { x: p.x, width: p.width, index };
		if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
		settleTimerRef.current = setTimeout(
			() => setSettledIndex(index),
			HOVER_SETTLE_MS,
		);
		if (rafRef.current != null) return;
		rafRef.current = requestAnimationFrame(() => {
			rafRef.current = null;
			if (pendingRef.current) setHover(pendingRef.current);
		});
	};

	if (segments.length === 0) return null;

	const hoverTimeSec = hover ? (hover.x / hover.width) * totalDurationSec : 0;
	const hoverSegment = hover ? segments[hover.index] : null;
	const thumbnailSegment =
		settledIndex != null ? (segments[settledIndex] ?? null) : null;

	return (
		<div
			ref={trackRef}
			className="group relative flex h-5 w-full cursor-pointer items-center"
			style={{ touchAction: "none" }}
			onPointerDown={seekDrag.onPointerDown}
			onPointerMove={(e) => {
				scheduleHover(e);
				seekDrag.onPointerMove(e);
			}}
			onPointerUp={seekDrag.onPointerUp}
			onPointerCancel={seekDrag.onPointerCancel}
			onPointerLeave={() => {
				if (rafRef.current != null) {
					cancelAnimationFrame(rafRef.current);
					rafRef.current = null;
				}
				if (settleTimerRef.current) {
					clearTimeout(settleTimerRef.current);
					settleTimerRef.current = null;
				}
				pendingRef.current = null;
				setHover(null);
				setSettledIndex(null);
			}}
		>
			<div className="flex h-2 w-full gap-[2px]">
				{segments.map((seg) => (
					<div
						key={seg.sceneId}
						className="h-full bg-white/15"
						style={{
							flexBasis: `${(seg.duration / totalDurationSec) * 100}%`,
						}}
					/>
				))}
			</div>
			<SeekProgress player={player} layout={layout} segments={segments} />
			{hover && hoverSegment ? (
				<SeekTooltip
					x={hover.x}
					containerWidth={hover.width}
					timeSec={hoverTimeSec}
					label={hoverSegment.label}
					thumbnail={thumbnailSegment?.thumbnail ?? null}
				/>
			) : null}
		</div>
	);
}

function SeekProgress({
	player,
	layout,
	segments,
}: {
	player: PlayerRef | null;
	layout: VideoLayout;
	segments: SceneSegment[];
}) {
	const frame = usePlayerFrame(player);
	const { fps, totalDurationSec, totalFrames } = layout;
	const currentSec = frame / fps;
	const progress = clamp(frame / Math.max(1, totalFrames - 1), 0, 1);

	return (
		<>
			<div className="pointer-events-none absolute inset-x-0 top-1/2 flex h-2 -translate-y-1/2 gap-[2px]">
				{segments.map((seg) => {
					const fill = clamp((currentSec - seg.start) / seg.duration, 0, 1);
					return (
						<div
							key={seg.sceneId}
							className="h-full overflow-hidden"
							style={{
								flexBasis: `${(seg.duration / totalDurationSec) * 100}%`,
							}}
						>
							<div
								className="h-full bg-violet-500"
								style={{ width: `${fill * 100}%` }}
							/>
						</div>
					);
				})}
			</div>
			<div
				className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.6)] ring-2 ring-white/20"
				style={{ left: `${progress * 100}%` }}
			/>
		</>
	);
}
