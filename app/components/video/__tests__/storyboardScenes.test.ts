import { describe, expect, it } from "vitest";
import type { SceneElement } from "@/lib/canvas/types";
import type { SceneSegment } from "../useSceneSegments";
import { buildStoryboardScenes } from "../storyboard/storyboardScenes";

const scene = (id: string, childTypes: string[]): SceneElement => ({
	id,
	type: "scene",
	children: childTypes.map((type, i) => ({
		id: `${id}-${i}`,
		type: type as SceneElement["children"][number]["type"],
		children: [],
	})),
});

const segment = (sceneId: string, start: number): SceneSegment => ({
	id: `${sceneId}-fg`,
	sceneId,
	start,
	duration: 3,
	label: "Scene",
	thumbnail: null,
});

describe("buildStoryboardScenes", () => {
	it("numbers scenes by document order", () => {
		const items = buildStoryboardScenes(
			[scene("a", ["image"]), scene("b", ["clip"])],
			[],
		);
		expect(items.map((item) => item.sceneIndex)).toEqual([1, 2]);
	});

	it("takes the seek target from the matching segment", () => {
		const items = buildStoryboardScenes(
			[scene("a", ["image"]), scene("b", ["image"])],
			[segment("b", 4.5)],
		);
		expect(items.map((item) => item.start)).toEqual([null, 4.5]);
	});

	it("keeps scenes that have no segment yet", () => {
		const items = buildStoryboardScenes([scene("a", ["narration"])], []);
		expect(items).toHaveLength(1);
		expect(items[0].foreground).toBeNull();
	});

	it("picks the scene's foreground element", () => {
		const items = buildStoryboardScenes(
			[scene("a", ["narration", "image"])],
			[],
		);
		expect(items[0].foreground?.id).toBe("a-1");
	});
});
