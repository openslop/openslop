import {
	DEFAULT_FPS,
	type ResolvedElement,
	type Sequence,
	type RenderLayout,
} from "./types";
import { ASPECT_RATIO_DIMENSIONS } from "../project/aspect-ratio";
import type { VideoSettings } from "../project/video-settings";
import { blankScene } from "./blank-scene";
import { loopStrideSec } from "./audio-fade";
import { toFrames, toSeconds } from "./frames";
import { transitionOverlapSec } from "./transitions";

export type BuildLayoutOptions = Pick<
	VideoSettings,
	"transitionType" | "aspectRatio" | "captionStyle" | "filmGrain" | "rgbSplit"
> &
	Partial<Pick<RenderLayout, "fps">>;

/** No sequence is ever shorter than this, however little content it holds. */
export const MIN_DURATION_SEC = 1;
// Durations accumulated on the frame grid land a few ULPs above a whole frame.
// Without this slack the total ceils into a trailing frame with no content.
const FRAME_EPSILON = 1e-6;

function createSequence(
	element: ResolvedElement,
	start: number,
	duration: number,
): Sequence {
	return { element, start, duration: Math.max(duration, MIN_DURATION_SEC) };
}

type SequenceMap = RenderLayout["sequences"];

type SceneSequence = Sequence & { overlaySec: number };

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
		list.push(createSequence(element, start + i * stride, element.durationSec));
	}
}

function trimSequencesAt(list: Sequence[] | undefined, cutoff: number) {
	if (!list) return;
	while (list.length > 0 && list[list.length - 1].start >= cutoff) list.pop();
	const last = list.at(-1);
	if (last) last.duration = Math.min(last.duration, cutoff - last.start);
}

function getForegroundCursor(current: Sequence | undefined, cursor: number) {
	return current ? Math.max(cursor, current.start + current.duration) : cursor;
}

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
	const series: SceneSequence[] = [];
	const sequences: SequenceMap = {};
	let cursor = 0;

	for (const raw of elements) {
		const element = {
			...raw,
			durationSec: onGrid(raw.durationSec),
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
				series.push({
					...createSequence(element, cursor, element.durationSec),
					overlaySec: 0,
				});
				break;
			}
			case "overlay": {
				if (!current) {
					series.push({
						...createSequence(blankScene(element), cursor, element.durationSec),
						overlaySec: element.durationSec,
					});
				} else {
					current.overlaySec += element.durationSec;
					current.duration = Math.max(current.duration, current.overlaySec);
				}
				pushSequence(sequences, element, cursor, stride);
				cursor += element.durationSec;
				break;
			}
		}
	}

	const last = series.at(-1);
	const totalDurationSec = last ? last.start + last.duration : 0;

	for (const sequence of Object.values(sequences).flat()) {
		const { start } = sequence;
		if (start + sequence.duration > totalDurationSec) {
			sequence.duration = Math.max(MIN_DURATION_SEC, totalDurationSec - start);
		}
	}

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
		captionStyle,
		filmGrain,
		rgbSplit,
	};
}
