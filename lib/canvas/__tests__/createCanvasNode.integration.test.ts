import { describe, expect, it } from "vitest";
import { createCanvasNode } from "../createCanvasNode";
import type { ConnectorRegistry } from "@/lib/connectors/registry";

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
			models: ["image-model"],
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
		expect(node.customAttributes).toMatchObject({
			emotion: "neutral",
			speed: "medium",
			volume: "10",
			model: "tts-model",
			provider: "openslop",
		});
	});

	it("applies the same TTS defaults for character", () => {
		const node = createCanvasNode("character", connectors);
		expect(node.customAttributes).toMatchObject({
			emotion: "neutral",
			speed: "medium",
			volume: "10",
			model: "tts-model",
			provider: "openslop",
		});
	});

	it("applies sfx defaults for sound", () => {
		const node = createCanvasNode("sound", connectors);
		expect(node.customAttributes).toMatchObject({
			loops: "1",
			volume: "2",
			model: "sfx-model",
			provider: "openslop",
		});
	});

	it("applies animated_image defaults including videoPrompt", () => {
		const node = createCanvasNode("animated_image", connectors);
		expect(node.customAttributes).toMatchObject({
			videoPrompt: "slow cinematic pan",
			duration: "10",
			motion: "none",
			model: "anim-model",
			provider: "openslop",
		});
	});
});
