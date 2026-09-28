import { isForeground } from "@/lib/canvas/guards";
import { ELEMENT_TYPES, type SceneElement } from "@/lib/canvas/types";
import { toFrames } from "./frames";
import type { ResolvedElement, Sequence, RenderLayout } from "./types";

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
	return new Map(series.map((seq) => [seq.element.id, seq]));
}

export function findSceneSequence(
	scene: SceneElement,
	index: SequenceIndex,
): Sequence | undefined {
	const foreground = scene.children.find(isForeground);
	return foreground ? index.get(foreground.id) : undefined;
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
	const index = segments.findIndex(
		(seg) => frame < toFrames(seg.start + seg.duration, fps),
	);
	return index === -1 ? segments.length - 1 : index;
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
export function buildSceneSegments(layout: RenderLayout): SceneSegment[] {
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
