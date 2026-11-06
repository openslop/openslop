import { getTrimEnd, getTrimStart } from "@/lib/canvas/element-attributes";
import type { ContentElement } from "@/lib/canvas/types";
import type { Caption } from "@remotion/captions";
import { clamp } from "@/lib/utils";
import { MIN_DURATION_SEC } from "./scene-builder";
import type { ResolvedCaptions, ResolvedElement, Sequence } from "./types";

export type TrimEdge = "start" | "end";

/** Where a clip opens in its media, and how long it runs on the timeline from there. */
export type Trim = Pick<ResolvedElement, "trimStartSec" | "trimDurationSec">;

/** A still has no media length to trim. */
export const isTrimmable = (element: ResolvedElement): boolean =>
	element.mediaDurationSec > 0;

export const isTrimmed = (
	element: Pick<ResolvedElement, "trimDurationSec" | "mediaDurationSec">,
): boolean => element.trimDurationSec < element.mediaDurationSec;

/** The shortest a trim leaves a clip: the minimum, or the whole of media shorter than that. */
const minTrimSec = (mediaDurationSec: number) =>
	Math.min(MIN_DURATION_SEC, mediaDurationSec);

/** A clip plays from its in-point to its out-point, or to the end of its media by default. */
export function trimClip(
	mediaDurationSec: number,
	startSec: number,
	endSec?: number,
): Trim {
	const minSec = minTrimSec(mediaDurationSec);
	const trimStartSec = clamp(startSec, 0, mediaDurationSec - minSec);
	const trimEndSec = clamp(
		endSec ?? mediaDurationSec,
		trimStartSec + minSec,
		mediaDurationSec,
	);
	return { trimStartSec, trimDurationSec: trimEndSec - trimStartSec };
}

export const elementTrim = (
	element: ContentElement,
	mediaDurationSec: number,
): Trim =>
	trimClip(mediaDurationSec, getTrimStart(element), getTrimEnd(element));

type LaidOutClip = Pick<Sequence, "element" | "duration">;

/** The element as drawn: a still fills its span, and one the layout stops short of its trim, as music stops where the next begins, runs only as far as it's drawn. */
export const laidOut = ({
	element,
	duration,
}: LaidOutClip): ResolvedElement => ({
	...element,
	trimDurationSec: isTrimmable(element)
		? Math.min(element.trimDurationSec, duration)
		: duration,
});

/** The words spoken whole inside the clip, timed from its trim start, and where they sit among the element's own. */
export function trimCaptions(
	captions: Caption[],
	{ trimStartSec, trimDurationSec }: Trim,
): ResolvedCaptions {
	const trimStartMs = trimStartSec * 1000;
	const trimEndMs = trimStartMs + trimDurationSec * 1000;
	const start = captions.filter(
		(caption) => caption.startMs < trimStartMs,
	).length;
	const end = captions.filter((caption) => caption.endMs <= trimEndMs).length;
	return {
		trimIndexOffset: start,
		words: captions.slice(start, end).map((caption) => ({
			...caption,
			startMs: caption.startMs - trimStartMs,
			endMs: caption.endMs - trimStartMs,
		})),
	};
}

/** One edge moves, inside the media and the minimum from the other; a clip the layout cuts short stays cut. */
export function trimEdge(
	clip: LaidOutClip,
	edge: TrimEdge,
	deltaSec: number,
): Trim {
	const { trimStartSec, trimDurationSec, mediaDurationSec } = clip.element;
	const maxSec = mediaDurationSec - trimStartSec;
	const minSec = minTrimSec(mediaDurationSec);
	const drawnSec = laidOut(clip).trimDurationSec;
	const fit = (sec: number) =>
		drawnSec < trimDurationSec ? Math.min(sec, drawnSec) : sec;
	if (edge === "end")
		return {
			trimStartSec,
			trimDurationSec: fit(clamp(drawnSec + deltaSec, minSec, maxSec)),
		};
	const shift = clamp(
		deltaSec,
		-trimStartSec,
		Math.max(0, trimDurationSec - minSec),
	);
	return {
		trimStartSec: trimStartSec + shift,
		trimDurationSec: fit(trimDurationSec - shift),
	};
}

export const trimPointSec = (
	{ trimStartSec, trimDurationSec }: Trim,
	edge: TrimEdge,
): number => (edge === "start" ? trimStartSec : trimStartSec + trimDurationSec);

export const extensionSec = (
	{ overlaySec = 0 }: Pick<Sequence, "overlaySec">,
	trim: Trim,
): number => Math.max(0, overlaySec - trim.trimDurationSec);
