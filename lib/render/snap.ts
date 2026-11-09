import minBy from "lodash/minBy";
import { playedTrim, trimEdge, type TrimEdge } from "./clip-trim";
import { totalDuration } from "./sequences";
import type { Sequence, Trim } from "./types";

// A trim that lands on its target comes back a few ULPs off it.
const EPSILON_SEC = 1e-6;

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

/** Where the handle sits on the timeline: the end handle moves the end, the start handle cuts the in-point from where the clip starts. */
const edgeSec = ({ element, start }: Sequence, edge: TrimEdge, trim: Trim) =>
	edge === "end"
		? start + trim.trimDurationSec
		: start + trim.trimStartSec - element.trimStartSec;

/** Every drawn edge of the other clips: where each starts, where its media stops, and where its span ends. */
export const snapTargets = (
	clips: Sequence[],
	exceptElementId: string,
): number[] =>
	clips
		.filter((clip) => clip.element.id !== exceptElementId)
		.flatMap((clip) => [
			clip.start,
			clip.start + clip.duration,
			clip.start + totalDuration(clip),
		]);

/** The dragged handle sticks to a target within reach, unless the media runs out before it. A handle at rest never snaps, so a click changes nothing. */
export function snapTrimEdge(
	clip: Sequence,
	edge: TrimEdge,
	deltaSec: number,
	targets: readonly number[],
	thresholdSec: number,
): SnappedTrim {
	const restSec = edgeSec(clip, edge, playedTrim(clip));
	const target =
		deltaSec === 0
			? null
			: snapTarget(restSec + deltaSec, targets, thresholdSec);
	if (target !== null) {
		const trim = trimEdge(clip, edge, target - restSec);
		if (Math.abs(edgeSec(clip, edge, trim) - target) < EPSILON_SEC)
			return { trim, snappedSec: target };
	}
	return { trim: trimEdge(clip, edge, deltaSec), snappedSec: null };
}
