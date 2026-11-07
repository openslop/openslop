import mapValues from "lodash/mapValues";
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
import { isTrimmable } from "./clip-trim";
import { totalDuration } from "./sequences";
import { loopStrideSec } from "./audio-fade";
import { toFrames, toSeconds } from "./frames";
import { transitionOverlapSec } from "./transitions";

export type BuildLayoutOptions = Pick<
	VideoSettings,
	"transitionType" | "aspectRatio" | "captionStyle" | "filmGrain" | "rgbSplit"
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

const cutAt = (sequence: Sequence, cutoff: number): Sequence => ({
	...sequence,
	duration: Math.min(sequence.duration, cutoff - sequence.start),
	maxDuration: cutoff - sequence.start,
});

function trimSequencesAt(list: Sequence[] | undefined, cutoff: number) {
	if (!list) return;
	while (list.length > 0 && list[list.length - 1].start >= cutoff) list.pop();
	const last = list.at(-1);
	if (last) list[list.length - 1] = cutAt(last, cutoff);
}

function getForegroundCursor(current: Sequence | undefined, cursor: number) {
	return current
		? Math.max(cursor, current.start + totalDuration(current))
		: cursor;
}

/** A still has no length of its own, so it plays for its whole slot. */
const fillStill = (scene: Sequence): Sequence =>
	isTrimmable(scene.element)
		? scene
		: { ...scene, duration: totalDuration(scene) };

/** Layers stop with the video. */
const cutToVideo = (sequences: SequenceMap, totalDurationSec: number) =>
	mapValues(sequences, (list = []) =>
		list
			.filter(({ start }) => start < totalDurationSec - FRAME_EPSILON)
			.map((sequence) =>
				sequence.start + sequence.duration > totalDurationSec
					? cutAt(sequence, totalDurationSec)
					: sequence,
			),
	);

/**
 * Walks the element list and assembles scenes with these rules:
 *
 *  1. Foreground → starts a new scene.
 *  2. Overlay    → extends the current scene's duration; opens a blank scene if none exists.
 *  3. Background → updates the active background layer for that element type. Exclusive (one at a time per type).
 *  4. Effect     → same as background but additive (can overlap).
 *
 * A scene is a consecutive, blocking sequence containing an element within a series.
 */
export function buildRenderLayout(
	elements: ResolvedElement[],
	{
		transitionType,
		aspectRatio,
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
		const current = series.at(-1);
		const foregroundCursor = getForegroundCursor(current, cursor);

		switch (element.role) {
			case "effect": {
				pushSequence(sequences, element, cursor, stride);
				break;
			}
			case "background": {
				trimSequencesAt(sequences[element.type], foregroundCursor);
				pushSequence(sequences, element, foregroundCursor, stride);
				break;
			}
			case "foreground": {
				cursor = foregroundCursor;
				if (series.length > 0) {
					// TransitionSeries.Sequence overlap the previous
					// ones by transitionDurationSec. Bake that into the cursor so every
					// subsequent overlay/background/effect lands on the rendered timeline.
					cursor -= transitionDurationSec;
				}
				series.push(sequenceAt(element, cursor, MIN_DURATION_SEC));
				overlaySec = 0;
				break;
			}
			case "overlay": {
				const scene =
					current ?? sequenceAt(blankScene(element), cursor, MIN_DURATION_SEC);
				if (!current) series.push(scene);
				overlaySec += element.trimDurationSec;
				scene.minDuration = Math.max(scene.minDuration, overlaySec);
				pushSequence(sequences, element, cursor, stride);
				cursor += element.trimDurationSec;
				break;
			}
		}
	}

	const last = series.at(-1);
	const totalDurationSec = last ? last.start + totalDuration(last) : 0;

	return {
		...config,
		series: series.map(fillStill),
		sequences: cutToVideo(sequences, totalDurationSec),
		totalDurationSec,
		totalFrames: Math.max(
			2,
			Math.ceil(totalDurationSec * config.fps - FRAME_EPSILON),
		),
		transitionType,
		transitionDurationSec,
		captionStyle,
		filmGrain,
		rgbSplit,
	};
}
