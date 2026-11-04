import {
	getTimelineDuration,
	getTrimStart,
} from "@/lib/canvas/element-attributes";
import type { ContentElement } from "@/lib/canvas/types";
import type { Caption } from "@remotion/captions";
import { clamp } from "@/lib/utils";
import { MIN_DURATION_SEC } from "./scene-builder";
import type { ResolvedCaptions, ResolvedElement, Sequence } from "./types";

export type TrimEdge = "start" | "end";

/** Where a clip opens in its media, and how long it runs on the timeline from there. */
export type Trim = Pick<
	ResolvedElement,
	"trimStartSec" | "timelineDurationSec"
>;

type Media = Pick<ResolvedElement, "originalDurationSec">;

type Trimmable = Trim & Media;

/** A still has no media length to trim. */
export const isTrimmable = ({ originalDurationSec }: Media): boolean =>
	originalDurationSec > 0;

/** A clip runs out at the end of its media; a still never does. */
const maxTimelineDurationSec = (
	clip: Media & Pick<Trim, "trimStartSec">,
): number =>
	isTrimmable(clip) ? clip.originalDurationSec - clip.trimStartSec : Infinity;

export const isTrimmed = (clip: Trimmable): boolean =>
	isTrimmable(clip) &&
	(clip.trimStartSec > 0 ||
		clip.timelineDurationSec !== clip.originalDurationSec);

/** A clip plays from its trim start for its timeline duration, or to the end of its media by default. */
export function trimClip(
	media: Media,
	startSec: number,
	timelineDurationSec?: number,
): Trim {
	const { originalDurationSec } = media;
	const trimStartSec = clamp(
		startSec,
		0,
		Math.max(0, originalDurationSec - MIN_DURATION_SEC),
	);
	return {
		trimStartSec,
		timelineDurationSec: Math.min(
			timelineDurationSec ?? originalDurationSec - trimStartSec,
			maxTimelineDurationSec({ ...media, trimStartSec }),
		),
	};
}

export const elementTrim = (
	element: ContentElement,
	originalDurationSec: number,
): Trim =>
	trimClip(
		{ originalDurationSec },
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
	clip: Trimmable,
	edge: TrimEdge,
	deltaSec: number,
): Trim {
	const { trimStartSec, timelineDurationSec } = clip;
	if (edge === "end")
		return {
			trimStartSec,
			timelineDurationSec: clamp(
				timelineDurationSec + deltaSec,
				MIN_DURATION_SEC,
				Math.max(MIN_DURATION_SEC, maxTimelineDurationSec(clip)),
			),
		};
	const shift = clamp(
		deltaSec,
		-trimStartSec,
		Math.max(0, timelineDurationSec - MIN_DURATION_SEC),
	);
	return {
		trimStartSec: trimStartSec + shift,
		timelineDurationSec: timelineDurationSec - shift,
	};
}

/** How a clip's footage and the scene's extension past it split its span. */
type Span = { timelineDurationSec: number; extensionSec: number };

/**
 * A scene runs as long as its video or its dialogue, whichever is longer, less
 * any cross-fade; the video covers what it can and the scene extends past it.
 */
export function previewSpan(
	media: Media,
	{ duration, overlaySec = 0 }: Pick<Sequence, "duration" | "overlaySec">,
	resting: Trim,
	trim: Trim,
): Span {
	const sceneSec = (sec: number) => Math.max(sec, overlaySec);
	const spanSec =
		duration +
		sceneSec(trim.timelineDurationSec) -
		sceneSec(resting.timelineDurationSec);
	const timelineDurationSec = isTrimmable(media)
		? Math.min(trim.timelineDurationSec, spanSec)
		: spanSec;
	return { timelineDurationSec, extensionSec: spanSec - timelineDurationSec };
}
