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
	return new Map(series.map((sequence) => [sequence.element.id, sequence]));
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
	const segments: SceneSegment[] = [];
	for (const { element, start, duration } of layout.series) {
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
			label: `Scene ${element.sceneNumber}`,
			start,
			duration,
			thumbnail: toThumbnail(element),
		});
	}
	return segments;
}
