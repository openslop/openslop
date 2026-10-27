import {
	getTimelineDuration,
	getTrimStart,
} from "@/lib/canvas/element-attributes";
import { CONTENT_TYPES, type ContentElement } from "@/lib/canvas/types";
import type { Caption } from "@remotion/captions";
import { clamp } from "@/lib/utils";
import { MIN_DURATION_SEC } from "./scene-builder";
import type { ResolvedElement } from "./types";

export type TrimEdge = "start" | "end";

/** Where a clip opens in its media, and how long it holds the timeline from there. */
export type Trim = Pick<ResolvedElement, "trimStartSec" | "durationSec">;

type Media = Pick<ResolvedElement, "mediaDurationSec">;

type Trimmable = Trim & Media & Pick<ResolvedElement, "layer">;

/** A visual outlasts its media by looping or freezing; audio ends with it. */
const longestSec = ({
	layer,
	mediaDurationSec,
	trimStartSec,
}: Omit<Trimmable, "durationSec">) =>
	layer === "visual" ? Infinity : mediaDurationSec - trimStartSec;

/** A still has no media length to trim. */
export const isTrimmable = ({ mediaDurationSec }: Media): boolean =>
	mediaDurationSec > 0;

export const isTrimmed = (clip: Trim & Media): boolean =>
	isTrimmable(clip) &&
	(clip.trimStartSec > 0 || clip.durationSec !== clip.mediaDurationSec);

/** How long the media itself plays before the clip loops or freezes. */
export const playedSec = ({
	trimStartSec,
	durationSec,
	mediaDurationSec,
}: Trim & Media): number =>
	Math.min(durationSec, mediaDurationSec - trimStartSec);

/** A clip plays from its trim start for its timeline duration, or to the end of its media by default. */
export function trimClip(
	media: Omit<Trimmable, keyof Trim>,
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
		{ layer: CONTENT_TYPES[element.type].layer, mediaDurationSec },
		getTrimStart(element),
		getTimelineDuration(element),
	);

/** Caption timings counted from the trim start, keeping only the words spoken whole inside the clip. */
export function trimTimestamps(
	captions: Caption[],
	{ trimStartSec, durationSec }: Trim,
): Caption[] {
	const startMs = trimStartSec * 1000;
	const endMs = startMs + durationSec * 1000;
	return captions
		.filter((caption) => caption.startMs >= startMs && caption.endMs <= endMs)
		.map((caption) => ({
			...caption,
			startMs: caption.startMs - startMs,
			endMs: caption.endMs - startMs,
		}));
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
