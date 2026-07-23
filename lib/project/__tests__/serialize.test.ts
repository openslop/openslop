import { describe, expect, it } from "vitest";
import { serializeOSMLWithScenes } from "@/lib/canvas/osmlSerializer";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import {
	SCENE_TYPE,
	type CanvasContentElement,
	type SceneElement,
} from "@/lib/canvas/types";
import { deserializeWithScenes, splitScenes } from "../serialize";

const connector = {
	openslop: { defaultModel: "m", models: ["m"], isDefault: true, apiKey: "" },
};
const connectors: ConnectorRegistry = {
	llm: connector,
	tts: connector,
	image: connector,
	animated_image: connector,
	video: connector,
	sfx: connector,
	music: connector,
};

const makeEl = (
	type: CanvasContentElement["type"],
	text: string,
	attrs?: Record<string, string>,
): CanvasContentElement => ({
	id: `${type}-id`,
	type,
	...(attrs && { customAttributes: attrs }),
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
		expect(deserializeWithScenes("", connectors)).toEqual([]);
	});

	it("round-trips with serializeWithScenes preserving customAttributes.url", () => {
		const original = [
			makeScene([
				makeEl("image", "", { url: "https://cdn/a.png", durationSec: "3" }),
				makeEl("narration", "hello"),
			]),
			makeScene([makeEl("clip", "", { url: "https://cdn/b.mp4" })]),
		];

		const osml = serializeOSMLWithScenes(original);
		const scenes = deserializeWithScenes(osml, connectors);

		expect(scenes).toHaveLength(2);

		const firstImage = scenes[0].children[0];
		expect(firstImage.type).toBe("image");
		expect(firstImage.customAttributes?.url).toBe("https://cdn/a.png");
		expect(firstImage.customAttributes?.durationSec).toBe("3");

		const firstNarration = scenes[0].children[1];
		expect(firstNarration.type).toBe("narration");
		expect(firstNarration.children.map((c) => c.text).join("")).toContain(
			"hello",
		);

		const secondClip = scenes[1].children[0];
		expect(secondClip.type).toBe("clip");
		expect(secondClip.customAttributes?.url).toBe("https://cdn/b.mp4");
	});
});
