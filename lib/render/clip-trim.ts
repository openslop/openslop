import {
	getTimelineDuration,
	getTrimStart,
} from "@/lib/canvas/element-attributes";
import type { ContentElement } from "@/lib/canvas/types";
import type { Caption } from "@remotion/captions";
import { clamp } from "@/lib/utils";
import { MIN_DURATION_SEC, sceneDurationSec } from "./scene-builder";
import type { ResolvedCaptions, ResolvedElement, Sequence } from "./types";

export type TrimEdge = "start" | "end";

/** Where a clip opens in its media, and how long it runs on the timeline from there. */
export type Trim = Pick<
	ResolvedElement,
	"trimStartSec" | "timelineDurationSec"
>;

/** A clip runs out at the end of its media; a still, having none, never does. */
const maxTimelineDurationSec = (
	mediaDurationSec: number,
	trimStartSec: number,
) => (mediaDurationSec > 0 ? mediaDurationSec - trimStartSec : Infinity);

/** A still has no media length to trim. */
export const isTrimmable = (element: ResolvedElement): boolean =>
	element.mediaDurationSec > 0;

export const isTrimmed = (element: ResolvedElement): boolean =>
	element.timelineDurationSec < element.mediaDurationSec;

/** A clip plays from its trim start for its timeline duration, or to the end of its media by default. */
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
	return {
		trimStartSec,
		timelineDurationSec: Math.min(
			timelineDurationSec ?? mediaDurationSec - trimStartSec,
			maxTimelineDurationSec(mediaDurationSec, trimStartSec),
		),
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

/** The words spoken whole inside the clip, timed from its trim start, and where they sit among the element's own. */
export function trimCaptions(
	captions: Caption[],
	{ trimStartSec, timelineDurationSec }: Trim,
): ResolvedCaptions {
	const trimStartMs = trimStartSec * 1000;
	const trimEndMs = trimStartMs + timelineDurationSec * 1000;
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

/** The clip's start stays put and what follows ripples; it never runs under the minimum or past its media. */
export function trimEdge(
	element: ResolvedElement,
	edge: TrimEdge,
	deltaSec: number,
): Trim {
	const { trimStartSec, timelineDurationSec, mediaDurationSec } = element;
	const maxSec = maxTimelineDurationSec(mediaDurationSec, trimStartSec);
	const minSec = Math.min(MIN_DURATION_SEC, maxSec);
	if (edge === "end")
		return {
			trimStartSec,
			timelineDurationSec: clamp(
				timelineDurationSec + deltaSec,
				minSec,
				maxSec,
			),
		};
	const shift = clamp(
		deltaSec,
		-trimStartSec,
		Math.max(0, timelineDurationSec - minSec),
	);
	return {
		trimStartSec: trimStartSec + shift,
		timelineDurationSec: timelineDurationSec - shift,
	};
}

/** A clip previews the span the layout gives it, less any cross-fade; a scene extends past a video that runs out inside it. */
export function previewSpan(
	element: ResolvedElement,
	{ duration, overlaySec }: Pick<Sequence, "duration" | "overlaySec">,
	trim: Trim,
) {
	const deltaSec = trim.timelineDurationSec - element.timelineDurationSec;
	if (overlaySec === undefined)
		return { timelineDurationSec: duration + deltaSec, extensionSec: 0 };
	const spanSec =
		duration +
		sceneDurationSec(trim.timelineDurationSec, overlaySec) -
		sceneDurationSec(element.timelineDurationSec, overlaySec);
	const timelineDurationSec = isTrimmable(element)
		? Math.min(trim.timelineDurationSec, spanSec)
		: spanSec;
	return { timelineDurationSec, extensionSec: spanSec - timelineDurationSec };
}
