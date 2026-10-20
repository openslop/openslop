import {
	getTimelineDuration,
	getTrimStart,
} from "@/lib/canvas/element-attributes";
import type { ContentElement } from "@/lib/canvas/types";
import type { TextTimestamp } from "@/lib/connectors/types";
import { clamp } from "@/lib/utils";
import { MIN_DURATION_SEC } from "./scene-builder";
import type { ResolvedElement } from "./types";

export type TrimEdge = "start" | "end";

/** Where a clip opens in its media, and how long it plays from there. */
export type Trim = Pick<ResolvedElement, "trimStartSec" | "durationSec">;

type Trimmable = Trim & Pick<ResolvedElement, "mediaDurationSec">;

/** A still has no media length to trim. */
export const isTrimmable = ({
	mediaDurationSec,
}: Pick<ResolvedElement, "mediaDurationSec">): boolean => mediaDurationSec > 0;

export const isTrimmed = ({
	trimStartSec,
	durationSec,
	mediaDurationSec,
}: Trimmable): boolean => trimStartSec > 0 || durationSec < mediaDurationSec;

/** A clip plays from its trim start for its timeline duration, never past the end of its media. */
export function trimClip(
	mediaDurationSec: number,
	startSec: number,
	timelineDurationSec?: number,
): Trim {
	const trimStartSec = clamp(
		startSec,
		0,
		Math.max(0, mediaDurationSec - MIN_DURATION_SEC),
	);
	const remainingSec = mediaDurationSec - trimStartSec;
	return {
		trimStartSec,
		durationSec: Math.min(timelineDurationSec ?? remainingSec, remainingSec),
	};
}

export const elementTrim = (
	element: ContentElement,
	mediaDurationSec: number,
): Trim =>
	trimClip(
		mediaDurationSec,
		getTrimStart(element),
		getTimelineDuration(element),
	);

/** Word timings counted from the trim start, without the words cut before it. */
export const trimTimestamps = (
	timestamps: TextTimestamp[],
	startSec: number,
): TextTimestamp[] =>
	timestamps
		.filter(({ end }) => end > startSec)
		.map((word) => ({
			...word,
			start: word.start - startSec,
			end: word.end - startSec,
		}));

/** The clip's start stays put and what follows ripples; either edge stays within the media. */
export function trimEdge(
	{ trimStartSec, durationSec, mediaDurationSec }: Trimmable,
	edge: TrimEdge,
	deltaSec: number,
): Trim {
	if (edge === "end")
		return {
			trimStartSec,
			durationSec: clamp(
				durationSec + deltaSec,
				MIN_DURATION_SEC,
				Math.max(MIN_DURATION_SEC, mediaDurationSec - trimStartSec),
			),
		};
	const shift = clamp(
		deltaSec,
		-trimStartSec,
		Math.max(0, durationSec - MIN_DURATION_SEC),
	);
	return {
		trimStartSec: trimStartSec + shift,
		durationSec: durationSec - shift,
	};
}
