import { isForeground } from "@/lib/canvas/guards";
import type { CanvasContentElement, SceneElement } from "@/lib/canvas/types";
import type { SceneSegment } from "../useSceneSegments";

export type StoryboardScene = {
	scene: SceneElement;
	sceneIndex: number;
	foreground: CanvasContentElement | null;
	/** Seek target, or null while the scene has nothing on the timeline yet. */
	start: number | null;
};

/**
 * Joins every scene in the document to its rendered segment. Scenes whose
 * foreground has not generated yet have no segment, so the storyboard shows
 * them as placeholders rather than dropping them the way the seek bar does.
 */
export function buildStoryboardScenes(
	scenes: SceneElement[],
	segments: SceneSegment[],
): StoryboardScene[] {
	const startBySceneId = new Map(
		segments.map((seg) => [seg.sceneId, seg.start]),
	);
	return scenes.map((scene, i) => ({
		scene,
		sceneIndex: i + 1,
		foreground: scene.children.find(isForeground) ?? null,
		start: startBySceneId.get(scene.id) ?? null,
	}));
}
