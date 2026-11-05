import minBy from "lodash/minBy";
import { trimEdge, type Trim, type TrimEdge } from "./clip-trim";
import type { Sequence } from "./types";

// A trim that lands on its target comes back a few ULPs off it.
const EPSILON_SEC = 1e-6;

/** The nearest target within reach of the time, or null when none is. */
export function snapTarget(
	sec: number,
	targets: readonly number[],
	thresholdSec: number,
): number | null {
	const nearest = minBy(targets, (target) => Math.abs(target - sec));
	return nearest !== undefined && Math.abs(nearest - sec) <= thresholdSec
		? nearest
		: null;
}

type SnappedTrim = { trim: Trim; snappedSec: number | null };

type Clip = Pick<Sequence, "element" | "start">;

/** Where the handle sits on the timeline: the end handle moves the end, the start handle cuts the in-point from where the clip starts. */
const edgeSec = ({ element, start }: Clip, edge: TrimEdge, trim: Trim) =>
	edge === "end"
		? start + trim.trimDurationSec
		: start + trim.trimStartSec - element.trimStartSec;

/** The dragged handle sticks to a target within reach, unless the media runs out before it. */
export function snapTrimEdge(
	clip: Clip,
	edge: TrimEdge,
	deltaSec: number,
	targets: readonly number[],
	thresholdSec: number,
): SnappedTrim {
	const free = {
		trim: trimEdge(clip.element, edge, deltaSec),
		snappedSec: null,
	};
	const restSec = edgeSec(clip, edge, clip.element);
	const target = snapTarget(restSec + deltaSec, targets, thresholdSec);
	if (target === null) return free;
	const trim = trimEdge(clip.element, edge, target - restSec);
	return Math.abs(edgeSec(clip, edge, trim) - target) < EPSILON_SEC
		? { trim, snappedSec: target }
		: free;
}
