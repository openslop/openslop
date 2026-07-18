import type { PlayerRef } from "@remotion/player";
import { useMemo } from "react";
import { isForeground } from "@/lib/canvas/guards";
import type { SceneElement } from "@/lib/canvas/types";
import type { Sequence, VideoLayout } from "@/lib/video/types";
import type { SeekThumbnail } from "./SeekTooltip";
import { useLayout } from "./VideoLayoutContext";
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
	fps: number | undefined,
): number {
	return usePlayerValue(
		player,
		FRAME_EVENTS,
		(p) => (fps ? findSegmentIndexAt(segments, p.getCurrentFrame() / fps) : -1),
		-1,
	);
}

export function useSceneSegments(): SceneSegment[] {
	const { layout, scenes } = useLayout();
	return useMemo<SceneSegment[]>(() => {
		const out: SceneSegment[] = [];
		for (let i = 0; i < scenes.length; i++) {
			const scene = scenes[i];
			const seq = findSceneSequence(scene, layout);
			if (!seq) continue;
			const prev = out[out.length - 1];
			if (prev) {
				prev.duration = Math.max(
					0,
					prev.duration - layout.transitionDurationSec,
				);
			}
			const el = seq.element;
			out.push({
				sceneId: scene.id,
				sceneIndex: i + 1,
				start: seq.start,
				duration: seq.duration,
				label: `Scene ${i + 1}`,
				thumbnail: el
					? { url: el.url, kind: el.type === "image" ? "image" : "video" }
					: null,
			});
		}
		return out;
	}, [scenes, layout]);
}
