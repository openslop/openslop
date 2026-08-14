"use client";

import { useMemo, type CSSProperties, type PointerEvent } from "react";
import { formatTime } from "@/lib/video/timestamps";
import { cn } from "@/lib/utils";
import { buildTicks, subdivision, tickInterval } from "./timelineTicks";

export const RULER_HEIGHT = "h-7";
/** Shared so a readout can line up with the ticks. */
export const RULER_LABEL =
	"font-mono text-label tabular-nums text-muted-foreground";
export const RULER_LABEL_OFFSET = "top-3.5 -translate-y-1/2";

const dots = (spacing: number): CSSProperties => ({
	backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
	backgroundSize: `${spacing}px 100%`,
	backgroundPosition: "0 center",
});

/**
 * Timecode ruler doubling as a scrub surface. Pointer-only by design: the
 * transport bar's seek slider above is the keyboard-accessible equivalent.
 */
export function TimelineRuler({
	totalDurationSec,
	pxPerSec,
	onScrub,
	onScrubStart,
	onScrubEnd,
}: {
	totalDurationSec: number;
	pxPerSec: number;
	onScrub: (seconds: number) => void;
	onScrubStart: () => void;
	onScrubEnd: () => void;
}) {
	const { ticks, spacing } = useMemo(() => {
		const interval = tickInterval(pxPerSec);
		return {
			ticks: buildTicks(totalDurationSec, interval),
			spacing: subdivision(interval * pxPerSec),
		};
	}, [totalDurationSec, pxPerSec]);

	const scrubFrom = (event: PointerEvent<HTMLDivElement>) => {
		const rect = event.currentTarget.getBoundingClientRect();
		onScrub((event.clientX - rect.left) / pxPerSec);
	};

	const endScrub = (event: PointerEvent<HTMLDivElement>) => {
		if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
		event.currentTarget.releasePointerCapture(event.pointerId);
		onScrubEnd();
	};

	return (
		<div
			role="presentation"
			className={`relative shrink-0 cursor-pointer select-none text-border ${RULER_HEIGHT}`}
			style={{ touchAction: "none", ...dots(spacing) }}
			onPointerDown={(event) => {
				if (event.button !== 0) return;
				event.currentTarget.setPointerCapture(event.pointerId);
				onScrubStart();
				scrubFrom(event);
			}}
			onPointerMove={(event) => {
				if (event.currentTarget.hasPointerCapture(event.pointerId))
					scrubFrom(event);
			}}
			onPointerUp={endScrub}
			onPointerCancel={endScrub}
		>
			{ticks.map((seconds, index) => (
				<span
					key={seconds}
					aria-hidden="true"
					className={cn("absolute top-1/2 px-2", RULER_LABEL)}
					style={{
						left: seconds * pxPerSec,
						transform:
							index === 0 ? "translateY(-50%)" : "translate(-50%, -50%)",
					}}
				>
					{formatTime(seconds)}
				</span>
			))}
		</div>
	);
}
