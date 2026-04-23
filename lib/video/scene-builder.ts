import type {
	ResolvedElement,
	Sequence,
	VideoConfig,
	VideoLayout,
} from "./types";
import { DEFAULT_CONFIG } from "./types";

const MIN_DURATION_SEC = 1;

function createSequence(
	element: ResolvedElement | null,
	start: number,
	duration: number,
): Sequence {
	return { element, start, duration: Math.max(duration, MIN_DURATION_SEC) };
}

function pushSequence(
	sequences: Record<string, Sequence[]>,
	element: ResolvedElement,
	start: number,
) {
	(sequences[element.type] ??= []).push(
		createSequence(element, start, element.durationSec),
	);
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
	config?: Partial<VideoConfig>,
): VideoLayout {
	const cfg = { ...DEFAULT_CONFIG, ...config };
	const series: Sequence[] = [];
	const sequences: Record<string, Sequence[]> = {};
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
				const prev = sequences[element.type]?.at(-1);
				if (prev) {
					prev.duration = Math.min(
						prev.duration,
						foregroundCursor - prev.start,
					);
					if (prev.duration === 0) {
						sequences[element.type]?.pop();
					}
				}
				pushSequence(sequences, element, foregroundCursor);
				break;
			}
			case "foreground": {
				if (current && !current.element) {
					current.element = element;
					current.duration = Math.max(current.duration, element.durationSec);
				} else {
					cursor = foregroundCursor;
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

	return {
		...cfg,
		series,
		sequences,
		totalDurationSec,
		totalFrames: Math.max(2, Math.ceil(totalDurationSec * cfg.fps)),
	};
}
