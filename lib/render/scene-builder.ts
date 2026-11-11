import remove from "lodash/remove";
import { CONTENT_TYPES } from "@/lib/canvas/types";
import {
	DEFAULT_FPS,
	MIN_DURATION_SEC,
	type ResolvedElement,
	type Sequence,
	type RenderLayout,
} from "./types";
import { ASPECT_RATIO_DIMENSIONS } from "../project/aspect-ratio";
import type { VideoSettings } from "../project/video-settings";
import { blankScene } from "./blank-scene";
import { totalDuration } from "./sequences";
import { loopStrideSec } from "./audio-fade";
import { toFrames, toSeconds } from "./frames";
import { transitionOverlapSec } from "./transitions";

export type BuildLayoutOptions = Pick<
	VideoSettings,
	| "transitionType"
	| "aspectRatio"
	| "captions"
	| "captionStyle"
	| "filmGrain"
	| "rgbSplit"
> &
	Partial<Pick<RenderLayout, "fps">>;

// Durations accumulated on the frame grid land a few ULPs above a whole frame.
// Without this slack the total ceils into a trailing frame with no content.
const FRAME_EPSILON = 1e-6;

const sequenceAt = (
	element: ResolvedElement,
	start: number,
	minDuration: number,
): Sequence => ({
	element,
	start,
	duration: element.trimDurationSec,
	minDuration,
});

type SequenceMap = RenderLayout["sequences"];

/**
 * Lays down `element.loops` copies, each `stride` after the last. A stride
 * shorter than the copy overlaps them, which is how a looping effect crossfades
 * across its seam rather than cutting.
 */
function pushSequence(
	sequences: SequenceMap,
	element: ResolvedElement,
	start: number,
	stride: number,
) {
	const list = (sequences[element.type] ??= []);
	for (let i = 0; i < element.loops; i++) {
		list.push(sequenceAt(element, start + i * stride, 0));
	}
}

/** Drops what starts at `cutoff` or later and cuts what runs past it. */
function cutAt(list: Sequence[] = [], cutoff: number) {
	remove(list, ({ start }) => start > cutoff - FRAME_EPSILON);
	for (const sequence of list) {
		if (sequence.start + sequence.duration > cutoff) {
			sequence.duration = cutoff - sequence.start;
			sequence.maxDuration = sequence.duration;
		}
	}
}

function getForegroundCursor(current: Sequence | undefined, cursor: number) {
	return current
		? Math.max(cursor, current.start + totalDuration(current))
		: cursor;
}

const isStill = ({ element }: Sequence) =>
	CONTENT_TYPES[element.type].outputKind === "image";

/**
 * Walks the element list and assembles scenes with these rules:
 *
 *  1. Foreground → starts a new scene.
 *  2. Overlay    → extends the current scene's duration; opens a blank scene if none exists.
 *  3. Background → updates the active background layer for that element type. Exclusive (one at a time per type).
 *  4. Effect     → starts with its visual, or where the speech before it ends; overlaps freely.
 *
 * A scene is a consecutive, blocking sequence containing an element within a series.
 */
export function buildRenderLayout(
	elements: ResolvedElement[],
	{
		transitionType,
		aspectRatio,
		captions,
		captionStyle,
		filmGrain,
		rgbSplit,
		fps = DEFAULT_FPS,
	}: BuildLayoutOptions,
): RenderLayout {
	const config = { fps, ...ASPECT_RATIO_DIMENSIONS[aspectRatio].output };
	// Scenes are laid down one rounded duration at a time while layers are
	// positioned from the accumulated seconds; snapping here keeps them equal.
	const onGrid = (sec: number) =>
		toSeconds(toFrames(sec, config.fps), config.fps);
	const transitionDurationSec = onGrid(transitionOverlapSec(transitionType));
	const series: Sequence[] = [];
	const sequences: SequenceMap = {};
	let cursor = 0;
	let overlaySec = 0;

	for (const raw of elements) {
		const element = {
			...raw,
			trimDurationSec: onGrid(raw.trimDurationSec),
			mediaDurationSec: onGrid(raw.mediaDurationSec),
		};
		const stride = onGrid(loopStrideSec(element));
		let current = series.at(-1);
		const foregroundCursor = getForegroundCursor(current, cursor);

		switch (element.role) {
			case "effect": {
				pushSequence(sequences, element, cursor, stride);
				break;
			}
			case "background": {
				cutAt(sequences[element.type], foregroundCursor);
				pushSequence(sequences, element, foregroundCursor, stride);
				break;
			}
			case "foreground": {
				cursor = foregroundCursor;
				if (series.length > 0) {
					// TransitionSeries overlaps each sequence with the one before it by the transition.
					cursor -= transitionDurationSec;
				}
				series.push(sequenceAt(element, cursor, MIN_DURATION_SEC));
				overlaySec = 0;
				break;
			}
			case "overlay": {
				if (!current) {
					current = sequenceAt(blankScene(element), cursor, MIN_DURATION_SEC);
					series.push(current);
				}
				overlaySec += element.trimDurationSec;
				current.minDuration = Math.max(current.minDuration, overlaySec);
				pushSequence(sequences, element, cursor, stride);
				cursor += element.trimDurationSec;
				break;
			}
		}
	}

	const last = series.at(-1);
	const totalDurationSec = last ? last.start + totalDuration(last) : 0;

	for (const list of Object.values(sequences)) cutAt(list, totalDurationSec);

	// Cosmetic only: draws image clips on the timeline across their whole slot
	for (const still of series.filter(isStill))
		still.duration = totalDuration(still);

	return {
		...config,
		series,
		sequences,
		totalDurationSec,
		totalFrames: Math.max(
			2,
			Math.ceil(totalDurationSec * config.fps - FRAME_EPSILON),
		),
		transitionType,
		transitionDurationSec,
		captions,
		captionStyle,
		filmGrain,
		rgbSplit,
	};
}
