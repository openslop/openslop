import minBy from "lodash/minBy";
import { laidOut, trimEdge, type Trim, type TrimEdge } from "./clip-trim";
import type { Sequence } from "./types";

// A trim that lands on its target comes back a few ULPs off it.
const EPSILON_SEC = 1e-6;

/** The nearest target within reach of the time, or null when none is. */
export function snapTarget(
	sec: number,
	targets: readonly number[],
	thresholdSec: number,
): number | null {
	const nearest =
		minBy(targets, (target) => Math.abs(target - sec)) ?? Infinity;
	return Math.abs(nearest - sec) <= thresholdSec ? nearest : null;
}

type SnappedTrim = { trim: Trim; snappedSec: number | null };

type Clip = Pick<Sequence, "element" | "start">;

/** Where the handle sits on the timeline: the end handle moves the end, the start handle cuts the in-point from where the clip starts. */
const edgeSec = ({ element, start }: Clip, edge: TrimEdge, trim: Trim) =>
	edge === "end"
		? start + trim.trimDurationSec
		: start + trim.trimStartSec - element.trimStartSec;

/** Every drawn edge of the other clips: where each starts, where its media stops, and where its span ends. */
export const snapTargets = (
	clips: Pick<Sequence, "element" | "start" | "duration">[],
	exceptElementId: string,
): number[] =>
	clips
		.filter((clip) => clip.element.id !== exceptElementId)
		.flatMap((clip) => [
			clip.start,
			clip.start + laidOut(clip).trimDurationSec,
			clip.start + clip.duration,
		]);

/** The dragged handle sticks to a target within reach, unless the media runs out before it. */
export function snapTrimEdge(
	clip: Clip,
	edge: TrimEdge,
	deltaSec: number,
	targets: readonly number[],
	thresholdSec: number,
): SnappedTrim {
	const restSec = edgeSec(clip, edge, clip.element);
	const target = snapTarget(restSec + deltaSec, targets, thresholdSec);
	if (target !== null) {
		const trim = trimEdge(clip.element, edge, target - restSec);
		if (Math.abs(edgeSec(clip, edge, trim) - target) < EPSILON_SEC)
			return { trim, snappedSec: target };
	}
	return { trim: trimEdge(clip.element, edge, deltaSec), snappedSec: null };
}
