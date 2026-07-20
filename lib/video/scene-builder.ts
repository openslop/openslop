import type { CanvasElementType } from "@/lib/canvas/types";
import type {
	ResolvedElement,
	Sequence,
	VideoConfig,
	VideoLayout,
} from "./types";
import { DEFAULT_CONFIG } from "./types";
import { type AspectRatio, ASPECT_RATIO_DIMENSIONS } from "./aspectRatio";
import {
	DEFAULT_TRANSITION,
	TRANSITION_DURATION_SEC,
	type TransitionType,
} from "./transitions";

export type BuildLayoutOptions = Partial<VideoConfig> & {
	transitionType?: TransitionType;
	aspectRatio?: AspectRatio;
};

const MIN_DURATION_SEC = 1;

function createSequence(
	element: ResolvedElement | null,
	start: number,
	duration: number,
): Sequence {
	return { element, start, duration: Math.max(duration, MIN_DURATION_SEC) };
}

type SequenceMap = Partial<Record<CanvasElementType, Sequence[]>>;

function pushSequence(
	sequences: SequenceMap,
	element: ResolvedElement,
	start: number,
) {
	const list = (sequences[element.type] ??= []);
	for (let i = 0; i < element.loops; i++) {
		list.push(
			createSequence(
				element,
				start + i * element.durationSec,
				element.durationSec,
			),
		);
	}
}

function trimSequencesAt(list: Sequence[] | undefined, cutoff: number) {
	if (!list) return;
	while (list.length > 0) {
		const last = list[list.length - 1];
		if (last.start >= cutoff) {
			list.pop();
			continue;
		}
		last.duration = Math.min(last.duration, cutoff - last.start);
		return;
	}
}

function getForegroundCursor(current: Sequence | undefined, cursor: number) {
	return current ? Math.max(cursor, current.start + current.duration) : cursor;
}

/**
 * Walks the element list and assembles scenes with these rules:
 *
 *  1. Foreground → starts a new scene (or fills the current placeholder).
 *  2. Overlay    → extends the current scene's duration; creates a placeholder if none exists.
 *  3. Background → updates the active background layer for that element type. Exclusive (one at a time per type).
 *  4. Effect     → same as background but additive (can overlap).
 *
 * A scene is a consecutive, blocking sequence containing an element within a series.
 */
export function buildVideoLayout(
	elements: ResolvedElement[],
	options?: BuildLayoutOptions,
): VideoLayout {
	const aspectDims = options?.aspectRatio
		? ASPECT_RATIO_DIMENSIONS[options.aspectRatio].output
		: undefined;
	const cfg = { ...DEFAULT_CONFIG, ...aspectDims, ...options };
	const transitionType = options?.transitionType ?? DEFAULT_TRANSITION;
	const series: Sequence[] = [];
	const sequences: SequenceMap = {};
	let cursor = 0;

	for (const element of elements) {
		const current = series.at(-1);
		const foregroundCursor = getForegroundCursor(current, cursor);

		switch (element.role) {
			case "effect": {
				pushSequence(sequences, element, cursor);
				break;
			}
			case "background": {
				trimSequencesAt(sequences[element.type], foregroundCursor);
				pushSequence(sequences, element, foregroundCursor);
				break;
			}
			case "foreground": {
				if (current && !current.element) {
					current.element = element;
					current.duration = Math.max(current.duration, element.durationSec);
				} else {
					cursor = foregroundCursor;
					if (series.length > 0) {
						// TransitionSeries.Sequence overlap the previous
						// ones by TRANSITION_DURATION_SEC. Bake that into the cursor so every
						// subsequent overlay/background/effect lands on the rendered timeline.
						cursor -= TRANSITION_DURATION_SEC;
					}
					series.push(createSequence(element, cursor, element.durationSec));
				}
				break;
			}
			case "overlay": {
				if (!current) {
					series.push(createSequence(null, cursor, element.durationSec));
				} else {
					current.duration = Math.max(
						current.duration,
						cursor + element.durationSec - current.start,
					);
				}
				pushSequence(sequences, element, cursor);
				cursor += element.durationSec;
				break;
			}
		}
	}

	const lastEntry = series.at(-1);
	const totalDurationSec = lastEntry ? lastEntry.start + lastEntry.duration : 0;

	for (const seqs of Object.values(sequences)) {
		for (const seq of seqs) {
			const end = seq.start + seq.duration;
			if (end > totalDurationSec) {
				seq.duration = Math.max(MIN_DURATION_SEC, totalDurationSec - seq.start);
			}
		}
	}

	const sequenceByElementId = new Map<string, Sequence>();
	for (const seq of series) {
		if (seq.element) sequenceByElementId.set(seq.element.id, seq);
	}

	return {
		...cfg,
		series,
		sequences,
		sequenceByElementId,
		totalDurationSec,
		totalFrames: Math.max(2, Math.ceil(totalDurationSec * cfg.fps)),
		transitionType,
		transitionDurationSec: TRANSITION_DURATION_SEC,
	};
}
