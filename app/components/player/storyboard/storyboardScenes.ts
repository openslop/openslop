import { isForeground } from "@/lib/canvas/guards";
import type { ContentElement, Scene } from "@/lib/canvas/types";
import type { SceneSegment } from "@/lib/render/sceneSegments";

export type StoryboardScene = {
	scene: Scene;
	sceneIndex: number;
	foreground: ContentElement | null;
	/** Seek target, or null while the scene has nothing on the timeline yet. */
	start: number | null;
};

/** Unlike the seek bar, a scene with no segment yet is kept as a placeholder. */
export function buildStoryboardScenes(
	scenes: Scene[],
	segments: SceneSegment[],
): StoryboardScene[] {
	const startBySceneId = new Map(
		segments.map(({ sceneId, start }) => [sceneId, start]),
	);
	return scenes.map((scene, index) => ({
		scene,
		sceneIndex: index + 1,
		foreground: scene.children.find(isForeground) ?? null,
		start: startBySceneId.get(scene.id) ?? null,
	}));
}
