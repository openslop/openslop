"use client";

import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { loadPeaks } from "@/lib/components/peaks";
import {
	buildSoundwaveMask,
	SOUNDWAVE_MASK_STYLE,
	toBarHeights,
} from "@/lib/components/soundwave";
import { clamp, cn } from "@/lib/utils";

const SAMPLE_SPACING_PX = 2;
/** Sample counts snap to this so a resize doesn't rebuild the mask per pixel. */
const SAMPLE_QUANTUM = 16;
// Past the count `loadPeaks` extracts, more samples only repeat themselves.
const SAMPLE_RANGE = { min: 8, max: 200 };

type Decode =
	| { status: "loading" }
	| { status: "ready"; peaks: number[] }
	| { status: "failed" };

/** Keyed on the source it settled for, so a clip whose asset changed never keeps painting the old one. */
function usePeaks(src: string): Decode {
	const [settled, setSettled] = useState<{ src: string; decode: Decode }>();

	useEffect(() => {
		let cancelled = false;
		loadPeaks(src)
			.then((peaks) => {
				if (!cancelled) setSettled({ src, decode: { status: "ready", peaks } });
			})
			.catch((error) => {
				console.error("Failed to decode audio:", error);
				if (!cancelled) setSettled({ src, decode: { status: "failed" } });
			});
		return () => {
			cancelled = true;
		};
	}, [src]);

	return settled?.src === src ? settled.decode : { status: "loading" };
}

/**
 * The clip's audio as a mask-painted envelope, so it takes its colour from the
 * surrounding text token rather than from a canvas fill.
 */
export function ClipWaveform({
	src,
	width,
	className,
}: {
	src: string;
	width: number;
	className?: string;
}) {
	const decode = usePeaks(src);
	const sampleCount = clamp(
		Math.round(width / SAMPLE_SPACING_PX / SAMPLE_QUANTUM) * SAMPLE_QUANTUM,
		SAMPLE_RANGE.min,
		SAMPLE_RANGE.max,
	);

	const peaks = decode.status === "ready" ? decode.peaks : null;
	const style = useMemo(() => {
		if (!peaks) return null;
		const mask = buildSoundwaveMask(toBarHeights(peaks, sampleCount));
		return {
			...SOUNDWAVE_MASK_STYLE,
			maskImage: mask,
			WebkitMaskImage: mask,
		};
	}, [peaks, sampleCount]);

	// A failed decode stops shimmering: the clip is there, its audio is not.
	if (decode.status === "failed")
		return (
			<div className={cn("flex items-center", className)}>
				<div className="h-px w-full bg-current opacity-40" />
			</div>
		);
	if (!style) return <Skeleton className={cn("rounded-xs", className)} />;
	return <div className={cn("bg-current", className)} style={style} />;
}
