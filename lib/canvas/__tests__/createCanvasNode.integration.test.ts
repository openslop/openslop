import { describe, expect, it } from "vitest";
import { createCanvasNode } from "../createCanvasNode";
import { parseOSML } from "../osmlStreamParser";
import { serializeOSML } from "../osmlSerializer";
import { SCENE_TYPE, type SceneElement } from "@/lib/canvas/types";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import { flatAttributes } from "@/lib/video/elementAttributes";

const connectors: ConnectorRegistry = {
	llm: {
		openslop: {
			defaultModel: "llm-model",
			models: ["llm-model"],
			isDefault: true,
			apiKey: "",
		},
	},
	tts: {
		openslop: {
			defaultModel: "tts-model",
			models: ["tts-model"],
			isDefault: true,
			apiKey: "",
		},
	},
	image: {
		openslop: {
			defaultModel: "image-model",
			models: ["image-model", "image-model-pro"],
			isDefault: true,
			apiKey: "",
		},
	},
	animated_image: {
		openslop: {
			defaultModel: "anim-model",
			models: ["anim-model"],
			isDefault: true,
			apiKey: "",
		},
	},
	video: {
		openslop: {
			defaultModel: "video-model",
			models: ["video-model"],
			isDefault: true,
			apiKey: "",
		},
	},
	sfx: {
		openslop: {
			defaultModel: "sfx-model",
			models: ["sfx-model"],
			isDefault: true,
			apiKey: "",
		},
	},
	music: {
		openslop: {
			defaultModel: "music-model",
			models: ["music-model"],
			isDefault: true,
			apiKey: "",
		},
	},
};

describe("createCanvasNode — schema defaults (integration)", () => {
	it("applies full TTS defaults for narration", () => {
		const node = createCanvasNode("narration", connectors);
		expect(flatAttributes(node)).toMatchObject({
			emotion: "neutral",
			speed: "medium",
			volume: "10",
			model: "tts-model",
			provider: "openslop",
		});
	});

	it("applies the same TTS defaults for character", () => {
		const node = createCanvasNode("character", connectors);
		expect(flatAttributes(node)).toMatchObject({
			emotion: "neutral",
			speed: "medium",
			volume: "10",
			model: "tts-model",
			provider: "openslop",
		});
	});

	it("applies sfx defaults for sound", () => {
		const node = createCanvasNode("sound", connectors);
		expect(flatAttributes(node)).toMatchObject({
			loops: "1",
			volume: "2",
			model: "sfx-model",
			provider: "openslop",
		});
	});

	it("applies animated_image defaults including videoPrompt", () => {
		const node = createCanvasNode("animated_image", connectors);
		expect(flatAttributes(node)).toMatchObject({
			videoPrompt: "slow cinematic pan",
			duration: "10",
			motion: "none",
			model: "anim-model",
			provider: "openslop",
		});
	});
});

describe("createCanvasNode — authored model and provider", () => {
	it("keeps a model the registry knows instead of resetting it to the default", () => {
		const node = createCanvasNode("image", connectors, {
			attrs: { model: "image-model-pro", provider: "openslop" },
		});
		expect(flatAttributes(node)).toMatchObject({
			model: "image-model-pro",
			provider: "openslop",
		});
	});

	it("falls back to the default for a model the registry no longer offers", () => {
		const node = createCanvasNode("image", connectors, {
			attrs: { model: "retired-model" },
		});
		expect(flatAttributes(node).model).toBe("image-model");
	});

	it("falls back to the default provider for one the registry does not have", () => {
		const node = createCanvasNode("image", connectors, {
			attrs: { provider: "nobody", model: "image-model-pro" },
		});
		expect(flatAttributes(node)).toMatchObject({
			provider: "openslop",
			model: "image-model-pro",
		});
	});

	it("survives an OSML round trip, so reopening a project keeps the chosen model", () => {
		const scene: SceneElement = {
			id: "s1",
			type: SCENE_TYPE,
			children: [
				createCanvasNode("image", connectors, {
					attrs: { model: "image-model-pro" },
					text: "a sunset",
				}),
			],
		};

		const [reparsed] = parseOSML(serializeOSML([scene]), connectors);
		expect(flatAttributes(reparsed).model).toBe("image-model-pro");
	});
});
