import { isForeground } from "@/lib/canvas/guards";
import { ELEMENT_TYPES, type SceneElement } from "@/lib/canvas/types";
import { toFrames } from "@/lib/video/frames";
import type { ResolvedElement, Sequence, VideoLayout } from "@/lib/video/types";

export type SeekThumbnail = { url: string; kind: "image" | "video" };

export type SceneSegment = {
	id: string;
	sceneId: string;
	label: string;
	start: number;
	duration: number;
	thumbnail: SeekThumbnail | null;
};

export type SequenceIndex = ReadonlyMap<string, Sequence>;

/**
 * Lookup index from foreground element id to its scene sequence. Client-only:
 * the render payload carries the ordered `series`, not this projection of it.
 */
export function buildSequenceIndex(series: Sequence[]): SequenceIndex {
	const index = new Map<string, Sequence>();
	for (const seq of series) index.set(seq.element.id, seq);
	return index;
}

export function findSceneSequence(
	scene: SceneElement,
	index: SequenceIndex,
): Sequence | undefined {
	const fg = scene.children.find(isForeground);
	if (!fg) return undefined;
	return index.get(fg.id);
}

/**
 * Frame space, not seconds: the player only ever addresses whole frames, and
 * `toFrames` rounds. Segment starts are arbitrary reals, so comparing a rounded
 * playhead against an unrounded boundary reports the previous segment whenever
 * the seek rounded down. Rounding both sides the same way makes a seek to
 * `toFrames(seg.start, fps)` land in `seg` by construction.
 */
export function findSegmentIndexAtFrame(
	segments: SceneSegment[],
	frame: number,
	fps: number,
): number {
	if (segments.length === 0) return -1;
	for (let i = 0; i < segments.length; i++) {
		const seg = segments[i];
		if (frame < toFrames(seg.start + seg.duration, fps)) return i;
	}
	return segments.length - 1;
}

function toThumbnail(element: ResolvedElement): SeekThumbnail | null {
	const { outputKind } = ELEMENT_TYPES[element.type];
	if (outputKind === "audio") return null;
	return { url: element.url, kind: outputKind };
}

/**
 * The seek bar's spans, one per scene. Consecutive scenes overlap by
 * `transitionDurationSec`, so each span is trimmed by that overlap to keep the
 * bar contiguous.
 */
export function buildSceneSegments(layout: VideoLayout): SceneSegment[] {
	const out: SceneSegment[] = [];
	for (const seq of layout.series) {
		const prev = out.at(-1);
		if (prev?.sceneId === seq.element.sceneId) {
			prev.duration = seq.start + seq.duration - prev.start;
			continue;
		}
		if (prev) {
			prev.duration = Math.max(0, prev.duration - layout.transitionDurationSec);
		}
		out.push({
			id: seq.element.id,
			sceneId: seq.element.sceneId,
			label: `Scene ${seq.element.sceneNumber}`,
			start: seq.start,
			duration: seq.duration,
			thumbnail: toThumbnail(seq.element),
		});
	}
	return out;
}
