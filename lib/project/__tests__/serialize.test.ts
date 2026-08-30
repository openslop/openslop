import { describe, expect, it } from "vitest";
import {
	getElementText,
	serializeOSMLWithScenes,
} from "@/lib/canvas/osmlSerializer";
import {
	SCENE_TYPE,
	type CanvasContentElement,
	type SceneElement,
} from "@/lib/canvas/types";
import { BLANK_SCRIPT, deserializeWithScenes, splitScenes } from "../serialize";
import { flatAttributes, splitAttributes } from "@/lib/video/elementAttributes";

const makeEl = (
	type: CanvasContentElement["type"],
	text: string,
	attrs?: Record<string, string>,
): CanvasContentElement => ({
	id: `${type}-id`,
	type,
	...splitAttributes(attrs ?? {}),
	children: [{ id: `${type}-t`, type, text }],
});

const makeScene = (children: CanvasContentElement[]): SceneElement => ({
	id: "scene-id",
	type: SCENE_TYPE,
	children,
});

describe("splitScenes", () => {
	it("returns empty for empty input", () => {
		expect(splitScenes("")).toEqual([]);
		expect(splitScenes("   ")).toEqual([]);
	});

	it("splits a multi-scene OSML string", () => {
		const osml = `--- Scene 1 ---\n<image id="a"></image>\n--- Scene 2 ---\n<narration id="b">hi</narration>`;
		const parts = splitScenes(osml);
		expect(parts).toHaveLength(2);
		expect(parts[0]).toContain('<image id="a"></image>');
		expect(parts[1]).toContain("<narration");
	});
});

describe("deserializeWithScenes", () => {
	it("returns [] for empty input", () => {
		expect(deserializeWithScenes("")).toEqual([]);
	});

	it("turns BLANK_SCRIPT into one scene holding one empty narration", () => {
		const scenes = deserializeWithScenes(BLANK_SCRIPT);

		expect(scenes).toHaveLength(1);
		expect(scenes[0].children).toHaveLength(1);
		expect(scenes[0].children[0].type).toBe("narration");
	});

	it("round-trips quotes and angle brackets in attributes and text", () => {
		const original = [
			makeScene([
				makeEl("image", "5 < 10 & 20 > 15", {
					prompt: 'a 24" monitor & a <box>',
				}),
			]),
		];

		const scenes = deserializeWithScenes(serializeOSMLWithScenes(original));

		const image = scenes[0].children[0];
		expect(image.type).toBe("image");
		expect(image.id).toBe("image-id");
		expect(flatAttributes(image).prompt).toBe('a 24" monitor & a <box>');
		expect(getElementText(image)).toContain("5 < 10 & 20 > 15");
	});

	it("round-trips with serializeWithScenes preserving attributes", () => {
		const original = [
			makeScene([
				makeEl("image", "", { url: "https://cdn/a.png", durationSec: "3" }),
				makeEl("narration", "hello"),
			]),
			makeScene([makeEl("clip", "", { url: "https://cdn/b.mp4" })]),
		];

		const osml = serializeOSMLWithScenes(original);
		const scenes = deserializeWithScenes(osml);

		expect(scenes).toHaveLength(2);

		const firstImage = scenes[0].children[0];
		expect(firstImage.type).toBe("image");
		expect(flatAttributes(firstImage).url).toBe("https://cdn/a.png");
		expect(flatAttributes(firstImage).durationSec).toBe("3");

		const firstNarration = scenes[0].children[1];
		expect(firstNarration.type).toBe("narration");
		expect(firstNarration.children.map((c) => c.text).join("")).toContain(
			"hello",
		);

		const secondClip = scenes[1].children[0];
		expect(secondClip.type).toBe("clip");
		expect(flatAttributes(secondClip).url).toBe("https://cdn/b.mp4");
	});
});
