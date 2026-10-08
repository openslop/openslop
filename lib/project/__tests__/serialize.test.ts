import { describe, expect, it } from "vitest";
import {
	getElementText,
	serializeOSMLWithScenes,
} from "@/lib/canvas/osmlSerializer";
import {
	SCENE_TYPE,
	type ContentElement,
	type Scene,
} from "@/lib/canvas/types";
import { isAssetElement } from "@/lib/canvas/guards";
import { isScene } from "@/lib/canvas/scenes";
import { getPromptText } from "@/lib/generation/inputs";
import { deserializeWithScenes, splitScenes } from "../serialize";
import {
	flatAttributes,
	splitAttributes,
} from "@/lib/canvas/elementAttributes";

const makeEl = (
	type: ContentElement["type"],
	text: string,
	attrs?: Record<string, string>,
): ContentElement => ({
	id: `${type}-id`,
	type,
	...splitAttributes(attrs ?? {}),
	children: [{ id: `${type}-t`, type, text }],
});

const scenesOf = (...args: Parameters<typeof deserializeWithScenes>) =>
	deserializeWithScenes(...args).filter(isScene);

const makeScene = (children: ContentElement[]): Scene => ({
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

	it("names scenes with the given id factory", () => {
		const scenes = scenesOf(
			"<narration>a</narration>\n--- Scene 2 ---\n<narration>b</narration>",
			undefined,
			(index) => `scene-${index}`,
		);

		expect(scenes.map((scene) => scene.id)).toEqual(["scene-0", "scene-1"]);
	});

	it("keeps tags the canvas does not know out of the document", () => {
		const nodes = deserializeWithScenes(
			'<metadata_character name="Red" gender="feminine">A girl</metadata_character><narration>hello</narration>',
		);

		expect(nodes).toHaveLength(1);
		expect(
			scenesOf("<unknown>x</unknown><narration>hello</narration>"),
		).toEqual([
			expect.objectContaining({
				children: [expect.objectContaining({ type: "narration" })],
			}),
		]);
	});

	it("puts the assets ahead of the scenes, wherever the script wrote them", () => {
		const nodes = deserializeWithScenes(
			[
				'<asset_style id="asset_style">noir</asset_style>',
				"<narration>a</narration>",
				"--- Scene 2 ---",
				'<asset_avatar id="ada" name="Ada" provider="runware" model="Seedream 5 Lite">tall</asset_avatar>',
				"<narration>b</narration>",
			].join("\n"),
		);

		expect(nodes.map((node) => node.type)).toEqual([
			"asset_style",
			"asset_avatar",
			SCENE_TYPE,
			SCENE_TYPE,
		]);
		const avatar = nodes[1];
		expect(avatar).toMatchObject({
			id: "asset_avatar:Ada",
			generationAttributes: {
				name: "Ada",
				provider: "runware",
				model: "Seedream 5 Lite",
			},
		});
		expect(isAssetElement(avatar) && getPromptText(avatar)).toBe("tall");
		expect(
			scenesOf(
				'<asset_avatar name="Ada">tall</asset_avatar><narration>b</narration>',
			)[0]?.children,
		).toHaveLength(1);
	});

	it("makes no scene of a script that holds only assets", () => {
		const nodes = deserializeWithScenes(
			'<asset_style>noir</asset_style>\n--- Scene 1 ---\n<asset_references images="a.png"></asset_references>',
		);

		expect(nodes.map((node) => node.type)).toEqual([
			"asset_style",
			"asset_references",
		]);
	});

	it("round-trips assets through serializeOSMLWithScenes", () => {
		const osml = [
			'<asset_style id="asset_style">noir &amp; "moody"</asset_style>',
			'<asset_voice id="asset_voice:Narrator" provider="openslop" model="Slop TTS v1" name="Narrator" gender="feminine"></asset_voice>',
			'<asset_avatar id="asset_avatar:Ada &lt;the first&gt;" name="Ada &lt;the first&gt;" provider="openslop" model="Slop Image v1">tall</asset_avatar>',
			'<asset_voice id="asset_voice:Ada &lt;the first&gt;" provider="openslop" model="Slop TTS v1" name="Ada &lt;the first&gt;"></asset_voice>',
			'<asset_references id="asset_references" images="https://cdn/a.png?x=1&amp;y=2,https://cdn/b.png"></asset_references>',
		].join("\n");

		expect(serializeOSMLWithScenes(deserializeWithScenes(osml))).toBe(
			osml.replace('"moody"', "&quot;moody&quot;"),
		);
	});

	it("round-trips quotes and angle brackets in attributes and text", () => {
		const original = [
			makeScene([
				makeEl("image", "5 < 10 & 20 > 15", {
					prompt: 'a 24" monitor & a <box>',
				}),
			]),
		];

		const scenes = scenesOf(serializeOSMLWithScenes(original));

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
			makeScene([makeEl("video", "", { url: "https://cdn/b.mp4" })]),
		];

		const osml = serializeOSMLWithScenes(original);
		const scenes = scenesOf(osml);

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

		const secondVideo = scenes[1].children[0];
		expect(secondVideo.type).toBe("video");
		expect(flatAttributes(secondVideo).url).toBe("https://cdn/b.mp4");
	});
});
