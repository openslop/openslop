import type { PlayerRef } from "@remotion/player";
import { isForeground } from "@/lib/canvas/guards";
import { ELEMENT_TYPES, type SceneElement } from "@/lib/canvas/types";
import { toSeconds } from "@/lib/video/frames";
import type { ResolvedElement, Sequence, VideoLayout } from "@/lib/video/types";
import type { SeekThumbnail } from "./SeekTooltip";
import { FRAME_EVENTS, usePlayerValue } from "./usePlayerState";

export type SceneSegment = {
	sceneId: string;
	sceneIndex: number;
	start: number;
	duration: number;
	label: string;
	thumbnail: SeekThumbnail | null;
};

export function findSceneSequence(
	scene: SceneElement,
	layout: VideoLayout,
): Sequence | undefined {
	const fg = scene.children.find(isForeground);
	if (!fg) return undefined;
	return layout.sequenceByElementId.get(fg.id);
}

export function findSegmentIndexAt(
	segments: SceneSegment[],
	timeSec: number,
): number {
	if (segments.length === 0) return -1;
	for (let i = 0; i < segments.length; i++) {
		const seg = segments[i];
		if (timeSec < seg.start + seg.duration) return i;
	}
	return segments.length - 1;
}

export function useActiveSegmentIndex(
	player: PlayerRef | null,
	segments: SceneSegment[],
	fps: number,
): number {
	return usePlayerValue(
		player,
		FRAME_EVENTS,
		(p) => findSegmentIndexAt(segments, toSeconds(p.getCurrentFrame(), fps)),
		-1,
	);
}

function toThumbnail(element: ResolvedElement | null): SeekThumbnail | null {
	if (!element) return null;
	const { outputKind } = ELEMENT_TYPES[element.type];
	if (outputKind === "audio") return null;
	return { url: element.url, kind: outputKind };
}

/**
 * Derives the seek-bar scene segments from the layout. Consecutive scenes
 * overlap by `transitionDurationSec`, so each segment's duration is trimmed by
 * that overlap to keep the timeline contiguous. Owned by `VideoLayoutContext`
 * so it is computed once for all consumers.
 */
export function buildSceneSegments(
	scenes: SceneElement[],
	layout: VideoLayout,
): SceneSegment[] {
	const out: SceneSegment[] = [];
	for (let i = 0; i < scenes.length; i++) {
		const scene = scenes[i];
		const seq = findSceneSequence(scene, layout);
		if (!seq) continue;
		const prev = out[out.length - 1];
		if (prev) {
			prev.duration = Math.max(0, prev.duration - layout.transitionDurationSec);
		}
		out.push({
			sceneId: scene.id,
			sceneIndex: i + 1,
			start: seq.start,
			duration: seq.duration,
			label: `Scene ${i + 1}`,
			thumbnail: toThumbnail(seq.element),
		});
	}
	return out;
}
