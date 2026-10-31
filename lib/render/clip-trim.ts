import {
	getTimelineDuration,
	getTrimStart,
} from "@/lib/canvas/element-attributes";
import type { ContentElement } from "@/lib/canvas/types";
import type { Caption } from "@remotion/captions";
import { clamp } from "@/lib/utils";
import { MIN_DURATION_SEC } from "./scene-builder";
import type { ResolvedCaptions, ResolvedElement } from "./types";

export type TrimEdge = "start" | "end";

/** Where a clip opens in its media, and how long it holds the timeline from there. */
export type Trim = Pick<ResolvedElement, "trimStartSec" | "durationSec">;

type Media = Pick<ResolvedElement, "mediaDurationSec">;

type Trimmable = Trim & Media;

/** A still has no media length to trim. */
export const isTrimmable = ({ mediaDurationSec }: Media): boolean =>
	mediaDurationSec > 0;

/** A clip ends with its media; a still holds for as long as it is asked to. */
const longestSec = (clip: Media & Pick<Trim, "trimStartSec">): number =>
	isTrimmable(clip) ? clip.mediaDurationSec - clip.trimStartSec : Infinity;

export const isTrimmed = (clip: Trimmable): boolean =>
	isTrimmable(clip) &&
	(clip.trimStartSec > 0 || clip.durationSec !== clip.mediaDurationSec);

/** How long the media itself plays before the scene loops or freezes it. */
export const playedSec = (clip: Trimmable): number =>
	Math.min(clip.durationSec, longestSec(clip));

/** A clip plays from its trim start for its timeline duration, or to the end of its media by default. */
export function trimClip(
	media: Media,
	startSec: number,
	timelineDurationSec?: number,
): Trim {
	const { mediaDurationSec } = media;
	const trimStartSec = clamp(
		startSec,
		0,
		Math.max(0, mediaDurationSec - MIN_DURATION_SEC),
	);
	return {
		trimStartSec,
		durationSec: Math.min(
			timelineDurationSec ?? mediaDurationSec - trimStartSec,
			longestSec({ ...media, trimStartSec }),
		),
	};
}

export const elementTrim = (
	element: ContentElement,
	mediaDurationSec: number,
): Trim =>
	trimClip(
		{ mediaDurationSec },
		getTrimStart(element),
		getTimelineDuration(element),
	);

/** The words spoken whole inside the clip, timed from its trim start, and where they sit among the element's own. */
export function trimCaptions(
	captions: Caption[],
	{ trimStartSec, durationSec }: Trim,
): ResolvedCaptions {
	const trimStartMs = trimStartSec * 1000;
	const trimEndMs = trimStartMs + durationSec * 1000;
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

/**
 * The clip's start stays put and what follows ripples. The clip holds at least
 * `floorSec` before the drag and after it, so a zero drag is where it rests.
 */
export function trimEdge(
	clip: Trimmable,
	edge: TrimEdge,
	deltaSec: number,
	floorSec = 0,
): Trim {
	const { trimStartSec, mediaDurationSec } = clip;
	const minSec = Math.max(MIN_DURATION_SEC, floorSec);
	const heldSec = Math.max(clip.durationSec, minSec);
	if (edge === "end")
		return {
			trimStartSec,
			durationSec: clamp(
				heldSec + deltaSec,
				minSec,
				Math.max(minSec, longestSec(clip)),
			),
		};
	const shift = clamp(
		deltaSec,
		-trimStartSec,
		Math.max(
			0,
			Math.min(
				mediaDurationSec - trimStartSec - MIN_DURATION_SEC,
				heldSec - minSec,
			),
		),
	);
	return {
		trimStartSec: trimStartSec + shift,
		durationSec: heldSec - shift,
	};
}
