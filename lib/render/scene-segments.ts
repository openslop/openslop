import { sceneLabel } from "@/lib/canvas/constants";
import { CONTENT_TYPES } from "@/lib/canvas/types";
import { mediaUrlAt } from "./clip-trim";
import { toFrames } from "./frames";
import { totalDuration } from "./sequences";
import type { ResolvedElement, RenderLayout } from "./types";

export type SeekThumbnail = { url: string; kind: "image" | "video" };

export type SceneSegment = {
	id: string;
	sceneId: string;
	label: string;
	start: number;
	duration: number;
	thumbnail: SeekThumbnail | null;
};

/**
 * Frame space, not seconds: the player only ever addresses whole frames, and
 * `toFrames` rounds. Segment starts are arbitrary reals, so comparing a rounded
 * playhead against an unrounded boundary reports the previous segment whenever
 * the seek rounded down. Rounding both sides the same way makes a seek to
 * `toFrames(segment.start, fps)` land in `segment` by construction.
 */
export function findSegmentIndexAtFrame(
	segments: SceneSegment[],
	frame: number,
	fps: number,
): number {
	if (segments.length === 0) return -1;
	const index = segments.findIndex(
		({ start, duration }) => frame < toFrames(start + duration, fps),
	);
	return index === -1 ? segments.length - 1 : index;
}

/**
 * Where "Previous scene" seeks, in frames: the start of the scene the playhead
 * is in, or, when it is already there, the start of the scene before. On the
 * first scene that is frame 0 either way.
 */
export function previousSceneStart(
	segments: SceneSegment[],
	frame: number,
	fps: number,
): number {
	const current = findSegmentIndexAtFrame(segments, frame, fps);
	if (current === -1) return 0;
	const currentStart = toFrames(segments[current].start, fps);
	if (frame > currentStart) return currentStart;
	return toFrames(segments[Math.max(0, current - 1)].start, fps);
}

function toThumbnail(element: ResolvedElement): SeekThumbnail | null {
	const { outputKind } = CONTENT_TYPES[element.type];
	if (outputKind === "audio") return null;
	return {
		url: mediaUrlAt(element.url, element.trimStartSec),
		kind: outputKind,
	};
}

/**
 * The seek bar's spans, one per scene. Consecutive scenes overlap by
 * `transitionDurationSec`, so each span is trimmed by that overlap to keep the
 * bar contiguous.
 */
export function buildSceneSegments(layout: RenderLayout): SceneSegment[] {
	const segments: SceneSegment[] = [];
	for (const { element, start, ...slot } of layout.series) {
		const duration = totalDuration(slot);
		const last = segments.at(-1);
		if (last?.sceneId === element.sceneId) {
			last.duration = start + duration - last.start;
			continue;
		}
		if (last) {
			last.duration = Math.max(0, last.duration - layout.transitionDurationSec);
		}
		segments.push({
			id: element.id,
			sceneId: element.sceneId,
			label: sceneLabel(element.sceneNumber),
			start,
			duration,
			thumbnail: toThumbnail(element),
		});
	}
	return segments;
}
