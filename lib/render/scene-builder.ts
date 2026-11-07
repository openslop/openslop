import sortBy from "lodash/sortBy";
import uniqBy from "lodash/uniqBy";
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
		list.push(
			createSequence(element, start + i * stride, element.trimDurationSec),
		);
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

/** A scene opens on its first visual, whatever the canvas lists before it. */
function visualsFirst(elements: ResolvedElement[]): ResolvedElement[] {
	const openers = new Set(
		uniqBy(
			elements.filter((element) => element.role === "foreground"),
			"sceneId",
		),
	);
	return sortBy(elements, [
		"sceneNumber",
		(element) => (openers.has(element) ? 0 : 1),
	]);
}

/**
 * Walks each scene's elements and assembles the timeline with these rules,
 * never letting one scene's elements land in another:
 *
 *  1. Foreground → starts a new shot.
 *  2. Overlay    → extends the scene's current shot; a scene with no visual opens on a blank one.
 *  3. Background → starts with the scene's current shot. Exclusive (one at a time per type).
 *  4. Effect     → plays at the cursor, additive (can overlap).
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

	const open = (element: ResolvedElement): SceneSequence => {
		const previous = series.at(-1);
		// TransitionSeries overlaps each scene with the one before by the transition,
		// so every layer after it lands on the rendered timeline.
		cursor =
			getForegroundCursor(previous, cursor) -
			(previous ? transitionDurationSec : 0);
		const scene = {
			...createSequence(element, cursor, element.trimDurationSec),
			overlaySec: 0,
		};
		series.push(scene);
		return scene;
	};

	for (const raw of visualsFirst(elements)) {
		const element = {
			...raw,
			trimDurationSec: onGrid(raw.trimDurationSec),
			mediaDurationSec: onGrid(raw.mediaDurationSec),
		};
		const stride = onGrid(loopStrideSec(element));
		const current = series.at(-1);
		const shot =
			current?.element.sceneId === element.sceneId ? current : undefined;

		switch (element.role) {
			case "effect": {
				pushSequence(sequences, element, cursor, stride);
				break;
			}
			case "background": {
				const start = shot ? shot.start : getForegroundCursor(current, cursor);
				trimSequencesAt(sequences[element.type], start);
				pushSequence(sequences, element, start, stride);
				break;
			}
			case "foreground": {
				open(element);
				break;
			}
			case "overlay": {
				const scene = shot ?? open(blankScene(element));
				scene.overlaySec += element.trimDurationSec;
				scene.duration = Math.max(scene.duration, scene.overlaySec);
				pushSequence(sequences, element, cursor, stride);
				cursor += element.trimDurationSec;
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
